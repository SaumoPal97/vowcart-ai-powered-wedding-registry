import { NextResponse } from "next/server"
import { createReservation } from "@/lib/services/reservations"
import { getRegistryIdBySlug } from "@/lib/repos/registry"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { registryItemId, reservedBy, slug } = body
    if (!registryItemId || !reservedBy) {
      return NextResponse.json(
        { error: "registryItemId and reservedBy are required" },
        { status: 400 },
      )
    }
    const registryId = slug ? await getRegistryIdBySlug(slug) : "unknown"
    const reservation = await createReservation({
      registryItemId,
      reservedBy,
      registryId: registryId ?? "unknown",
    })
    if (!reservation) {
      return NextResponse.json(
        { error: "This gift is already reserved by another guest." },
        { status: 409 },
      )
    }
    return NextResponse.json({ reservation }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/reservation failed:", err)
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 },
    )
  }
}
