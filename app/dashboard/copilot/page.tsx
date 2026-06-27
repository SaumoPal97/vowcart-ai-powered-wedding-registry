import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { RegistryCopilot } from "@/components/dashboard/registry-copilot"
import { getCoupleForRequest } from "@/lib/repos/couples"
import { getRegistryItemsByCoupleId } from "@/lib/repos/registry"

export const dynamic = "force-dynamic"

export default async function CopilotPage() {
  const couple = await getCoupleForRequest()
  if (!couple) redirect("/onboarding")
  const items = await getRegistryItemsByCoupleId(couple.id)

  return (
    <>
      <PageHeader
        title="AI Copilot"
        description="Edit your registry by chatting — add, remove, and rebalance gifts."
      />
      <div className="p-4 sm:p-6">
        <RegistryCopilot initialItems={items} />
      </div>
    </>
  )
}
