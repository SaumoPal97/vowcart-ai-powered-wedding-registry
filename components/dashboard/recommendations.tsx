"use client"

import { useState } from "react"
import { Check, Plus, Sparkles, Loader2 } from "lucide-react"
import { ProductCard } from "@/components/registry/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { formatPrice } from "@/lib/data"
import type { Product, RecommendationGroup } from "@/lib/types"
import { toast } from "sonner"

export function Recommendations({
  groups,
  coupleNames,
  alreadyAdded,
  source,
}: {
  groups: RecommendationGroup[]
  coupleNames: string
  alreadyAdded: string[]
  source?: "cache" | "ai" | "ucp" | "fallback"
}) {
  // Track added items by title (registry items don't expose catalog ids).
  const [added, setAdded] = useState<Set<string>>(new Set(alreadyAdded))
  const [pending, setPending] = useState<string | null>(null)

  async function add(product: Product) {
    if (added.has(product.title)) return
    setPending(product.id)
    try {
      const res = await fetch("/api/registry/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      })
      if (!res.ok) throw new Error("failed")
      setAdded((prev) => new Set(prev).add(product.title))
      toast.success("Added to your registry", { description: product.title })
    } catch {
      toast.error("Couldn't add that gift. Please try again.")
    } finally {
      setPending(null)
    }
  }

  if (groups.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>No recommendations yet</EmptyTitle>
          <EmptyDescription>
            Add a few gifts to your registry and we&apos;ll suggest more.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const addedProducts = [
    ...new Map(
      groups
        .flatMap((g) => g.products)
        .filter((p) => added.has(p.title))
        .map((p) => [p.title, p]),
    ).values(),
  ]
  const addedValue = addedProducts.reduce((sum, p) => sum + p.price, 0)

  return (
    <div className="flex flex-col gap-10">
      <Alert>
        <Sparkles />
        <AlertTitle className="flex items-center gap-2">
          Personalized for {coupleNames}
          {source === "ai" && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="size-3" />
              AI-curated
            </Badge>
          )}
        </AlertTitle>
        <AlertDescription>
          {source === "ai"
            ? "An AI curator designed these themes from your lifestyle answers, then pulled real products from Shopify merchants. New picks appear as your registry grows."
            : "These picks are based on your lifestyle answers and what similar couples loved. New suggestions appear as your registry grows."}
        </AlertDescription>
      </Alert>

      {groups.map((group) => (
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
            {group.products.map((product) => {
              const isAdded = added.has(product.title)
              const isPending = pending === product.id
              return (
                <ProductCard
                  key={`${group.id}-${product.id}`}
                  product={product}
                  topLeft={<Badge variant="secondary">{product.category}</Badge>}
                  footer={
                    <Button
                      variant={isAdded ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      disabled={isAdded || isPending}
                      onClick={() => add(product)}
                    >
                      {isAdded ? (
                        <>
                          <Check data-icon="inline-start" />
                          Added
                        </>
                      ) : isPending ? (
                        <>
                          <Loader2
                            data-icon="inline-start"
                            className="animate-spin"
                          />
                          Adding...
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
      ))}

      {addedProducts.length > 0 && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-border bg-card/90 p-4 backdrop-blur">
          <p className="text-sm font-medium text-foreground">
            {added.size} gift{added.size > 1 ? "s" : ""} on your registry
          </p>
          <Badge variant="secondary">{formatPrice(addedValue)} value</Badge>
        </div>
      )}
    </div>
  )
}
