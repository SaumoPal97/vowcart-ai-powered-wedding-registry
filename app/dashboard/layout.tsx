import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { getCoupleForRequest } from "@/lib/repos/couples"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const couple = await getCoupleForRequest()
  if (!couple) redirect("/onboarding")

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
