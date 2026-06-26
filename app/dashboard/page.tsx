import Link from "next/link"
import { Gift, ShoppingBag, Eye, DollarSign, Sparkles } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { Countdown } from "@/components/registry/countdown"
import { QrCard } from "@/components/registry/qr-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  couple,
  registryItems,
  formatPrice,
  formatWeddingDate,
} from "@/lib/data"

export default function DashboardOverview() {
  const total = registryItems.length
  const purchased = registryItems.filter((i) => i.status === "purchased")
  const reserved = registryItems.filter((i) => i.status === "reserved")
  const claimedValue = [...purchased, ...reserved].reduce(
    (sum, i) => sum + i.price,
    0,
  )
  const completion = Math.round((purchased.length / total) * 100)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${couple.partnerOne}`}
        description={`Your wedding is on ${formatWeddingDate(couple.weddingDate)} in ${couple.location}.`}
        action={
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/recommendations" />}
          >
            <Sparkles data-icon="inline-start" />
            Add gifts
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Gifts on registry"
            value={String(total)}
            icon={Gift}
            hint={`${reserved.length} currently reserved`}
          />
          <StatCard
            label="Gifts purchased"
            value={String(purchased.length)}
            icon={ShoppingBag}
            trend={`${completion}% complete`}
          />
          <StatCard
            label="Registry views"
            value="1,024"
            icon={Eye}
            trend="+28% this week"
          />
          <StatCard
            label="Value claimed"
            value={formatPrice(claimedValue)}
            icon={DollarSign}
            hint="Purchased + reserved"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Registry progress</CardTitle>
                <CardDescription>
                  {purchased.length} of {total} gifts have been purchased by
                  your guests.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Progress value={completion} />
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="flex flex-col">
                    <span className="font-serif text-2xl font-semibold text-foreground">
                      {purchased.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Purchased
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif text-2xl font-semibold text-foreground">
                      {reserved.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Reserved
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif text-2xl font-semibold text-foreground">
                      {total - purchased.length - reserved.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Available
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Counting down</CardTitle>
                <CardDescription>
                  Until you say &ldquo;I do.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Countdown date={couple.weddingDate} />
              </CardContent>
            </Card>

            <ActivityFeed />
          </div>

          <div className="flex flex-col gap-6">
            <QrCard slug={couple.slug} />
          </div>
        </div>
      </div>
    </>
  )
}
