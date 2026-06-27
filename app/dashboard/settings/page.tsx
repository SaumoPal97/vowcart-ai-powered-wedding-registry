import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { PremiumPlans } from "@/components/dashboard/premium-plans"
import { Separator } from "@/components/ui/separator"
import { getCoupleForRequest } from "@/lib/repos/couples"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const couple = await getCoupleForRequest()
  if (!couple) redirect("/onboarding")

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, privacy, and public registry page."
      />
      <div className="flex max-w-3xl flex-col gap-8 p-4 sm:p-6">
        <SettingsForm couple={couple} />
        <Separator />
        <PremiumPlans />
      </div>
    </>
  )
}
