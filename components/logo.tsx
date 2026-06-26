import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  href = "/",
}: {
  className?: string
  href?: string
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-4"
          aria-hidden="true"
        >
          <path
            d="M12 21s-7-4.35-9.3-9.04C1.2 8.6 2.9 5.5 6 5.5c1.9 0 3.2 1.1 4 2.3.8-1.2 2.1-2.3 4-2.3 3.1 0 4.8 3.1 3.3 6.46C19 16.65 12 21 12 21Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
        VowCart
      </span>
    </Link>
  )
}
