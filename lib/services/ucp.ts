import "server-only"
import type { Product, ProductCategory } from "@/lib/types"

// ---------------------------------------------------------------------------
// Shopify Universal Commerce Protocol (UCP) — Global Catalog client.
//
// The Global Catalog is an MCP endpoint (JSON-RPC 2.0). Discovery requires no
// API key — only a public "agent profile" URL passed in the request metadata.
// Each result carries a per-variant `checkout_url` used for the buyer handoff.
// Docs: https://shopify.dev/docs/agents/catalog/global-catalog
// ---------------------------------------------------------------------------

const CATALOG_URL =
  process.env.UCP_CATALOG_URL || "https://catalog.shopify.com/api/ucp/mcp"
const AGENT_PROFILE =
  process.env.UCP_AGENT_PROFILE ||
  "https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json"
const TIMEOUT_MS = Number(process.env.UCP_TIMEOUT_MS || 15_000)

/** UCP discovery is on unless explicitly disabled (it needs no credentials). */
export function isUcpEnabled(): boolean {
  return process.env.UCP_ENABLED !== "false"
}

// --- raw UCP response shapes (only the fields we consume) ------------------
interface UcpMoney {
  amount: number // minor units (cents)
  currency: string
}
interface UcpVariant {
  id?: string
  price?: UcpMoney
  availability?: { available?: boolean }
  media?: { url?: string }[]
  seller?: { name?: string; domain?: string }
  checkout_url?: string
  rating?: { value?: number; count?: number }
}
interface UcpProduct {
  id: string
  title: string
  description?: { plain?: string }
  media?: { url?: string }[]
  variants?: UcpVariant[]
  price_range?: { min?: UcpMoney; max?: UcpMoney }
}

export interface SearchOptions {
  category?: ProductCategory
  limit?: number
  priceMin?: number // dollars
  priceMax?: number // dollars
  country?: string
  currency?: string
}

function mapProduct(p: UcpProduct, category: ProductCategory): Product | null {
  const v = p.variants?.[0]
  const amount = v?.price?.amount ?? p.price_range?.min?.amount
  if (amount == null) return null
  const image = p.media?.[0]?.url ?? v?.media?.[0]?.url ?? "/placeholder.svg"
  return {
    id: p.id,
    title: p.title,
    merchant: v?.seller?.name ?? "Shopify merchant",
    price: Math.round(amount) / 100,
    rating: v?.rating?.value ?? 0,
    reviews: v?.rating?.count ?? 0,
    category,
    image,
    description: p.description?.plain ?? "",
    productGid: p.id,
    variantId: v?.id,
    checkoutUrl: v?.checkout_url,
    sellerDomain: v?.seller?.domain,
  }
}

/** Parse a JSON or SSE (text/event-stream) MCP response body into JSON. */
function parseRpcBody(raw: string): unknown {
  const trimmed = raw.trim()
  if (trimmed.startsWith("{")) return JSON.parse(trimmed)
  // Streamable HTTP: take the last `data:` line.
  const dataLines = trimmed
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.slice(5).trim())
  if (dataLines.length) return JSON.parse(dataLines[dataLines.length - 1])
  return JSON.parse(trimmed)
}

async function callTool(
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(CATALOG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name,
          arguments: {
            meta: { "ucp-agent": { profile: AGENT_PROFILE } },
            ...args,
          },
        },
      }),
      signal: controller.signal,
    })
    const body = parseRpcBody(await res.text()) as {
      error?: { message?: string }
      result?: { structuredContent?: unknown }
    }
    if (body.error) {
      throw new Error(`UCP ${name} failed: ${body.error.message}`)
    }
    return body.result?.structuredContent ?? {}
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Search the Shopify Global Catalog. Results are tagged with the supplied
 * category (UCP does not return our taxonomy). Throws on failure so callers
 * can fall back to the seed catalog.
 */
export async function searchCatalog(
  query: string,
  opts: SearchOptions = {},
): Promise<Product[]> {
  const category = opts.category ?? "Home Decor"
  const catalog: Record<string, unknown> = {
    query,
    context: {
      country: opts.country ?? "US",
      language: "en",
      currency: opts.currency ?? "USD",
    },
    pagination: { limit: opts.limit ?? 12 },
  }
  if (opts.priceMin != null || opts.priceMax != null) {
    catalog.filters = {
      price: {
        ...(opts.priceMin != null ? { min: Math.round(opts.priceMin * 100) } : {}),
        ...(opts.priceMax != null ? { max: Math.round(opts.priceMax * 100) } : {}),
      },
    }
  }
  const structured = (await callTool("search_catalog", { catalog })) as {
    products?: UcpProduct[]
  }
  const products = structured.products ?? []
  return products
    .map((p) => mapProduct(p, category))
    .filter((p): p is Product => p !== null)
}

/** Resolve a single product/variant by its UCP gid (e.g. to refresh a checkout URL). */
export async function getProduct(
  id: string,
  category: ProductCategory = "Home Decor",
): Promise<Product | null> {
  const structured = (await callTool("get_product", {
    catalog: { id },
  })) as { product?: UcpProduct; products?: UcpProduct[] }
  const p = structured.product ?? structured.products?.[0]
  return p ? mapProduct(p, category) : null
}
