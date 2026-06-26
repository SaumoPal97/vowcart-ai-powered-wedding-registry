import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { setThankYouStatus } from "@/lib/repos/purchases"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await request.json()
    const sent = body.status ? body.status === "sent" : Boolean(body.sent)
    const ok = await setThankYouStatus(id, sent)
    if (!ok) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, status: sent ? "sent" : "pending" })
  } catch (err) {
    console.error("[v0] PATCH /api/thank-you/[id] failed:", err)
    return NextResponse.json(
      { error: "Failed to update thank-you status" },
      { status: 500 },
    )
  }
}
