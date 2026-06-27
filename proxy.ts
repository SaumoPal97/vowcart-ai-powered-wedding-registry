import { NextResponse, type NextRequest } from "next/server"

// ---------------------------------------------------------------------------
// Vanity-domain routing. When a request arrives on a custom domain (i.e. not
// one of our own app hosts), rewrite the registry root to the resolver route
// `/d/<host>`, which looks the host up in the DynamoDB routing table and
// renders the couple's public registry. App hosts pass through untouched.
//
// This middleware is intentionally dependency-free (no AWS SDK) so it stays
// edge-safe and fast; the actual DynamoDB lookup happens in the resolver page.
// ---------------------------------------------------------------------------

export const config = {
  // Skip Next internals, API routes, the resolver itself, and static files.
  matcher: ["/((?!_next/|api/|d/|favicon|.*\\.).*)"],
}

function isAppHost(hostWithPort: string): boolean {
  const host = hostWithPort.split(":")[0].toLowerCase()
  if (host === "localhost" || host === "127.0.0.1") return true
  if (host.endsWith(".vercel.app")) return true
  // Optional configured primary domain (e.g. "vowcart.app").
  const primary = process.env.NEXT_PUBLIC_PRIMARY_HOST?.toLowerCase()
  if (primary && (host === primary || host === `www.${primary}`)) return true
  return false
}

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || ""
  if (!host || isAppHost(host)) return NextResponse.next()

  // Vanity domain: serve the registry from the host root.
  if (req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone()
    url.pathname = `/d/${host.split(":")[0].toLowerCase()}`
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}
