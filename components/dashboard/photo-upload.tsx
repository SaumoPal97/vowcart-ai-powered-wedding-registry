"use client"

import { useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import { Upload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const MAX_BYTES = 10 * 1024 * 1024

/**
 * Cover-photo picker: uploads directly to Vercel Blob, offers one-click
 * preset images, and falls back to a pasted image URL. Every path writes the
 * final URL through `onChange`.
 */
export function PhotoUpload({
  value,
  onChange,
  presets,
}: {
  value: string
  onChange: (url: string) => void
  presets?: string[]
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 10 MB.")
      return
    }
    setBusy(true)
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })
      onChange(blob.url)
      toast.success("Photo uploaded")
    } catch {
      toast.error("Upload failed. You can paste an image URL instead.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Upload data-icon="inline-start" />
          )}
          {busy ? "Uploading..." : "Upload photo"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => onChange("")}
          >
            <X data-icon="inline-start" />
            Remove
          </Button>
        )}
      </div>

      {presets && presets.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">
            …or pick a suggested photo
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((url) => (
              <button
                key={url}
                type="button"
                aria-label="Use this photo"
                onClick={() => onChange(url)}
                className={cn(
                  "relative size-14 overflow-hidden rounded-lg border-2 transition",
                  value === url
                    ? "border-accent ring-2 ring-accent/40"
                    : "border-border hover:border-muted-foreground",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Input
        placeholder="…or paste an image URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {value.trim() && (
        <div className="relative aspect-[3/2] w-full max-w-sm overflow-hidden rounded-xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Cover preview"
            className="size-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = "none"
            }}
          />
        </div>
      )}
    </div>
  )
}
