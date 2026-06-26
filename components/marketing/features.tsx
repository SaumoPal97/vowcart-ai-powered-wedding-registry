import { Globe, Link2, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Sparkles,
    title: "AI Registry Builder",
    description:
      "Answer a few questions and receive an entire personalized registry, curated to how you actually live.",
  },
  {
    icon: Globe,
    title: "Universal Commerce",
    description:
      "Browse products from hundreds of Shopify merchants in one beautiful, unified place.",
  },
  {
    icon: Link2,
    title: "Smart Registry",
    description:
      "Share one beautiful link that automatically updates as gifts are reserved and purchased.",
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-secondary/40 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Why VowCart
          </p>
          <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Everything you need, beautifully simple.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="p-2">
              <CardContent className="flex flex-col gap-4 p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                  <feature.icon className="size-6" />
                </span>
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-pretty leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
