"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Gift, Heart, MapPin, Calendar } from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProductCard } from "@/components/registry/product-card"
import { StatusBadge, PriorityBadge } from "@/components/registry/badges"
import { Countdown } from "@/components/registry/countdown"
import { GiftDialog } from "@/components/registry/gift-dialog"
import { GiftFinder } from "@/components/registry/gift-finder"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatWeddingDate } from "@/lib/data"
import type { Couple, ItemStatus, RegistryItem } from "@/lib/types"
import { toast } from "sonner"

type Filter = "all" | "available" | "must-have"

export function PublicRegistry({
  couple,
  items: initialItems,
  slug,
}: {
  couple: Couple
  items: RegistryItem[]
  slug: string
}) {
  const [items, setItems] = useState<RegistryItem[]>(initialItems)
  const [filter, setFilter] = useState<Filter>("all")
  const [selected, setSelected] = useState<RegistryItem | null>(null)
  const [open, setOpen] = useState(false)

  const purchased = items.filter((i) => i.status === "purchased").length
  const completion =
    items.length > 0 ? Math.round((purchased / items.length) * 100) : 0

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter === "available") return item.status === "available"
      if (filter === "must-have") return item.priority === "must-have"
      return true
    })
  }, [items, filter])

  function openGift(item: RegistryItem) {
    setSelected(item)
    setOpen(true)
  }

  function handleComplete(id: string, status: ItemStatus, name: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status, purchasedBy: status === "purchased" ? name : undefined }
          : i,
      ),
    )
    if (status === "purchased") {
      toast.success("Thank you for your generous gift!")
    } else {
      toast.success("Gift reserved for 15 minutes")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-16">
          <div className="flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <Heart className="size-3" />
              We&apos;re getting married
            </Badge>
            <h1 className="font-serif text-5xl font-semibold leading-tight text-balance text-foreground sm:text-6xl">
              {couple.partnerOne} &amp; {couple.partnerTwo}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {formatWeddingDate(couple.weddingDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {couple.location}
              </span>
            </div>
            <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
              {couple.story}
            </p>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Counting down to the big day
              </p>
              <Countdown date={couple.weddingDate} />
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border shadow-lg">
            <Image
              src={couple.photo || "/placeholder.svg"}
              alt={`${couple.partnerOne} and ${couple.partnerTwo}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Registry */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-border bg-secondary/50 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Gift className="size-5 text-accent" />
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Our Registry
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {purchased} of {items.length} gifts purchased
            </p>
          </div>
          <Progress value={completion} />
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ToggleGroup
            value={[filter]}
            onValueChange={(v) => v[0] && setFilter(v[0] as Filter)}
            variant="outline"
          >
            <ToggleGroupItem value="all">All gifts</ToggleGroupItem>
            <ToggleGroupItem value="available">Available</ToggleGroupItem>
            <ToggleGroupItem value="must-have">Most wanted</ToggleGroupItem>
          </ToggleGroup>
          <GiftFinder slug={slug} onSelect={openGift} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const claimed = item.status !== "available"
            return (
              <ProductCard
                key={item.id}
                product={item}
                dimmed={item.status === "purchased"}
                topLeft={<StatusBadge status={item.status} />}
                topRight={
                  item.priority === "must-have" ? (
                    <PriorityBadge priority={item.priority} />
                  ) : undefined
                }
                footer={
                  <Button
                    variant={claimed ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    disabled={item.status === "purchased"}
                    onClick={() => openGift(item)}
                  >
                    {item.status === "purchased"
                      ? "Already gifted"
                      : item.status === "reserved"
                        ? "Reserved · Buy anyway"
                        : "Gift this"}
                  </Button>
                }
              />
            )
          })}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Registry powered by{" "}
          <span className="font-medium text-foreground">VowCart</span>
        </p>
      </footer>

      <GiftDialog
        item={selected}
        open={open}
        onOpenChange={setOpen}
        slug={slug}
        onComplete={handleComplete}
      />
    </div>
  )
}
