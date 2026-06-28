export type ProductCategory =
  | "Kitchen"
  | "Bedroom"
  | "Dining"
  | "Bathroom"
  | "Travel"
  | "Home Decor"
  | "Smart Home"

export type ItemStatus = "available" | "reserved" | "purchased"
export type ItemPriority = "must-have" | "nice-to-have"
export type RegistryItemType = "product" | "cash_fund"

export interface Product {
  id: string
  title: string
  merchant: string
  price: number
  rating: number
  reviews: number
  category: ProductCategory
  image: string
  description: string
  // Shopify UCP fields (present when sourced from the Universal Commerce
  // Protocol Catalog; absent for the local seed catalog).
  productGid?: string
  variantId?: string
  checkoutUrl?: string
  sellerDomain?: string
  // Set when a merchant is paying to promote this product. Consumer surfaces
  // MUST render a clearly-labeled "Sponsored" badge when true.
  isSponsored?: boolean
  sponsoredCampaignId?: string
}

export interface RegistryItem extends Product {
  status: ItemStatus
  priority: ItemPriority
  purchasedBy?: string
  purchasedByEmail?: string
  purchaseDate?: string
  // Group gifting / cash funds: when isGroupGift (or itemType === "cash_fund"),
  // guests contribute money toward `price` (the goal). `contributed` is the sum
  // raised so far across `contributorCount` guests.
  itemType?: RegistryItemType
  isGroupGift?: boolean
  contributed?: number
  contributorCount?: number
}

export interface Couple {
  partnerOne: string
  partnerTwo: string
  weddingDate: string
  location: string
  slug: string
  photo: string
  story: string
  isPublic: boolean
  // Saved lifestyle questionnaire used to personalize AI recommendations.
  preferences?: Record<string, string | number>
}

export interface ActivityEvent {
  id: string
  type: "purchase" | "view" | "reserve" | "added"
  message: string
  detail: string
  time: string
}

export interface ThankYouNote {
  id: string
  gift: string
  purchasedBy: string
  email: string
  purchaseDate: string
  status: "pending" | "sent"
}

export interface RecommendationGroup {
  id: string
  title: string
  subtitle: string
  products: Product[]
}

// ---------------------------------------------------------------------------
// Merchant portal domain
// ---------------------------------------------------------------------------

export type MerchantPlan = "free" | "pro" | "growth"
export type CampaignStatus = "draft" | "active" | "paused"

export interface Merchant {
  id: string
  name: string
  slug: string
  website: string
  shopifyMerchantId: string
  plan: MerchantPlan
  brands: string[]
  contactName?: string
  email?: string
}

export interface SponsoredCampaign {
  id: string
  merchantId: string
  productId: string | null
  productTitle: string
  category: ProductCategory | string
  status: CampaignStatus
  budget: number
  bid: number
  startDate: string
  endDate: string
  impressions: number
  clicks: number
  purchases: number
}

/** Aggregated, anonymized per-product demand metrics for the merchant portal. */
export interface MerchantProductStat {
  productId: string
  title: string
  merchant: string
  category: ProductCategory | string
  image: string
  price: number
  added: number
  purchased: number
  conversionRate: number // 0-100
  isSponsored: boolean
}

export interface MerchantCategoryStat {
  category: string
  added: number
  purchased: number
  conversionRate: number // 0-100
  avgPrice: number
  growth: number // % vs. prior period (demo signal)
}

export interface MerchantDashboardSummary {
  productsAdded: number
  productsPurchased: number
  conversionRate: number // 0-100
  avgGiftPrice: number
  sponsoredImpressions: number
  sponsoredClicks: number
  sponsoredPurchases: number
  sponsoredCtr: number // 0-100
}

export interface FeaturedCollection {
  id: string
  title: string
  description: string
  slots: number
  filled: number
  priceFrom: number
  categories: (ProductCategory | string)[]
}
