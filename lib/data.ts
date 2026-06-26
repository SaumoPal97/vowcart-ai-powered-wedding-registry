// Pure formatting helpers + static configuration only.
// All mock STATE has been removed — live data now flows through the
// repository/service layer (lib/repos, lib/services) backed by Aurora
// PostgreSQL and DynamoDB. Static option lists used by forms live in the
// seed catalog and are re-exported here for convenience.

export { CATEGORIES, lifestyleQuestions, registrySizes } from "./catalog"

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price)
}

export function daysUntil(dateStr: string) {
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)))
}

export function formatWeddingDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
