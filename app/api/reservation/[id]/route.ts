import { NextResponse } from "next/server"
import { deleteReservation } from "@/lib/services/reservations"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await deleteReservation(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] DELETE /api/reservation/[id] failed:", err)
    return NextResponse.json(
      { error: "Failed to release reservation" },
      { status: 500 },
    )
  }
}
