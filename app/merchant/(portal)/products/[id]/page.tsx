import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Megaphone } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { PlusCircle, ShoppingBag, Percent, DollarSign } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/data"
import {
  getMerchantForRequest,
  getMerchantProductStat,
} from "@/lib/repos/merchant"

export const dynamic = "force-dynamic"

export default async function MerchantProductDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const merchant = await getMerchantForRequest()
  if (!merchant) redirect("/merchant/login")
  const { id } = await params
  const data = await getMerchantProductStat(merchant, id)
  if (!data) notFound()
  const { stat, frequentlyAddedWith, categoryBenchmark } = data

  const vsBenchmark = stat.conversionRate - categoryBenchmark.avgConversion

  return (
    <>
      <PageHeader
        title="Product detail"
        description={`${stat.category} · ${merchant.name}`}
        action={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/merchant/products" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
        }
      />
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <Card>
          <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image
                src={stat.image || "/placeholder.svg"}
                alt={stat.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  {stat.title}
                </h2>
                {stat.isSponsored && (
                  <Badge variant="secondary" className="gap-1">
                    <Megaphone className="size-3" />
                    Sponsored
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {stat.category} · {formatPrice(stat.price)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Added to registries"
            value={stat.added.toLocaleString()}
            icon={PlusCircle}
          />
          <StatCard
            label="Purchased"
            value={stat.purchased.toLocaleString()}
            icon={ShoppingBag}
          />
          <StatCard
            label="Conversion"
            value={`${stat.conversionRate}%`}
            icon={Percent}
            trend={`${vsBenchmark >= 0 ? "+" : ""}${vsBenchmark}% vs. category`}
          />
          <StatCard
            label="Avg. price"
            value={formatPrice(stat.price)}
            icon={DollarSign}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequently added together</CardTitle>
              <CardDescription>
                Products often added alongside this one in the same registries.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {frequentlyAddedWith.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Not enough data yet.
                </p>
              ) : (
                frequentlyAddedWith.map((p) => (
                  <Link
                    key={p.productId}
                    href={`/merchant/products/${p.productId}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-secondary/50"
                  >
                    <span className="font-medium text-foreground">{p.title}</span>
                    <span className="text-muted-foreground">
                      {p.added.toLocaleString()} adds
                    </span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category benchmark</CardTitle>
              <CardDescription>
                How this product compares within {stat.category}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">This product conversion</span>
                <span className="font-semibold text-foreground">
                  {stat.conversionRate}%
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category avg. conversion</span>
                <span className="font-semibold text-foreground">
                  {categoryBenchmark.avgConversion}%
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category avg. price</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(categoryBenchmark.avgPrice)}
                </span>
              </div>
              <div className="mt-2 rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                {vsBenchmark >= 0
                  ? `This product converts ${vsBenchmark}% above the ${stat.category} average — a strong candidate to raise your sponsored bid.`
                  : `This product converts ${Math.abs(vsBenchmark)}% below the ${stat.category} average — consider repositioning or bundling.`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
