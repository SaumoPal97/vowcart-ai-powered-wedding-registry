import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import {
  createCouple,
  getCoupleForRequest,
  updateCouple,
} from "@/lib/repos/couples"
import { getRegistryItemsByCoupleId } from "@/lib/repos/registry"

// GET /api/registry — the request's couple (session user's, or demo) + items
export async function GET() {
  try {
    const couple = await getCoupleForRequest()
    if (!couple) {
      return NextResponse.json({ error: "No registry found." }, { status: 404 })
    }
    const items = await getRegistryItemsByCoupleId(couple.id)
    return NextResponse.json({ couple, items })
  } catch (err) {
    console.error("[v0] GET /api/registry error:", err)
    return NextResponse.json({ error: "Failed to load registry." }, { status: 500 })
  }
}

// Create-or-update the couple for this request from the body.
async function upsertCouple(req: Request) {
  const body = (await req.json()) as {
    partnerOne?: string
    partnerTwo?: string
    weddingDate?: string
    location?: string
    story?: string
    slug?: string
    photo?: string
    isPublic?: boolean
    preferences?: Record<string, string | number>
  }

  // Resolve the couple this request manages, mirroring how the dashboard
  // reads it (signed-in user's couple, or the demo couple). Editing the demo
  // works without an account so the live demo is fully interactive.
  const existing = await getCoupleForRequest()
  if (existing) {
    const updated = await updateCouple(existing.id, body)
    return NextResponse.json({ couple: updated })
  }

  // No couple yet → a signed-in user is creating their first registry.
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to create your registry." },
      { status: 401 },
    )
  }
  if (!body.partnerOne?.trim() || !body.partnerTwo?.trim()) {
    return NextResponse.json(
      { error: "Both partner names are required." },
      { status: 400 },
    )
  }
  const created = await createCouple({
    userId: session.userId,
    partnerOne: body.partnerOne,
    partnerTwo: body.partnerTwo,
    weddingDate: body.weddingDate,
    location: body.location,
    story: body.story,
    slug: body.slug,
    photo: body.photo,
    preferences: body.preferences,
  })
  return NextResponse.json({ couple: created })
}

// POST /api/registry — create (or update) the couple for the session user
export async function POST(req: Request) {
  try {
    return await upsertCouple(req)
  } catch (err) {
    console.error("[v0] POST /api/registry error:", err)
    return NextResponse.json({ error: "Failed to save registry." }, { status: 500 })
  }
}

// PATCH /api/registry — update couple / registry settings for the session user
export async function PATCH(req: Request) {
  try {
    return await upsertCouple(req)
  } catch (err) {
    console.error("[v0] PATCH /api/registry error:", err)
    return NextResponse.json({ error: "Failed to update registry." }, { status: 500 })
  }
}

// DELETE /api/registry — hide the registry (set non-public)
export async function DELETE() {
  try {
    const couple = await getCoupleForRequest()
    if (!couple) {
      return NextResponse.json({ error: "No couple found." }, { status: 404 })
    }
    await updateCouple(couple.id, { isPublic: false })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] DELETE /api/registry error:", err)
    return NextResponse.json({ error: "Failed to delete registry." }, { status: 500 })
  }
}
