import { PageHeader } from "@/components/dashboard/page-header"
import { Recommendations } from "@/components/dashboard/recommendations"

export default function RecommendationsPage() {
  return (
    <>
      <PageHeader
        title="AI Recommendations"
        description="Smart gift suggestions curated just for the two of you."
      />
      <div className="p-4 sm:p-6">
        <Recommendations />
      </div>
    </>
  )
}
