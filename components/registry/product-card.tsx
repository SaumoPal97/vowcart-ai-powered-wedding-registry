import type { ReactNode } from "react"
import Image from "next/image"
import { Megaphone } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StarRating } from "@/components/registry/star-rating"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/data"
import { cn } from "@/lib/utils"

export function ProductCard({
  product,
  topLeft,
  topRight,
  footer,
  dimmed,
  className,
  progress,
  hideRating,
}: {
  product: Product
  topLeft?: ReactNode
  topRight?: ReactNode
  footer?: ReactNode
  dimmed?: boolean
  className?: string
  progress?: { raised: number; goal: number; contributors?: number }
  hideRating?: boolean
}) {
  const pct =
    progress && progress.goal > 0
      ? Math.min(100, Math.round((progress.raised / progress.goal) * 100))
      : 0
  return (
    <Card
      className={cn(
        "group overflow-hidden p-0 transition-all hover:shadow-md",
        dimmed && "opacity-70",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted/50">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            dimmed && "grayscale",
          )}
        />
        {topLeft && <div className="absolute left-3 top-3">{topLeft}</div>}
        {topRight && <div className="absolute right-3 top-3">{topRight}</div>}
        {product.isSponsored && !topRight && (
          <div className="absolute right-3 top-3">
            <Badge variant="secondary" className="gap-1 text-[10px] shadow-sm">
              <Megaphone className="size-2.5" />
              Sponsored
            </Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.merchant}
            {product.isSponsored && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-accent">
                <Megaphone className="size-2.5" />
                Ad
              </span>
            )}
          </p>
          <p className="font-serif text-base font-semibold text-foreground">
            {formatPrice(product.price)}
          </p>
        </div>
        <h3 className="text-pretty text-sm font-semibold leading-snug text-foreground">
          {product.title}
        </h3>
        {!hideRating && (
          <StarRating rating={product.rating} reviews={product.reviews} />
        )}
        {progress && (
          <div className="flex flex-col gap-1.5">
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatPrice(progress.raised)}
              </span>{" "}
              of {formatPrice(progress.goal)} raised
              {progress.contributors ? (
                <> · {progress.contributors} gave</>
              ) : null}
            </p>
          </div>
        )}
        {footer && <div className="mt-auto pt-2">{footer}</div>}
      </div>
    </Card>
  )
}
