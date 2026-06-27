import "server-only"
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"
import { docClient, isDynamoConfigured, key, nowSeconds, TABLE_NAME } from "@/lib/dynamo"

// ---------------------------------------------------------------------------
// Vanity-domain routing table (DynamoDB).
//
// Mapping an incoming Host header to a registry is a hot, per-request key
// lookup — exactly what DynamoDB is good at. Aurora remains the system of
// record for couples/registries; this is a fast routing/index layer.
//
//   PK = DOMAIN#<host>      SK = MAP   -> { slug, coupleId }   (forward lookup)
//   PK = REGDOMAIN#<id>     SK = MAP   -> { host }             (reverse lookup)
//
// An in-memory fallback keeps the feature working in the local sandbox where
// DynamoDB isn't configured (single-process only).
// ---------------------------------------------------------------------------

export interface DomainMapping {
  host: string
  slug: string
  coupleId: string
}

const SK = "MAP"
const fpk = (host: string) => `DOMAIN#${host}`
const rpk = (coupleId: string) => `REGDOMAIN#${coupleId}`

// In-memory fallback (local/sandbox).
const memForward = new Map<string, DomainMapping>()
const memReverse = new Map<string, string>()

/** Normalize user input / Host header to a bare hostname. */
export function normalizeHost(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
}

/** Basic sanity check: must look like a registrable domain. */
export function isValidDomain(host: string): boolean {
  if (!host || host.length > 253) return false
  if (host.endsWith(".vercel.app") || host === "localhost") return false
  return /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)
}

export async function getDomainMapping(
  hostRaw: string,
): Promise<DomainMapping | null> {
  const host = normalizeHost(hostRaw)
  if (!host) return null
  if (!isDynamoConfigured()) return memForward.get(host) ?? null
  const res = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: key(fpk(host), SK) }),
  )
  const item = res.Item as (DomainMapping & Record<string, unknown>) | undefined
  return item ? { host, slug: item.slug, coupleId: item.coupleId } : null
}

export async function getCoupleDomain(coupleId: string): Promise<string | null> {
  if (!isDynamoConfigured()) return memReverse.get(coupleId) ?? null
  const res = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: key(rpk(coupleId), SK) }),
  )
  const item = res.Item as { host?: string } | undefined
  return item?.host ?? null
}

/**
 * Claim a vanity domain for a couple's registry. Throws "DOMAIN_TAKEN" if
 * another couple already owns it. Replaces the couple's previous domain.
 */
export async function setVanityDomain(input: {
  host: string
  slug: string
  coupleId: string
}): Promise<DomainMapping> {
  const host = normalizeHost(input.host)
  const mapping: DomainMapping = { host, slug: input.slug, coupleId: input.coupleId }

  const existing = await getDomainMapping(host)
  if (existing && existing.coupleId !== input.coupleId) {
    throw new Error("DOMAIN_TAKEN")
  }
  // Release the couple's previous domain (if different) so only one is active.
  const prev = await getCoupleDomain(input.coupleId)
  if (prev && prev !== host) await removeHost(prev)

  if (!isDynamoConfigured()) {
    memForward.set(host, mapping)
    memReverse.set(input.coupleId, host)
    return mapping
  }

  const createdAt = nowSeconds()
  await Promise.all([
    docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...key(fpk(host), SK), ...mapping, createdAt },
      }),
    ),
    docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...key(rpk(input.coupleId), SK), host, createdAt },
      }),
    ),
  ])
  return mapping
}

async function removeHost(host: string): Promise<void> {
  if (!isDynamoConfigured()) {
    memForward.delete(host)
    return
  }
  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: key(fpk(host), SK) }),
  )
}

export async function removeVanityDomain(coupleId: string): Promise<void> {
  const host = await getCoupleDomain(coupleId)
  if (host) await removeHost(host)
  if (!isDynamoConfigured()) {
    memReverse.delete(coupleId)
    return
  }
  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: key(rpk(coupleId), SK) }),
  )
}
