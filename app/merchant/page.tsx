import type { Metadata } from "next"
import Link from "next/link"
import {
  Store,
  BarChart3,
  Megaphone,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "VowCart for Merchants — Registry demand intelligence",
  description:
    "Aggregated, anonymized registry demand analytics and sponsored placements for Shopify brands.",
}

const FEATURES = [
  {
    icon: BarChart3,
    title: "Demand analytics",
    description:
      "See how often your products are added and purchased across registries — aggregated and fully anonymized.",
  },
  {
    icon: Layers,
    title: "Category & affinity insights",
    description:
      "Track category trends, conversion benchmarks, and which products are frequently added together.",
  },
  {
    icon: Megaphone,
    title: "Sponsored placements",
    description:
      "Promote products inside AI registry recommendations and product discovery, clearly labeled for couples.",
  },
  {
    icon: Sparkles,
    title: "AI merchant recommendations",
    description:
      "Get ROI-focused guidance on pricing bands, bundles, and where to spend your next ad dollar.",
  },
]

export default function MerchantMarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-foreground text-background">
            <Store className="size-4" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              VowCart
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Merchant Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" nativeButton={false} render={<Link href="/merchant/login" />}>
            Sign in
          </Button>
          <Button nativeButton={false} render={<Link href="/merchant/signup" />}>
            Get started
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-8 lg:py-28">
        <Badge variant="secondary" className="mb-6 gap-1.5">
          <ShieldCheck className="size-3" />
          Aggregated & anonymized — never couple or guest data
        </Badge>
        <h1 className="text-balance font-serif text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Registry demand intelligence for Shopify brands.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          VowCart shows you exactly how couples discover, add, and purchase your
          products across thousands of wedding registries — and lets you promote
          the products most likely to convert.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" nativeButton={false} render={<Link href="/merchant/signup" />}>
            Create a merchant account
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/merchant/login" />}
          >
            View the dashboard
          </Button>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              The merchant toolkit
            </p>
            <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground">
              Turn registry demand into revenue.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-2">
                <CardContent className="flex flex-col gap-4 p-6">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-foreground/8 text-foreground">
                    <f.icon className="size-6" />
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>
          Looking to create a registry?{" "}
          <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
            Visit VowCart for couples
          </Link>
        </p>
      </footer>
    </div>
  )
}
