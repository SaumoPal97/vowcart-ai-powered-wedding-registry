import { NextResponse } from "next/server"
import { destroyMerchantSession } from "@/lib/auth"

export async function POST() {
  await destroyMerchantSession()
  return NextResponse.json({ ok: true })
}
