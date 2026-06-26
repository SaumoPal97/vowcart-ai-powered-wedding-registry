import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { Recommendations } from "@/components/dashboard/recommendations"
import { getCoupleForRequest } from "@/lib/repos/couples"
import { getRegistryItemsByCoupleId } from "@/lib/repos/registry"
import { getRecommendations } from "@/lib/services/recommendations"

export const dynamic = "force-dynamic"

export default async function RecommendationsPage() {
  const couple = await getCoupleForRequest()
  if (!couple) redirect("/onboarding")
  const [{ groups }, items] = await Promise.all([
    getRecommendations({}),
    getRegistryItemsByCoupleId(couple.id),
  ])
  // Mark products already on the registry (matched by title) as added.
  const existingTitles = items.map((i) => i.title)

  return (
    <>
      <PageHeader
        title="AI Recommendations"
        description="Smart gift suggestions curated just for the two of you."
      />
      <div className="p-4 sm:p-6">
        <Recommendations
          groups={groups}
          coupleNames={`${couple.partnerOne} & ${couple.partnerTwo}`}
          alreadyAdded={existingTitles}
        />
      </div>
    </>
  )
}
