"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Gift,
  Sparkles,
  BarChart3,
  HeartHandshake,
  Settings,
  ExternalLink,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { couple } from "@/lib/data"

const NAV = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Registry", href: "/dashboard/registry", icon: Gift },
  {
    title: "Recommendations",
    href: "/dashboard/recommendations",
    icon: Sparkles,
  },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Thank-Yous", href: "/dashboard/thank-yous", icon: HeartHandshake },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3 p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          nativeButton={false}
          render={<Link href={`/r/${couple.slug}`} target="_blank" />}
        >
          <ExternalLink data-icon="inline-start" />
          View public page
        </Button>
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border p-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-accent/15 text-accent">
              {couple.partnerOne[0]}
              {couple.partnerTwo[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {couple.partnerOne} &amp; {couple.partnerTwo}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Couple account
            </span>
          </div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
