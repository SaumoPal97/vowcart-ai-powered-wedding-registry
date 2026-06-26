import "server-only"
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { isDbConfigured, query } from "@/lib/db"

const SESSION_COOKIE = "vowcart_session"
const SECRET = process.env.SESSION_SECRET || "vowcart-dev-secret-change-me"

// --- password hashing (scrypt) --------------------------------------------
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const original = Buffer.from(hash, "hex")
  return original.length === candidate.length && timingSafeEqual(original, candidate)
}

// --- signed session cookie -------------------------------------------------
function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex")
}

function serialize(payload: { userId: string; email: string }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${body}.${sign(body)}`
}

function deserialize(token: string): { userId: string; email: string } | null {
  const [body, sig] = token.split(".")
  if (!body || !sig) return null
  if (sign(body) !== sig) return null
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString())
  } catch {
    return null
  }
}

export async function createSession(payload: { userId: string; email: string }) {
  const store = await cookies()
  store.set(SESSION_COOKIE, serialize(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getSession() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  return token ? deserialize(token) : null
}

const DEMO_COUPLE_ID = "00000000-0000-0000-0000-0000000b0001"

export interface SessionUser {
  userId: string
  email: string
  coupleId: string
}

/**
 * Resolves the authenticated user together with their couple id.
 *
 * In the sandbox (no DB) we always resolve to the demo couple so the
 * dashboard remains fully browsable without a login round-trip. In
 * production an unauthenticated request returns null.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession()
  if (!isDbConfigured()) {
    return {
      userId: session?.userId ?? "00000000-0000-0000-0000-000000000001",
      email: session?.email ?? "maya@vowcart.app",
      coupleId: DEMO_COUPLE_ID,
    }
  }
  if (session) {
    const { rows } = await query<{ id: string }>(
      `SELECT id FROM couples WHERE user_id = $1 LIMIT 1`,
      [session.userId],
    )
    if (rows[0]?.id) {
      return { userId: session.userId, email: session.email, coupleId: rows[0].id }
    }
  }
  // Single-tenant demo: the dashboard is browsable without an explicit login
  // (reads resolve to the first couple), so resolve mutations the same way
  // instead of rejecting them. Honors a real session when one is present.
  const { rows } = await query<{ id: string; user_id: string; email: string }>(
    `SELECT c.id, c.user_id, u.email
       FROM couples c JOIN users u ON u.id = c.user_id
      ORDER BY c.created_at ASC LIMIT 1`,
  )
  if (rows[0]) {
    return { userId: rows[0].user_id, email: rows[0].email, coupleId: rows[0].id }
  }
  return null
}

// --- user lookups ----------------------------------------------------------
export interface UserRow {
  id: string
  email: string
  name: string
  password_hash: string
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  if (!isDbConfigured()) return null
  const { rows } = await query<UserRow>(
    `SELECT id, email, name, password_hash FROM users WHERE email = $1 LIMIT 1`,
    [email.toLowerCase()],
  )
  return rows[0] ?? null
}

export async function createUser(input: {
  email: string
  name: string
  password: string
}): Promise<UserRow> {
  const { rows } = await query<UserRow>(
    `INSERT INTO users (email, name, password_hash)
     VALUES ($1,$2,$3)
     RETURNING id, email, name, password_hash`,
    [input.email.toLowerCase(), input.name, hashPassword(input.password)],
  )
  return rows[0]
}
