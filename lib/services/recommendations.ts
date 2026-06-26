import "server-only"
import { catalog } from "@/lib/catalog"
import type { Product, ProductCategory, RecommendationGroup } from "@/lib/types"
import { isUcpEnabled, searchCatalog } from "./ucp"
import {
  getCachedRecommendations,
  questionnaireHash,
  setCachedRecommendations,
} from "./ai-cache"

export type Questionnaire = Record<string, string> & { size?: number }

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
    const products = catalog
      .filter((p) => g.categories.includes(p.category))
      .sort((a, b) => scoreProduct(b, q) - scoreProduct(a, q))
      .slice(0, perGroup)
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

export async function getRecommendations(
  q: Questionnaire,
): Promise<{
  groups: RecommendationGroup[]
  source: "cache" | "ucp" | "fallback"
}> {
  const hash = questionnaireHash(q)
  const cached = await getCachedRecommendations<RecommendationGroup[]>(hash)
  if (cached) return { groups: cached, source: "cache" }

  const ucp = isUcpEnabled() ? await curateWithUcp(q) : null
  const groups = ucp ?? curate(q)
  await setCachedRecommendations(hash, groups)
  return { groups, source: ucp ? "ucp" : "fallback" }
}
