import { NextResponse } from "next/server"
import { getMerchantForRequest, updateCampaignStatus } from "@/lib/repos/merchant"
import type { CampaignStatus } from "@/lib/types"

const VALID: CampaignStatus[] = ["draft", "active", "paused"]

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const merchant = await getMerchantForRequest()
    if (!merchant) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }
    const { id } = await params
    const { status } = await req.json()
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 })
    }
    const ok = await updateCampaignStatus(merchant, id, status)
    if (!ok) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] PATCH /api/merchant/campaigns/[id] failed:", err)
    return NextResponse.json({ error: "Failed to update campaign." }, { status: 500 })
  }
}
