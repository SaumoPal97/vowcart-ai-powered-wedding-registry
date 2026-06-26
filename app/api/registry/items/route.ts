import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { addRegistryItem, getRegistryItemsByCoupleId } from "@/lib/repos/registry"
import { getCatalogProductById } from "@/lib/catalog"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const items = await getRegistryItemsByCoupleId(user.coupleId)
    return NextResponse.json({ items })
  } catch (err) {
    console.error("[v0] GET /api/registry/items failed:", err)
    return NextResponse.json(
      { error: "Failed to load registry items" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const product = body.productId
      ? getCatalogProductById(body.productId)
      : undefined
    const item = await addRegistryItem(user.coupleId, {
      product,
      title: body.title,
      merchant: body.merchant,
      image: body.image,
      price: body.price,
      category: body.category,
      priority: body.priority,
    })
    if (!item) {
      return NextResponse.json(
        { error: "Could not add item" },
        { status: 400 },
      )
    }
    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/registry/items failed:", err)
    return NextResponse.json(
      { error: "Failed to add registry item" },
      { status: 500 },
    )
  }
}
