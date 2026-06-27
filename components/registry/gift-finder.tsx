"use client"

import { useState } from "react"
import Image from "next/image"
import { Sparkles, Send, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/data"
import type { RegistryItem } from "@/lib/types"
import { toast } from "sonner"

const PROMPTS = [
  "I have a $100 budget",
  "Something meaningful",
  "Show me gifts under $50",
  "What are their must-have gifts?",
]

export function GiftFinder({
  slug,
  onSelect,
}: {
  slug: string
  onSelect: (item: RegistryItem) => void
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState<string | null>(null)
  const [results, setResults] = useState<RegistryItem[]>([])

  async function ask(message: string) {
    const text = message.trim()
    if (!text || loading) return
    setLoading(true)
    setReply(null)
    try {
      const res = await fetch("/api/gift-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReply(data.reply)
      setResults(data.items ?? [])
    } catch {
      toast.error("Couldn't find gifts right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2">
            <Sparkles className="size-4 text-accent" />
            Help me choose a gift
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Sparkles className="size-5 text-accent" />
            Gift Finder
          </DialogTitle>
          <DialogDescription>
            Tell me your budget or what you have in mind and I&apos;ll suggest
            available gifts from the registry.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="e.g. I'm a coworker with a $75 budget"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>

        {!reply && !loading && (
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <Button
                key={p}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setInput(p)
                  ask(p)
                }}
              >
                {p}
              </Button>
            ))}
          </div>
        )}

        {reply && (
          <p className="text-sm text-muted-foreground">{reply}</p>
        )}

        {results.length > 0 && (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOpen(false)
                  onSelect(item)
                }}
                className="flex items-center gap-3 rounded-xl border border-border p-2.5 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.merchant} · {item.category}
                  </span>
                </div>
                <span className="font-serif text-sm font-semibold text-foreground">
                  {formatPrice(item.price)}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
