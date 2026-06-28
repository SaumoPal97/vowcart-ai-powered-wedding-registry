import "server-only"
import { generateText } from "ai"
import { annotateSponsored, catalog } from "@/lib/catalog"
import type { Product, ProductCategory, RecommendationGroup } from "@/lib/types"
import { isUcpEnabled, searchCatalog } from "./ucp"
import {
  getCachedRecommendations,
  questionnaireHash,
  setCachedRecommendations,
} from "./ai-cache"

export type Questionnaire = Record<string, string> & { size?: number }

// The model id is resolved through the Vercel AI Gateway (no provider key
// needed). Override with AI_GATEWAY_MODEL to use any model your gateway plan
// allows (e.g. a free-tier model from the Vercel dashboard).
const AI_MODEL = process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini"

const PRODUCT_CATEGORIES = [
  "Kitchen",
  "Bedroom",
  "Dining",
  "Bathroom",
  "Travel",
  "Home Decor",
  "Smart Home",
] as const

/**
 * AI recommendations are on when not explicitly disabled and the gateway can
 * authenticate: on Vercel that's automatic via OIDC; locally it needs
 * AI_GATEWAY_API_KEY.
 */
export function isAiEnabled(): boolean {
  if (process.env.AI_RECS === "false") return false
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL)
}

// Display groups requested by the product spec.
const GROUPS: { id: string; title: string; subtitle: string; categories: Product["category"][] }[] = [
  { id: "kitchen", title: "Kitchen", subtitle: "For the home chefs", categories: ["Kitchen"] },
  { id: "dining", title: "Dining", subtitle: "Gather and host in style", categories: ["Dining"] },
  { id: "bedroom", title: "Bedroom", subtitle: "Rest and recharge", categories: ["Bedroom", "Bathroom"] },
  { id: "travel", title: "Travel", subtitle: "For the adventurers", categories: ["Travel"] },
  { id: "smart-home", title: "Smart Home", subtitle: "Automate the everyday", categories: ["Smart Home"] },
  { id: "decor", title: "Decor", subtitle: "Make it feel like home", categories: ["Home Decor"] },
]

// Rule-based weighting used both to seed the prompt and as a fallback.
function scoreProduct(p: Product, q: Questionnaire): number {
  let score = p.rating
  const cooks = q.cooking === "We live for it"
  const coffee = q.coffee === "Daily ritual"
  const travels = q.travel === "Constantly"
  const homebody = q.outdoors === "Indoors please" || q.travel === "Homebodies"
  if (cooks && p.category === "Kitchen") score += 3
  if (coffee && /coffee|espresso/i.test(p.title)) score += 3
  if (travels && p.category === "Travel") score += 3
  if (homebody && (p.category === "Home Decor" || p.category === "Bedroom")) score += 2
  if (q.home === "House" && p.category === "Smart Home") score += 1
  // Budget bias.
  if (q.budget === "$50–100" && p.price <= 150) score += 1
  if (q.budget === "$200+" && p.price >= 250) score += 1
  return score
}

function curate(q: Questionnaire, perGroup = 4): RecommendationGroup[] {
  return GROUPS.map((g) => {
    const products = annotateSponsored(
      catalog
        .filter((p) => g.categories.includes(p.category))
        .sort((a, b) => scoreProduct(b, q) - scoreProduct(a, q))
        .slice(0, perGroup),
    )
    return { id: g.id, title: g.title, subtitle: g.subtitle, products }
  }).filter((g) => g.products.length > 0)
}

// Build a UCP catalog search query for a group, tailored by the lifestyle answers.
function queryForGroup(groupId: string, q: Questionnaire): string {
  const loves = (k: string, v: string) => q[k] === v
  switch (groupId) {
    case "kitchen":
      return loves("cooking", "We live for it")
        ? "premium kitchen cookware stand mixer dutch oven"
        : "kitchen essentials cookware set"
    case "dining":
      return "modern dinnerware glassware flatware for entertaining"
    case "bedroom":
      return "luxury bedding sheet set pillows"
    case "travel":
      return loves("travel", "Constantly")
        ? "premium carry-on luggage travel gear"
        : "weekender travel duffel bag"
    case "smart-home":
      return loves("coffee", "Daily ritual")
        ? "smart home espresso machine coffee maker"
        : "smart home devices lighting vacuum"
    case "decor":
      return "modern home decor throw blanket table lamp wall art"
    default:
      return "wedding registry gift"
  }
}

