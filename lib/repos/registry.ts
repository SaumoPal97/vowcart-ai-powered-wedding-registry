import "server-only"
import { isDbConfigured, query } from "@/lib/db"
import {
  catalog,
  getCatalogProductById,
  seedRegistryItems,
} from "@/lib/catalog"
import type { ItemPriority, ItemStatus, Product, RegistryItem } from "@/lib/types"

interface ItemRow {
  id: string
  registry_id: string
  product_id: string | null
  merchant: string
  title: string
  image: string
  price: string
  rating: string
  reviews: number
  description: string
  category: string
  priority: "MUST_HAVE" | "NICE_TO_HAVE"
  status: "AVAILABLE" | "RESERVED" | "PURCHASED"
  checkout_url: string | null
  variant_id: string | null
  guest_name: string | null
  guest_email: string | null
  purchased_at: string | null
}

const statusFromDb: Record<ItemRow["status"], ItemStatus> = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  PURCHASED: "purchased",
}
export const statusToDb: Record<ItemStatus, ItemRow["status"]> = {
  available: "AVAILABLE",
  reserved: "RESERVED",
  purchased: "PURCHASED",
}
const priorityFromDb: Record<ItemRow["priority"], ItemPriority> = {
  MUST_HAVE: "must-have",
  NICE_TO_HAVE: "nice-to-have",
}
export const priorityToDb: Record<ItemPriority, ItemRow["priority"]> = {
  "must-have": "MUST_HAVE",
  "nice-to-have": "NICE_TO_HAVE",
}

function rowToItem(r: ItemRow): RegistryItem {
  return {
    id: r.id,
    title: r.title,
    merchant: r.merchant,
    price: Number(r.price),
    rating: Number(r.rating),
    reviews: r.reviews,
    category: r.category as Product["category"],
    image: r.image,
    description: r.description,
    status: statusFromDb[r.status],
    priority: priorityFromDb[r.priority],
    productGid: r.product_id ?? undefined,
    variantId: r.variant_id ?? undefined,
    checkoutUrl: r.checkout_url ?? undefined,
    purchasedBy: r.guest_name ?? undefined,
    purchasedByEmail: r.guest_email ?? undefined,
    purchaseDate: r.purchased_at
      ? new Date(r.purchased_at).toISOString().slice(0, 10)
      : undefined,
  }
}

// Deterministic seed items for sandbox fallback.
export function buildSeedItems(): RegistryItem[] {
  const items: RegistryItem[] = []
  for (const s of seedRegistryItems) {
    const product = getCatalogProductById(s.productId)
    if (!product) continue
    items.push({
      ...product,
      id: `seed-${s.productId}`,
      status: s.status,
      priority: s.priority,
      purchasedBy: s.purchasedBy,
      purchasedByEmail: s.purchasedByEmail,
      purchaseDate: s.purchaseDate,
    })
  }
  return items
}

export async function getRegistryItemsByCoupleId(
  coupleId: string,
): Promise<RegistryItem[]> {
  if (!isDbConfigured()) return buildSeedItems()
  const { rows } = await query<ItemRow>(
    `SELECT ri.*, p.guest_name, p.guest_email, p.purchased_at
       FROM registry_items ri
       JOIN registries r ON r.id = ri.registry_id
       LEFT JOIN purchases p ON p.registry_item_id = ri.id
      WHERE r.couple_id = $1
      ORDER BY ri.created_at ASC`,
    [coupleId],
  )
  return rows.map(rowToItem)
}

export async function getRegistryItemsBySlug(
  slug: string,
): Promise<RegistryItem[]> {
  if (!isDbConfigured()) return buildSeedItems()
  const { rows } = await query<ItemRow>(
    `SELECT ri.*, p.guest_name, p.guest_email, p.purchased_at
       FROM registry_items ri
       JOIN registries r ON r.id = ri.registry_id
       JOIN couples c ON c.id = r.couple_id
       LEFT JOIN purchases p ON p.registry_item_id = ri.id
      WHERE c.slug = $1
      ORDER BY ri.created_at ASC`,
    [slug],
  )
  return rows.map(rowToItem)
}

