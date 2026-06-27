"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Search, Loader2, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/data"
import type { Product, RegistryItem } from "@/lib/types"
import { toast } from "sonner"

export function ReplaceProductDialog({
  item,
  open,
  onOpenChange,
  onReplaced,
}: {
  item: RegistryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReplaced: (oldId: string, newItem: RegistryItem) => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const reqRef = useRef(0)

  // Seed the search with the current item's category when opened.
  useEffect(() => {
    if (open && item) {
      setQuery(item.title)
      setResults(null)
    }
  }, [open, item])

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setResults(null)
      return
    }
    const reqId = ++reqRef.current
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/products/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: term, category: item?.category }),
        })
        const data = await res.json()
        if (reqId !== reqRef.current) return
        setResults(data.products ?? [])
      } catch {
        if (reqId === reqRef.current) setResults([])
      } finally {
        if (reqId === reqRef.current) setLoading(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [query, item])

  async function choose(product: Product) {
    if (!item) return
    setPendingId(product.id)
    try {
      // Add the replacement first (preserving priority), then remove the old.
      const addRes = await fetch("/api/registry/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, priority: item.priority }),
      })
      if (!addRes.ok) throw new Error("add failed")
      const { item: newItem } = await addRes.json()
      const delRes = await fetch(`/api/registry/items/${item.id}`, {
        method: "DELETE",
      })
      if (!delRes.ok) throw new Error("remove failed")
      onReplaced(item.id, newItem)
      toast.success("Gift replaced", {
        description: `${item.title} → ${product.title}`,
      })
      onOpenChange(false)
    } catch {
      toast.error("Couldn't replace that gift. Please try again.")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Replace gift</DialogTitle>
          <DialogDescription>
            {item ? (
              <>
                Find a replacement for{" "}
                <span className="font-medium text-foreground">{item.title}</span>.
                It keeps the same priority.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <InputGroup>
          <InputGroupInput
            placeholder="Search for a replacement..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <InputGroupAddon>
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </InputGroupAddon>
        </InputGroup>

        <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
          {loading && results === null &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          {results?.map((product) => (
            <button
              key={product.id}
              type="button"
              disabled={pendingId !== null}
              onClick={() => choose(product)}
              className="flex items-center gap-3 rounded-xl border border-border p-2.5 text-left transition-colors hover:bg-secondary/50 disabled:opacity-60"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {product.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {product.merchant} · {product.category}
                </span>
              </div>
              <span className="flex items-center gap-2 font-serif text-sm font-semibold text-foreground">
                {formatPrice(product.price)}
                {pendingId === product.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4 text-muted-foreground" />
                )}
              </span>
            </button>
          ))}
          {results?.length === 0 && !loading && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No products found. Try a different search.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
