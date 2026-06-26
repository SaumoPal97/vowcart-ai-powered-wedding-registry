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
import { merchantInsights } from "@/lib/data"

export default function AnalyticsPage() {
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
            value="1,024"
            icon={Eye}
            trend="+28%"
          />
          <StatCard
            label="QR scans"
            value="216"
            icon={QrCode}
            trend="+41%"
          />
          <StatCard
            label="Add-to-purchase"
            value="48%"
            icon={MousePointerClick}
            hint="Conversion rate"
          />
          <StatCard
            label="Avg. gift value"
            value="$284"
            icon={TrendingUp}
            trend="+12%"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <TrafficChart />
          <CategoryChart />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MostViewedChart />
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
      </div>
    </>
  )
}
