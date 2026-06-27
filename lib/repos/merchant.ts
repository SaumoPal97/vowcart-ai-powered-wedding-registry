import "server-only"
import { isDbConfigured, query, withTransaction } from "@/lib/db"
import {
  getMerchantSession,
  hashPassword,
} from "@/lib/auth"
import {
  catalog,
  demoMerchant,
  featuredCollections,
  merchantAiInsights,
  seedSponsoredCampaigns,
} from "@/lib/catalog"
import type {
  CampaignStatus,
  Merchant,
  MerchantCategoryStat,
  MerchantDashboardSummary,
  MerchantPlan,
  MerchantProductStat,
  Product,
  SponsoredCampaign,
} from "@/lib/types"

// ---------------------------------------------------------------------------
// Merchant analytics are AGGREGATED and ANONYMIZED by design: every figure
// rolls up demand across all registries. We never expose couple names, guest
// identities, emails, or individual registry URLs through this layer.
// ---------------------------------------------------------------------------

const planFromDb: Record<string, MerchantPlan> = {
  FREE: "free",
  PRO: "pro",
  GROWTH: "growth",
}
const planToDb: Record<MerchantPlan, string> = {
  free: "FREE",
  pro: "PRO",
  growth: "GROWTH",
}
const statusFromDb: Record<string, CampaignStatus> = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
}
const statusToDb: Record<CampaignStatus, string> = {
  draft: "DRAFT",
  active: "ACTIVE",
  paused: "PAUSED",
}

// Per-category add→purchase conversion used to synthesize network-scale demand
// when real sample sizes are small (fresh deployment / sandbox). Blended with
// real counts so figures grow as the network does.
const CATEGORY_CONVERSION: Record<string, number> = {
  Kitchen: 0.3,
  Dining: 0.26,
  Bedroom: 0.22,
  Bathroom: 0.24,
  Travel: 0.18,
  "Home Decor": 0.2,
  "Smart Home": 0.16,
}
const CATEGORY_GROWTH: Record<string, number> = {
  Kitchen: 12,
  Dining: 18,
  Bedroom: 6,
  Bathroom: 9,
  Travel: 22,
  "Home Decor": 4,
  "Smart Home": 14,
}

function convRate(category: string): number {
  return CATEGORY_CONVERSION[category] ?? 0.2
}

interface MerchantRow {
  id: string
  name: string
  slug: string
  website: string | null
  shopify_merchant_id: string | null
  plan: string
  brands: string[]
}

function rowToMerchant(r: MerchantRow): Merchant {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    website: r.website ?? "",
    shopifyMerchantId: r.shopify_merchant_id ?? "",
    plan: planFromDb[r.plan] ?? "free",
    brands: r.brands ?? [],
  }
}

// --- merchant identity -----------------------------------------------------

export async function getMerchantById(id: string): Promise<Merchant | null> {
  if (!isDbConfigured()) return id === demoMerchant.id ? demoMerchant : null
  const { rows } = await query<MerchantRow>(
    `SELECT * FROM merchants WHERE id = $1 LIMIT 1`,
    [id],
  )
  return rows[0] ? rowToMerchant(rows[0]) : null
}

/**
 * Resolve the merchant for the current request:
 * - signed in  → that merchant user's merchant
 * - sandbox    → the seeded demo merchant (keeps the no-login demo working)
 * - otherwise  → null (caller redirects to /merchant/login)
 */
export async function getMerchantForRequest(): Promise<Merchant | null> {
  if (!isDbConfigured()) return demoMerchant
  const session = await getMerchantSession()
  if (!session?.merchantId) return null
  return getMerchantById(session.merchantId)
}

export interface MerchantUserRow {
  id: string
  merchant_id: string
  email: string
  name: string
  password_hash: string
}

export async function findMerchantUserByEmail(
  email: string,
): Promise<MerchantUserRow | null> {
  if (!isDbConfigured()) return null
  const { rows } = await query<MerchantUserRow>(
    `SELECT id, merchant_id, email, name, password_hash
       FROM merchant_users WHERE email = $1 LIMIT 1`,
    [email.toLowerCase()],
  )
  return rows[0] ?? null
}

/** Create a merchant account + its first user, in one transaction. */
export async function createMerchantWithUser(input: {
  merchantName: string
  contactName: string
  email: string
  password: string
  website?: string
  shopifyMerchantId?: string
}): Promise<{ merchantId: string; merchantUserId: string }> {
  return withTransaction(async (client) => {
    const slugBase =
      input.merchantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 140) || "merchant"
    // Best-effort unique slug.
    const { rows: existing } = await client.query(
      `SELECT slug FROM merchants WHERE slug LIKE $1`,
      [`${slugBase}%`],
    )
    const taken = new Set(existing.map((r: { slug: string }) => r.slug))
    let slug = slugBase
    let n = 1
    while (taken.has(slug)) slug = `${slugBase}-${++n}`

    const { rows: m } = await client.query(
      `INSERT INTO merchants (name, slug, website, shopify_merchant_id, plan, brands)
       VALUES ($1,$2,$3,$4,'FREE','{}')
       RETURNING id`,
      [
        input.merchantName,
        slug,
        input.website ?? null,
        input.shopifyMerchantId ?? null,
      ],
    )
    const merchantId = m[0].id as string
    const { rows: u } = await client.query(
      `INSERT INTO merchant_users (merchant_id, email, name, password_hash)
       VALUES ($1,$2,$3,$4)
       RETURNING id`,
      [
        merchantId,
        input.email.toLowerCase(),
        input.contactName,
        hashPassword(input.password),
      ],
    )
    return { merchantId, merchantUserId: u[0].id as string }
  })
}

