import Link from "next/link"
import { Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    quote:
      "The AI built our entire registry in under a minute. It somehow knew we were coffee obsessed and never cook a real meal without our Dutch oven.",
    name: "Maya & Daniel",
    location: "Hudson Valley, NY",
    initials: "MD",
  },
  {
    quote:
      "One link, every store. Our guests loved how easy it was, and we loved watching the registry update in real time.",
    name: "Priya & James",
    location: "Austin, TX",
    initials: "PJ",
  },
  {
    quote:
      "The thank-you tracker alone was worth it. We didn't miss a single note, and the QR code on our invites was a hit.",
    name: "Sofia & Liam",
    location: "Portland, OR",
    initials: "SL",
  },
]

export function Testimonials() {
  return (
    <section className="bg-secondary/40 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Loved by couples
          </p>
          <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Joyfully registered, beautifully celebrated.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="flex flex-col gap-5 p-6">
                <Quote className="size-7 text-accent" />
                <p className="text-pretty leading-relaxed text-foreground">
                  {t.quote}
                </p>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <Avatar>
                    <AvatarFallback>{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-16 overflow-hidden border-0 bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-14 text-center">
            <h3 className="max-w-xl text-balance font-serif text-3xl font-semibold sm:text-4xl">
              Your registry is waiting to be built.
            </h3>
            <p className="max-w-md text-pretty text-primary-foreground/70">
              Join thousands of couples who started their forever with VowCart.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-6 text-base"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Create Your Registry
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
