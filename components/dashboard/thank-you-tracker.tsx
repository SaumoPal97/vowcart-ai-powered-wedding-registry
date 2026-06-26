"use client"

import { useState } from "react"
import { Check, Mail, Sparkles, Send } from "lucide-react"
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
import { thankYouNotes } from "@/lib/data"
import type { ThankYouNote } from "@/lib/types"
import { toast } from "sonner"

export function ThankYouTracker() {
  const [notes, setNotes] = useState<ThankYouNote[]>(thankYouNotes)
  const [active, setActive] = useState<ThankYouNote | null>(null)
  const [draft, setDraft] = useState("")
  const [generating, setGenerating] = useState(false)

  const sent = notes.filter((n) => n.status === "sent").length
  const completion = Math.round((sent / notes.length) * 100)

  function openNote(note: ThankYouNote) {
    setActive(note)
    setDraft("")
  }

  function generateDraft() {
    if (!active) return
    setGenerating(true)
    setTimeout(() => {
      setDraft(
        `Dear ${active.purchasedBy},\n\nThank you so much for the ${active.gift}! It means the world to us that you're celebrating this new chapter with us. We can't wait to put it to good use in our new home, and we feel so lucky to have you in our lives.\n\nWith love and gratitude,\nMaya & Daniel`,
      )
      setGenerating(false)
    }, 900)
  }

  function markSent() {
    if (!active) return
    setNotes((prev) =>
      prev.map((n) => (n.id === active.id ? { ...n, status: "sent" } : n)),
    )
    toast.success(`Thank-you note sent to ${active.purchasedBy}`)
    setActive(null)
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
        <CardHeader>
          <CardTitle>Gift log</CardTitle>
          <CardDescription>
            Every gift received, with one-tap AI-assisted thank-you notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gift</TableHead>
                <TableHead>From</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium text-foreground">
                    {note.gift}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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
          <Button
            variant="secondary"
            onClick={generateDraft}
            disabled={generating}
          >
            <Sparkles data-icon="inline-start" />
            {generating ? "Drafting..." : "Generate with AI"}
          </Button>
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
            <Button onClick={markSent} disabled={!draft.trim()}>
              <Send data-icon="inline-start" />
              Send &amp; mark complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
