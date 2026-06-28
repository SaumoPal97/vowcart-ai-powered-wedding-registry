"use client"

import { useState } from "react"
import { Check, Mail, Sparkles, Send, Copy, Download } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import type { ThankYouNote } from "@/lib/types"
import { toast } from "sonner"

export function ThankYouTracker({
  initialNotes,
  coupleNames,
}: {
  initialNotes: ThankYouNote[]
  coupleNames: string
}) {
  type Tone = "warm" | "formal" | "playful" | "short"
  const [notes, setNotes] = useState<ThankYouNote[]>(initialNotes)
  const [active, setActive] = useState<ThankYouNote | null>(null)
  const [draft, setDraft] = useState("")
  const [tone, setTone] = useState<Tone>("warm")
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  const sent = notes.filter((n) => n.status === "sent").length
  const completion =
    notes.length > 0 ? Math.round((sent / notes.length) * 100) : 0

  function openNote(note: ThankYouNote) {
    setActive(note)
    setDraft("")
    setTone("warm")
  }

  async function generateDraft() {
    if (!active) return
    setGenerating(true)
    try {
      const res = await fetch("/api/thank-you/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleNames,
          guestName: active.purchasedBy,
          gift: active.gift,
          tone,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDraft(data.note)
    } catch {
      toast.error("Couldn't draft a note. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  async function copyDraft() {
    if (!draft.trim()) return
    try {
      await navigator.clipboard.writeText(draft)
      toast.success("Note copied to clipboard")
    } catch {
      toast.error("Couldn't copy. Please select and copy manually.")
    }
  }

  function exportCsv() {
    const header = ["Gift", "Purchased by", "Email", "Purchase date", "Thank-you status"]
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    const rows = notes.map((n) =>
      [n.gift, n.purchasedBy, n.email, n.purchaseDate, n.status].map(escape).join(","),
    )
    const csv = [header.map(escape).join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "vowcart-thank-yous.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Exported thank-you list")
  }

  async function markSent() {
    if (!active) return
    const target = active
    setSending(true)
    try {
      const res = await fetch(`/api/thank-you/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      })
      if (!res.ok) throw new Error("failed")
      setNotes((prev) =>
        prev.map((n) => (n.id === target.id ? { ...n, status: "sent" } : n)),
      )
      toast.success(`Thank-you note sent to ${target.purchasedBy}`)
      setActive(null)
    } catch {
      toast.error("Couldn't update that note. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Thank-you progress</CardTitle>
          <CardDescription>
            {sent} of {notes.length} thank-you notes sent. Stay on top of your
            gratitude.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completion} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Gift log</CardTitle>
            <CardDescription>
              Every gift received, with one-tap AI-assisted thank-you notes.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download data-icon="inline-start" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gift</TableHead>
                <TableHead className="hidden sm:table-cell">From</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium text-foreground">
                    <span className="block">{note.gift}</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground sm:hidden">
                      From {note.purchasedBy}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {note.purchasedBy}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {new Date(note.purchaseDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {note.status === "sent" ? (
                      <Badge variant="secondary" className="gap-1">
                        <Check className="size-3" />
                        Sent
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Mail className="size-3" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={note.status === "sent" ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => openNote(note)}
                    >
                      {note.status === "sent" ? "View" : "Write note"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!active}
        onOpenChange={(open) => !open && setActive(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Thank {active?.purchasedBy}
            </DialogTitle>
            <DialogDescription>
              For the {active?.gift}. Write your own or let AI draft one.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Tone</span>
              <ToggleGroup
                value={[tone]}
                onValueChange={(v) => v[0] && setTone(v[0] as Tone)}
                variant="outline"
                className="flex-wrap"
              >
                <ToggleGroupItem value="warm">Warm</ToggleGroupItem>
                <ToggleGroupItem value="formal">Formal</ToggleGroupItem>
                <ToggleGroupItem value="playful">Playful</ToggleGroupItem>
                <ToggleGroupItem value="short">Short</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={generateDraft}
                disabled={generating}
              >
                <Sparkles data-icon="inline-start" />
                {generating ? "Drafting..." : "Generate with AI"}
              </Button>
              <Button
                variant="outline"
                onClick={copyDraft}
                disabled={!draft.trim()}
              >
                <Copy data-icon="inline-start" />
                Copy
              </Button>
            </div>
          </div>
          <Textarea
            rows={9}
            placeholder="Write your heartfelt thank-you note..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setActive(null)}
            >
              Cancel
            </Button>
            <Button onClick={markSent} disabled={!draft.trim() || sending}>
              <Send data-icon="inline-start" />
              {sending ? "Sending..." : "Send & mark complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
