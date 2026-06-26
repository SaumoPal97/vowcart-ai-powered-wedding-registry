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
