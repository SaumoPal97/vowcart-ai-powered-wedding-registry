import { NextResponse } from "next/server"
import { proposeChanges, type CopilotItem } from "@/lib/services/copilot"

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = String(body.message ?? "").slice(0, 500)
    const items = (Array.isArray(body.items) ? body.items : []) as CopilotItem[]
    if (!message.trim()) {
      return NextResponse.json({ error: "A message is required." }, { status: 400 })
    }
    const proposal = await proposeChanges(message, items)
    return NextResponse.json(proposal)
  } catch (err) {
    console.error("[v0] POST /api/ai/copilot failed:", err)
    return NextResponse.json(
      { error: "Failed to generate suggestions." },
      { status: 500 },
    )
  }
}
