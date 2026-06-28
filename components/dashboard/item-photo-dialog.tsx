"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PhotoUpload } from "@/components/dashboard/photo-upload"
import type { RegistryItem } from "@/lib/types"
import { toast } from "sonner"

export function ItemPhotoDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
}: {
  item: RegistryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (id: string, image: string) => void
}) {
  const [photo, setPhoto] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) setPhoto(item.image)
  }, [item])

  async function save() {
    if (!item || !photo.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/registry/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo }),
      })
      if (!res.ok) throw new Error("failed")
      onUpdated(item.id, photo)
      toast.success("Gift photo updated")
      onOpenChange(false)
    } catch {
      toast.error("Couldn't update the photo. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change gift photo</DialogTitle>
          <DialogDescription>{item?.title}</DialogDescription>
        </DialogHeader>
        <PhotoUpload value={photo} onChange={setPhoto} />
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={save} disabled={saving || !photo.trim()}>
            {saving ? "Saving..." : "Save photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
