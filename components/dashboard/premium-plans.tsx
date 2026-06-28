"use client"

import { Check, Sparkles, Crown } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const FREE = [
  "AI registry builder",
  "Unlimited gifts from any Shopify merchant",
  "Shareable registry link & QR code",
  "Guest reservations & checkout",
  "Thank-you tracker",
]

const PREMIUM = [
  "Everything in Free",
  "Unlimited AI Copilot edits",
  "AI-generated thank-you notes (every tone)",
  "Group gifting & cash funds",
  "Downloadable registry PDF",
]

export function PremiumPlans() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Your plan
        </h2>
        <p className="text-sm text-muted-foreground">
          Upgrade for premium themes, unlimited AI, and more.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Free</CardTitle>
              <Badge variant="secondary">Current</Badge>
            </div>
            <CardDescription>
              <span className="font-serif text-2xl font-semibold text-foreground">
                $0
              </span>{" "}
              forever
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {FREE.map((f) => (
              <span
                key={f}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="size-4 shrink-0 text-accent" />
                {f}
              </span>
            ))}
          </CardContent>
        </Card>

        <Card className={cn("relative border-accent ring-1 ring-accent")}>
          <Badge className="absolute right-4 top-4 gap-1">
            <Crown className="size-3" />
            Premium
          </Badge>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              Premium
            </CardTitle>
            <CardDescription>
              <span className="font-serif text-2xl font-semibold text-foreground">
                $39
              </span>{" "}
              one-time, through your wedding
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {PREMIUM.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Check className="size-4 shrink-0 text-accent" />
                  {f}
                </span>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={() =>
                toast.success("Premium is illustrative in this demo", {
                  description: "No payment is processed.",
                })
              }
            >
              <Crown data-icon="inline-start" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
