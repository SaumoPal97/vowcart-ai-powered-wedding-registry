import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { getCurrentCouple } from "@/lib/repos/couples"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const couple = await getCurrentCouple()

  return (
    <SidebarProvider>
      <DashboardSidebar
        slug={couple.slug}
        partnerOne={couple.partnerOne}
        partnerTwo={couple.partnerTwo}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
