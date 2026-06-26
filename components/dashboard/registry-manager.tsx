"use client"

import { useMemo, useState } from "react"
import { Search, Trash2, Star, Gift } from "lucide-react"
import { ProductCard } from "@/components/registry/product-card"
import { StatusBadge, PriorityBadge } from "@/components/registry/badges"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { registryItems, CATEGORIES, formatPrice } from "@/lib/data"
import type { ItemStatus, RegistryItem } from "@/lib/types"
import { toast } from "sonner"

type Filter = "all" | ItemStatus

export function RegistryManager() {
  const [items, setItems] = useState<RegistryItem[]>(registryItems)
  const [filter, setFilter] = useState<Filter>("all")
  const [category, setCategory] = useState<string>("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = filter === "all" || item.status === filter
      const matchesCategory =
        category === "all" || item.category === category
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.merchant.toLowerCase().includes(query.toLowerCase())
      return matchesStatus && matchesCategory && matchesQuery
    })
  }, [items, filter, category, query])

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast.success("Gift removed from your registry")
  }

  function togglePriority(id: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              priority:
                i.priority === "must-have" ? "nice-to-have" : "must-have",
            }
          : i,
      ),
    )
  }

  const counts = {
    all: items.length,
    available: items.filter((i) => i.status === "available").length,
    reserved: items.filter((i) => i.status === "reserved").length,
    purchased: items.filter((i) => i.status === "purchased").length,
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ToggleGroup
          value={[filter]}
          onValueChange={(v) => v[0] && setFilter(v[0] as Filter)}
          variant="outline"
        >
          <ToggleGroupItem value="all">All ({counts.all})</ToggleGroupItem>
          <ToggleGroupItem value="available">
            Available ({counts.available})
          </ToggleGroupItem>
          <ToggleGroupItem value="reserved">
            Reserved ({counts.reserved})
          </ToggleGroupItem>
          <ToggleGroupItem value="purchased">
            Purchased ({counts.purchased})
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex flex-col gap-3 sm:flex-row">
          <InputGroup className="sm:w-64">
            <InputGroupInput
              placeholder="Search gifts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v ?? "all")}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Gift />
            </EmptyMedia>
            <EmptyTitle>No gifts found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your filters or add new gifts from recommendations.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              dimmed={item.status === "purchased"}
              topLeft={<StatusBadge status={item.status} />}
              topRight={<PriorityBadge priority={item.priority} />}
              footer={
                <div className="flex flex-col gap-2">
                  {item.status === "purchased" && item.purchasedBy && (
                    <p className="text-xs text-muted-foreground">
                      Gifted by {item.purchasedBy}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => togglePriority(item.id)}
                      disabled={item.status === "purchased"}
                    >
                      <Star data-icon="inline-start" />
                      {item.priority === "must-have" ? "Must-have" : "Nice"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={item.status === "purchased"}
                      aria-label="Remove gift"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {items.length} gifts · total registry
        value{" "}
        {formatPrice(items.reduce((sum, i) => sum + i.price, 0))}
      </p>
    </div>
  )
}
