import { NextResponse } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { createSession, createUser, findUserByEmail } from "@/lib/auth"

// Allow headroom for an Aurora Serverless cold-start resume.
export const maxDuration = 45

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json()
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      )
    }
    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      )
    }

    if (!isDbConfigured()) {
      // Sandbox: simulate a successful signup so the flow is testable.
      await createSession({ userId: "demo-user", email })
      return NextResponse.json({
        user: { id: "demo-user", email, name },
        demo: true,
      })
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      )
    }
    const user = await createUser({ email, name, password })
    await createSession({ userId: user.id, email: user.email })
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    console.error("[v0] signup error:", err)
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 })
  }
}
