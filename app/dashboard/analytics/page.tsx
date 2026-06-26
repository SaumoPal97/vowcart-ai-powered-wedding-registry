import { Eye, QrCode, MousePointerClick, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  TrafficChart,
  CategoryChart,
  MostViewedChart,
} from "@/components/dashboard/analytics-charts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/data"
import { merchantInsights } from "@/lib/catalog"
import { getCurrentCouple } from "@/lib/repos/couples"
import {
  getRegistryIdForCoupleId,
  getRegistryItemsByCoupleId,
  getRegistryStatsByCoupleId,
} from "@/lib/repos/registry"
import { getAnalyticsSummary } from "@/lib/services/analytics"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const couple = await getCurrentCouple()
  const [registryId, stats, items] = await Promise.all([
    getRegistryIdForCoupleId(couple.id),
    getRegistryStatsByCoupleId(couple.id),
    getRegistryItemsByCoupleId(couple.id),
  ])
  const summary = await getAnalyticsSummary(registryId ?? "unknown", {
    topCategories: stats.topCategories,
  })

  const completion =
    stats.total > 0 ? Math.round((stats.purchased / stats.total) * 100) : 0
  const conversion =
    summary.totalViews > 0
      ? Math.round((stats.purchased / summary.totalViews) * 100)
      : 0
  const avgGiftValue =
    items.length > 0
      ? items.reduce((sum, i) => sum + i.price, 0) / items.length
      : 0

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Understand how guests engage with your registry."
      />
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total views"
            value={summary.totalViews.toLocaleString()}
            icon={Eye}
            hint={`${completion}% registry complete`}
          />
          <StatCard
            label="QR scans"
            value={summary.qrScans.toLocaleString()}
            icon={QrCode}
            hint="From invitations & signage"
          />
          <StatCard
            label="View-to-purchase"
            value={`${conversion}%`}
            icon={MousePointerClick}
            hint="Conversion rate"
          />
          <StatCard
            label="Avg. gift value"
            value={formatPrice(avgGiftValue)}
            icon={TrendingUp}
            hint="Across your registry"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <TrafficChart data={summary.dailyViews} />
          <CategoryChart data={summary.topCategories} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MostViewedChart data={summary.mostViewedGifts} />
          <Card>
            <CardHeader>
              <CardTitle>Merchant insights</CardTitle>
              <CardDescription>
                Aggregate trends across the VowCart network.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">
                  Most added gifts
                </p>
                {merchantInsights.mostAdded.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">
                  Trending brands
                </p>
                <div className="flex flex-wrap gap-2">
                  {merchantInsights.trendingBrands.map((brand) => (
                    <Badge key={brand} variant="secondary">
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Network avg. gift price
                </span>
                <span className="font-serif text-xl font-semibold text-foreground">
                  {merchantInsights.averageGiftPrice}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground">
          Merchant insights are anonymized and aggregated across the VowCart
          network.
        </p>
      </div>
    </>
  )
}
