import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { isDbConfigured, pool } from "@/lib/db"
import { runSeed } from "@/lib/seed"

export const maxDuration = 60

/**
 * One-time database initialization for deployed environments.
 * Runs the SQL schema migration(s) then seeds the demo data.
 *
 * Protect with ADMIN_SETUP_TOKEN: POST /api/admin/setup?token=...
 */
export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database not configured. Deploy to Preview/Production where the Aurora env vars are injected.",
      },
      { status: 503 },
    )
  }

  const token = new URL(request.url).searchParams.get("token")
  const expected = process.env.ADMIN_SETUP_TOKEN
  if (expected && token !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const migrations = [
      "001-init-schema.sql",
      "002-ucp-fields.sql",
      "003-preferences.sql",
    ]
    for (const file of migrations) {
      const sql = await readFile(
        join(process.cwd(), "scripts", file),
        "utf8",
      )
      await pool.query(sql)
    }
    // Restore a pristine demo: drop any non-seed (test/live) purchases so the
    // re-seed below can reset item statuses cleanly. Seed purchases use a
    // `SEED-` order id; real checkouts use `SHOP-`.
    await pool.query(
      `DELETE FROM purchases WHERE shopify_order_id IS NULL OR shopify_order_id NOT LIKE 'SEED-%'`,
    )
    const seeded = await runSeed()
    return NextResponse.json({
      success: true,
      migrationsApplied: migrations,
      seeded,
    })
  } catch (err) {
    console.error("[v0] POST /api/admin/setup failed:", err)
    return NextResponse.json(
      {
        error: "Setup failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}
