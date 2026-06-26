import { PageHeader } from "@/components/dashboard/page-header"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { getCurrentCouple } from "@/lib/repos/couples"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const couple = await getCurrentCouple()

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, privacy, and public registry page."
      />
      <div className="max-w-3xl p-4 sm:p-6">
        <SettingsForm couple={couple} />
      </div>
    </>
  )
}