// Source each group's products from the live Shopify UCP Global Catalog.
async function curateWithUcp(
  q: Questionnaire,
): Promise<RecommendationGroup[] | null> {
  try {
    const results = await Promise.all(
      GROUPS.map(async (g) => {
        const { products } = await searchCatalog(queryForGroup(g.id, q), {
          category: g.categories[0] as ProductCategory,
          limit: 4,
        })
        return { id: g.id, title: g.title, subtitle: g.subtitle, products }
      }),
    )
    const groups = results.filter((g) => g.products.length > 0)
    const total = groups.reduce((a, g) => a + g.products.length, 0)
    // Require a meaningful spread before trusting the live results.
    return total >= 6 ? groups : null
  } catch (err) {
    console.error("[v0] UCP recommendations failed, using seed:", err)
    return null
  }
}

// A themed group the model plans: a heading + a catalog search phrase we then
// run against Shopify UCP for real products.
interface PlannedGroup {
  title: string
  subtitle: string
  category: ProductCategory
  query: string
}

// Case-insensitively map a model-provided category onto an allowed value.
function coerceCategory(raw: unknown): ProductCategory | null {
  if (typeof raw !== "string") return null
  const hit = PRODUCT_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.trim().toLowerCase(),
  )
  return hit ?? null
}

// Defensively pull a gift plan out of the model's free-text JSON response.
// Small models can't reliably satisfy tool/structured-output mode, so we
// prompt for JSON and validate/coerce here instead of trusting a schema.
function parsePlan(text: string): PlannedGroup[] | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim()
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")
  if (start === -1 || end === -1) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    return null
  }
  const rawGroups = (parsed as { groups?: unknown })?.groups
  if (!Array.isArray(rawGroups)) return null

  const groups: PlannedGroup[] = []
  for (const g of rawGroups) {
    const category = coerceCategory((g as { category?: unknown })?.category)
    const query = (g as { query?: unknown })?.query
    const title = (g as { title?: unknown })?.title
    if (!category || typeof query !== "string" || !query.trim()) continue
    groups.push({
      title:
        typeof title === "string" && title.trim() ? title.trim() : category,
      subtitle:
        typeof (g as { subtitle?: unknown })?.subtitle === "string"
          ? ((g as { subtitle: string }).subtitle as string)
          : "Tailored to the two of you",
      category,
      query: query.trim(),
    })
  }
  return groups.length >= 3 ? groups.slice(0, 6) : null
}

// Ask the model to turn the lifestyle answers into a personalized gift plan.
async function planWithAi(q: Questionnaire): Promise<PlannedGroup[] | null> {
  const answers = Object.entries(q)
    .filter(([k]) => k !== "size")
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n")

  const allowed = PRODUCT_CATEGORIES.map((c) => `"${c}"`).join(", ")

  try {
    const { text } = await generateText({
      model: AI_MODEL,
      maxRetries: 2,
      system:
        "You are a thoughtful wedding registry curator. Reply with ONLY valid " +
        "JSON — no prose, no markdown code fences. Shape: " +
        `{"groups":[{"title":string,"subtitle":string,"category":one of [${allowed}],"query":string}]}. ` +
        "Give 4-6 distinct groups. Each \"query\" must be a concrete, searchable " +
        "product phrase (e.g. \"enameled cast iron dutch oven\") — no brand names " +
        "required. Tailor the picks to the couple: lean into what they care about " +
        "and skip what they don't.",
      prompt: answers
        ? `The couple's lifestyle answers:\n${answers}`
        : "The couple hasn't answered the lifestyle quiz yet; design a strong, broadly-loved starter plan.",
    })
    return parsePlan(text)
  } catch (err) {
    console.error("[v0] AI recommendation planning failed:", err)
    return null
  }
}

