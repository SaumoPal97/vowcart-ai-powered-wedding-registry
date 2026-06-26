import { NextResponse } from "next/server"
import { completeCheckout } from "@/lib/repos/purchases"
import { deleteReservation } from "@/lib/services/reservations"
import { recordEvent } from "@/lib/services/analytics"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { registryItemId, guestName, guestEmail, slug, registryId } = body
    if (!registryItemId || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: "registryItemId, guestName and guestEmail are required" },
        { status: 400 },
      )
    }

    let purchase
    try {
      // Simulate a Shopify order id for the completed checkout.
      const shopifyOrderId = `SHOP-${Date.now().toString(36).toUpperCase()}`
      purchase = await completeCheckout({
        registryItemId,
        guestName,
        guestEmail,
        shopifyOrderId,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "CHECKOUT_FAILED"
      if (message === "ALREADY_PURCHASED") {
        return NextResponse.json(
          { error: "This gift has already been purchased." },
          { status: 409 },
        )
      }
      if (message === "ITEM_NOT_FOUND") {
        return NextResponse.json({ error: "Gift not found." }, { status: 404 })
      }
      throw err
    }

    // Release the DynamoDB reservation lock now that the purchase is final.
    await deleteReservation(registryItemId)

    // Fire-and-forget analytics; never block the checkout response.
    void recordEvent(registryId ?? slug ?? "unknown", "purchase_click", {
      registryItemId,
      value: purchase.shopifyOrderId,
    })

    return NextResponse.json({ purchase }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/checkout failed:", err)
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}
