import type { ReactNode } from "react"
import Image from "next/image"
import { Logo } from "@/components/logo"

export function AuthShell({
  children,
  title,
  subtitle,
  eyebrow,
}: {
  children: ReactNode
  title: string
  subtitle: string
  eyebrow?: string
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-8">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col gap-2">
              {eyebrow ? (
                <span className="text-sm font-medium text-accent">
                  {eyebrow}
                </span>
              ) : null}
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image
          src="/products/hero-registry.png"
          alt="A beautifully styled wedding gift table"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="font-serif text-3xl font-medium leading-tight text-primary-foreground">
            "We built our entire registry in a single afternoon — it felt like
            magic."
          </p>
          <p className="mt-4 text-sm font-medium text-primary-foreground/80">
            Sofia & Liam, married 2025
          </p>
        </div>
      </div>
    </div>
  )
}
