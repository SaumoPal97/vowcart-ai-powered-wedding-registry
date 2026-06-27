"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Megaphone,
  Settings,
  LogOut,
  Store,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const NAV = [
  { title: "Dashboard", href: "/merchant/dashboard", icon: LayoutDashboard },
  { title: "Product Insights", href: "/merchant/products", icon: Package },
  { title: "Category Trends", href: "/merchant/insights", icon: TrendingUp },
  { title: "Sponsored", href: "/merchant/sponsored", icon: Megaphone },
  { title: "Settings", href: "/merchant/settings", icon: Settings },
]

export function MerchantSidebar({
  merchantName,
  plan,
}: {
  merchantName: string
  plan: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch("/api/merchant/auth/logout", { method: "POST" })
    router.push("/merchant/login")
    router.refresh()
  }

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Link href="/merchant/dashboard" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-foreground text-background">
            <Store className="size-4" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              VowCart
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Merchant Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active =
                  item.href === "/merchant/dashboard"
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
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border p-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-foreground/10 text-foreground">
              {merchantName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {merchantName}
            </span>
            <Badge variant="secondary" className="mt-0.5 w-fit text-[10px] capitalize">
              {plan} plan
            </Badge>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut data-icon="inline-start" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
