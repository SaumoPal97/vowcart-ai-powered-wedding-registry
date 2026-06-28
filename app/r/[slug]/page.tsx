import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PublicRegistry } from "@/components/registry/public-registry"
import { getCoupleBySlug } from "@/lib/repos/couples"
import {
  getRegistryItemsBySlug,
  getRegistryIdBySlug,
} from "@/lib/repos/registry"
import { getReservedItemIds } from "@/lib/services/reservations"
import { recordEvent } from "@/lib/services/analytics"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const couple = await getCoupleBySlug(slug)
  if (!couple) {
    return { title: "Registry not found — VowCart" }
  }
  return {
    title: `${couple.partnerOne} & ${couple.partnerTwo} — Wedding Registry`,
    description: `Celebrate with ${couple.partnerOne} and ${couple.partnerTwo}. Browse and gift from their VowCart registry.`,
  }
}

export default async function PublicRegistryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const couple = await getCoupleBySlug(slug)
  if (!couple || !couple.isPublic) {
    notFound()
  }
  const [items, registryId] = await Promise.all([
    getRegistryItemsBySlug(slug),
    getRegistryIdBySlug(slug),
  ])

  // Overlay live 15-minute reservation holds so a gift someone is buying shows
  // as "reserved" to every other guest, not just the one who placed the hold.
  const reservedIds = await getReservedItemIds(
    items.filter((i) => i.status === "available").map((i) => i.id),
  )
  const itemsWithHolds = items.map((i) =>
    reservedIds.has(i.id) ? { ...i, status: "reserved" as const } : i,
  )

  // Record a registry view (fire-and-forget; never block the render).
  void recordEvent(registryId ?? slug, "registry_view", { slug })

  return <PublicRegistry couple={couple} items={itemsWithHolds} slug={slug} />
}
