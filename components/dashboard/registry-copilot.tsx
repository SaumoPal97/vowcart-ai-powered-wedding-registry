"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Check,
  Loader2,
  User,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/data"
import type { Product, RegistryItem } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Proposal {
  add: Product[]
  remove: { id: string; title: string; reason: string }[]
}
interface Message {
  role: "user" | "assistant"
  text: string
  proposal?: Proposal
  applied?: boolean
}

const SUGGESTIONS = [
  "Add more gifts under $75",
  "Remove expensive gifts",
  "Add coffee-related gifts",
  "Make the registry more minimalist",
  "Add more options for guests under $50",
  "I already own a vacuum",
]

export function RegistryCopilot({
  initialItems,
}: {
  initialItems: RegistryItem[]
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm your registry copilot. Tell me how to shape your registry — add gifts by theme or budget, trim things you don't need, or rebalance priorities. I'll propose changes for you to approve.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [applyingIdx, setApplyingIdx] = useState<number | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  function scrollDown() {
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }))
  }

  async function send(message: string) {
    const text = message.trim()
    if (!text || loading) return
    setInput("")
    setMessages((m) => [...m, { role: "user", text }])
    setLoading(true)
    scrollDown()
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          items: items.map((i) => ({
            id: i.id,
            title: i.title,
            category: i.category,
            price: i.price,
            priority: i.priority,
            status: i.status,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const hasChanges = data.add?.length || data.remove?.length
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.reply,
          proposal: hasChanges ? { add: data.add, remove: data.remove } : undefined,
        },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
      scrollDown()
    }
  }

  async function apply(idx: number, proposal: Proposal) {
    setApplyingIdx(idx)
    try {
      // Removals.
      await Promise.all(
        proposal.remove.map((r) =>
          fetch(`/api/registry/items/${r.id}`, { method: "DELETE" }),
        ),
      )
      // Additions.
      const added: RegistryItem[] = []
      await Promise.all(
        proposal.add.map(async (p) => {
          const res = await fetch("/api/registry/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product: p }),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.item) added.push(data.item)
          }
        }),
      )
      const removedIds = new Set(proposal.remove.map((r) => r.id))
      setItems((prev) => [
        ...prev.filter((i) => !removedIds.has(i.id)),
        ...added,
      ])
      setMessages((m) =>
        m.map((msg, i) => (i === idx ? { ...msg, applied: true } : msg)),
      )
      toast.success("Registry updated", {
        description: `${proposal.add.length} added · ${proposal.remove.length} removed`,
      })
      router.refresh()
    } catch {
      toast.error("Couldn't apply all changes. Please try again.")
    } finally {
      setApplyingIdx(null)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col gap-4">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-3",
              msg.role === "user" && "flex-row-reverse",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                msg.role === "assistant"
                  ? "bg-accent/15 text-accent"
                  : "bg-secondary text-foreground",
              )}
            >
              {msg.role === "assistant" ? (
                <Sparkles className="size-4" />
              ) : (
                <User className="size-4" />
              )}
            </span>
            <div
              className={cn(
                "flex max-w-[85%] flex-col gap-3",
                msg.role === "user" && "items-end",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-secondary text-foreground"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {msg.text}
              </div>

              {msg.proposal && (
                <Card className="w-full">
                  <CardContent className="flex flex-col gap-3 p-4">
                    {msg.proposal.add.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <Plus className="size-3" /> Add {msg.proposal.add.length}
                        </p>
                        {msg.proposal.add.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="flex items-center gap-1.5 text-foreground">
                              {p.title}
                              {p.isSponsored && (
                                <Badge variant="secondary" className="text-[9px]">
                                  Sponsored
                                </Badge>
                              )}
                            </span>
                            <span className="text-muted-foreground">
                              {formatPrice(p.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.proposal.remove.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <Trash2 className="size-3" /> Remove {msg.proposal.remove.length}
                        </p>
                        {msg.proposal.remove.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="text-foreground line-through decoration-muted-foreground/40">
                              {r.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {r.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="mt-1"
                      disabled={msg.applied || applyingIdx === idx}
                      onClick={() => apply(idx, msg.proposal!)}
                    >
                      {msg.applied ? (
                        <>
                          <Check data-icon="inline-start" />
                          Applied
                        </>
                      ) : applyingIdx === idx ? (
                        <>
                          <Loader2 data-icon="inline-start" className="animate-spin" />
                          Applying...
                        </>
                      ) : (
                        "Apply changes"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <Button
              key={s}
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => send(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Ask the copilot to edit your registry..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <Send />
        </Button>
      </form>
    </div>
  )
}
