import "server-only"
import { generateObject } from "ai"
import { z } from "zod"
import { catalog } from "@/lib/catalog"
import type { Product, RecommendationGroup } from "@/lib/types"
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

async function curateWithAI(q: Questionnaire): Promise<RecommendationGroup[] | null> {
  try {
    const compact = catalog.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price,
    }))
    const { object } = await generateObject({
      model: "openai/gpt-5-mini",
      schema: z.object({
        groups: z.array(
          z.object({
            id: z.string(),
            productIds: z.array(z.string()),
          }),
        ),
      }),
      prompt:
        `You are a wedding registry curator. Given this couple's lifestyle answers:\n` +
        `${JSON.stringify(q)}\n\n` +
        `And this product catalog (id, title, category, price):\n` +
        `${JSON.stringify(compact)}\n\n` +
        `Select the best 3-4 products for each of these groups by id: ` +
        `${GROUPS.map((g) => `${g.id} (${g.categories.join("/")})`).join(", ")}.\n` +
        `Only use product ids from the catalog. Tailor picks to the answers ` +
        `(cooking, coffee, travel, budget, home type). Return ids per group.`,
    })
    const byId = new Map(catalog.map((p) => [p.id, p]))
    const groups = GROUPS.map((g) => {
      const picked = object.groups.find((x) => x.id === g.id)
      const products = (picked?.productIds ?? [])
        .map((id) => byId.get(id))
        .filter((p): p is Product => Boolean(p) && g.categories.includes(p!.category))
        .slice(0, 4)
      return { id: g.id, title: g.title, subtitle: g.subtitle, products }
    }).filter((g) => g.products.length > 0)
    // If the model returned too little, treat as failure.
    const total = groups.reduce((a, g) => a + g.products.length, 0)
    return total >= 6 ? groups : null
  } catch {
    return null
  }
}

export async function getRecommendations(
  q: Questionnaire,
): Promise<{ groups: RecommendationGroup[]; source: "cache" | "ai" | "fallback" }> {
  const hash = questionnaireHash(q)
  const cached = await getCachedRecommendations<RecommendationGroup[]>(hash)
  if (cached) return { groups: cached, source: "cache" }

  const ai = await curateWithAI(q)
  const groups = ai ?? curate(q)
  await setCachedRecommendations(hash, groups)
  return { groups, source: ai ? "ai" : "fallback" }
}
