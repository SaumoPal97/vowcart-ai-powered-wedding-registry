import "server-only"
import { generateText } from "ai"
import { isAiEnabled } from "./recommendations"
import type { RegistryItem } from "@/lib/types"

const AI_MODEL = process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini"

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

// --- LLM-backed finder -----------------------------------------------------

function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim()
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    return null
  }
}

async function findWithAi(
  message: string,
  available: RegistryItem[],
): Promise<GiftFinderResult | null> {
  const list = available
    .map((i) => `- ${i.title} ($${i.price}, ${i.category}, ${i.priority})`)
    .join("\n")
  try {
    const { text } = await generateText({
      model: AI_MODEL,
      maxRetries: 2,
      system:
        "You help a wedding guest choose a gift from a registry. Reply with ONLY " +
        'valid JSON: {"reply":string,"pickTitles":string[]}. pickTitles MUST be ' +
        "3–5 titles chosen verbatim from the AVAILABLE GIFTS list, best matching " +
        "the guest's budget and intent. reply is one warm, helpful sentence.",
      prompt: `Guest says: ${message}\n\nAVAILABLE GIFTS:\n${list}`,
    })
    const parsed = parseJson(text) as {
      reply?: string
      pickTitles?: unknown
    } | null
    if (!parsed || !Array.isArray(parsed.pickTitles)) return null
    const picks: RegistryItem[] = []
    const seen = new Set<string>()
    for (const t of parsed.pickTitles.slice(0, 5)) {
      if (typeof t !== "string") continue
      const tl = t.trim().toLowerCase()
      const item =
        available.find((i) => i.title.trim().toLowerCase() === tl) ??
        available.find(
          (i) =>
            i.title.toLowerCase().includes(tl) || tl.includes(i.title.toLowerCase()),
        )
      if (item && !seen.has(item.id)) {
        seen.add(item.id)
        picks.push(item)
      }
    }
    if (picks.length === 0) return null
    return {
      reply:
        (typeof parsed.reply === "string" && parsed.reply.trim()) ||
        `Here are ${picks.length} available gifts they'd love:`,
      items: picks,
    }
  } catch (err) {
    console.error("[v0] gift finder AI failed:", err)
    return null
  }
}

/** Public entry point: LLM finder with a rule-engine fallback. */
export async function findGiftsSmart(
  message: string,
  registryItems: RegistryItem[],
): Promise<GiftFinderResult> {
  const available = registryItems.filter((i) => i.status === "available")
  if (available.length > 0 && isAiEnabled()) {
    const ai = await findWithAi(message, available)
    if (ai) return ai
  }
  return findGifts(message, registryItems)
}
