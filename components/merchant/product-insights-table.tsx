"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Megaphone, ArrowUpRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { formatPrice } from "@/lib/data"
import type { MerchantProductStat } from "@/lib/types"

type SortKey = "added" | "purchased" | "conversionRate" | "price"

export function ProductInsightsTable({
  products,
}: {
  products: MerchantProductStat[]
}) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("added")

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  )
  const [category, setCategory] = useState<string>("all")

  const rows = useMemo(() => {
    return products
      .filter((p) => {
        const matchesQuery =
          !query || p.title.toLowerCase().includes(query.toLowerCase())
        const matchesCategory = category === "all" || p.category === category
        return matchesQuery && matchesCategory
      })
      .sort((a, b) => (b[sort] as number) - (a[sort] as number))
  }, [products, query, category, sort])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:w-72">
          <InputGroupInput
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <div className="flex gap-3">
          <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort((v as SortKey) ?? "added")}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="added">Most added</SelectItem>
                <SelectItem value="purchased">Most purchased</SelectItem>
                <SelectItem value="conversionRate">Highest conversion</SelectItem>
                <SelectItem value="price">Highest price</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="text-right">Added</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Purchased</TableHead>
              <TableHead className="text-right">Conv.</TableHead>
              <TableHead className="hidden text-right md:table-cell">Avg. price</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.productId} className="group">
                <TableCell className="max-w-[46vw] sm:max-w-none">
                  <Link
                    href={`/merchant/products/${p.productId}`}
                    className="flex items-center gap-2 font-medium text-foreground hover:underline"
                  >
                    <span className="truncate">{p.title}</span>
                    {p.isSponsored && (
                      <Badge
                        variant="secondary"
                        className="hidden shrink-0 gap-1 text-[10px] sm:inline-flex"
                      >
                        <Megaphone className="size-2.5" />
                        Sponsored
                      </Badge>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {p.category}
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {p.added.toLocaleString()}
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                  {p.purchased.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={p.conversionRate >= 25 ? "default" : "secondary"}>
                    {p.conversionRate}%
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                  {formatPrice(p.price)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/merchant/products/${p.productId}`}
                    className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ArrowUpRight className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        Showing {rows.length} of {products.length} products · anonymized network demand
      </p>
    </div>
  )
}
