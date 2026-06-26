import "server-only"
import { withTransaction } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import {
  catalog,
  demoCouple,
  DEMO_USER,
  priorityToDbMap,
  seedRegistryItems,
  statusToDbMap,
} from "@/lib/catalog"

const DEMO_COUPLE_ID = "00000000-0000-0000-0000-0000000b0001"
const DEMO_REGISTRY_ID = "00000000-0000-0000-0000-0000000c0001"

/**
 * Idempotent seed: demo user + couple + registry, the full product catalog,
 * and a starter set of registry items (including one purchased gift so the
 * thank-you tracker and analytics have data on first load).
 */
export async function runSeed(): Promise<{ products: number; items: number }> {
  const passwordHash = await hashPassword("vowcart-demo")

  return withTransaction(async (client) => {
    // Demo user.
    await client.query(
      `INSERT INTO users (id, email, name, password_hash)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`,
      [DEMO_USER.id, DEMO_USER.email, DEMO_USER.name, passwordHash],
    )

    // Demo couple.
    await client.query(
      `INSERT INTO couples
         (id, user_id, partner_one, partner_two, wedding_date, location, slug, photo, story, is_public)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         partner_one = EXCLUDED.partner_one,
         partner_two = EXCLUDED.partner_two,
         wedding_date = EXCLUDED.wedding_date,
         location = EXCLUDED.location,
         photo = EXCLUDED.photo,
         story = EXCLUDED.story,
         is_public = EXCLUDED.is_public`,
      [
        DEMO_COUPLE_ID,
        DEMO_USER.id,
        demoCouple.partnerOne,
        demoCouple.partnerTwo,
        demoCouple.weddingDate,
        demoCouple.location,
        demoCouple.slug,
        demoCouple.photo,
        demoCouple.story,
        demoCouple.isPublic,
      ],
    )

    // Registry.
    await client.query(
      `INSERT INTO registries (id, couple_id, title)
       VALUES ($1,$2,$3)
       ON CONFLICT (id) DO NOTHING`,
      [DEMO_REGISTRY_ID, DEMO_COUPLE_ID, "Our Wedding Registry"],
    )

    // Products.
    for (const p of catalog) {
      await client.query(
        `INSERT INTO products
           (id, title, merchant, price, rating, reviews, category, image, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           merchant = EXCLUDED.merchant,
           price = EXCLUDED.price,
           rating = EXCLUDED.rating,
           reviews = EXCLUDED.reviews,
           category = EXCLUDED.category,
           image = EXCLUDED.image,
           description = EXCLUDED.description`,
        [
          p.id,
          p.title,
          p.merchant,
          p.price,
          p.rating,
          p.reviews,
          p.category,
          p.image,
          p.description,
        ],
      )
    }

    // Registry items (+ purchases for the purchased ones).
    let itemCount = 0
    for (const s of seedRegistryItems) {
      const product = catalog.find((p) => p.id === s.productId)
      if (!product) continue
      const itemId = `${DEMO_REGISTRY_ID.slice(0, 24)}${String(itemCount + 1).padStart(12, "0")}`
      itemCount++
      await client.query(
        `INSERT INTO registry_items
           (id, registry_id, product_id, merchant, title, image, price, rating, reviews, description, category, priority, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, priority = EXCLUDED.priority`,
        [
          itemId,
          DEMO_REGISTRY_ID,
          product.id,
          product.merchant,
          product.title,
          product.image,
          product.price,
          product.rating,
          product.reviews,
          product.description,
          product.category,
          priorityToDbMap[s.priority],
          statusToDbMap[s.status],
        ],
      )
      if (s.status === "purchased" && s.purchasedBy) {
        await client.query(
          `INSERT INTO purchases
             (registry_item_id, guest_name, guest_email, shopify_order_id, thank_you_sent, purchased_at)
           VALUES ($1,$2,$3,$4,$5, COALESCE($6::timestamptz, now()))
           ON CONFLICT (registry_item_id) DO NOTHING`,
          [
            itemId,
            s.purchasedBy,
            s.purchasedByEmail ?? "guest@example.com",
            `SEED-${itemId.slice(-6)}`,
            Boolean(s.thankYouSent),
            s.purchaseDate ? `${s.purchaseDate}T12:00:00Z` : null,
          ],
        )
      }
    }

    return { products: catalog.length, items: itemCount }
  })
}
