import "server-only"
import { createHash } from "node:crypto"
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"
import { docClient, isDynamoConfigured, key, nowSeconds, TABLE_NAME } from "@/lib/dynamo"

const SK = "CACHE"
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export function questionnaireHash(input: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex")
    .slice(0, 24)
}

const memoryCache = new Map<string, { value: unknown; expires: number }>()

export async function getCachedRecommendations<T>(
  hash: string,
): Promise<T | null> {
  if (!isDynamoConfigured()) {
    const hit = memoryCache.get(hash)
    if (hit && hit.expires > nowSeconds()) return hit.value as T
    memoryCache.delete(hash)
    return null
  }
  const res = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: key(`AIREC#${hash}`, SK) }),
  )
  const item = res.Item as { payload?: T; ttl?: number } | undefined
  if (!item?.payload || (item.ttl ?? 0) <= nowSeconds()) return null
  return item.payload
}

export async function setCachedRecommendations(
  hash: string,
  payload: unknown,
): Promise<void> {
  if (!isDynamoConfigured()) {
    memoryCache.set(hash, { value: payload, expires: nowSeconds() + CACHE_TTL_SECONDS })
    return
  }
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...key(`AIREC#${hash}`, SK),
        payload,
        ttl: nowSeconds() + CACHE_TTL_SECONDS,
      },
    }),
  )
}
