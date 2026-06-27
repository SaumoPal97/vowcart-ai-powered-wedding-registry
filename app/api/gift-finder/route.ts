import { NextResponse } from "next/server"
import { getRegistryItemsBySlug } from "@/lib/repos/registry"
import { findGifts } from "@/lib/services/gift-finder"

export const maxDuration = 20

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = String(body.message ?? "").slice(0, 300)
    const slug = String(body.slug ?? "")
    if (!message.trim() || !slug) {
      return NextResponse.json(
        { error: "A message and registry are required." },
        { status: 400 },
      )
    }
    const items = await getRegistryItemsBySlug(slug)
    const result = findGifts(message, items)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[v0] POST /api/gift-finder failed:", err)
    return NextResponse.json({ error: "Failed to find gifts." }, { status: 500 })
  }
}
