import { NextResponse } from "next/server"
import { getCoupleForRequest } from "@/lib/repos/couples"
import {
  getCoupleDomain,
  isValidDomain,
  normalizeHost,
  removeVanityDomain,
  setVanityDomain,
} from "@/lib/services/domains"

export const maxDuration = 30

// Resolves the request's couple (signed-in user's, or the demo couple for the
// no-login demo) — same convention as the rest of the registry API.
async function requireCouple() {
  return getCoupleForRequest()
}

// GET — the couple's currently connected vanity domain (or null).
export async function GET() {
  try {
    const couple = await requireCouple()
    if (!couple) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 })
    }
    const domain = await getCoupleDomain(couple.id)
    return NextResponse.json({ domain })
  } catch (err) {
    console.error("[v0] GET /api/registry/domain failed:", err)
    return NextResponse.json({ error: "Failed to load domain." }, { status: 500 })
  }
}

// POST { domain } — connect a vanity domain to the couple's registry.
export async function POST(req: Request) {
  try {
    const couple = await requireCouple()
    if (!couple) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 })
    }
    const body = await req.json()
    const host = normalizeHost(String(body.domain ?? ""))
    if (!isValidDomain(host)) {
      return NextResponse.json(
        { error: "Enter a valid domain like emily-and-james.com (no http, no path)." },
        { status: 400 },
      )
    }
    try {
      const mapping = await setVanityDomain({
        host,
        slug: couple.slug,
        coupleId: couple.id,
      })
      return NextResponse.json({ domain: mapping.host }, { status: 201 })
    } catch (err) {
      if (err instanceof Error && err.message === "DOMAIN_TAKEN") {
        return NextResponse.json(
          { error: "That domain is already connected to another registry." },
          { status: 409 },
        )
      }
      throw err
    }
  } catch (err) {
    console.error("[v0] POST /api/registry/domain failed:", err)
    return NextResponse.json({ error: "Failed to connect domain." }, { status: 500 })
  }
}

// DELETE — disconnect the couple's vanity domain.
export async function DELETE() {
  try {
    const couple = await requireCouple()
    if (!couple) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 })
    }
    await removeVanityDomain(couple.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] DELETE /api/registry/domain failed:", err)
    return NextResponse.json({ error: "Failed to disconnect domain." }, { status: 500 })
  }
}
