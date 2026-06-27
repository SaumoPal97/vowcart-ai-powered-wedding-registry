import Link from "next/link"
import { Logo } from "@/components/logo"

const footerLinks = [
  { label: "About", href: "/#" },
  { label: "Privacy", href: "/#" },
  { label: "Terms", href: "/#" },
  { label: "For Merchants", href: "/merchant" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              The AI-powered universal wedding registry. Beautiful to share,
              effortless to manage.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} VowCart. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-accent" />
            Powered by Shopify Universal Commerce Protocol
          </p>
        </div>
      </div>
    </footer>
  )
}
