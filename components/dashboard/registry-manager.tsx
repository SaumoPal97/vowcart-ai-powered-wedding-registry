"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Trash2,
  Star,
  Gift,
  RefreshCw,
  ImageIcon,
  HeartHandshake,
} from "lucide-react"
import { ProductCard } from "@/components/registry/product-card"
import { ReplaceProductDialog } from "@/components/dashboard/replace-product-dialog"
import { ItemPhotoDialog } from "@/components/dashboard/item-photo-dialog"
import { AddCashFundDialog } from "@/components/dashboard/add-cash-fund-dialog"
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
import { CATEGORIES, formatPrice } from "@/lib/data"
import type { ItemPriority, ItemStatus, RegistryItem } from "@/lib/types"
import { toast } from "sonner"

type Filter = "all" | ItemStatus

export function RegistryManager({
  initialItems,
}: {
  initialItems: RegistryItem[]
}) {
  const [items, setItems] = useState<RegistryItem[]>(initialItems)
  const [filter, setFilter] = useState<Filter>("all")
  const [category, setCategory] = useState<string>("all")
  const [priority, setPriority] = useState<string>("all")
  const [query, setQuery] = useState("")
  const [replaceItem, setReplaceItem] = useState<RegistryItem | null>(null)
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [photoItem, setPhotoItem] = useState<RegistryItem | null>(null)
  const [photoOpen, setPhotoOpen] = useState(false)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = filter === "all" || item.status === filter
      const matchesCategory =
        category === "all" || item.category === category
      const matchesPriority = priority === "all" || item.priority === priority
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.merchant.toLowerCase().includes(query.toLowerCase())
      return matchesStatus && matchesCategory && matchesPriority && matchesQuery
    })
  }, [items, filter, category, priority, query])

  function openReplace(item: RegistryItem) {
    setReplaceItem(item)
    setReplaceOpen(true)
  }

  function handleReplaced(oldId: string, newItem: RegistryItem) {
    setItems((prev) => prev.map((i) => (i.id === oldId ? newItem : i)))
  }

  function openPhoto(item: RegistryItem) {
    setPhotoItem(item)
    setPhotoOpen(true)
  }

  function handlePhotoUpdated(id: string, image: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, image } : i)))
  }

  function handleCashFundAdded(item: RegistryItem) {
    setItems((prev) => [...prev, item])
  }

  async function toggleGroupGift(id: string) {
    const current = items.find((i) => i.id === id)
    if (!current) return
    const next = !current.isGroupGift
    const snapshot = items
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isGroupGift: next } : i)),
    )
    try {
      const res = await fetch(`/api/registry/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGroupGift: next }),
      })
      if (!res.ok) throw new Error("failed")
      toast.success(
        next
          ? "Group gifting on — guests can chip in together"
          : "Group gifting turned off",
      )
    } catch {
      setItems(snapshot)
      toast.error("Couldn't update group gifting. Please try again.")
    }
  }

  async function removeItem(id: string) {
    const snapshot = items
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      const res = await fetch(`/api/registry/items/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("failed")
      toast.success("Gift removed from your registry")
    } catch {
      setItems(snapshot)
      toast.error("Couldn't remove that gift. Please try again.")
    }
  }

  async function togglePriority(id: string) {
    const current = items.find((i) => i.id === id)
    if (!current) return
    const nextPriority: ItemPriority =
      current.priority === "must-have" ? "nice-to-have" : "must-have"
    const snapshot = items
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, priority: nextPriority } : i)),
    )
    try {
      const res = await fetch(`/api/registry/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: nextPriority }),
      })
      if (!res.ok) throw new Error("failed")
    } catch {
      setItems(snapshot)
      toast.error("Couldn't update priority. Please try again.")
    }
  }

  const counts = {
    all: items.length,
    available: items.filter((i) => i.status === "available").length,
    reserved: items.filter((i) => i.status === "reserved").length,
    purchased: items.filter((i) => i.status === "purchased").length,
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
          <Select value={priority} onValueChange={(v) => setPriority(v ?? "all")}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="must-have">Must Have</SelectItem>
                <SelectItem value="nice-to-have">Nice to Have</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <AddCashFundDialog onAdded={handleCashFundAdded} />
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
              hideRating={item.itemType === "cash_fund"}
              progress={
                item.isGroupGift || item.itemType === "cash_fund"
                  ? {
                      raised: item.contributed ?? 0,
                      goal: item.price,
                      contributors: item.contributorCount,
                    }
                  : undefined
              }
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
                      variant={item.isGroupGift ? "default" : "ghost"}
                      size="icon"
                      onClick={() => toggleGroupGift(item.id)}
                      disabled={
                        item.status === "purchased" ||
                        item.itemType === "cash_fund"
                      }
                      aria-label="Toggle group gifting"
                      title="Allow guests to chip in together"
                    >
                      <HeartHandshake />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openPhoto(item)}
                      disabled={item.status === "purchased"}
                      aria-label="Change gift photo"
                    >
                      <ImageIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openReplace(item)}
                      disabled={item.status !== "available"}
                      aria-label="Replace gift"
                    >
                      <RefreshCw />
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

      <ReplaceProductDialog
        item={replaceItem}
        open={replaceOpen}
        onOpenChange={setReplaceOpen}
        onReplaced={handleReplaced}
      />

      <ItemPhotoDialog
        item={photoItem}
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        onUpdated={handlePhotoUpdated}
      />
    </div>
  )
}
