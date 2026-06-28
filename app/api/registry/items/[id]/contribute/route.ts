import { NextResponse } from "next/server"
import { addContribution } from "@/lib/repos/registry"

export const maxDuration = 30

// POST /api/registry/items/[id]/contribute — a guest contributes toward a
// group gift or cash fund. Public, like reservations and checkout.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = (await request.json()) as {
      guestName?: string
      guestEmail?: string
      amount?: number
      message?: string
    }
    const amount = Number(body.amount)
    if (!body.guestName?.trim()) {
      return NextResponse.json(
        { error: "Please add your name." },
        { status: 400 },
      )
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a contribution amount greater than $0." },
        { status: 400 },
      )
    }
    const result = await addContribution(id, {
      guestName: body.guestName.trim(),
      guestEmail: body.guestEmail?.trim() || undefined,
      amount,
      message: body.message?.trim() || undefined,
    })
    if (!result) {
      return NextResponse.json(
        { error: "Couldn't record your contribution." },
        { status: 400 },
      )
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error("[v0] POST contribute failed:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    )
  }
}
