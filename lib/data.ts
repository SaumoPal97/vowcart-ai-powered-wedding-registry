// Pure formatting helpers + static configuration only.
// All mock STATE has been removed — live data now flows through the
// repository/service layer (lib/repos, lib/services) backed by Aurora
// PostgreSQL and DynamoDB. Static option lists used by forms live in the
// seed catalog and are re-exported here for convenience.

export { CATEGORIES, lifestyleQuestions, registrySizes } from "./catalog"

// Curated, ready-to-use cover photos so couples can pick one in a click
// without hunting for an image URL.
export const coverPhotoPresets = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=70",
]

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
