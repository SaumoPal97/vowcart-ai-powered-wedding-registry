import Link from "next/link"
import { Sparkles } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { RegistryManager } from "@/components/dashboard/registry-manager"
import { Button } from "@/components/ui/button"

export default function RegistryPage() {
  return (
    <>
      <PageHeader
        title="My Registry"
        description="Manage every gift, set priorities, and track what's been claimed."
        action={
          <Button render={<Link href="/dashboard/recommendations" />}>
            <Sparkles data-icon="inline-start" />
            Add gifts
          </Button>
        }
      />
      <div className="p-4 sm:p-6">
        <RegistryManager />
      </div>
    </>
  )
}
