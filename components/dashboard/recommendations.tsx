"use client"

import { useState } from "react"
import { Check, Plus, Sparkles } from "lucide-react"
import { ProductCard } from "@/components/registry/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { products, formatPrice } from "@/lib/data"
import { toast } from "sonner"

const GROUPS = [
  {
    id: "g1",
    title: "Because you love cooking",
    subtitle: "Pro-grade tools to match your kitchen ambitions.",
    ids: ["p7", "p15", "p8", "p4"],
  },
  {
    id: "g2",
    title: "For your daily coffee ritual",
    subtitle: "You marked coffee as a daily must — here's the upgrade.",
    ids: ["p3", "p7"],
  },
  {
    id: "g3",
    title: "Smart home essentials",
    subtitle: "Effortless living for your new place together.",
    ids: ["p2", "p9", "p10", "p16"],
  },
  {
    id: "g4",
    title: "Guests on a $50–100 budget",
    subtitle: "Thoughtful gifts at every price point.",
    ids: ["p12", "p14", "p13"],
  },
]

export function Recommendations() {
  const [added, setAdded] = useState<Set<string>>(new Set())

  function add(id: string, title: string) {
    setAdded((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    toast.success(`Added to your registry`, { description: title })
  }

  return (
    <div className="flex flex-col gap-10">
      <Alert>
        <Sparkles />
        <AlertTitle>Personalized for Maya &amp; Daniel</AlertTitle>
        <AlertDescription>
          These picks are based on your lifestyle answers and what similar
          couples loved. New suggestions appear as your registry grows.
        </AlertDescription>
      </Alert>

      {GROUPS.map((group) => {
        const groupProducts = group.ids
          .map((id) => products.find((p) => p.id === id))
          .filter(Boolean) as typeof products
        return (
          <section key={group.id} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-accent" />
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  {group.title}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">{group.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {groupProducts.map((product) => {
                const isAdded = added.has(product.id)
                return (
                  <ProductCard
                    key={`${group.id}-${product.id}`}
                    product={product}
                    topLeft={
                      <Badge variant="secondary">{product.category}</Badge>
                    }
                    footer={
                      <Button
                        variant={isAdded ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                        disabled={isAdded}
                        onClick={() => add(product.id, product.title)}
                      >
                        {isAdded ? (
                          <>
                            <Check data-icon="inline-start" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus data-icon="inline-start" />
                            Add to registry
                          </>
                        )}
                      </Button>
                    }
                  />
                )
              })}
            </div>
          </section>
        )
      })}

      {added.size > 0 && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-border bg-card/90 p-4 backdrop-blur">
          <p className="text-sm font-medium text-foreground">
            {added.size} gift{added.size > 1 ? "s" : ""} added this session
          </p>
          <Badge variant="secondary">
            {formatPrice(
              [...added].reduce(
                (sum, id) =>
                  sum + (products.find((p) => p.id === id)?.price ?? 0),
                0,
              ),
            )}{" "}
            value
          </Badge>
        </div>
      )}
    </div>
  )
}