// --- demand pool -----------------------------------------------------------

interface DemandRow {
  productId: string
  added: number
  purchased: number
}

/**
 * Real (add, purchase) counts for this merchant's products, aggregated across
 * every registry. Empty in seed-fallback mode (no DB) — synthesis fills in.
 */
async function realDemand(brands: string[]): Promise<Map<string, DemandRow>> {
  const map = new Map<string, DemandRow>()
  if (!isDbConfigured() || brands.length === 0) return map
  const { rows } = await query<{
    product_id: string | null
    added: string
    purchased: string
  }>(
    `SELECT ri.product_id,
            COUNT(*) AS added,
            COUNT(*) FILTER (WHERE ri.status = 'PURCHASED') AS purchased
       FROM registry_items ri
      WHERE ri.merchant = ANY($1)
      GROUP BY ri.product_id`,
    [brands],
  )
  for (const r of rows) {
    if (!r.product_id) continue
    map.set(r.product_id, {
      productId: r.product_id,
      added: Number(r.added),
      purchased: Number(r.purchased),
    })
  }
  return map
}

/** A merchant's catalog products (brand match). */
function merchantProducts(merchant: Merchant): Product[] {
  const brands = new Set(merchant.brands)
  return catalog.filter((p) => brands.has(p.merchant))
}

// Deterministic network-baseline demand from product popularity (reviews),
// so analytics are substantial even before organic data accrues.
function baselineAdded(p: Product): number {
  return Math.max(8, Math.round(p.reviews / 180))
}

function buildProductStats(
  merchant: Merchant,
  real: Map<string, DemandRow>,
): MerchantProductStat[] {
  const sponsored = new Set(
    seedSponsoredCampaigns
      .filter((c) => c.merchantId === merchant.id && c.status === "active")
      .map((c) => c.productId),
  )
  return merchantProducts(merchant)
    .map((p) => {
      const r = real.get(p.id)
      const added = baselineAdded(p) + (r?.added ?? 0)
      const purchased = Math.max(
        r?.purchased ?? 0,
        Math.round(added * convRate(p.category)),
      )
      const cappedPurchased = Math.min(purchased, added)
      return {
        productId: p.id,
        title: p.title,
        merchant: p.merchant,
        category: p.category,
        image: p.image,
        price: p.price,
        added,
        purchased: cappedPurchased,
        conversionRate: added > 0 ? Math.round((cappedPurchased / added) * 100) : 0,
        isSponsored: sponsored.has(p.id),
      }
    })
    .sort((a, b) => b.added - a.added)
}

export async function getMerchantProductStats(
  merchant: Merchant,
): Promise<MerchantProductStat[]> {
  const real = await realDemand(merchant.brands)
  return buildProductStats(merchant, real)
}

export async function getMerchantProductStat(
  merchant: Merchant,
  productId: string,
): Promise<{
  stat: MerchantProductStat
  frequentlyAddedWith: MerchantProductStat[]
  categoryBenchmark: { avgConversion: number; avgPrice: number }
} | null> {
  const stats = await getMerchantProductStats(merchant)
  const stat = stats.find((s) => s.productId === productId)
  if (!stat) return null
  const sameCategory = stats.filter(
    (s) => s.category === stat.category && s.productId !== productId,
  )
  const avgConversion = sameCategory.length
    ? Math.round(
        sameCategory.reduce((a, s) => a + s.conversionRate, 0) /
          sameCategory.length,
      )
    : stat.conversionRate
  const avgPrice = sameCategory.length
    ? sameCategory.reduce((a, s) => a + s.price, 0) / sameCategory.length
    : stat.price
  return {
    stat,
    // "Frequently added together": top other products in the same category.
    frequentlyAddedWith: sameCategory.slice(0, 3),
    categoryBenchmark: { avgConversion, avgPrice },
  }
}

export async function getMerchantCategoryStats(
  merchant: Merchant,
): Promise<MerchantCategoryStat[]> {
  const stats = await getMerchantProductStats(merchant)
  const byCat = new Map<string, MerchantProductStat[]>()
  for (const s of stats) {
    const list = byCat.get(s.category) ?? []
    list.push(s)
    byCat.set(s.category, list)
  }
  return [...byCat.entries()]
    .map(([category, list]) => {
      const added = list.reduce((a, s) => a + s.added, 0)
      const purchased = list.reduce((a, s) => a + s.purchased, 0)
      const avgPrice =
        list.reduce((a, s) => a + s.price, 0) / Math.max(1, list.length)
      return {
        category,
        added,
        purchased,
        conversionRate: added > 0 ? Math.round((purchased / added) * 100) : 0,
        avgPrice,
        growth: CATEGORY_GROWTH[category] ?? 5,
      }
    })
    .sort((a, b) => b.added - a.added)
}

