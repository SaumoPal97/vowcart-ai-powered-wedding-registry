import type { ReactNode } from "react"
import Link from "next/link"
import { Store, TrendingUp, BarChart3, Megaphone } from "lucide-react"

export function MerchantAuthShell({
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
        <Link href="/merchant" className="flex items-center gap-2">
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
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col gap-2">
              {eyebrow ? (
                <span className="text-sm font-medium text-accent">{eyebrow}</span>
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
      <div className="relative hidden flex-col justify-between bg-foreground p-12 text-background lg:flex">
        <div className="flex items-center gap-2 text-background/70">
          <BarChart3 className="size-5" />
          <span className="text-sm font-medium uppercase tracking-widest">
            Registry demand intelligence
          </span>
        </div>
        <div className="flex flex-col gap-8">
          <p className="font-serif text-3xl font-medium leading-tight">
            See exactly how couples discover, add, and buy your products across
            thousands of wedding registries.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <Metric icon={TrendingUp} value="+24%" label="Avg. add-to-purchase lift on sponsored placements" />
            <Metric icon={Megaphone} value="6 collections" label="Curated, paid-placement registry collections" />
          </div>
        </div>
        <p className="text-sm text-background/60">
          Aggregated and anonymized. Never any couple or guest data.
        </p>
      </div>
    </div>
  )
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof TrendingUp
  value: string
  label: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-background/15 bg-background/5 p-5">
      <Icon className="size-5 text-background/70" />
      <span className="font-serif text-2xl font-semibold">{value}</span>
      <span className="text-xs text-background/60">{label}</span>
    </div>
  )
}
