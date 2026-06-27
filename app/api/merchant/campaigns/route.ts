import { NextResponse } from "next/server"
import { getMerchantForRequest, createSponsoredCampaign } from "@/lib/repos/merchant"

export async function POST(req: Request) {
  try {
    const merchant = await getMerchantForRequest()
    if (!merchant) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }
    const body = await req.json()
    const { productId, productTitle, category, budget, bid, startDate, endDate, status } =
      body
    if (!productTitle || !category) {
      return NextResponse.json(
        { error: "Product and category are required." },
        { status: 400 },
      )
    }
    const campaign = await createSponsoredCampaign(merchant, {
      productId: productId ?? null,
      productTitle,
      category,
      budget: Number(budget) || 0,
      bid: Number(bid) || 0,
      startDate,
      endDate,
      status: status ?? "draft",
    })
    return NextResponse.json({ campaign }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/merchant/campaigns failed:", err)
    return NextResponse.json({ error: "Failed to create campaign." }, { status: 500 })
  }
}
