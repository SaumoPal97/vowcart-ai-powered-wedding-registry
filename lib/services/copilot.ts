import "server-only"
import { generateText } from "ai"
import { annotateSponsored, catalog } from "@/lib/catalog"
import { isAiEnabled } from "./recommendations"
import type { Product, ProductCategory, RegistryItem } from "@/lib/types"

const AI_MODEL = process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini"

// ---------------------------------------------------------------------------
// AI Registry Copilot — an *editing* assistant (not analytics). It interprets a
// natural-language instruction and proposes concrete changes (add / remove)
// the couple can review and apply. A deterministic rule engine keeps the demo
// reliable; it can be swapped for / augmented by a model later.
// ---------------------------------------------------------------------------

export interface CopilotItem {
  id: string
  title: string
  category: string
  price: number
  priority: "must-have" | "nice-to-have"
  status: "available" | "reserved" | "purchased"
}

export interface CopilotProposal {
  reply: string
  add: Product[]
  remove: { id: string; title: string; reason: string }[]
}

const CATEGORY_KEYWORDS: { match: RegExp; category: ProductCategory }[] = [
  { match: /coffee|espresso|barista/i, category: "Kitchen" },
  { match: /cook|cookware|kitchen|chef|bak/i, category: "Kitchen" },
  { match: /din(e|ing)|plate|glass|flatware|host|entertain/i, category: "Dining" },
  { match: /bed|sheet|pillow|sleep|linen/i, category: "Bedroom" },
  { match: /bath|towel|robe|spa/i, category: "Bathroom" },
  { match: /travel|luggage|suitcase|trip|honeymoon|duffel/i, category: "Travel" },
  { match: /smart|vacuum|robot|thermostat|light|tech/i, category: "Smart Home" },
  { match: /decor|lamp|art|blanket|throw|cozy/i, category: "Home Decor" },
]

function parseBudget(text: string): number | null {
  const m = text.match(/\$?\s?(\d{2,4})/)
  return m ? Number(m[1]) : null
}

function existingTitles(items: CopilotItem[]): Set<string> {
  return new Set(items.map((i) => i.title.trim().toLowerCase()))
}

/** Pick up to `n` catalog products not already on the registry. */
function pickNew(
  items: CopilotItem[],
  filter: (p: Product) => boolean,
  n = 4,
): Product[] {
  const have = existingTitles(items)
  return annotateSponsored(
    catalog
      .filter((p) => !have.has(p.title.trim().toLowerCase()) && filter(p))
      .sort((a, b) => b.rating - a.rating),
  ).slice(0, n)
}

const removable = (i: CopilotItem) => i.status === "available"

export function buildProposal(
  message: string,
  items: CopilotItem[],
): CopilotProposal {
  const text = message.toLowerCase()
  const add: Product[] = []
  const remove: CopilotProposal["remove"] = []
  const notes: string[] = []

  const wantsRemove = /remove|don'?t need|already (own|have)|too many|fewer|less|declutter|minimal/i.test(
    text,
  )
  const wantsAdd = /add|more|include|want|show|need|suggest|find/i.test(text)
  const budget = parseBudget(text)
  const underBudget = /under|below|less than|cheap|affordable|budget/i.test(text)
  const premium = /premium|luxur|high.?end|nicer|upgrade|splurge/i.test(text)
  const expensive = /expensive|pricey|costly|over|above/i.test(text)

  // Category intent from keywords.
  const targetCategory =
    CATEGORY_KEYWORDS.find((k) => k.match.test(text))?.category ?? null

  // --- removals -------------------------------------------------------------
  if (expensive && wantsRemove) {
    const threshold = budget ?? 300
    for (const i of items.filter(removable)) {
      if (i.price > threshold)
        remove.push({ id: i.id, title: i.title, reason: `Over $${threshold}` })
    }
    notes.push(`Flagged ${remove.length} gift(s) over $${threshold} to remove.`)
  } else if (/minimal/i.test(text)) {
    for (const i of items.filter(removable)) {
      if (i.priority === "nice-to-have")
        remove.push({ id: i.id, title: i.title, reason: "Trimmed for a minimalist registry" })
    }
    notes.push(`Trimmed ${remove.length} nice-to-have gift(s) for a leaner registry.`)
  } else if (wantsRemove) {
    // "I already own a vacuum" / "remove the espresso machine" — keyword match.
    const cat = targetCategory
    for (const i of items.filter(removable)) {
      const hit =
        (cat && i.category === cat) ||
        CATEGORY_KEYWORDS.some(
          (k) => k.match.test(text) && k.match.test(i.title),
        )
      if (hit) remove.push({ id: i.id, title: i.title, reason: "Matches your request" })
    }
    if (remove.length) notes.push(`Found ${remove.length} matching gift(s) to remove.`)
  }

  // --- additions ------------------------------------------------------------
  if (wantsAdd || (!wantsRemove && (budget || targetCategory))) {
    let filter: (p: Product) => boolean = () => true
    if (targetCategory) {
      const cat = targetCategory
      // For coffee specifically, prefer coffee/espresso products.
      if (/coffee|espresso|barista/i.test(text)) {
        filter = (p) => /coffee|espresso/i.test(p.title) || p.category === cat
      } else {
        filter = (p) => p.category === cat
      }
    }
    if (budget && underBudget) {
      const base = filter
      filter = (p) => base(p) && p.price <= budget
    } else if (premium) {
      const base = filter
      filter = (p) => base(p) && p.price >= 200
    }
    add.push(...pickNew(items, filter, 4))
    if (add.length) {
      const label = targetCategory ? `${targetCategory.toLowerCase()} ` : ""
      const budgetLabel = budget && underBudget ? ` under $${budget}` : premium ? " (premium picks)" : ""
      notes.push(`Suggested ${add.length} ${label}gift(s)${budgetLabel}.`)
    }
  }

  let reply: string
  if (!add.length && !remove.length) {
    reply =
      "I couldn't find specific changes for that. Try things like “add more kitchen gifts under $100”, “remove expensive gifts”, or “make the registry more minimalist.”"
  } else {
    reply = notes.join(" ") + " Review the proposed changes below and apply the ones you like."
  }

  return { reply, add, remove }
}

