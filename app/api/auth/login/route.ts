import { NextResponse } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { createSession, findUserByEmail, verifyPassword } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      )
    }

    if (!isDbConfigured()) {
      await createSession({ userId: "demo-user", email })
      return NextResponse.json({
        user: { id: "demo-user", email, name: "Demo User" },
        demo: true,
      })
    }

    const user = await findUserByEmail(email)
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      )
    }
    await createSession({ userId: user.id, email: user.email })
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    console.error("[v0] login error:", err)
    return NextResponse.json({ error: "Failed to sign in." }, { status: 500 })
  }
}
