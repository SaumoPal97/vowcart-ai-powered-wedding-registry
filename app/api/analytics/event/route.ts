import { NextResponse } from "next/server"
import { recordEvent, type AnalyticsEventType } from "@/lib/services/analytics"
import { getRegistryIdBySlug } from "@/lib/repos/registry"

const VALID: AnalyticsEventType[] = [
  "registry_view",
  "qr_scan",
  "purchase_click",
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventType, slug, registryId, metadata } = body
    if (!VALID.includes(eventType)) {
      return NextResponse.json(
        { error: "Invalid eventType" },
        { status: 400 },
      )
    }
    const resolvedId =
      registryId ?? (slug ? await getRegistryIdBySlug(slug) : null)
    if (!resolvedId) {
      return NextResponse.json(
        { error: "registryId or slug is required" },
        { status: 400 },
      )
    }
    await recordEvent(resolvedId, eventType, metadata)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/analytics/event failed:", err)
    return NextResponse.json(
      { error: "Failed to record event" },
      { status: 500 },
    )
  }
}
