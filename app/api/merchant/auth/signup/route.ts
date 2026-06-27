import { NextResponse } from "next/server"
import { isDbConfigured } from "@/lib/db"
import { createMerchantSession } from "@/lib/auth"
import {
  createMerchantWithUser,
  findMerchantUserByEmail,
} from "@/lib/repos/merchant"
import { demoMerchant } from "@/lib/catalog"

// Allow headroom for an Aurora Serverless cold-start resume.
export const maxDuration = 45

export async function POST(req: Request) {
  try {
    const { merchantName, contactName, email, password, website, shopifyMerchantId } =
      await req.json()
    if (!merchantName || !contactName || !email || !password) {
      return NextResponse.json(
        { error: "Brand name, contact name, email, and password are required." },
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
      await createMerchantSession({
        merchantUserId: "demo-merchant-user",
        merchantId: demoMerchant.id,
        email,
      })
      return NextResponse.json({ merchant: { name: merchantName }, demo: true })
    }

    const existing = await findMerchantUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      )
    }
    const { merchantId, merchantUserId } = await createMerchantWithUser({
      merchantName,
      contactName,
      email,
      password,
      website,
      shopifyMerchantId,
    })
    await createMerchantSession({ merchantUserId, merchantId, email })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] merchant signup error:", err)
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 })
  }
}
