import "server-only"
import type { RegistryItem } from "@/lib/types"

// ---------------------------------------------------------------------------
// Guest Gift Finder — helps a guest pick from the registry. It ONLY ever
// recommends items that are currently AVAILABLE, returning 3–5 matches.
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: { match: RegExp; category: string }[] = [
  { match: /coffee|espresso|kitchen|cook|chef|bak/i, category: "Kitchen" },
  { match: /din(e|ing)|plate|glass|host|entertain/i, category: "Dining" },
  { match: /bed|sheet|pillow|sleep|cozy/i, category: "Bedroom" },
  { match: /bath|towel|robe|spa/i, category: "Bathroom" },
  { match: /travel|luggage|honeymoon|trip/i, category: "Travel" },
  { match: /smart|tech|gadget|vacuum/i, category: "Smart Home" },
  { match: /decor|lamp|art|blanket|home/i, category: "Home Decor" },
]

function parseBudget(text: string): number | null {
  const m = text.match(/\$?\s?(\d{2,4})/)
  return m ? Number(m[1]) : null
}

export interface GiftFinderResult {
  reply: string
  items: RegistryItem[]
}

export function findGifts(
  message: string,
  registryItems: RegistryItem[],
): GiftFinderResult {
  const text = message.toLowerCase()
  const available = registryItems.filter((i) => i.status === "available")

  if (available.length === 0) {
    return {
      reply:
        "Every gift on this registry has already been claimed — that's wonderful! Reach out to the couple directly if you'd still like to contribute.",
      items: [],
    }
  }

  const budget = parseBudget(text)
  const under = /under|below|less than|cheap|budget|max/i.test(text)
  const meaningful = /meaningful|special|memorable|sentimental|nice|generous|splurge/i.test(text)
  const mustHave = /must.?have|most wanted|top|priorit/i.test(text)
  const category = CATEGORY_KEYWORDS.find((k) => k.match.test(text))?.category ?? null

  const scored = available
    .map((item) => {
      let score = item.rating
      if (item.priority === "must-have") score += mustHave || meaningful ? 4 : 1
      if (category && item.category === category) score += 4
      if (budget) {
        if (under) score += item.price <= budget ? 3 : -5
        else score += Math.abs(item.price - budget) <= budget * 0.35 ? 2 : 0
      }
      if (meaningful) score += item.price >= 150 ? 1 : 0
      return { item, score }
    })
    .sort((a, b) => b.score - a.score)

  // Hard budget filter when the guest gave an explicit ceiling. Prefer items
  // within budget whenever any qualify; only relax if none do.
  let pool = scored
  let noneInBudget = false
  if (budget && under) {
    const within = scored.filter((s) => s.item.price <= budget)
    if (within.length > 0) pool = within
    else noneInBudget = true
  }

  const items = pool.slice(0, 5).map((s) => s.item)

  if (noneInBudget) {
    return {
      reply: `Nothing available is under $${budget} right now, but here are the closest available gifts:`,
      items,
    }
  }

  const bits: string[] = []
  if (mustHave) bits.push("their most-wanted gifts")
  if (category) bits.push(`${category.toLowerCase()} picks`)
  if (budget) bits.push(under ? `options under $${budget}` : `gifts around $${budget}`)
  if (meaningful) bits.push("something memorable")
  const focus = bits.length ? ` Here are ${bits.join(", ")}:` : " Here are a few they'd love:"

  return {
    reply: `Found ${items.length} available gift${items.length === 1 ? "" : "s"}.${focus}`,
    items,
  }
}
