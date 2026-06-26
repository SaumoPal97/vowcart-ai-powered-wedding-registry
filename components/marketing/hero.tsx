import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--accent),transparent_88%),transparent)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-accent" />
            Powered by Shopify Universal Commerce Protocol
          </span>
          <h1 className="text-balance font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Build your dream wedding registry in minutes.
          </h1>
          <p className="max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            AI helps you create the perfect registry while Shopify powers secure
            purchasing across merchants.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 px-6 text-base"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Create Registry
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base"
              nativeButton={false}
              render={<Link href="/#how-it-works" />}
            >
              <Play data-icon="inline-start" />
              Watch Demo
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <div>
              <span className="font-serif text-2xl font-semibold text-foreground">
                40k+
              </span>
              <p>Couples registered</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <span className="font-serif text-2xl font-semibold text-foreground">
                300+
              </span>
              <p>Merchant partners</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl shadow-foreground/5 sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/products/hero-registry.png"
              alt="A beautifully styled wedding gift table with wrapped gifts, an invitation, and a registry QR code"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 pr-5 shadow-xl backdrop-blur sm:-left-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Registry built by AI
              </p>
              <p className="text-xs text-muted-foreground">
                52 gifts curated in 30 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
