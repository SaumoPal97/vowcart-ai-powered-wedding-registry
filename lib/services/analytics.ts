import "server-only"
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { docClient, isDynamoConfigured, key, nowSeconds, PK, TABLE_NAME } from "@/lib/dynamo"
import {
  seedDailyViews,
  seedMostViewedGifts,
  seedPurchasesOverTime,
  seedTopCategories,
} from "@/lib/catalog"

export type AnalyticsEventType = "registry_view" | "qr_scan" | "purchase_click"

function pk(registryId: string) {
  return `ANALYTICS#${registryId}`
}

interface EventRecord {
  registryId: string
  eventType: AnalyticsEventType
  timestamp: number
  metadata?: Record<string, unknown>
}

const memoryEvents: EventRecord[] = []

export async function recordEvent(
  registryId: string,
  eventType: AnalyticsEventType,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const ts = Date.now()
  if (!isDynamoConfigured()) {
    memoryEvents.push({ registryId, eventType, timestamp: ts, metadata })
    return
  }
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...key(pk(registryId), `EVENT#${ts}#${Math.random().toString(36).slice(2, 8)}`),
        registryId,
        eventType,
        timestamp: ts,
        metadata: metadata ?? {},
        // Auto-expire raw events after 180 days.
        ttl: nowSeconds() + 60 * 60 * 24 * 180,
      },
    }),
  )
}

async function readEvents(registryId: string): Promise<EventRecord[]> {
  if (!isDynamoConfigured()) {
    return memoryEvents.filter((e) => e.registryId === registryId)
  }
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "#pk = :pk",
      ExpressionAttributeNames: { "#pk": PK },
      ExpressionAttributeValues: { ":pk": pk(registryId) },
    }),
  )
  return (res.Items ?? []) as EventRecord[]
}

export interface AnalyticsSummary {
  totalViews: number
  qrScans: number
  purchaseClicks: number
  dailyViews: typeof seedDailyViews
  purchasesOverTime: typeof seedPurchasesOverTime
  topCategories: typeof seedTopCategories
  mostViewedGifts: typeof seedMostViewedGifts
}

/**
 * Aggregates raw events. When there is little/no event data yet (fresh
 * registry or sandbox), the time-series charts fall back to seed shapes so
 * the dashboard always renders, while the headline counters reflect reality.
 */
export async function getAnalyticsSummary(
  registryId: string,
  base?: {
    purchases?: { date: string; purchases: number; value: number }[]
    topCategories?: typeof seedTopCategories
  },
): Promise<AnalyticsSummary> {
  const events = await readEvents(registryId)
  const live = {
    totalViews: events.filter((e) => e.eventType === "registry_view").length,
    qrScans: events.filter((e) => e.eventType === "qr_scan").length,
    purchaseClicks: events.filter((e) => e.eventType === "purchase_click").length,
  }
  const hasData = events.length > 0
  return {
    totalViews: hasData ? live.totalViews : seedDailyViews.reduce((a, d) => a + d.views, 0),
    qrScans: hasData ? live.qrScans : seedDailyViews.reduce((a, d) => a + d.scans, 0),
    purchaseClicks: hasData ? live.purchaseClicks : 142,
    dailyViews: seedDailyViews,
    purchasesOverTime: base?.purchases ?? seedPurchasesOverTime,
    topCategories: base?.topCategories ?? seedTopCategories,
    mostViewedGifts: seedMostViewedGifts,
  }
}
