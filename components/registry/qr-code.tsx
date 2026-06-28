"use client"

import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"

// A real, scannable QR code encoding `value`. Renders an <svg> so the card's
// SVG→PNG download path keeps working.
export function QrCode({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <QRCodeSVG
      value={value}
      level="M"
      marginSize={0}
      fgColor="#1c1917"
      bgColor="#ffffff"
      className={cn("size-full", className)}
      aria-label="Registry QR code"
    />
  )
}