// --- LLM-backed planning ---------------------------------------------------

// Extract a JSON object from a (possibly fenced) model response.
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

function matchCatalogByTitle(title: string, taken: Set<string>): Product | null {
  const t = title.trim().toLowerCase()
  let p = catalog.find((c) => c.title.trim().toLowerCase() === t)
  if (!p) p = catalog.find((c) => c.title.toLowerCase().includes(t) || t.includes(c.title.toLowerCase()))
  if (!p || taken.has(p.title.trim().toLowerCase())) return null
  return p
}

function matchItemByTitle(title: string, items: CopilotItem[]): CopilotItem | null {
  const t = title.trim().toLowerCase()
  return (
    items.find((i) => i.title.trim().toLowerCase() === t) ??
    items.find(
      (i) => i.title.toLowerCase().includes(t) || t.includes(i.title.toLowerCase()),
    ) ??
    null
  )
}

/** Ask the model to choose concrete add/remove titles, grounded in real data. */
async function planWithAi(
  message: string,
  items: CopilotItem[],
): Promise<CopilotProposal | null> {
  const have = new Set(items.map((i) => i.title.trim().toLowerCase()))
  const addable = catalog.filter((p) => !have.has(p.title.trim().toLowerCase()))
  const registryList = items
    .filter((i) => i.status === "available")
    .map((i) => `- ${i.title} ($${i.price}, ${i.category}, ${i.priority})`)
    .join("\n")
  const catalogList = addable
    .map((p) => `- ${p.title} ($${p.price}, ${p.category})`)
    .join("\n")

  try {
    const { text } = await generateText({
      model: AI_MODEL,
      maxRetries: 2,
      system:
        "You are an AI wedding registry editing copilot. Interpret the couple's " +
        "instruction and decide which gifts to add and/or remove. Reply with ONLY " +
        'valid JSON: {"reply":string,"addTitles":string[],"removeTitles":string[]}. ' +
        "addTitles MUST be chosen verbatim from the AVAILABLE CATALOG. removeTitles " +
        "MUST be chosen verbatim from the CURRENT REGISTRY. Pick 0–5 of each — only " +
        "what genuinely matches the request. Keep reply to one friendly sentence.",
      prompt:
        `Instruction: ${message}\n\n` +
        `CURRENT REGISTRY (removable):\n${registryList || "(empty)"}\n\n` +
        `AVAILABLE CATALOG (addable):\n${catalogList}`,
    })
    const parsed = parseJson(text) as {
      reply?: string
      addTitles?: unknown
      removeTitles?: unknown
    } | null
    if (!parsed) return null

    const taken = new Set<string>()
    const add: Product[] = []
    if (Array.isArray(parsed.addTitles)) {
      for (const t of parsed.addTitles.slice(0, 5)) {
        if (typeof t !== "string") continue
        const p = matchCatalogByTitle(t, taken)
        if (p) {
          taken.add(p.title.trim().toLowerCase())
          add.push(p)
        }
      }
    }
    const remove: CopilotProposal["remove"] = []
    const removedIds = new Set<string>()
    if (Array.isArray(parsed.removeTitles)) {
      for (const t of parsed.removeTitles.slice(0, 8)) {
        if (typeof t !== "string") continue
        const i = matchItemByTitle(t, items)
        if (i && i.status === "available" && !removedIds.has(i.id)) {
          removedIds.add(i.id)
          remove.push({ id: i.id, title: i.title, reason: "Matches your request" })
        }
      }
    }
    if (!add.length && !remove.length) return null
    return {
      reply:
        (typeof parsed.reply === "string" && parsed.reply.trim()) ||
        "Here are the changes I'd suggest — review and apply the ones you like.",
      add: annotateSponsored(add),
      remove,
    }
  } catch (err) {
    console.error("[v0] copilot AI planning failed:", err)
    return null
  }
}

/**
 * Public entry point: try the LLM planner, fall back to the deterministic rule
 * engine when AI is disabled or returns nothing usable.
 */
export async function proposeChanges(
  message: string,
  items: CopilotItem[],
): Promise<CopilotProposal> {
  if (isAiEnabled()) {
    const ai = await planWithAi(message, items)
    if (ai) return ai
  }
  return buildProposal(message, items)
}
