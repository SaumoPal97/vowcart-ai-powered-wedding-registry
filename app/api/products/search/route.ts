import { NextResponse } from "next/server"
import { searchCatalog, isUcpEnabled } from "@/lib/services/ucp"
import { catalog, CATEGORIES } from "@/lib/catalog"
import type { Product, ProductCategory } from "@/lib/types"

export const maxDuration = 30

// Local seed search used when UCP is disabled or unavailable.
function seedSearch(query: string, category?: ProductCategory): Product[] {
  const q = query.trim().toLowerCase()
  return catalog.filter((p) => {
    const matchesCategory = !category || p.category === category
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.merchant.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })
}

export async function POST(request: Request) {
  let query = ""
  let category: ProductCategory | undefined
  try {
    const body = await request.json()
    query = String(body.query ?? "").slice(0, 200)
    if (body.category && CATEGORIES.includes(body.category)) {
      category = body.category as ProductCategory
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (isUcpEnabled() && query) {
    try {
      const products = await searchCatalog(query, { category, limit: 24 })
      if (products.length > 0) {
        return NextResponse.json({ products, source: "ucp" })
      }
    } catch (err) {
      console.error("[v0] UCP search failed, falling back to seed:", err)
    }
  }
  return NextResponse.json({
    products: seedSearch(query, category),
    source: "seed",
  })
}
