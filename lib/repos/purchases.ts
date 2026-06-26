import "server-only"
import { isDbConfigured, query, withTransaction } from "@/lib/db"
import { buildSeedItems } from "./registry"
import type { ThankYouNote } from "@/lib/types"

interface ThankYouRow {
  id: string
  gift: string
  guest_name: string
  guest_email: string
  purchased_at: string
  thank_you_sent: boolean
}

export interface CheckoutInput {
  registryItemId: string
  guestName: string
  guestEmail: string
  shopifyOrderId?: string
}

/**
 * Completes a checkout atomically: records the purchase and flips the
 * registry item to PURCHASED. Returns null if the item is already taken.
 */
export async function completeCheckout(input: CheckoutInput) {
  if (!isDbConfigured()) {
    return {
      id: `seed-purchase-${Date.now()}`,
      registryItemId: input.registryItemId,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      shopifyOrderId:
        input.shopifyOrderId ?? `DEMO-${Math.floor(Math.random() * 1e6)}`,
      purchasedAt: new Date().toISOString(),
    }
  }

  return withTransaction(async (client) => {
    const locked = await client.query(
      `SELECT id, status FROM registry_items WHERE id = $1 FOR UPDATE`,
      [input.registryItemId],
    )
    if (locked.rowCount === 0) throw new Error("ITEM_NOT_FOUND")
    if (locked.rows[0].status === "PURCHASED") throw new Error("ALREADY_PURCHASED")

    const orderId =
      input.shopifyOrderId ?? `SHOP-${Math.floor(Math.random() * 1e9)}`
    const inserted = await client.query(
      `INSERT INTO purchases
         (registry_item_id, guest_name, guest_email, shopify_order_id)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (registry_item_id) DO NOTHING
       RETURNING id, purchased_at`,
      [input.registryItemId, input.guestName, input.guestEmail, orderId],
    )
    if (inserted.rowCount === 0) throw new Error("ALREADY_PURCHASED")

    await client.query(
      `UPDATE registry_items SET status = 'PURCHASED', updated_at = now() WHERE id = $1`,
      [input.registryItemId],
    )

    return {
      id: inserted.rows[0].id as string,
      registryItemId: input.registryItemId,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      shopifyOrderId: orderId,
      purchasedAt: inserted.rows[0].purchased_at as string,
    }
  })
}

function seedThankYous(): ThankYouNote[] {
  return buildSeedItems()
    .filter((i) => i.status === "purchased" && i.purchasedBy)
    .map((i) => ({
      id: `ty-${i.id}`,
      gift: i.title,
      purchasedBy: i.purchasedBy as string,
      email: i.purchasedByEmail ?? "",
      purchaseDate: i.purchaseDate ?? "",
      // Seed: first purchased item is "sent", rest pending (matches prior UI).
      status: i.id === "seed-p4" ? "sent" : "pending",
    }))
}

export async function getThankYouNotes(coupleId: string): Promise<ThankYouNote[]> {
  if (!isDbConfigured()) return seedThankYous()
  const { rows } = await query<ThankYouRow>(
    `SELECT p.id, ri.title AS gift, p.guest_name, p.guest_email,
            p.purchased_at, p.thank_you_sent
       FROM purchases p
       JOIN registry_items ri ON ri.id = p.registry_item_id
       JOIN registries r ON r.id = ri.registry_id
      WHERE r.couple_id = $1
      ORDER BY p.purchased_at DESC`,
    [coupleId],
  )
  return rows.map((r) => ({
    id: r.id,
    gift: r.gift,
    purchasedBy: r.guest_name,
    email: r.guest_email,
    purchaseDate: r.purchased_at
      ? new Date(r.purchased_at).toISOString().slice(0, 10)
      : "",
    status: r.thank_you_sent ? "sent" : "pending",
  }))
}

export async function setThankYouStatus(
  purchaseId: string,
  sent: boolean,
): Promise<boolean> {
  if (!isDbConfigured()) return true
  const { rowCount } = await query(
    `UPDATE purchases
        SET thank_you_sent = $2,
            thank_you_sent_at = CASE WHEN $2 THEN now() ELSE NULL END
      WHERE id = $1`,
    [purchaseId, sent],
  )
  return rowCount > 0
}
