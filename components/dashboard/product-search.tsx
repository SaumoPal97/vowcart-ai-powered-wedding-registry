"use client"

import { useEffect, useRef, useState } from "react"
import { Search, Plus, Check, Loader2, Sparkles, PackageSearch } from "lucide-react"
import { ProductCard } from "@/components/registry/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORIES } from "@/lib/data"
import type { Product } from "@/lib/types"
import { toast } from "sonner"

const SUGGESTIONS = [
  "KitchenAid stand mixer",
  "Linen bedding set",
  "Away carry-on luggage",
  "Espresso machine",
  "Le Creuset dutch oven",
  "Smart home lighting",
]

export function ProductSearch() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [results, setResults] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [total, setTotal] = useState<number | undefined>(undefined)
  const [source, setSource] = useState<string>("")
  const [lastQuery, setLastQuery] = useState("")
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [pending, setPending] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const reqIdRef = useRef(0)
  // Cursor is read inside an async appended fetch; keep a ref to avoid stale closure.
  const cursorRef = useRef<string | null>(null)
  cursorRef.current = cursor

  async function fetchPage(reset: boolean) {
    const term = query.trim()
    if (!term) return
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    const reqId = ++reqIdRef.current

    if (reset) setLoading(true)
    else setLoadingMore(true)
    if (reset) setLastQuery(term)

    try {
      const res = await fetch("/api/products/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({
          query: term,
          category: category === "all" ? undefined : category,
          cursor: reset ? undefined : cursorRef.current,
        }),
      })
      const data = await res.json()
      if (reqId !== reqIdRef.current) return // a newer request superseded this one
      const incoming: Product[] = data.products ?? []
      setSource(data.source ?? "")
      setCursor(data.cursor ?? null)
      setHasNext(Boolean(data.hasNextPage))
      setTotal(data.totalCount)
      setResults((prev) => {
        if (reset || prev === null) return incoming
        // De-dupe across pages by product id.
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...incoming.filter((p) => !seen.has(p.id))]
      })
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        toast.error("Search failed. Please try again.")
        if (reset) setResults([])
      }
    } finally {
      if (reqId === reqIdRef.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }

  // Debounced as-you-type search (and on category change).
  useEffect(() => {
    const term = query.trim()
    if (term.length === 0) {
      setResults(null)
      setCursor(null)
      setHasNext(false)
      return
    }
    if (term.length < 2) return
    const t = setTimeout(() => fetchPage(true), 450)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category])

  async function add(product: Product) {
    if (added.has(product.id)) return
    setPending(product.id)
    try {
      const res = await fetch("/api/registry/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      })
      if (!res.ok) throw new Error("failed")
      setAdded((prev) => new Set(prev).add(product.id))
      toast.success("Added to your registry", { description: product.title })
    } catch {
      toast.error("Couldn't add that gift. Please try again.")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          fetchPage(true)
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <InputGroup className="flex-1">
          <InputGroupInput
            placeholder="Search millions of products across Shopify merchants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </InputGroupAddon>
        </InputGroup>
        <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
          <SelectTrigger className="sm:w-48">
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
      </form>

      {/* Initial state: suggestion chips */}
      {results === null && !loading && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {SUGGESTIONS.map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setQuery(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageSearch />
              </EmptyMedia>
              <EmptyTitle>Search the universal catalog</EmptyTitle>
              <EmptyDescription>
                Powered by Shopify&apos;s Universal Commerce Protocol — search
                real products from hundreds of merchants and add them straight to
                your registry.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

      {/* First-page loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results !== null && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {results.length}
              {total ? ` of ~${total.toLocaleString()}` : ""} result
              {results.length === 1 ? "" : "s"} for{" "}
              <span className="font-medium text-foreground">
                &ldquo;{lastQuery}&rdquo;
              </span>
            </p>
            {source === "ucp" && (
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="size-3" />
                Live via Shopify UCP
              </Badge>
            )}
          </div>

          {results.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>No products found</EmptyTitle>
                <EmptyDescription>
                  Try a different search term or category.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((product) => {
                  const isAdded = added.has(product.id)
                  const isPending = pending === product.id
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      topLeft={
                        <Badge variant="secondary">{product.merchant}</Badge>
                      }
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

              {hasNext && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fetchPage(false)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 data-icon="inline-start" className="animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      "Load more results"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
