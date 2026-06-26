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
}

export interface RegistryItem extends Product {
  status: ItemStatus
  priority: ItemPriority
  purchasedBy?: string
  purchasedByEmail?: string
  purchaseDate?: string
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
