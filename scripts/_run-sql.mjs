// Standalone migration/seed runner for Aurora PostgreSQL (IAM auth).
// Usage: node scripts/_run-sql.mjs <file1.sql> [file2.sql ...]
import { readFile } from "node:fs/promises"
import path from "node:path"
import pg from "pg"
import { Signer } from "@aws-sdk/rds-signer"
import { awsCredentialsProvider } from "@vercel/functions/oidc"

const region = process.env.AWS_REGION
const host = process.env.PGHOST
const port = Number(process.env.PGPORT || 5432)
const user = process.env.PGUSER || "postgres"
const database = process.env.PGDATABASE || "postgres"

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    clientConfig: { region },
  }),
  region,
  hostname: host,
  username: user,
  port,
})

const pool = new pg.Pool({
  host,
  port,
  user,
  database,
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 4,
})

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error("[v0] No SQL files provided")
  process.exit(1)
}

try {
  for (const file of files) {
    const abs = path.resolve(process.cwd(), file)
    const sql = await readFile(abs, "utf8")
    console.log(`[v0] Running ${file} ...`)
    await pool.query(sql)
    console.log(`[v0] OK ${file}`)
  }
  console.log("[v0] All SQL executed successfully")
} catch (err) {
  console.error("[v0] SQL execution failed:", err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
