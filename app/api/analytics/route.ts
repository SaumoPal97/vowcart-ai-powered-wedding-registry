import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { getAnalyticsSummary } from "@/lib/services/analytics"
import {
  getRegistryIdForCoupleId,
  getRegistryStatsByCoupleId,
} from "@/lib/repos/registry"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const [registryId, stats] = await Promise.all([
      getRegistryIdForCoupleId(user.coupleId),
      getRegistryStatsByCoupleId(user.coupleId),
    ])
    const summary = await getAnalyticsSummary(registryId ?? "unknown", {
      topCategories: stats.topCategories,
    })
    const completion =
      stats.total > 0
        ? Math.round((stats.purchased / stats.total) * 100)
        : 0
    return NextResponse.json({
      ...summary,
      purchases: stats.purchased,
      completion,
      totals: stats,
    })
  } catch (err) {
    console.error("[v0] GET /api/analytics failed:", err)
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    )
  }
}
