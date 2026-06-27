import { redirect } from "next/navigation"
import { Check, Store } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { getMerchantForRequest } from "@/lib/repos/merchant"
import type { MerchantPlan } from "@/lib/types"

export const dynamic = "force-dynamic"

const PLANS: {
  id: MerchantPlan
  name: string
  price: string
  features: string[]
}[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: ["Dashboard summary", "Limited product insights", "Top 5 products"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$199/mo",
    features: [
      "Full product insights",
      "Category & trend insights",
      "Product affinity data",
      "AI merchant recommendations",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$599/mo",
    features: [
      "Everything in Pro",
      "Sponsored placements",
      "Featured collections",
      "Advanced reporting & exports",
    ],
  },
]

export default async function MerchantSettingsPage() {
  const merchant = await getMerchantForRequest()
  if (!merchant) redirect("/merchant/login")

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your merchant account and plan."
      />
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="size-4 text-accent" />
              Merchant profile
            </CardTitle>
            <CardDescription>
              How your brand is represented across VowCart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">Brand name</FieldLabel>
                  <Input id="name" defaultValue={merchant.name} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="website">Website</FieldLabel>
                  <Input id="website" defaultValue={merchant.website} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="shopify">Shopify shop ID</FieldLabel>
                  <Input id="shopify" defaultValue={merchant.shopifyMerchantId} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="brands">Catalog brands</FieldLabel>
                  <Input id="brands" defaultValue={merchant.brands.join(", ")} />
                </Field>
              </div>
              <div>
                <Button>Save changes</Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-1 font-serif text-xl font-semibold text-foreground">
            Plan & billing
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            You are currently on the{" "}
            <span className="font-medium capitalize text-foreground">
              {merchant.plan}
            </span>{" "}
            plan.
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const current = plan.id === merchant.plan
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col",
                    current && "border-accent ring-1 ring-accent",
                  )}
                >
                  {current && (
                    <Badge className="absolute right-4 top-4">Current</Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="font-serif text-2xl font-semibold text-foreground">
                        {plan.price}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <ul className="flex flex-1 flex-col gap-2">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="size-4 shrink-0 text-accent" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={current ? "outline" : "default"}
                      disabled={current}
                      className="w-full"
                    >
                      {current ? "Current plan" : `Switch to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Billing is illustrative for this demo — no payment is processed.
          </p>
        </div>
      </div>
    </>
  )
}
