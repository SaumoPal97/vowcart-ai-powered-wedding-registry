import { NextResponse } from "next/server"
import { getCoupleForRequest } from "@/lib/repos/couples"
import { addRegistryItem, getRegistryItemsByCoupleId } from "@/lib/repos/registry"
import { getCatalogProductById } from "@/lib/catalog"

export async function GET() {
  const couple = await getCoupleForRequest()
  if (!couple) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const items = await getRegistryItemsByCoupleId(couple.id)
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
  const couple = await getCoupleForRequest()
  if (!couple) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    // A full UCP/search product object, or a seed catalog id.
    const product =
      body.product ??
      (body.productId ? getCatalogProductById(body.productId) : undefined)
    const item = await addRegistryItem(couple.id, {
      product,
      title: body.title,
      merchant: body.merchant,
      image: body.image,
      price: body.price,
      category: body.category,
      priority: body.priority,
      productGid: body.productGid,
      variantId: body.variantId,
      checkoutUrl: body.checkoutUrl,
      description: body.description,
      itemType: body.itemType,
      isGroupGift: body.isGroupGift,
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