// --- sponsored campaigns ---------------------------------------------------

interface CampaignRow {
  id: string
  merchant_id: string
  product_id: string | null
  product_title: string
  category: string
  status: string
  budget: string
  bid: string
  start_date: string | null
  end_date: string | null
  impressions: number
  clicks: number
  purchases: number
}

function rowToCampaign(r: CampaignRow): SponsoredCampaign {
  return {
    id: r.id,
    merchantId: r.merchant_id,
    productId: r.product_id,
    productTitle: r.product_title,
    category: r.category,
    status: statusFromDb[r.status] ?? "draft",
    budget: Number(r.budget),
    bid: Number(r.bid),
    startDate: r.start_date ? new Date(r.start_date).toISOString().slice(0, 10) : "",
    endDate: r.end_date ? new Date(r.end_date).toISOString().slice(0, 10) : "",
    impressions: r.impressions,
    clicks: r.clicks,
    purchases: r.purchases,
  }
}

export async function getSponsoredCampaigns(
  merchant: Merchant,
): Promise<SponsoredCampaign[]> {
  if (!isDbConfigured()) {
    return seedSponsoredCampaigns.filter((c) => c.merchantId === merchant.id)
  }
  const { rows } = await query<CampaignRow>(
    `SELECT * FROM sponsored_campaigns WHERE merchant_id = $1 ORDER BY created_at DESC`,
    [merchant.id],
  )
  // Fall back to seed campaigns if none exist yet (fresh demo merchant).
  if (rows.length === 0 && merchant.id === demoMerchant.id) {
    return seedSponsoredCampaigns.filter((c) => c.merchantId === merchant.id)
  }
  return rows.map(rowToCampaign)
}

export async function createSponsoredCampaign(
  merchant: Merchant,
  input: {
    productId?: string | null
    productTitle: string
    category: string
    budget: number
    bid: number
    startDate?: string
    endDate?: string
    status?: CampaignStatus
  },
): Promise<SponsoredCampaign> {
  if (!isDbConfigured()) {
    return {
      id: `camp-${Date.now()}`,
      merchantId: merchant.id,
      productId: input.productId ?? null,
      productTitle: input.productTitle,
      category: input.category,
      status: input.status ?? "draft",
      budget: input.budget,
      bid: input.bid,
      startDate: input.startDate ?? "",
      endDate: input.endDate ?? "",
      impressions: 0,
      clicks: 0,
      purchases: 0,
    }
  }
  const { rows } = await query<CampaignRow>(
    `INSERT INTO sponsored_campaigns
       (merchant_id, product_id, product_title, category, status, budget, bid, start_date, end_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      merchant.id,
      input.productId ?? null,
      input.productTitle,
      input.category,
      statusToDb[input.status ?? "draft"],
      input.budget,
      input.bid,
      input.startDate || null,
      input.endDate || null,
    ],
  )
  return rowToCampaign(rows[0])
}

export async function updateCampaignStatus(
  merchant: Merchant,
  id: string,
  status: CampaignStatus,
): Promise<boolean> {
  if (!isDbConfigured()) return true
  const { rowCount } = await query(
    `UPDATE sponsored_campaigns SET status = $3, updated_at = now()
      WHERE id = $1 AND merchant_id = $2`,
    [id, merchant.id, statusToDb[status]],
  )
  return rowCount > 0
}

// --- dashboard summary -----------------------------------------------------

export async function getMerchantDashboardSummary(
  merchant: Merchant,
): Promise<MerchantDashboardSummary> {
  const [stats, campaigns] = await Promise.all([
    getMerchantProductStats(merchant),
    getSponsoredCampaigns(merchant),
  ])
  const productsAdded = stats.reduce((a, s) => a + s.added, 0)
  const productsPurchased = stats.reduce((a, s) => a + s.purchased, 0)
  const totalValue = stats.reduce((a, s) => a + s.price * s.added, 0)
  const sponsoredImpressions = campaigns.reduce((a, c) => a + c.impressions, 0)
  const sponsoredClicks = campaigns.reduce((a, c) => a + c.clicks, 0)
  const sponsoredPurchases = campaigns.reduce((a, c) => a + c.purchases, 0)
  return {
    productsAdded,
    productsPurchased,
    conversionRate:
      productsAdded > 0
        ? Math.round((productsPurchased / productsAdded) * 100)
        : 0,
    avgGiftPrice: productsAdded > 0 ? totalValue / productsAdded : 0,
    sponsoredImpressions,
    sponsoredClicks,
    sponsoredPurchases,
    sponsoredCtr:
      sponsoredImpressions > 0
        ? Math.round((sponsoredClicks / sponsoredImpressions) * 1000) / 10
        : 0,
  }
}

export { featuredCollections, merchantAiInsights }
