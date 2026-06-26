import type { ReactNode } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
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
}: {
  product: Product
  topLeft?: ReactNode
  topRight?: ReactNode
  footer?: ReactNode
  dimmed?: boolean
  className?: string
}) {
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
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.merchant}
          </p>
          <p className="font-serif text-base font-semibold text-foreground">
            {formatPrice(product.price)}
          </p>
        </div>
        <h3 className="text-pretty text-sm font-semibold leading-snug text-foreground">
          {product.title}
        </h3>
        <StarRating rating={product.rating} reviews={product.reviews} />
        {footer && <div className="mt-auto pt-2">{footer}</div>}
      </div>
    </Card>
  )
}
