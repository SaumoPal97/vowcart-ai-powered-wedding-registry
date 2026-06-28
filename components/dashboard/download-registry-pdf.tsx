"use client"

import { useState } from "react"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice, formatWeddingDate } from "@/lib/data"
import type { Couple, RegistryItem } from "@/lib/types"
import { toast } from "sonner"

export function DownloadRegistryPdf({
  couple,
  items,
}: {
  couple: Pick<Couple, "partnerOne" | "partnerTwo" | "weddingDate" | "location" | "slug">
  items: RegistryItem[]
}) {
  const [busy, setBusy] = useState(false)

  async function generate() {
    setBusy(true)
    try {
      // Loaded on demand to keep the dashboard bundle lean.
      const { jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF({ unit: "pt", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const marginX = 40

      // Header.
      doc.setFont("times", "bold")
      doc.setFontSize(22)
      doc.text(
        `${couple.partnerOne} & ${couple.partnerTwo}`,
        pageWidth / 2,
        56,
        { align: "center" },
      )
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.setTextColor(110)
      const subtitleParts = [
        couple.weddingDate ? formatWeddingDate(couple.weddingDate) : "",
        couple.location || "",
      ].filter(Boolean)
      doc.text(
        ["Wedding Registry", ...subtitleParts].join("  ·  "),
        pageWidth / 2,
        76,
        { align: "center" },
      )

      const isFund = (i: RegistryItem) =>
        i.itemType === "cash_fund" || i.isGroupGift
      const statusLabel = (i: RegistryItem) => {
        if (isFund(i)) {
          const raised = i.contributed ?? 0
          return raised >= i.price
            ? "Funded"
            : `${formatPrice(raised)} / ${formatPrice(i.price)} raised`
        }
        if (i.status === "purchased") return "Purchased"
        if (i.status === "reserved") return "Reserved"
        return "Available"
      }

      autoTable(doc, {
        startY: 100,
        head: [["Gift", "From", "Price / Goal", "Status", "Priority"]],
        body: items.map((i) => [
          i.title,
          i.itemType === "cash_fund" ? "Cash fund" : i.merchant,
          formatPrice(i.price),
          statusLabel(i),
          i.priority === "must-have" ? "Must-have" : "Nice-to-have",
        ]),
        styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
        headStyles: { fillColor: [199, 154, 107], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 245, 240] },
        columnStyles: { 0: { cellWidth: 200 } },
        margin: { left: marginX, right: marginX },
      })

      const total = items.reduce((sum, i) => sum + i.price, 0)
      // @ts-expect-error lastAutoTable is added by the plugin at runtime
      const endY = (doc.lastAutoTable?.finalY ?? 120) + 24
      doc.setFontSize(10)
      doc.setTextColor(60)
      doc.text(
        `${items.length} gifts  ·  total registry value ${formatPrice(total)}`,
        marginX,
        endY,
      )
      doc.setTextColor(150)
      doc.setFontSize(9)
      doc.text(
        "Registry powered by VowCart",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 28,
        { align: "center" },
      )

      doc.save(`${couple.slug || "wedding"}-registry.pdf`)
      toast.success("Registry PDF downloaded")
    } catch {
      toast.error("Couldn't generate the PDF. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="outline" onClick={generate} disabled={busy || items.length === 0}>
      <FileDown data-icon="inline-start" />
      {busy ? "Preparing..." : "Download PDF"}
    </Button>
  )
}