async function getRegistryIdForCouple(coupleId: string): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM registries WHERE couple_id = $1 LIMIT 1`,
    [coupleId],
  )
  return rows[0]?.id ?? null
}

const SEED_REGISTRY_ID = "00000000-0000-0000-0000-0000000c0001"

export async function getRegistryIdForCoupleId(
  coupleId: string,
): Promise<string | null> {
  if (!isDbConfigured()) return SEED_REGISTRY_ID
  return getRegistryIdForCouple(coupleId)
}

export async function getRegistryIdBySlug(slug: string): Promise<string | null> {
  if (!isDbConfigured()) return SEED_REGISTRY_ID
  const { rows } = await query<{ id: string }>(
    `SELECT r.id FROM registries r
       JOIN couples c ON c.id = r.couple_id
      WHERE c.slug = $1 LIMIT 1`,
    [slug],
  )
  return rows[0]?.id ?? null
}

export async function addRegistryItem(
  coupleId: string,
  input: {
    product?: Product
    title?: string
    merchant?: string
    image?: string
    price?: number
    category?: string
    priority?: ItemPriority
    productGid?: string
    variantId?: string
    checkoutUrl?: string
  },
): Promise<RegistryItem | null> {
  const p = input.product
  const item = {
    // UCP products carry a gid; the seed catalog uses its short id.
    productId: input.productGid ?? p?.productGid ?? p?.id ?? null,
    title: input.title ?? p?.title ?? "Untitled gift",
    merchant: input.merchant ?? p?.merchant ?? "VowCart",
    image: input.image ?? p?.image ?? "/placeholder.svg",
    price: input.price ?? p?.price ?? 0,
    rating: p?.rating ?? 0,
    reviews: p?.reviews ?? 0,
    description: p?.description ?? "",
    category: input.category ?? p?.category ?? "Home Decor",
    priority: priorityToDb[input.priority ?? "nice-to-have"],
    variantId: input.variantId ?? p?.variantId ?? null,
    checkoutUrl: input.checkoutUrl ?? p?.checkoutUrl ?? null,
  }
  if (!isDbConfigured()) {
    return {
      id: `seed-${Date.now()}`,
      title: item.title,
      merchant: item.merchant,
      image: item.image,
      price: item.price,
      rating: item.rating,
      reviews: item.reviews,
      description: item.description,
      category: item.category as Product["category"],
      priority: input.priority ?? "nice-to-have",
      status: "available",
      productGid: item.productId ?? undefined,
      variantId: item.variantId ?? undefined,
      checkoutUrl: item.checkoutUrl ?? undefined,
    }
  }
  const registryId = await getRegistryIdForCouple(coupleId)
  if (!registryId) return null
  const { rows } = await query<ItemRow>(
    `INSERT INTO registry_items
       (registry_id, product_id, merchant, title, image, price, rating, reviews, description, category, priority, status, variant_id, checkout_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'AVAILABLE',$12,$13)
     RETURNING *, NULL::text AS guest_name, NULL::text AS guest_email, NULL::timestamptz AS purchased_at`,
    [
      registryId,
      item.productId,
      item.merchant,
      item.title,
      item.image,
      item.price,
      item.rating,
      item.reviews,
      item.description,
      item.category,
      item.priority,
      item.variantId,
      item.checkoutUrl,
    ],
  )
  return rowToItem(rows[0])
}

export async function updateRegistryItem(
  id: string,
  patch: { priority?: ItemPriority; status?: ItemStatus; image?: string },
): Promise<RegistryItem | null> {
  if (!isDbConfigured()) {
    const seed = buildSeedItems().find((i) => i.id === id)
    return seed
      ? { ...seed, ...patch }
      : null
  }
  const { rows } = await query<ItemRow>(
    `UPDATE registry_items SET
        priority = COALESCE($2, priority),
        status = COALESCE($3, status),
        image = COALESCE($4, image),
        updated_at = now()
      WHERE id = $1
      RETURNING *, NULL::text AS guest_name, NULL::text AS guest_email, NULL::timestamptz AS purchased_at`,
    [
      id,
      patch.priority ? priorityToDb[patch.priority] : null,
      patch.status ? statusToDb[patch.status] : null,
      patch.image || null,
    ],
  )
  return rows[0] ? rowToItem(rows[0]) : null
}

export async function deleteRegistryItem(id: string): Promise<boolean> {
  if (!isDbConfigured()) return true
  const { rowCount } = await query(`DELETE FROM registry_items WHERE id = $1`, [
    id,
  ])
  return rowCount > 0
}

const CHART_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export interface RegistryStats {
  total: number
  purchased: number
  reserved: number
  available: number
  topCategories: { category: string; added: number; fill: string }[]
}

export async function getRegistryStatsByCoupleId(
  coupleId: string,
): Promise<RegistryStats> {
  const items = await getRegistryItemsByCoupleId(coupleId)
  const byCategory = new Map<string, number>()
  for (const i of items) {
    byCategory.set(i.category, (byCategory.get(i.category) ?? 0) + 1)
  }
  const topCategories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, added], idx) => ({
      category,
      added,
      fill: CHART_FILLS[idx % CHART_FILLS.length],
    }))
  return {
    total: items.length,
    purchased: items.filter((i) => i.status === "purchased").length,
    reserved: items.filter((i) => i.status === "reserved").length,
    available: items.filter((i) => i.status === "available").length,
    topCategories,
  }
}

export async function getCatalog(): Promise<Product[]> {
  if (!isDbConfigured()) return catalog
  const { rows } = await query<
    ItemRow & { is_sponsored: boolean; sponsored_campaign_id: string | null }
  >(
    `SELECT id, title, merchant, price, rating, reviews, category, image, description,
            is_sponsored, sponsored_campaign_id
       FROM products ORDER BY id`,
  )
  if (rows.length === 0) return catalog
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    merchant: r.merchant,
    price: Number(r.price),
    rating: Number(r.rating),
    reviews: r.reviews,
    category: r.category as Product["category"],
    image: r.image,
    description: r.description,
    isSponsored: r.is_sponsored,
    sponsoredCampaignId: r.sponsored_campaign_id ?? undefined,
  }))
}
