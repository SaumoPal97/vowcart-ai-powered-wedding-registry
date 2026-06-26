import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PublicRegistry } from "@/components/registry/public-registry"
import { getCoupleBySlug } from "@/lib/repos/couples"
import {
  getRegistryItemsBySlug,
  getRegistryIdBySlug,
} from "@/lib/repos/registry"
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

  // Record a registry view (fire-and-forget; never block the render).
  void recordEvent(registryId ?? slug, "registry_view", { slug })

  return <PublicRegistry couple={couple} items={items} slug={slug} />
}
