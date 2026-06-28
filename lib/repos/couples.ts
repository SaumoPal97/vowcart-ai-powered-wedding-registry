import "server-only"
import { isDbConfigured, query, withTransaction } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { demoCouple } from "@/lib/catalog"
import type { Couple } from "@/lib/types"

// Build a URL-safe slug from arbitrary text.
function slugifyRaw(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 140) || "our-registry"
  )
}

function slugifyNames(a: string, b: string): string {
  return slugifyRaw(`${a} and ${b}`)
}

// Return `base`, or `base-2`, `base-3`… until it's free (ignoring excludeId).
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base
  let n = 1
  // Bounded loop guard.
  while (n < 1000) {
    const { rows } = await query<{ id: string }>(
      `SELECT id FROM couples WHERE slug = $1 LIMIT 1`,
      [candidate],
    )
    if (!rows[0] || rows[0].id === excludeId) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
  return `${base}-${Date.now().toString(36)}`
}

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
  preferences: Record<string, string | number> | null
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
    photo: r.photo || "/couple.png",
    story: r.story ?? "",
    isPublic: r.is_public,
    preferences: r.preferences ?? undefined,
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

/** The first (seeded demo) couple — shown to anonymous visitors. */
export async function getCurrentCouple() {
  if (!isDbConfigured()) return demoWithIds
  const { rows } = await query<CoupleRow>(
    `SELECT * FROM couples ORDER BY created_at ASC LIMIT 1`,
  )
  return rows[0] ? rowToCouple(rows[0]) : demoWithIds
}

/**
 * Resolve the couple for the current request:
 * - signed in  → that user's couple (or null if they haven't onboarded yet)
 * - anonymous  → the seeded demo couple (keeps the no-login demo working)
 */
export async function getCoupleForRequest() {
  if (!isDbConfigured()) return demoWithIds
  const session = await getSession()
  if (session?.userId) {
    return getCoupleByUserId(session.userId) // may be null → caller onboards
  }
  return getCurrentCouple()
}

/** Create a couple (+ its registry) for a user, with a unique slug. */
export async function createCouple(input: {
  userId: string
  partnerOne: string
  partnerTwo: string
  weddingDate?: string
  location?: string
  story?: string
  slug?: string
  photo?: string
  preferences?: Record<string, string | number>
}): Promise<Couple & { id: string; userId: string }> {
  if (!isDbConfigured()) {
    return {
      ...demoWithIds,
      partnerOne: input.partnerOne,
      partnerTwo: input.partnerTwo,
      weddingDate: input.weddingDate ?? demoWithIds.weddingDate,
      location: input.location ?? "",
      photo: input.photo || demoWithIds.photo,
      slug: input.slug
        ? slugifyRaw(input.slug)
        : slugifyNames(input.partnerOne, input.partnerTwo),
      preferences: input.preferences,
    }
  }
  const base = input.slug
    ? slugifyRaw(input.slug)
    : slugifyNames(input.partnerOne, input.partnerTwo)
  const slug = await uniqueSlug(base)
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO couples
         (user_id, partner_one, partner_two, wedding_date, location, slug, story, photo, is_public, preferences)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)
       RETURNING *`,
      [
        input.userId,
        input.partnerOne,
        input.partnerTwo,
        input.weddingDate || null,
        input.location || null,
        slug,
        input.story ?? null,
        input.photo || null,
        input.preferences ? JSON.stringify(input.preferences) : null,
      ],
    )
    const couple = rowToCouple(rows[0] as CoupleRow)
    await client.query(
      `INSERT INTO registries (couple_id, title)
       VALUES ($1, 'Our Wedding Registry')
       ON CONFLICT (couple_id) DO NOTHING`,
      [couple.id],
    )
    return couple
  })
}

export async function updateCouple(
  id: string,
  patch: Partial<Couple>,
): Promise<Couple & { id: string; userId: string }> {
  if (!isDbConfigured()) {
    return { ...demoWithIds, ...patch }
  }
  // Resolve a unique slug only when the caller is changing it.
  const slug = patch.slug ? await uniqueSlug(slugifyRaw(patch.slug), id) : null
  const { rows } = await query<CoupleRow>(
    `UPDATE couples SET
       partner_one = COALESCE($2, partner_one),
       partner_two = COALESCE($3, partner_two),
       wedding_date = COALESCE($4, wedding_date),
       location = COALESCE($5, location),
       story = COALESCE($6, story),
       is_public = COALESCE($7, is_public),
       slug = COALESCE($8, slug),
       preferences = COALESCE($9, preferences),
       photo = COALESCE($10, photo),
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
      slug,
      patch.preferences ? JSON.stringify(patch.preferences) : null,
      patch.photo || null,
    ],
  )
  return rowToCouple(rows[0])
}
