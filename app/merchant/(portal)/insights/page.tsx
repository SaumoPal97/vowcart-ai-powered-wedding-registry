import { redirect } from "next/navigation"
import { TrendingUp, Flame, Sparkles } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/data"
import {
  getMerchantForRequest,
  getMerchantCategoryStats,
  merchantAiInsights,
} from "@/lib/repos/merchant"

export const dynamic = "force-dynamic"

export default async function MerchantInsightsPage() {
  const merchant = await getMerchantForRequest()
  if (!merchant) redirect("/merchant/login")
  const categories = await getMerchantCategoryStats(merchant)
  const fastestGrowing = [...categories].sort((a, b) => b.growth - a.growth).slice(0, 3)

  return (
    <>
      <PageHeader
        title="Category trends"
        description="Where demand is moving across your catalog — aggregated and anonymized."
      />
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CategoryDemandChart data={categories} />
          <CategoryConversionChart data={categories} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4 text-accent" />
                Category performance
              </CardTitle>
              <CardDescription>Added, purchased, conversion, and price.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Added</TableHead>
                    <TableHead className="text-right">Purchased</TableHead>
                    <TableHead className="text-right">Conv.</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Avg. price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.category}>
                      <TableCell className="font-medium text-foreground">
                        {c.category}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {c.added.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {c.purchased.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={c.conversionRate >= 25 ? "default" : "secondary"}>
                          {c.conversionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                        {formatPrice(c.avgPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="size-4 text-accent" />
                  Fastest growing
                </CardTitle>
                <CardDescription>Vs. prior period.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {fastestGrowing.map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{c.category}</span>
                    <Badge variant="secondary" className="text-emerald-600">
                      +{c.growth}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-accent" />
                  AI insights
                </CardTitle>
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
        </div>
      </div>
    </>
  )
}
