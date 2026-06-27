"use client"

import { useState } from "react"
import { Megaphone, Play, Pause, Plus } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/data"
import type { CampaignStatus, MerchantProductStat, SponsoredCampaign } from "@/lib/types"
import { toast } from "sonner"

const STATUS_VARIANT: Record<CampaignStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  paused: "secondary",
  draft: "outline",
}

export function SponsoredManager({
  initialCampaigns,
  products,
}: {
  initialCampaigns: SponsoredCampaign[]
  products: MerchantProductStat[]
}) {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  // New-campaign form state.
  const [productId, setProductId] = useState<string>(products[0]?.productId ?? "")
  const [budget, setBudget] = useState("1000")
  const [bid, setBid] = useState("1.0")

  async function toggleStatus(c: SponsoredCampaign) {
    const next: CampaignStatus = c.status === "active" ? "paused" : "active"
    setBusy(c.id)
    const snapshot = campaigns
    setCampaigns((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, status: next } : x)),
    )
    try {
      const res = await fetch(`/api/merchant/campaigns/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error("failed")
      toast.success(`Campaign ${next === "active" ? "activated" : "paused"}`)
    } catch {
      setCampaigns(snapshot)
      toast.error("Couldn't update the campaign. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  async function create() {
    const product = products.find((p) => p.productId === productId)
    if (!product) return
    setCreating(true)
    try {
      const res = await fetch("/api/merchant/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.productId,
          productTitle: product.title,
          category: product.category,
          budget: Number(budget),
          bid: Number(bid),
          status: "active",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCampaigns((prev) => [data.campaign, ...prev])
      toast.success("Campaign created", { description: product.title })
      setOpen(false)
    } catch {
      toast.error("Couldn't create the campaign. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="size-4 text-accent" />
            Sponsored campaigns
          </CardTitle>
          <CardDescription>
            Promote products in AI recommendations and product discovery. Couples
            always see a clear &ldquo;Sponsored&rdquo; label.
          </CardDescription>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus data-icon="inline-start" />
          New campaign
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden text-right md:table-cell">Budget</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Impr.</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Clicks</TableHead>
                <TableHead className="text-right">Purch.</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-foreground">
                    {c.productTitle}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {c.category}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[c.status]} className="capitalize">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                    {formatPrice(c.budget)}
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                    {c.impressions.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                    {c.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {c.purchases.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {c.status === "draft" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy === c.id}
                        onClick={() => toggleStatus(c)}
                      >
                        <Play data-icon="inline-start" />
                        Launch
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy === c.id}
                        onClick={() => toggleStatus(c)}
                      >
                        {c.status === "active" ? (
                          <>
                            <Pause data-icon="inline-start" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play data-icon="inline-start" />
                            Resume
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New sponsored campaign</DialogTitle>
            <DialogDescription>
              Promote one of your products. A preview of the consumer label is shown below.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="product">Product</FieldLabel>
              <Select value={productId} onValueChange={(v) => setProductId(v ?? "")}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {products.map((p) => (
                      <SelectItem key={p.productId} value={p.productId}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="budget">Budget ($)</FieldLabel>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="bid">Bid / click ($)</FieldLabel>
                <Input
                  id="bid"
                  type="number"
                  step="0.1"
                  value={bid}
                  onChange={(e) => setBid(e.target.value)}
                />
              </Field>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Consumer label preview
              </p>
              <Badge variant="secondary" className="gap-1">
                <Megaphone className="size-3" />
                Sponsored
              </Badge>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={creating || !productId}>
              {creating ? "Creating..." : "Launch campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
