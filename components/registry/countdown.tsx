"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

function getParts(target: number) {
  const diff = Math.max(0, target - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

export function Countdown({
  date,
  className,
}: {
  date: string
  className?: string
}) {
  const target = new Date(date).getTime()
  const [parts, setParts] = useState<ReturnType<typeof getParts> | null>(null)

  useEffect(() => {
    setParts(getParts(target))
    const interval = setInterval(() => setParts(getParts(target)), 1000)
    return () => clearInterval(interval)
  }, [target])

  const units = [
    { label: "Days", value: parts?.days },
    { label: "Hours", value: parts?.hours },
    { label: "Minutes", value: parts?.minutes },
    { label: "Seconds", value: parts?.seconds },
  ]

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <span className="font-serif text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
            {unit.value === undefined
              ? "--"
              : String(unit.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  )
}
