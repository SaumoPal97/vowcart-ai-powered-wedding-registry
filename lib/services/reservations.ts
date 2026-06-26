import "server-only"
import {
  ConditionalCheckFailedException,
} from "@aws-sdk/client-dynamodb"
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"
import { docClient, isDynamoConfigured, key, nowSeconds, TABLE_NAME } from "@/lib/dynamo"

const RESERVATION_TTL_SECONDS = 15 * 60 // 15 minutes

function pk(registryItemId: string) {
  return `RESLOCK#${registryItemId}`
}
const SK = "LOCK"

export interface Reservation {
  registryItemId: string
  reservedBy: string
  registryId: string
  reservedUntil: number
}

/**
 * In-memory fallback used only in the sandbox (no DynamoDB). Process-local,
 * which is acceptable for a single-instance preview.
 */
const memoryLocks = new Map<string, Reservation>()

export async function getReservation(
  registryItemId: string,
): Promise<Reservation | null> {
  if (!isDynamoConfigured()) {
    const r = memoryLocks.get(registryItemId)
    if (r && r.reservedUntil > nowSeconds()) return r
    memoryLocks.delete(registryItemId)
    return null
  }
  const res = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: key(pk(registryItemId), SK) }),
  )
  const item = res.Item as (Reservation & { ttl: number }) | undefined
  if (!item) return null
  if (item.ttl <= nowSeconds()) return null
  return {
    registryItemId,
    reservedBy: item.reservedBy,
    registryId: item.registryId,
    reservedUntil: item.ttl,
  }
}

/**
 * Atomically reserves an item. Returns null if it is already reserved
 * (and the existing reservation has not expired).
 */
export async function createReservation(input: {
  registryItemId: string
  reservedBy: string
  registryId: string
}): Promise<Reservation | null> {
  const reservedUntil = nowSeconds() + RESERVATION_TTL_SECONDS
  const reservation: Reservation = {
    registryItemId: input.registryItemId,
    reservedBy: input.reservedBy,
    registryId: input.registryId,
    reservedUntil,
  }

  if (!isDynamoConfigured()) {
    const existing = memoryLocks.get(input.registryItemId)
    if (existing && existing.reservedUntil > nowSeconds()) return null
    memoryLocks.set(input.registryItemId, reservation)
    return reservation
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...key(pk(input.registryItemId), SK),
          reservedBy: input.reservedBy,
          registryId: input.registryId,
          ttl: reservedUntil,
          createdAt: nowSeconds(),
        },
        // Reject if a live lock exists; allow overwrite once TTL has passed.
        ConditionExpression:
          "attribute_not_exists(#ttl) OR #ttl <= :now",
        ExpressionAttributeNames: { "#ttl": "ttl" },
        ExpressionAttributeValues: { ":now": nowSeconds() },
      }),
    )
    return reservation
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) return null
    throw err
  }
}

export async function deleteReservation(registryItemId: string): Promise<void> {
  if (!isDynamoConfigured()) {
    memoryLocks.delete(registryItemId)
    return
  }
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: key(pk(registryItemId), SK),
    }),
  )
}
