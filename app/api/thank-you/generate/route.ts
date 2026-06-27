import { NextResponse } from "next/server"
import { generateText } from "ai"
import { isAiEnabled } from "@/lib/services/recommendations"

export const maxDuration = 20

const AI_MODEL = process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini"

type Tone = "warm" | "formal" | "playful" | "short"

const TONE_GUIDE: Record<Tone, string> = {
  warm: "warm, heartfelt, and sincere",
  formal: "polished, gracious, and formal",
  playful: "light, playful, and fun while still grateful",
  short: "very short — two or three sentences at most",
}

// Deterministic fallback used when the AI gateway isn't configured.
function template(
  coupleNames: string,
  guestName: string,
  gift: string,
  tone: Tone,
): string {
  if (tone === "short") {
    return `Dear ${guestName},\n\nThank you so much for the ${gift} — we love it and can't wait to use it! It means the world to have you celebrating with us.\n\nWith love,\n${coupleNames}`
  }
  if (tone === "formal") {
    return `Dear ${guestName},\n\nThank you very much for your thoughtful gift of the ${gift}. We are deeply grateful for your generosity and for your presence as we begin this new chapter together. It will be cherished in our home for years to come.\n\nWith sincere appreciation,\n${coupleNames}`
  }
  if (tone === "playful") {
    return `Hi ${guestName}!\n\nOkay, the ${gift}? Obsessed. You clearly know us too well. Thank you so much — every time we use it we'll think of you (and probably text you a photo). Thank you for celebrating with us!\n\nLots of love,\n${coupleNames}`
  }
  return `Dear ${guestName},\n\nThank you so much for the ${gift}! It means the world to us that you're celebrating this new chapter with us. We can't wait to put it to good use in our new home, and we feel so lucky to have you in our lives.\n\nWith love and gratitude,\n${coupleNames}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const coupleNames = String(body.coupleNames ?? "We").slice(0, 120)
    const guestName = String(body.guestName ?? "friend").slice(0, 120)
    const gift = String(body.gift ?? "gift").slice(0, 160)
    const tone: Tone = ["warm", "formal", "playful", "short"].includes(body.tone)
      ? body.tone
      : "warm"

    if (!isAiEnabled()) {
      return NextResponse.json({
        note: template(coupleNames, guestName, gift, tone),
        source: "template",
      })
    }

    try {
      const { text } = await generateText({
        model: AI_MODEL,
        maxRetries: 2,
        system:
          "You write wedding thank-you notes on behalf of a couple. Return ONLY the note text, no preamble, no quotes. Sign off with the couple's names.",
        prompt: `Write a ${TONE_GUIDE[tone]} thank-you note from ${coupleNames} to ${guestName} for their wedding gift: "${gift}". Reference the gift specifically.`,
      })
      const note = text.trim()
      return NextResponse.json({
        note: note || template(coupleNames, guestName, gift, tone),
        source: note ? "ai" : "template",
      })
    } catch (err) {
      console.error("[v0] thank-you AI generation failed:", err)
      return NextResponse.json({
        note: template(coupleNames, guestName, gift, tone),
        source: "template",
      })
    }
  } catch (err) {
    console.error("[v0] POST /api/thank-you/generate failed:", err)
    return NextResponse.json({ error: "Failed to generate note." }, { status: 500 })
  }
}
