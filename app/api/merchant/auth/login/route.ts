import { NextResponse } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { createMerchantSession, verifyPassword } from "@/lib/auth"
import { findMerchantUserByEmail } from "@/lib/repos/merchant"
import { demoMerchant } from "@/lib/catalog"

// Allow headroom for an Aurora Serverless cold-start resume.
export const maxDuration = 45

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
      // Sandbox: resolve to the seeded demo merchant so the portal is browsable.
      await createMerchantSession({
        merchantUserId: "demo-merchant-user",
        merchantId: demoMerchant.id,
        email,
      })
      return NextResponse.json({ merchant: { name: demoMerchant.name }, demo: true })
    }

    const user = await findMerchantUserByEmail(email)
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      )
    }
    await createMerchantSession({
      merchantUserId: user.id,
      merchantId: user.merchant_id,
      email: user.email,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] merchant login error:", err)
    return NextResponse.json({ error: "Failed to sign in." }, { status: 500 })
  }
}
