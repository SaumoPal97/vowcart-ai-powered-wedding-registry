"use client"

import { useState } from "react"
import Image from "next/image"
import confetti from "canvas-confetti"
import { Check, Clock, ShoppingBag, ExternalLink, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { StarRating } from "@/components/registry/star-rating"
import { StatusBadge } from "@/components/registry/badges"
import { formatPrice } from "@/lib/data"
import type { RegistryItem, ItemStatus } from "@/lib/types"
import { toast } from "sonner"

type Step = "details" | "form" | "success"
type Intent = "buy" | "reserve"

export function GiftDialog({
  item,
  open,
  onOpenChange,
  slug,
  onComplete,
}: {
  item: RegistryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  onComplete: (id: string, status: ItemStatus, name: string) => void
}) {
  const [step, setStep] = useState<Step>("details")
  const [intent, setIntent] = useState<Intent>("buy")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  function reset() {
    setStep("details")
    setName("")
    setEmail("")
    setLoading(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) setTimeout(reset, 200)
    onOpenChange(next)
  }

  function start(which: Intent) {
    setIntent(which)
    setStep("form")
  }

  function fireConfetti() {
    const end = Date.now() + 600
    const colors = ["#c79a6b", "#e8d9c5", "#7d9b76"]
    ;(function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }

  async function submit() {
    if (!name.trim() || !email.trim() || !item) return
    setLoading(true)
    try {
      if (intent === "reserve") {
        const res = await fetch("/api/reservation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registryItemId: item.id,
            reservedBy: name,
            slug,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? "Couldn't reserve this gift.")
          setLoading(false)
          return
        }
      } else {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registryItemId: item.id,
            guestName: name,
            guestEmail: email,
            slug,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? "Checkout failed. Please try again.")
          setLoading(false)
          return
        }
      }
      setLoading(false)
      setStep("success")
      if (intent === "buy") fireConfetti()
      onComplete(item.id, intent === "buy" ? "purchased" : "reserved", name)
    } catch {
      toast.error("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {item.title}
              </DialogTitle>
              <DialogDescription>
                Sold by {item.merchant} · {item.category}
              </DialogDescription>
            </DialogHeader>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, 28rem"
                className="object-cover"
              />
              <div className="absolute left-3 top-3">
                <StatusBadge status={item.status} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-serif text-2xl font-semibold text-foreground">
                {formatPrice(item.price)}
              </span>
              <StarRating rating={item.rating} reviews={item.reviews} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            <FieldGroup>
              <Button size="lg" className="w-full" onClick={() => start("buy")}>
                <ShoppingBag data-icon="inline-start" />
                Buy this gift · {formatPrice(item.price)}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => start("reserve")}
              >
                <Clock data-icon="inline-start" />
                Reserve for later
              </Button>
            </FieldGroup>
            <p className="text-center text-xs text-muted-foreground">
              Secure checkout powered by Shopify across {item.merchant} and 40+
              merchants.
            </p>
          </>
        )}

        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {intent === "buy" ? "Complete your gift" : "Reserve this gift"}
              </DialogTitle>
              <DialogDescription>
                {intent === "buy"
                  ? "We'll let the couple know it's from you."
                  : "We'll hold this gift for 48 hours so no one else buys it."}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="guest-name">Your name</FieldLabel>
                <Input
                  id="guest-name"
                  placeholder="Jordan Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="guest-email">Email</FieldLabel>
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FieldDescription>
                  For your receipt and a thank-you note from the couple.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full"
                onClick={submit}
                disabled={loading || !name.trim() || !email.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                    {intent === "buy" ? "Processing..." : "Reserving..."}
                  </>
                ) : intent === "buy" ? (
                  <>
                    <ShoppingBag data-icon="inline-start" />
                    Pay {formatPrice(item.price)}
                  </>
                ) : (
                  <>
                    <Clock data-icon="inline-start" />
                    Reserve gift
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("details")}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <DialogHeader className="items-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Check className="size-7" />
              </span>
              <DialogTitle className="font-serif text-2xl">
                {intent === "buy" ? "Gift sent!" : "Gift reserved!"}
              </DialogTitle>
              <DialogDescription>
                {intent === "buy"
                  ? `Thank you, ${name}. The couple will be thrilled.`
                  : `We're holding the ${item.title} for you for 48 hours.`}
              </DialogDescription>
            </DialogHeader>
            {intent === "reserve" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIntent("buy")
                  setStep("form")
                }}
              >
                <ExternalLink data-icon="inline-start" />
                Complete purchase now
              </Button>
            )}
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Back to registry
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
