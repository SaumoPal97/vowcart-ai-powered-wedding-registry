import type { ReactNode } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="lg:hidden" />
        <Separator orientation="vertical" className="h-6 lg:hidden" />
        <div className="flex flex-col gap-0.5">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  )
}
