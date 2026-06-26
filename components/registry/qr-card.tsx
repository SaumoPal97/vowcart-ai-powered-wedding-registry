"use client"

import { useRef } from "react"
import { Copy, Download, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { QrCode } from "@/components/registry/qr-code"

export function QrCard({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const svgRef = useRef<HTMLDivElement>(null)
  const registryUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${slug}`
      : `https://vowcart.app/r/${slug}`

  function copyLink() {
    navigator.clipboard.writeText(registryUrl)
    toast.success("Registry link copied to clipboard")
  }

  function share() {
    if (navigator.share) {
      navigator
        .share({ title: "Our Wedding Registry", url: registryUrl })
        .catch(() => {})
    } else {
      copyLink()
    }
  }

  function downloadPng() {
    const svg = svgRef.current?.querySelector("svg")
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, 512, 512)
      ctx.drawImage(img, 32, 32, 448, 448)
      URL.revokeObjectURL(url)
      const link = document.createElement("a")
      link.download = `vowcart-${slug}-qr.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("QR code downloaded")
    }
    img.src = url
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-xl">Scan to gift</CardTitle>
        <CardDescription>
          Share this code on invitations and signage.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5">
        <div
          ref={svgRef}
          className="size-44 rounded-2xl border border-border bg-white p-3 shadow-sm"
        >
          <QrCode value={registryUrl} />
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          <Button variant="outline" size="lg" onClick={downloadPng}>
            <Download data-icon="inline-start" />
            Download
          </Button>
          <Button variant="outline" size="lg" onClick={copyLink}>
            <Copy data-icon="inline-start" />
            Copy Link
          </Button>
          <Button variant="outline" size="lg" onClick={share}>
            <Share2 data-icon="inline-start" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
