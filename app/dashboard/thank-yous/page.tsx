import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { ThankYouTracker } from "@/components/dashboard/thank-you-tracker"
import { getCoupleForRequest } from "@/lib/repos/couples"
import { getThankYouNotes } from "@/lib/repos/purchases"

export const dynamic = "force-dynamic"

export default async function ThankYousPage() {
  const couple = await getCoupleForRequest()
  if (!couple) redirect("/onboarding")
  const notes = await getThankYouNotes(couple.id)

  return (
    <>
      <PageHeader
        title="Thank-Yous"
        description="Track gifts received and send heartfelt notes with AI assistance."
      />
      <div className="p-4 sm:p-6">
        <ThankYouTracker
          initialNotes={notes}
          coupleNames={`${couple.partnerOne} & ${couple.partnerTwo}`}
        />
      </div>
    </>
  )
}
