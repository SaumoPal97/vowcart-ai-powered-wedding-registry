import type { Metadata } from "next"
import { PublicRegistry } from "@/components/registry/public-registry"
import { couple } from "@/lib/data"

export const metadata: Metadata = {
  title: `${couple.partnerOne} & ${couple.partnerTwo} — Wedding Registry`,
  description: `Celebrate with ${couple.partnerOne} and ${couple.partnerTwo}. Browse and gift from their VowCart registry.`,
}

export default async function PublicRegistryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await params
  return <PublicRegistry />
}
