"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import confetti from "canvas-confetti"
import {
  Check,
  Clock,
  ShoppingBag,
  ExternalLink,
  Loader2,
  HeartHandshake,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
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

type Step = "details" | "form" | "confirm" | "success"
type Intent = "buy" | "reserve" | "contribute"

export function GiftDialog({
  item,
  open,
  onOpenChange,
  slug,
  onComplete,
  onContributed,
}: {
  item: RegistryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  onComplete: (id: string, status: ItemStatus, name: string) => void
  onContributed?: (
    id: string,
    contributed: number,
    contributorCount: number,
    funded: boolean,
  ) => void
}) {
  const [step, setStep] = useState<Step>("details")
  const [intent, setIntent] = useState<Intent>("buy")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  // 15-minute reservation window (in seconds remaining).
  const [secondsLeft, setSecondsLeft] = useState(15 * 60)

  // Tick the 15-minute hold countdown — while a reserved gift is shown, and
  // while a buyer is finishing checkout (the gift is held for them meanwhile).
  useEffect(() => {
    const active =
      (step === "success" && intent === "reserve") ||
      (step === "confirm" && intent === "buy")
    if (!active) return
    setSecondsLeft(15 * 60)
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [step, intent])

  const timer = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
    secondsLeft % 60,
  ).padStart(2, "0")}`

  function reset() {
    setStep("details")
    setName("")
    setEmail("")
    setAmount("")
    setMessage("")
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

  // Places a best-effort 15-minute hold so no one else can claim the gift
  // while this guest completes checkout. Never blocks the purchase itself.
  async function holdForCheckout() {
    if (!item) return
    try {
      await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registryItemId: item.id, reservedBy: name, slug }),
      })
    } catch {
      // Hold is opportunistic — proceed to checkout regardless.
    }
  }

  // Primary action from the form step.
  async function submit() {
    if (!item) return
    if (intent === "contribute") return submitContribute()
    if (!name.trim() || !email.trim()) return
    if (intent === "reserve") return submitReserve()
    // Buy: hold the gift for 15 minutes, then hand off to checkout.
    setLoading(true)
    await holdForCheckout()
    setLoading(false)
    // UCP buy → hand off to the merchant's real Shopify checkout, then confirm.
    if (item.checkoutUrl) {
      window.open(item.checkoutUrl, "_blank", "noopener,noreferrer")
      setStep("confirm")
      return
    }
    // No UCP checkout URL (legacy/seed item) → complete directly.
    return finalizePurchase()
  }

  async function submitReserve() {
    if (!item) return
    setLoading(true)
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registryItemId: item.id, reservedBy: name, slug }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't reserve this gift.")
        setLoading(false)
        return
      }
      setLoading(false)
      setStep("success")
      onComplete(item.id, "reserved", name)
    } catch {
      toast.error("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  // Records a guest's contribution toward a group gift / cash fund.
  async function submitContribute() {
    if (!item) return
    const value = Number(amount)
    if (!name.trim() || !Number.isFinite(value) || value <= 0) return
    setLoading(true)
    try {
      const res = await fetch(`/api/registry/items/${item.id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: name,
          guestEmail: email || undefined,
          amount: value,
          message: message || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't record your contribution.")
        setLoading(false)
        return
      }
      setLoading(false)
      setStep("success")
      fireConfetti()
      onContributed?.(
        item.id,
        data.contributed,
        data.contributorCount,
        data.funded,
      )
    } catch {
      toast.error("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  // Records the purchase in VowCart after the guest checks out on the merchant.
  async function finalizePurchase() {
    if (!item) return
    setLoading(true)
    try {
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
        toast.error(data.error ?? "Couldn't record your gift. Please try again.")
        setLoading(false)
        return
      }
      setLoading(false)
      setStep("success")
      fireConfetti()
      onComplete(item.id, "purchased", name)
    } catch {
      toast.error("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  if (!item) return null

  const contributable = !!item.isGroupGift || item.itemType === "cash_fund"
  const raised = item.contributed ?? 0
  const goal = item.price
  const remaining = Math.max(0, goal - raised)
  const fundedPct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0
  const isFunded = contributable && remaining <= 0

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
                {item.itemType === "cash_fund"
                  ? "Cash fund"
                  : `Sold by ${item.merchant} · ${item.category}`}
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
            {contributable ? (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-2xl font-semibold text-foreground">
                      {formatPrice(raised)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      of {formatPrice(goal)} goal
                    </span>
                  </div>
                  <Progress value={fundedPct} />
                  <p className="text-xs text-muted-foreground">
                    {item.contributorCount
                      ? `${item.contributorCount} ${
                          item.contributorCount === 1 ? "guest has" : "guests have"
                        } contributed`
                      : "Be the first to contribute"}
                    {!isFunded && remaining > 0
                      ? ` · ${formatPrice(remaining)} to go`
                      : ""}
                  </p>
                </div>
                {item.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                )}
                <FieldGroup>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => start("contribute")}
                    disabled={isFunded}
                  >
                    <HeartHandshake data-icon="inline-start" />
                    {isFunded ? "Fully funded 🎉" : "Contribute"}
                  </Button>
                </FieldGroup>
                <p className="text-center text-xs text-muted-foreground">
                  {item.itemType === "cash_fund"
                    ? "Contribute any amount toward this fund."
                    : "Chip in any amount — give this gift together."}
                </p>
              </>
            ) : (
              <>
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
                  Secure checkout powered by Shopify across {item.merchant} and
                  40+ merchants.
                </p>
              </>
            )}
          </>
        )}

        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {intent === "buy"
                  ? "Complete your gift"
                  : intent === "reserve"
                    ? "Reserve this gift"
                    : "Make a contribution"}
              </DialogTitle>
              <DialogDescription>
                {intent === "buy"
                  ? "We'll let the couple know it's from you."
                  : intent === "reserve"
                    ? "We'll hold this gift for 15 minutes so no one else can buy it while you check out."
                    : `Chip in any amount toward ${item.title}. ${
                        remaining > 0 ? `${formatPrice(remaining)} to go.` : ""
                      }`}
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
              {intent === "contribute" && (
                <Field>
                  <FieldLabel htmlFor="contrib-amount">Amount (USD)</FieldLabel>
                  <Input
                    id="contrib-amount"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="decimal"
                    placeholder={remaining > 0 ? String(remaining) : "50"}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {remaining > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[25, 50, 100].map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAmount(String(preset))}
                        >
                          {formatPrice(preset)}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(String(remaining))}
                      >
                        Cover the rest
                      </Button>
                    </div>
                  )}
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="guest-email">
                  Email{intent === "contribute" ? " (optional)" : ""}
                </FieldLabel>
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
              {intent === "contribute" && (
                <Field>
                  <FieldLabel htmlFor="contrib-message">
                    Message (optional)
                  </FieldLabel>
                  <Textarea
                    id="contrib-message"
                    rows={2}
                    placeholder="Wishing you both a lifetime of happiness!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Field>
              )}
            </FieldGroup>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full"
                onClick={submit}
                disabled={
                  loading ||
                  !name.trim() ||
                  (intent === "contribute"
                    ? !(Number(amount) > 0)
                    : !email.trim())
                }
              >
                {loading ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                    {intent === "buy"
                      ? "Processing..."
                      : intent === "reserve"
                        ? "Reserving..."
                        : "Sending..."}
                  </>
                ) : intent === "contribute" ? (
                  <>
                    <HeartHandshake data-icon="inline-start" />
                    Contribute{Number(amount) > 0
                      ? ` ${formatPrice(Number(amount))}`
                      : ""}
                  </>
                ) : intent === "buy" ? (
                  item.checkoutUrl ? (
                    <>
                      <ExternalLink data-icon="inline-start" />
                      Continue to {item.merchant}
                    </>
                  ) : (
                    <>
                      <ShoppingBag data-icon="inline-start" />
                      Pay {formatPrice(item.price)}
                    </>
                  )
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

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Finish at {item.merchant}
              </DialogTitle>
              <DialogDescription>
                We opened {item.merchant}&apos;s secure Shopify checkout in a new
                tab. Complete your purchase there, then confirm below so the
                couple sees it&apos;s claimed.
              </DialogDescription>
            </DialogHeader>
            <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 py-3 text-sm">
              <Clock className="size-4 text-accent" />
              <span className="text-muted-foreground">
                Held for you —
              </span>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {timer}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
              Didn&apos;t see the tab open?{" "}
              <a
                href={item.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Open checkout again
              </a>
              .
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full"
                onClick={finalizePurchase}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Check data-icon="inline-start" />
                    I&apos;ve completed my purchase
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("details")}
                disabled={loading}
              >
                Cancel
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
                {intent === "buy"
                  ? "Gift sent!"
                  : intent === "reserve"
                    ? "Gift reserved!"
                    : "Thank you for contributing!"}
              </DialogTitle>
              <DialogDescription>
                {intent === "buy"
                  ? `Thank you, ${name}. The couple will be thrilled.`
                  : intent === "reserve"
                    ? `Reserved for you, ${name}. Complete your purchase before the timer runs out.`
                    : `Your contribution means the world, ${name}. The couple will be so grateful.`}
              </DialogDescription>
            </DialogHeader>
            {intent === "reserve" && (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 py-3 text-sm">
                <Clock className="size-4 text-accent" />
                <span className="text-muted-foreground">Reserved for you —</span>
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  {timer}
                </span>
              </div>
            )}
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
