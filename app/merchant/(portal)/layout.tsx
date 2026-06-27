import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MerchantSidebar } from "@/components/merchant/merchant-sidebar"
import { getMerchantForRequest } from "@/lib/repos/merchant"

export default async function MerchantPortalLayout({
  children,
}: {
  children: ReactNode
}) {
  const merchant = await getMerchantForRequest()
  if (!merchant) redirect("/merchant/login")

  return (
    <SidebarProvider>
      <MerchantSidebar merchantName={merchant.name} plan={merchant.plan} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
