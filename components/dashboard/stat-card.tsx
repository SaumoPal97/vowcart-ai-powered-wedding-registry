import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
}: {
  label: string
  value: string
  icon: LucideIcon
  trend?: string
  hint?: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Icon className="size-4.5" />
          </span>
          {trend && (
            <Badge variant="secondary" className="font-medium">
              {trend}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-serif text-3xl font-semibold text-foreground">
            {value}
          </span>
          <span className="text-sm text-muted-foreground">{label}</span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
