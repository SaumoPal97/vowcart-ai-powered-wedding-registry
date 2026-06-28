"use client"

import { useState } from "react"
import { PiggyBank } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { PhotoUpload } from "@/components/dashboard/photo-upload"
import { coverPhotoPresets } from "@/lib/data"
import type { RegistryItem } from "@/lib/types"
import { toast } from "sonner"

export function AddCashFundDialog({
  onAdded,
}: {
  onAdded: (item: RegistryItem) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [goal, setGoal] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(coverPhotoPresets[3])
  const [saving, setSaving] = useState(false)

  async function save() {
    const amount = Number(goal)
    if (!title.trim() || !(amount > 0)) return
    setSaving(true)
    try {
      const res = await fetch("/api/registry/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "cash_fund",
          isGroupGift: true,
          title: title.trim(),
          price: amount,
          description: description.trim(),
          image: image.trim() || undefined,
          merchant: "Cash Fund",
          category: "Home Decor",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onAdded(data.item)
      toast.success("Cash fund added to your registry")
      setOpen(false)
      setTitle("")
      setGoal("")
      setDescription("")
      setImage(coverPhotoPresets[3])
    } catch {
      toast.error("Couldn't add the cash fund. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <PiggyBank data-icon="inline-start" />
            Add cash fund
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a cash fund</DialogTitle>
          <DialogDescription>
            Let guests contribute toward something bigger — a honeymoon, a home,
            or anything you&apos;re saving for.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fund-title">Fund name</FieldLabel>
            <Input
              id="fund-title"
              placeholder="Honeymoon in Italy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fund-goal">Goal (USD)</FieldLabel>
            <Input
              id="fund-goal"
              type="number"
              min="1"
              step="1"
              inputMode="decimal"
              placeholder="3000"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fund-desc">Description (optional)</FieldLabel>
            <Textarea
              id="fund-desc"
              rows={2}
              placeholder="Help us explore the Amalfi Coast on our dream honeymoon."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Photo</FieldLabel>
            <PhotoUpload value={image} onChange={setImage} presets={coverPhotoPresets} />
            <FieldDescription>
              Shown on the fund card. Upload one or pick a suggestion.
            </FieldDescription>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={save} disabled={saving || !title.trim() || !(Number(goal) > 0)}>
            {saving ? "Adding..." : "Add cash fund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
