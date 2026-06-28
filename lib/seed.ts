import "server-only"
import { withTransaction } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import {
  catalog,
  demoCouple,
  demoMerchant,
  DEMO_MERCHANT_USER,
  DEMO_USER,
  priorityToDbMap,
  seedRegistryItems,
  seedSponsoredCampaigns,
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
           (id, registry_id, product_id, merchant, title, image, price, rating, reviews, description, category, priority, status, is_group_gift)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, priority = EXCLUDED.priority, is_group_gift = EXCLUDED.is_group_gift`,
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
          Boolean(s.isGroupGift),
        ],
      )
      // Seed a couple of contributions on the group-gift item so the public
      // page shows real progress out of the box.
      if (s.isGroupGift) {
        await client.query(
          `DELETE FROM gift_contributions WHERE registry_item_id = $1 AND guest_email LIKE 'seed-%'`,
          [itemId],
        )
        await client.query(
          `INSERT INTO gift_contributions (registry_item_id, guest_name, guest_email, amount, message)
           VALUES ($1,'The Patels','seed-patels@example.com',75,'So happy for you both!'),
                  ($1,'Marcus Lee','seed-marcus@example.com',75,'Cook up something wonderful.')`,
          [itemId],
        )
      }
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

    // A demo cash fund (honeymoon) with a few contributions, so the public
    // registry showcases cash funds + group gifting out of the box.
    const cashFundId = `${DEMO_REGISTRY_ID.slice(0, 24)}00000000cf01`
    await client.query(
      `INSERT INTO registry_items
         (id, registry_id, product_id, merchant, title, image, price, rating, reviews, description, category, priority, status, item_type, is_group_gift)
       VALUES ($1,$2,NULL,'Cash Fund','Honeymoon in Italy',$3,3000,0,0,$4,'Travel','NICE_TO_HAVE','AVAILABLE','cash_fund',true)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price, image = EXCLUDED.image, item_type = EXCLUDED.item_type, is_group_gift = EXCLUDED.is_group_gift`,
      [
        cashFundId,
        DEMO_REGISTRY_ID,
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=70",
        "Help us explore the Amalfi Coast on our dream honeymoon — every contribution takes us one step closer.",
      ],
    )
    await client.query(
      `DELETE FROM gift_contributions WHERE registry_item_id = $1 AND guest_email LIKE 'seed-%'`,
      [cashFundId],
    )
    await client.query(
      `INSERT INTO gift_contributions (registry_item_id, guest_name, guest_email, amount, message)
       VALUES ($1,'Grandma Rose','seed-rose@example.com',250,'For a magical trip!'),
              ($1,'The Okafor Family','seed-okafor@example.com',400,'Enjoy every moment.'),
              ($1,'Sofia & Liam','seed-sofia@example.com',200,'Buon viaggio!')`,
      [cashFundId],
    )

    // Merchant account + first user (separate identity from the couple).
    await client.query(
      `INSERT INTO merchants (id, name, slug, website, shopify_merchant_id, plan, brands)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         website = EXCLUDED.website,
         shopify_merchant_id = EXCLUDED.shopify_merchant_id,
         plan = EXCLUDED.plan,
         brands = EXCLUDED.brands`,
      [
        demoMerchant.id,
        demoMerchant.name,
        demoMerchant.slug,
        demoMerchant.website,
        demoMerchant.shopifyMerchantId,
        "GROWTH",
        demoMerchant.brands,
      ],
    )
    await client.query(
      `INSERT INTO merchant_users (id, merchant_id, email, name, password_hash)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`,
      [
        DEMO_MERCHANT_USER.id,
        DEMO_MERCHANT_USER.merchantId,
        DEMO_MERCHANT_USER.email,
        DEMO_MERCHANT_USER.name,
        passwordHash,
      ],
    )

    // Sponsored campaigns (+ flag the promoted products in the catalog).
    for (const c of seedSponsoredCampaigns) {
      await client.query(
        `INSERT INTO sponsored_campaigns
           (id, merchant_id, product_id, product_title, category, status, budget, bid, start_date, end_date, impressions, clicks, purchases)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           budget = EXCLUDED.budget,
           bid = EXCLUDED.bid,
           impressions = EXCLUDED.impressions,
           clicks = EXCLUDED.clicks,
           purchases = EXCLUDED.purchases`,
        [
          c.id,
          c.merchantId,
          c.productId,
          c.productTitle,
          c.category,
          c.status.toUpperCase(),
          c.budget,
          c.bid,
          c.startDate || null,
          c.endDate || null,
          c.impressions,
          c.clicks,
          c.purchases,
        ],
      )
      if (c.status === "active" && c.productId) {
        await client.query(
          `UPDATE products SET is_sponsored = true, sponsored_campaign_id = $2 WHERE id = $1`,
          [c.productId, c.id],
        )
      }
    }

    return { products: catalog.length, items: itemCount }
  })
}
