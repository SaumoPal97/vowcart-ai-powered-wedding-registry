import { redirect } from "next/navigation"
import { Layers, Check } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { SponsoredManager } from "@/components/merchant/sponsored-manager"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatPrice } from "@/lib/data"
import {
  getMerchantForRequest,
  getSponsoredCampaigns,
  getMerchantProductStats,
  featuredCollections,
} from "@/lib/repos/merchant"

export const dynamic = "force-dynamic"

export default async function MerchantSponsoredPage() {
  const merchant = await getMerchantForRequest()
  if (!merchant) redirect("/merchant/login")
  const [campaigns, products] = await Promise.all([
    getSponsoredCampaigns(merchant),
    getMerchantProductStats(merchant),
  ])

  return (
    <>
      <PageHeader
        title="Sponsored & placements"
        description="Manage paid campaigns and curated collection placements."
      />
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <SponsoredManager initialCampaigns={campaigns} products={products} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-4 text-accent" />
              Featured collections
            </CardTitle>
            <CardDescription>
              Pay for placement in curated, high-intent registry collections shown
              to couples.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCollections.map((c) => {
              const full = c.filled >= c.slots
              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-foreground">{c.title}</h3>
                    {full ? (
                      <Badge variant="secondary">Full</Badge>
                    ) : (
                      <Badge variant="outline">{c.slots - c.filled} slots</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <div className="flex flex-col gap-1.5">
                    <Progress value={(c.filled / c.slots) * 100} />
                    <span className="text-xs text-muted-foreground">
                      {c.filled} of {c.slots} placements filled
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-foreground">
                      From {formatPrice(c.priceFrom)}/mo
                    </span>
                    <Button size="sm" variant={full ? "outline" : "default"} disabled={full}>
                      {full ? (
                        <>
                          <Check data-icon="inline-start" />
                          Waitlist
                        </>
                      ) : (
                        "Reserve slot"
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
