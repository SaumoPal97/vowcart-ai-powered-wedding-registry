import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { FindGifts } from "@/components/dashboard/find-gifts"
import { getCoupleForRequest } from "@/lib/repos/couples"
import { getRegistryItemsByCoupleId } from "@/lib/repos/registry"
import { getRecommendations } from "@/lib/services/recommendations"

export const dynamic = "force-dynamic"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const defaultTab = tab === "recommendations" ? "recommendations" : "search"

  const couple = await getCoupleForRequest()
  if (!couple) redirect("/onboarding")

  const [{ groups, source }, items] = await Promise.all([
    getRecommendations({}),
    getRegistryItemsByCoupleId(couple.id),
  ])

  // Don't recommend gifts already on the registry (matched by normalized title).
  const existing = new Set(items.map((i) => i.title.trim().toLowerCase()))
  const filtered = groups
    .map((g) => ({
      ...g,
      products: g.products.filter(
        (p) => !existing.has(p.title.trim().toLowerCase()),
      ),
    }))
    .filter((g) => g.products.length > 0)

  return (
    <>
      <PageHeader
        title="Find Gifts"
        description="Search real products from Shopify merchants, or browse picks tailored to you."
      />
      <div className="p-4 sm:p-6">
        <FindGifts
          groups={filtered}
          coupleNames={`${couple.partnerOne} & ${couple.partnerTwo}`}
          defaultTab={defaultTab}
          recsSource={source}
        />
      </div>
    </>
  )
}
