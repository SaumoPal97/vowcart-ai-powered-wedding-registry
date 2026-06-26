import Link from "next/link"
import { Sparkles } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { RegistryManager } from "@/components/dashboard/registry-manager"
import { Button } from "@/components/ui/button"
import { getCurrentCouple } from "@/lib/repos/couples"
import { getRegistryItemsByCoupleId } from "@/lib/repos/registry"

export const dynamic = "force-dynamic"

export default async function RegistryPage() {
  const couple = await getCurrentCouple()
  const items = await getRegistryItemsByCoupleId(couple.id)

  return (
    <>
      <PageHeader
        title="My Registry"
        description="Manage every gift, set priorities, and track what's been claimed."
        action={
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/search" />}
          >
            <Sparkles data-icon="inline-start" />
            Add gifts
          </Button>
        }
      />
      <div className="p-4 sm:p-6">
        <RegistryManager initialItems={items} />
      </div>
    </>
  )
}