// AI plans the themes + queries; Shopify UCP supplies the real products.
async function curateWithAi(
  q: Questionnaire,
): Promise<RecommendationGroup[] | null> {
  const plan = await planWithAi(q)
  if (!plan) return null
  try {
    const results = await Promise.all(
      plan.map(async (g, i) => {
        const { products } = await searchCatalog(g.query, {
          category: g.category as ProductCategory,
          limit: 4,
        })
        return {
          id: `ai-${i}`,
          title: g.title,
          subtitle: g.subtitle,
          products,
        }
      }),
    )
    const groups = results.filter((g) => g.products.length > 0)
    const total = groups.reduce((a, g) => a + g.products.length, 0)
    // Require a meaningful spread before trusting the live results.
    return total >= 6 ? groups : null
  } catch (err) {
    console.error("[v0] AI+UCP curation failed:", err)
    return null
  }
}

export async function getRecommendations(
  q: Questionnaire,
): Promise<{
  groups: RecommendationGroup[]
  source: "cache" | "ai" | "ucp" | "fallback"
}> {
  const hash = questionnaireHash(q)
  const cached = await getCachedRecommendations<RecommendationGroup[]>(hash)
  if (cached) return { groups: cached, source: "cache" }

  // Preferred: AI-designed plan sourced from the live Shopify catalog.
  if (isAiEnabled()) {
    const ai = await curateWithAi(q)
    if (ai) {
      await setCachedRecommendations(hash, ai)
      return { groups: ai, source: "ai" }
    }
  }

  // Fallbacks: live UCP over fixed groups, then the rule-based seed catalog.
  const ucp = isUcpEnabled() ? await curateWithUcp(q) : null
  const groups = ucp ?? curate(q)
  await setCachedRecommendations(hash, groups)
  return { groups, source: ucp ? "ucp" : "fallback" }
}

// Broad per-category top-up queries used to reach the couple's chosen size.
const CATEGORY_QUERIES: { category: ProductCategory; query: string }[] = [
  { category: "Kitchen", query: "kitchen cookware small appliances" },
  { category: "Dining", query: "dinnerware glassware flatware serving" },
  { category: "Bedroom", query: "bedding sheets duvet pillows" },
  { category: "Bathroom", query: "bath towels bath mat robe" },
  { category: "Home Decor", query: "home decor throw lamp wall art vase" },
  { category: "Smart Home", query: "smart home devices speaker lighting" },
  { category: "Travel", query: "luggage weekender travel accessories" },
]

/**
 * Build a flat starter registry of (up to) `size` unique products for
 * onboarding. Starts from the themed recommendations, then tops up via UCP
 * across categories and finally the seed catalog so the count matches the
 * couple's chosen registry size whenever supply allows.
 */
export async function buildStarterRegistry(
  q: Questionnaire,
  size: number,
): Promise<{ products: Product[]; source: string }> {
  const target = Math.max(1, Math.min(size, 100))
  const { groups, source } = await getRecommendations(q)

  const byKey = new Map<string, Product>()
  const add = (p: Product) => {
    const key = `${p.productGid ?? p.id}|${p.title.trim().toLowerCase()}`
    if (!byKey.has(key)) byKey.set(key, p)
  }
  groups.flatMap((g) => g.products).forEach(add)

  // Top up from live UCP across categories until we reach the target.
  if (byKey.size < target && isUcpEnabled()) {
    for (const { category, query } of CATEGORY_QUERIES) {
      if (byKey.size >= target) break
      try {
        const { products } = await searchCatalog(query, {
          category,
          limit: Math.min(24, target),
        })
        products.forEach(add)
      } catch {
        // Ignore a failed category and keep going.
      }
    }
  }

  // Final fallback: fill any remainder from the seed catalog.
  if (byKey.size < target) {
    annotateSponsored(catalog).forEach(add)
  }

  return { products: [...byKey.values()].slice(0, target), source }
}
