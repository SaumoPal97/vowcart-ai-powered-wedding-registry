import { redirect } from "next/navigation"
import Link from "next/link"
import {
  PlusCircle,
  ShoppingBag,
  Percent,
  DollarSign,
  Eye,
  MousePointerClick,
  Megaphone,
  Sparkles,
  ArrowUpRight,
} from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  CategoryDemandChart,
  CategoryConversionChart,
} from "@/components/merchant/merchant-charts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/data"
import {
  getMerchantForRequest,
  getMerchantDashboardSummary,
  getMerchantCategoryStats,
  getMerchantProductStats,
  merchantAiInsights,
} from "@/lib/repos/merchant"

export const dynamic = "force-dynamic"

export default async function MerchantDashboard() {
  const merchant = await getMerchantForRequest()
  if (!merchant) redirect("/merchant/login")

  const [summary, categories, products] = await Promise.all([
    getMerchantDashboardSummary(merchant),
    getMerchantCategoryStats(merchant),
    getMerchantProductStats(merchant),
  ])
  const topProducts = products.slice(0, 5)

  return (
    <>
      <PageHeader
        title={`${merchant.name} overview`}
        description="Aggregated, anonymized registry demand across the VowCart network."
        action={
          <Button nativeButton={false} render={<Link href="/merchant/sponsored" />}>
            <Megaphone data-icon="inline-start" />
            New campaign
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        {/* Demand KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Products added"
            value={summary.productsAdded.toLocaleString()}
            icon={PlusCircle}
            hint="To registries network-wide"
          />
          <StatCard
            label="Products purchased"
            value={summary.productsPurchased.toLocaleString()}
            icon={ShoppingBag}
            hint="Completed gifts"
          />
          <StatCard
            label="Add-to-purchase"
            value={`${summary.conversionRate}%`}
            icon={Percent}
            trend="Conversion"
          />
          <StatCard
            label="Avg. gift price"
            value={formatPrice(summary.avgGiftPrice)}
            icon={DollarSign}
            hint="Across your catalog"
          />
        </div>

        {/* Sponsored KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Sponsored impressions"
            value={summary.sponsoredImpressions.toLocaleString()}
            icon={Eye}
          />
          <StatCard
            label="Sponsored clicks"
            value={summary.sponsoredClicks.toLocaleString()}
            icon={MousePointerClick}
            hint={`${summary.sponsoredCtr}% CTR`}
          />
          <StatCard
            label="Sponsored purchases"
            value={summary.sponsoredPurchases.toLocaleString()}
            icon={ShoppingBag}
          />
          <StatCard
            label="Active campaigns"
            value={merchant.plan === "free" ? "—" : "View"}
            icon={Megaphone}
            hint="Manage in Sponsored"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CategoryDemandChart data={categories} />
          <CategoryConversionChart data={categories} />
        </div>

        {/* Top products + AI insights */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Top performing products</CardTitle>
                <CardDescription>By registry adds.</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/merchant/products" />}
              >
                All products
                <ArrowUpRight data-icon="inline-end" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {topProducts.map((p) => (
                <Link
                  key={p.productId}
                  href={`/merchant/products/${p.productId}`}
                  className="flex items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {p.title}
                      {p.isSponsored && (
                        <Badge variant="secondary" className="gap-1 text-[10px]">
                          <Megaphone className="size-2.5" />
                          Sponsored
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p.category} · {formatPrice(p.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div className="hidden flex-col sm:flex">
                      <span className="text-sm font-semibold text-foreground">
                        {p.added.toLocaleString()}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Added
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {p.conversionRate}%
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Conv.
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-accent" />
                AI recommendations
              </CardTitle>
              <CardDescription>Where to focus next.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {merchantAiInsights.map((insight) => (
                <div key={insight.title} className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {insight.title}
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {insight.detail}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground">
          All figures are aggregated and anonymized across the VowCart network.
          Individual couples, guests, and registries are never exposed.
        </p>
      </div>
    </>
  )
}
