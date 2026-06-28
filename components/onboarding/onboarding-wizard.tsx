"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Sparkles, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ProductCard } from "@/components/registry/product-card"
import { AiBuilding } from "@/components/onboarding/ai-building"
import { lifestyleQuestions, registrySizes, formatPrice } from "@/lib/data"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Phase = "details" | "lifestyle" | "size" | "building" | "result"

// Mirror of the server-side slugify so the preview matches what we'll save.
function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 140) || "our-registry"
  )
}

export function OnboardingWizard() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>("details")
  const [questionIndex, setQuestionIndex] = useState(0)

  // Form state
  const [partnerOne, setPartnerOne] = useState("")
  const [partnerTwo, setPartnerTwo] = useState("")
  const [weddingDate, setWeddingDate] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)

  // Auto-derive the slug from names until the user edits it manually.
  const effectiveSlug = slugEdited
    ? slugify(slug)
    : slugify(`${partnerOne} and ${partnerTwo}`)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [size, setSize] = useState(50)
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [generated, setGenerated] = useState<Product[]>([])
  const [built, setBuilt] = useState(false)
  const [saving, setSaving] = useState(false)

  const totalQuestions = lifestyleQuestions.length
  const currentQuestion = lifestyleQuestions[questionIndex]

  const kept = generated.filter((p) => !removed.has(p.id))
  const estTotal = kept.reduce((sum, p) => sum + p.price, 0)

  // Build a registry sized to the couple's chosen size (AI + UCP + catalog
  // top-up), so the number of gifts matches what they picked.
  async function buildRegistry() {
    setBuilt(false)
    setPhase("building")
    try {
      const res = await fetch("/api/onboarding/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionnaire: { ...answers, size } }),
      })
      const data = (await res.json()) as { products?: Product[] }
      setGenerated(data.products ?? [])
    } catch {
      toast.error("Couldn't build your registry. Please try again.")
      setGenerated([])
    } finally {
      // Let the building animation finish and advance once data has loaded.
      setBuilt(true)
    }
  }

  // Persist couple details + every kept gift, then head to the dashboard.
  async function saveAndContinue() {
    setSaving(true)
    try {
      // Create (or update) the couple first so items attach to the right slug.
      const res = await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerOne,
          partnerTwo,
          weddingDate,
          slug: effectiveSlug,
          preferences: { ...answers, size },
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(data.error || "Couldn't save your registry. Please try again.")
        setSaving(false)
        return
      }
      await Promise.all(
        kept.map((p) =>
          fetch("/api/registry/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product: p }),
          }),
        ),
      )
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Couldn't save your registry. Please try again.")
      setSaving(false)
    }
  }

  const detailsValid =
    partnerOne.trim() && partnerTwo.trim() && weddingDate.trim()

  function toggleRemoved(id: string) {
    setRemoved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const progress =
    phase === "details"
      ? 10
      : phase === "lifestyle"
        ? 15 + (questionIndex / totalQuestions) * 45
        : phase === "size"
          ? 70
          : phase === "building"
            ? 90
            : 100

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between">
        <Logo />
        <span className="text-sm text-muted-foreground">
          {phase === "result" ? "Done" : "Step"}{" "}
          {phase === "result" ? "" : `· ${Math.round(progress)}%`}
        </span>
      </header>

      <div className="mt-6">
        <Progress value={progress} />
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        {phase === "details" && (
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex flex-col gap-2 text-center">
              <span className="text-sm font-medium text-accent">
                Let&apos;s begin
              </span>
              <h1 className="font-serif text-3xl font-semibold text-foreground">
                Tell us about the big day
              </h1>
              <p className="text-muted-foreground">
                We&apos;ll personalize everything around the two of you.
              </p>
            </div>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="p1">Partner one</FieldLabel>
                  <Input
                    id="p1"
                    placeholder="Maya"
                    value={partnerOne}
                    onChange={(e) => setPartnerOne(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="p2">Partner two</FieldLabel>
                  <Input
                    id="p2"
                    placeholder="Daniel"
                    value={partnerTwo}
                    onChange={(e) => setPartnerTwo(e.target.value)}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="date">Wedding date</FieldLabel>
                <Input
                  id="date"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                />
                <FieldDescription>
                  We use this for your countdown and shipping windows.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="slug">Registry link</FieldLabel>
                <div className="flex items-center rounded-md border border-input bg-background pl-3 focus-within:ring-2 focus-within:ring-ring">
                  <span className="text-sm text-muted-foreground">
                    vowcart.app/r/
                  </span>
                  <Input
                    id="slug"
                    className="border-0 px-1 shadow-none focus-visible:ring-0"
                    placeholder="maya-and-daniel"
                    value={effectiveSlug}
                    onChange={(e) => {
                      setSlugEdited(true)
                      setSlug(e.target.value)
                    }}
                  />
                </div>
                <FieldDescription>
                  Your shareable registry URL. Auto-filled from your names —
                  edit it any time.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <Button
              className="mt-8 w-full"
              size="lg"
              disabled={!detailsValid}
              onClick={() => setPhase("lifestyle")}
            >
              Continue
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        )}

        {phase === "lifestyle" && currentQuestion && (
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex flex-col gap-2 text-center">
              <span className="text-sm font-medium text-accent">
                Question {questionIndex + 1} of {totalQuestions}
              </span>
              <h1 className="font-serif text-3xl font-semibold text-balance text-foreground">
                {currentQuestion.question}
              </h1>
            </div>
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option) => {
                const selected = answers[currentQuestion.id] === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setAnswers((a) => ({
                        ...a,
                        [currentQuestion.id]: option,
                      }))
                      setTimeout(() => {
                        if (questionIndex + 1 < totalQuestions) {
                          setQuestionIndex((i) => i + 1)
                        } else {
                          setPhase("size")
                        }
                      }, 220)
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-5 py-4 text-left text-base font-medium transition-all",
                      selected
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border bg-card text-foreground hover:border-accent/50 hover:bg-secondary",
                    )}
                  >
                    {option}
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border",
                        selected
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border",
                      )}
                    >
                      {selected && <Check className="size-3" />}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  if (questionIndex === 0) setPhase("details")
                  else setQuestionIndex((i) => i - 1)
                }}
              >
                <ArrowLeft data-icon="inline-start" />
                Back
              </Button>
              {answers[currentQuestion.id] && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (questionIndex + 1 < totalQuestions)
                      setQuestionIndex((i) => i + 1)
                    else setPhase("size")
                  }}
                >
                  Next
                  <ArrowRight data-icon="inline-end" />
                </Button>
              )}
            </div>
          </div>
        )}

        {phase === "size" && (
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex flex-col gap-2 text-center">
              <span className="text-sm font-medium text-accent">
                Almost there
              </span>
              <h1 className="font-serif text-3xl font-semibold text-foreground">
                How big should your registry be?
              </h1>
              <p className="text-muted-foreground">
                A good rule of thumb is two to three gifts per guest.
              </p>
            </div>
            <ToggleGroup
              value={[String(size)]}
              onValueChange={(v) => v[0] && setSize(Number(v[0]))}
              className="grid grid-cols-3 gap-3"
            >
              {registrySizes.map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={String(option)}
                  className="flex h-auto flex-col gap-1 rounded-xl border border-border bg-card py-5 data-[state=on]:border-accent data-[state=on]:bg-accent/10"
                >
                  <span className="font-serif text-2xl font-semibold">
                    {option}
                  </span>
                  <span className="text-xs text-muted-foreground">gifts</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button
              className="mt-8 w-full"
              size="lg"
              onClick={buildRegistry}
            >
              <Sparkles data-icon="inline-start" />
              Generate my registry
            </Button>
          </div>
        )}

        {phase === "building" && (
          <AiBuilding ready={built} onComplete={() => setPhase("result")} />
        )}

        {phase === "result" && (
          <div className="w-full">
            <div className="mb-8 flex flex-col gap-2 text-center">
              <span className="text-sm font-medium text-accent">
                Your registry is ready
              </span>
              <h1 className="font-serif text-3xl font-semibold text-foreground">
                {partnerOne} &amp; {partnerTwo}, here are your gifts
              </h1>
              <p className="text-muted-foreground">
                {kept.length} curated gifts · estimated{" "}
                {formatPrice(estTotal)} total. Remove anything that isn&apos;t
                quite right.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {generated.map((product) => {
                const isRemoved = removed.has(product.id)
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    dimmed={isRemoved}
                    footer={
                      <Button
                        variant={isRemoved ? "outline" : "secondary"}
                        size="sm"
                        className="w-full"
                        onClick={() => toggleRemoved(product.id)}
                      >
                        {isRemoved ? (
                          <>
                            <Plus data-icon="inline-start" />
                            Add back
                          </>
                        ) : (
                          <>
                            <X data-icon="inline-start" />
                            Remove
                          </>
                        )}
                      </Button>
                    }
                  />
                )
              })}
            </div>
            <div className="sticky bottom-4 mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/90 p-4 backdrop-blur sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {kept.length} gifts kept · {formatPrice(estTotal)}
              </p>
              <Button size="lg" onClick={saveAndContinue} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save &amp; go to dashboard
                    <ArrowRight data-icon="inline-end" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
