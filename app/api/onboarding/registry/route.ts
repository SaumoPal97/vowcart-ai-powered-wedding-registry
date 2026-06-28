import { NextResponse } from "next/server"
import { buildStarterRegistry } from "@/lib/services/recommendations"

// Topping up across categories (with pagination) can take many UCP round-trips.
export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const questionnaire = body.questionnaire ?? {}
    const size = Number(questionnaire.size) || 25
    const { products, source } = await buildStarterRegistry(questionnaire, size)
    return NextResponse.json({ products, source, size })
  } catch (err) {
    console.error("[v0] POST /api/onboarding/registry failed:", err)
    return NextResponse.json(
      { error: "Failed to build registry" },
      { status: 500 },
    )
  }
}
