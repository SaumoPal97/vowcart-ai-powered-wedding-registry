"use client"

import { useEffect, useState } from "react"
import { Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  "Analyzing your lifestyle answers",
  "Matching products across 40+ merchants",
  "Balancing price ranges for every guest",
  "Curating must-haves and nice-to-haves",
  "Finalizing your personalized registry",
]

export function AiBuilding({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (current >= STEPS.length) {
      const done = setTimeout(onComplete, 700)
      return () => clearTimeout(done)
    }
    const timer = setTimeout(() => setCurrent((c) => c + 1), 900)
    return () => clearTimeout(timer)
  }, [current, onComplete])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 py-10 text-center">
      <div className="relative flex size-20 items-center justify-center rounded-full bg-accent/15">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
        <Sparkles className="size-9 text-accent" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Building your registry
        </h2>
        <p className="text-muted-foreground">
          Our AI is hand-picking gifts just for you.
        </p>
      </div>
      <ul className="flex w-full flex-col gap-3 text-left">
        {STEPS.map((step, i) => {
          const isDone = i < current
          const isActive = i === current
          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm transition-all duration-300",
                isDone && "border-accent/40",
                isActive && "border-accent/60 shadow-sm",
                !isDone && !isActive && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border",
                  isDone
                    ? "border-accent bg-accent text-accent-foreground"
                    : isActive
                      ? "border-accent text-accent"
                      : "border-border text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="size-3.5" />
                ) : isActive ? (
                  <span className="size-2 animate-pulse rounded-full bg-accent" />
                ) : (
                  <span className="size-2 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span
                className={cn(
                  "font-medium",
                  isDone || isActive
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
