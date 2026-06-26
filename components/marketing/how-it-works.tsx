import { ClipboardList, Gift, Send, Share2, Sparkles } from "lucide-react"

const steps = [
  {
    icon: ClipboardList,
    title: "Create your registry",
    description: "Tell us about you as a couple and your new life together.",
  },
  {
    icon: Sparkles,
    title: "AI recommends gifts",
    description: "Get a personalized registry curated from top merchants.",
  },
  {
    icon: Share2,
    title: "Share your registry",
    description: "Send one beautiful link or a scannable QR code to guests.",
  },
  {
    icon: Gift,
    title: "Guests purchase",
    description: "Secure checkout across merchants, powered by Shopify UCP.",
  },
  {
    icon: Send,
    title: "Track gifts & thank-you notes",
    description: "Stay organized from the first gift to the last note sent.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            How it works
          </p>
          <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            From "yes" to perfectly registered.
          </h2>
        </div>
        <div className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-accent shadow-sm">
                  <step.icon className="size-5" />
                </span>
                <span className="font-serif text-sm font-semibold text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="text-pretty text-lg font-semibold leading-snug text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
