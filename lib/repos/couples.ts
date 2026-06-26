import "server-only"
import { isDbConfigured, query } from "@/lib/db"
import { demoCouple } from "@/lib/catalog"
import type { Couple } from "@/lib/types"

interface CoupleRow {
  id: string
  user_id: string
  partner_one: string
  partner_two: string
  wedding_date: string | null
  location: string | null
  slug: string
  photo: string | null
  story: string | null
  is_public: boolean
}

function rowToCouple(r: CoupleRow): Couple & { id: string; userId: string } {
  return {
    id: r.id,
    userId: r.user_id,
    partnerOne: r.partner_one,
    partnerTwo: r.partner_two,
    weddingDate: r.wedding_date
      ? new Date(r.wedding_date).toISOString().slice(0, 10)
      : "",
    location: r.location ?? "",
    slug: r.slug,
    photo: r.photo ?? "/couple.png",
    story: r.story ?? "",
    isPublic: r.is_public,
  }
}

const demoWithIds = {
  ...demoCouple,
  id: "00000000-0000-0000-0000-0000000c0001",
  userId: "00000000-0000-0000-0000-000000000001",
}

export async function getCoupleBySlug(slug: string) {
  if (!isDbConfigured()) {
    return slug === demoCouple.slug ? demoWithIds : null
  }
  const { rows } = await query<CoupleRow>(
    `SELECT * FROM couples WHERE slug = $1 LIMIT 1`,
    [slug],
  )
  return rows[0] ? rowToCouple(rows[0]) : null
}

export async function getCoupleByUserId(userId: string) {
  if (!isDbConfigured()) return demoWithIds
  const { rows } = await query<CoupleRow>(
    `SELECT * FROM couples WHERE user_id = $1 LIMIT 1`,
    [userId],
  )
  return rows[0] ? rowToCouple(rows[0]) : null
}

/** The demo couple is the signed-in couple in this single-tenant demo. */
export async function getCurrentCouple() {
  if (!isDbConfigured()) return demoWithIds
  const { rows } = await query<CoupleRow>(
    `SELECT * FROM couples ORDER BY created_at ASC LIMIT 1`,
  )
  return rows[0] ? rowToCouple(rows[0]) : demoWithIds
}

export async function updateCouple(
  id: string,
  patch: Partial<Couple>,
): Promise<Couple & { id: string; userId: string }> {
  if (!isDbConfigured()) {
    return { ...demoWithIds, ...patch }
  }
  const { rows } = await query<CoupleRow>(
    `UPDATE couples SET
       partner_one = COALESCE($2, partner_one),
       partner_two = COALESCE($3, partner_two),
       wedding_date = COALESCE($4, wedding_date),
       location = COALESCE($5, location),
       story = COALESCE($6, story),
       is_public = COALESCE($7, is_public),
       updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      patch.partnerOne ?? null,
      patch.partnerTwo ?? null,
      patch.weddingDate || null,
      patch.location ?? null,
      patch.story ?? null,
      typeof patch.isPublic === "boolean" ? patch.isPublic : null,
    ],
  )
  return rowToCouple(rows[0])
}
