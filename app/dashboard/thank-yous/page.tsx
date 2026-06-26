import { PageHeader } from "@/components/dashboard/page-header"
import { ThankYouTracker } from "@/components/dashboard/thank-you-tracker"

export default function ThankYousPage() {
  return (
    <>
      <PageHeader
        title="Thank-Yous"
        description="Track gifts received and send heartfelt notes with AI assistance."
      />
      <div className="p-4 sm:p-6">
        <ThankYouTracker />
      </div>
    </>
  )
}
