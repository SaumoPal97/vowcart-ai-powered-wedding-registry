import { PageHeader } from "@/components/dashboard/page-header"
import { SettingsForm } from "@/components/dashboard/settings-form"

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, privacy, and public registry page."
      />
      <div className="max-w-3xl p-4 sm:p-6">
        <SettingsForm />
      </div>
    </>
  )
}
