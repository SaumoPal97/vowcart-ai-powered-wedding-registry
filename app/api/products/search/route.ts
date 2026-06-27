import { NextResponse } from "next/server"
import { searchCatalog, isUcpEnabled } from "@/lib/services/ucp"
import { annotateSponsored, catalog, CATEGORIES } from "@/lib/catalog"
import type { Product, ProductCategory } from "@/lib/types"

export const maxDuration = 30

// Local seed search used when UCP is disabled or unavailable.
function seedSearch(
  query: string,
  category?: ProductCategory,
  priceMin?: number,
  priceMax?: number,
): Product[] {
  const q = query.trim().toLowerCase()
  return catalog.filter((p) => {
    const matchesCategory = !category || p.category === category
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.merchant.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    const matchesPrice =
      (priceMin == null || p.price >= priceMin) &&
      (priceMax == null || p.price <= priceMax)
    return matchesCategory && matchesQuery && matchesPrice
  })
}

export async function POST(request: Request) {
  let query = ""
  let category: ProductCategory | undefined
  let cursor: string | undefined
  let priceMin: number | undefined
  let priceMax: number | undefined
  try {
    const body = await request.json()
    query = String(body.query ?? "").slice(0, 200)
    if (body.category && CATEGORIES.includes(body.category)) {
      category = body.category as ProductCategory
    }
    if (typeof body.cursor === "string") cursor = body.cursor
    if (typeof body.priceMin === "number" && body.priceMin >= 0)
      priceMin = body.priceMin
    if (typeof body.priceMax === "number" && body.priceMax > 0)
      priceMax = body.priceMax
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  // Sponsored placements: matching promoted seed products surface at the top of
  // discovery, clearly labeled. Only on the first page (no cursor).
  function sponsoredMatches(): Product[] {
    if (cursor) return []
    const q = query.trim().toLowerCase()
    return annotateSponsored(catalog)
      .filter((p) => p.isSponsored)
      .filter((p) => !category || p.category === category)
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.merchant.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .filter(
        (p) =>
          (priceMin == null || p.price >= priceMin) &&
          (priceMax == null || p.price <= priceMax),
      )
      .slice(0, 2)
  }

  if (isUcpEnabled() && query) {
    try {
      const result = await searchCatalog(query, {
        category,
        limit: 24,
        cursor,
        priceMin,
        priceMax,
      })
      if (result.products.length > 0) {
        const sponsored = sponsoredMatches()
        const have = new Set(sponsored.map((p) => p.title.trim().toLowerCase()))
        const merged = [
          ...sponsored,
          ...result.products.filter(
            (p) => !have.has(p.title.trim().toLowerCase()),
          ),
        ]
        return NextResponse.json({
          products: merged,
          cursor: result.cursor,
          hasNextPage: result.hasNextPage,
          totalCount: result.totalCount,
          source: "ucp",
        })
      }
    } catch (err) {
      console.error("[v0] UCP search failed, falling back to seed:", err)
    }
  }
  // Seed fallback is a single page (no cursor). Sponsored products surface
  // first, each clearly labeled on the consumer card.
  const seed = annotateSponsored(seedSearch(query, category, priceMin, priceMax))
  seed.sort((a, b) => Number(b.isSponsored ?? false) - Number(a.isSponsored ?? false))
  return NextResponse.json({
    products: seed,
    cursor: null,
    hasNextPage: false,
    source: "seed",
  })
}
