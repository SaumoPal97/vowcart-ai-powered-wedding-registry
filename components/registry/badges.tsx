import { Check, Clock, Heart, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ItemPriority, ItemStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export function StatusBadge({
  status,
  className,
}: {
  status: ItemStatus
  className?: string
}) {
  if (status === "purchased") {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <Check className="size-3" />
        Purchased
      </Badge>
    )
  }
  if (status === "reserved") {
    return (
      <Badge
        className={cn(
          "gap-1 border-transparent bg-accent/15 text-accent-foreground",
          className,
        )}
        style={{ color: "var(--accent)" }}
      >
        <Clock className="size-3" />
        Reserved
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-border text-muted-foreground", className)}
    >
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Available
    </Badge>
  )
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: ItemPriority
  className?: string
}) {
  if (priority === "must-have") {
    return (
      <Badge className={cn("gap-1 bg-primary text-primary-foreground", className)}>
        <Heart className="size-3" />
        Must Have
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className={cn("gap-1", className)}>
      <Sparkles className="size-3" />
      Nice to Have
    </Badge>
  )
}
