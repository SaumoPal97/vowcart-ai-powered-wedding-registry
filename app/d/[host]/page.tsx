import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PublicRegistry } from "@/components/registry/public-registry"
import { getCoupleBySlug } from "@/lib/repos/couples"
import {
  getRegistryItemsBySlug,
  getRegistryIdBySlug,
} from "@/lib/repos/registry"
import { getDomainMapping, normalizeHost } from "@/lib/services/domains"
import { recordEvent } from "@/lib/services/analytics"

export const dynamic = "force-dynamic"

// Resolves a vanity domain (e.g. emilyandjames.com) to its registry. Middleware
// rewrites custom-domain root requests here; the host segment is the domain.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string }>
}): Promise<Metadata> {
  const { host } = await params
  const mapping = await getDomainMapping(normalizeHost(decodeURIComponent(host)))
  if (!mapping) return { title: "Registry not found — VowCart" }
  const couple = await getCoupleBySlug(mapping.slug)
  if (!couple) return { title: "Registry not found — VowCart" }
  return {
    title: `${couple.partnerOne} & ${couple.partnerTwo} — Wedding Registry`,
    description: `Celebrate with ${couple.partnerOne} and ${couple.partnerTwo}. Browse and gift from their VowCart registry.`,
  }
}

export default async function VanityDomainPage({
  params,
}: {
  params: Promise<{ host: string }>
}) {
  const { host } = await params
  const mapping = await getDomainMapping(normalizeHost(decodeURIComponent(host)))
  if (!mapping) notFound()

  const couple = await getCoupleBySlug(mapping.slug)
  if (!couple || !couple.isPublic) notFound()

  const [items, registryId] = await Promise.all([
    getRegistryItemsBySlug(mapping.slug),
    getRegistryIdBySlug(mapping.slug),
  ])

  void recordEvent(registryId ?? mapping.slug, "registry_view", {
    slug: mapping.slug,
    via: "vanity-domain",
    host: mapping.host,
  })

  // Reuse the exact public registry experience; reservations/checkout post to
  // the same APIs keyed by slug.
  return <PublicRegistry couple={couple} items={items} slug={mapping.slug} />
}
