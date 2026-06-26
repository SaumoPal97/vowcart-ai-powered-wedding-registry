import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { getThankYouNotes } from "@/lib/repos/purchases"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const notes = await getThankYouNotes(user.coupleId)
    return NextResponse.json({ notes })
  } catch (err) {
    console.error("[v0] GET /api/thank-you failed:", err)
    return NextResponse.json(
      { error: "Failed to load thank-you notes" },
      { status: 500 },
    )
  }
}
