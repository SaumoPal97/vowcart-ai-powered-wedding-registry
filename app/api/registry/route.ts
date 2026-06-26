import { NextResponse } from "next/server"
import { getCurrentCouple, updateCouple } from "@/lib/repos/couples"
import { getRegistryItemsByCoupleId } from "@/lib/repos/registry"

// GET /api/registry — current couple + their registry items
export async function GET() {
  try {
    const couple = await getCurrentCouple()
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

// POST /api/registry — returns the (single-tenant) registry for the couple
export async function POST() {
  const couple = await getCurrentCouple()
  if (!couple) {
    return NextResponse.json({ error: "No couple found." }, { status: 404 })
  }
  return NextResponse.json({ couple })
}

// PATCH /api/registry — update couple / registry settings
export async function PATCH(req: Request) {
  try {
    const couple = await getCurrentCouple()
    if (!couple) {
      return NextResponse.json({ error: "No couple found." }, { status: 404 })
    }
    const patch = await req.json()
    const updated = await updateCouple(couple.id, patch)
    return NextResponse.json({ couple: updated })
  } catch (err) {
    console.error("[v0] PATCH /api/registry error:", err)
    return NextResponse.json({ error: "Failed to update registry." }, { status: 500 })
  }
}

// DELETE /api/registry — hide the registry (set non-public)
export async function DELETE() {
  try {
    const couple = await getCurrentCouple()
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
