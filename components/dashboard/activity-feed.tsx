import { ShoppingBag, Eye, Clock, PackagePlus } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { activityFeed } from "@/lib/data"
import type { ActivityEvent } from "@/lib/types"

const ICONS: Record<ActivityEvent["type"], typeof ShoppingBag> = {
  purchase: ShoppingBag,
  view: Eye,
  reserve: Clock,
  added: PackagePlus,
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>The latest from your registry.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {activityFeed.map((event, i) => {
            const Icon = ICONS[event.type]
            const isLast = i === activityFeed.length - 1
            return (
              <li key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary text-foreground">
                    <Icon className="size-4" />
                  </span>
                  {!isLast && <span className="w-px flex-1 bg-border" />}
                </div>
                <div className="flex flex-col gap-0.5 pb-6">
                  <p className="text-sm font-medium text-foreground">
                    {event.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.detail}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {event.time}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
