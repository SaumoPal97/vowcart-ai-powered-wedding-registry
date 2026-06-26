import { Pool, type PoolClient } from "pg"
import { Signer } from "@aws-sdk/rds-signer"
import { attachDatabasePool } from "@vercel/functions"
import { awsCredentials } from "@/lib/aws-credentials"

const region = process.env.AWS_REGION
const host = process.env.PGHOST
const port = Number(process.env.PGPORT || 5432)
const user = process.env.PGUSER || "postgres"
const database = process.env.PGDATABASE || "postgres"
// Optional static password for local dev / non-IAM setups. When absent we fall
// back to short-lived IAM auth tokens (the production default).
const staticPassword = process.env.PGPASSWORD

/**
 * Aurora is "configured" once a host + region are present (env vars set in
 * Production, Preview, or a local `.env.local`). Without them the repository
 * layer falls back to seed data instead of throwing.
 */
export function isDbConfigured(): boolean {
  return Boolean(host && region)
}

// IAM token signer — generates a short-lived auth token used as the password.
// Credentials resolve via OIDC on Vercel, or the default AWS chain locally.
const signer = new Signer({
  credentials: awsCredentials({ roleArn: process.env.AWS_ROLE_ARN, region }),
  region,
  hostname: host as string,
  username: user,
  port,
})

declare global {
  // eslint-disable-next-line no-var
  var __vowcartPool: Pool | undefined
}

function createPool() {
  const pool = new Pool({
    host,
    port,
    user,
    database,
    // Static password when provided, otherwise a fresh IAM auth token per
    // connection (valid ~15 min).
    password: staticPassword ?? (() => signer.getAuthToken()),
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  })
  attachDatabasePool(pool)
  return pool
}

// Reuse a single pool across hot reloads / lambda invocations.
export const pool: Pool = global.__vowcartPool ?? createPool()
if (process.env.NODE_ENV !== "production") global.__vowcartPool = pool

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  const result = await pool.query(text, params as never)
  return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 }
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await fn(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
