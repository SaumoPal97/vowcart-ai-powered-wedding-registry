import { NextResponse } from "next/server"
import { getRecommendations } from "@/lib/services/recommendations"

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const questionnaire = body.questionnaire ?? body ?? {}
    const { groups, source } = await getRecommendations(questionnaire)
    return NextResponse.json({ groups, source })
  } catch (err) {
    console.error("[v0] POST /api/ai/recommendations failed:", err)
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 },
    )
  }
}
