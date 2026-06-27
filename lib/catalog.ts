import type {
  Couple,
  FeaturedCollection,
  Merchant,
  Product,
  ProductCategory,
  SponsoredCampaign,
} from "./types"

// ---------------------------------------------------------------------------
// Seed catalog — the source of truth for the Prisma/SQL seed script AND the
// graceful fallback used when the AWS databases are not reachable (e.g. the
// local v0 sandbox, where the integration credentials are not injected).
// In production every read goes through the repository layer to Aurora.
// ---------------------------------------------------------------------------

export const CATEGORIES: ProductCategory[] = [
  "Kitchen",
  "Bedroom",
  "Dining",
  "Bathroom",
  "Travel",
  "Home Decor",
  "Smart Home",
]

export const demoCouple: Couple = {
  partnerOne: "Maya",
  partnerTwo: "Daniel",
  weddingDate: "2026-09-19",
  location: "Hudson Valley, New York",
  slug: "maya-and-daniel",
  photo: "/couple.png",
  story:
    "We met over a shared love of slow mornings and good coffee. Five years later, we are building a home together — and we would be honored to have you celebrate with us.",
  isPublic: true,
}

export const DEMO_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "maya@vowcart.app",
  name: "Maya Chen",
  // bcrypt-style placeholder; the seed script hashes a real password.
  password: "vowcart-demo",
}

export const catalog: Product[] = [
  {
    id: "p1",
    title: "Artisan Tilt-Head Stand Mixer",
    merchant: "KitchenAid",
    price: 449,
    rating: 4.9,
    reviews: 12840,
    category: "Kitchen",
    image: "/products/stand-mixer.png",
    description:
      "A 5-quart icon for every baker. Ten speeds and a full suite of attachments for whisking, kneading, and beyond.",
  },
  {
    id: "p2",
    title: "V15 Cordless Vacuum",
    merchant: "Dyson",
    price: 749,
    rating: 4.8,
    reviews: 9210,
    category: "Smart Home",
    image: "/products/cordless-vacuum.png",
    description:
      "Laser-illuminated cleaning that reveals invisible dust, with up to 60 minutes of fade-free suction.",
  },
  {
    id: "p3",
    title: "Vertuo Next Coffee Machine",
    merchant: "Nespresso",
    price: 179,
    rating: 4.7,
    reviews: 18430,
    category: "Kitchen",
    image: "/products/coffee-machine.png",
    description:
      "Barista-grade coffee and espresso at the touch of a button, with five cup sizes and one-touch brewing.",
  },
  {
    id: "p4",
    title: "Round Enameled Dutch Oven, 5.5 Qt",
    merchant: "Le Creuset",
    price: 420,
    rating: 4.9,
    reviews: 7650,
    category: "Kitchen",
    image: "/products/dutch-oven.png",
    description:
      "The heirloom cast iron pot for braises, breads, and Sunday dinners that last for generations.",
  },
  {
    id: "p5",
    title: "The Carry-On Suitcase",
    merchant: "Away",
    price: 295,
    rating: 4.8,
    reviews: 5420,
    category: "Travel",
    image: "/products/luggage.png",
    description:
      "A durable hard-shell carry-on with an interior compression system and whisper-quiet wheels.",
  },
  {
    id: "p6",
    title: "Luxe Linen Sheet Set",
    merchant: "Brooklinen",
    price: 269,
    rating: 4.7,
    reviews: 8930,
    category: "Bedroom",
    image: "/products/bed-sheets.png",
    description:
      "Stonewashed European flax linen that gets softer with every wash. Breathable in summer, cozy in winter.",
  },
  {
    id: "p7",
    title: "Barista Express Espresso Machine",
    merchant: "Breville",
    price: 749,
    rating: 4.8,
    reviews: 14200,
    category: "Kitchen",
    image: "/products/espresso-machine.png",
    description:
      "Grind, dose, and extract third-wave specialty coffee from bean to cup in under a minute.",
  },
  {
    id: "p8",
    title: "Always Pan 2.0",
    merchant: "Our Place",
    price: 165,
    rating: 4.6,
    reviews: 11030,
    category: "Kitchen",
    image: "/products/ceramic-pan.png",
    description:
      "The do-it-all pan that replaces eight pieces of cookware with a single, beautiful nonstick design.",
  },
  {
    id: "p9",
    title: "Purifier Cool Tower",
    merchant: "Dyson",
    price: 549,
    rating: 4.7,
    reviews: 4310,
    category: "Smart Home",
    image: "/products/air-purifier.png",
    description:
      "Automatically senses and captures 99.97% of allergens and pollutants while cooling your home.",
  },
  {
    id: "p10",
    title: "Hue Smart Lighting Starter Kit",
    merchant: "Philips",
    price: 199,
    rating: 4.8,
    reviews: 22100,
    category: "Smart Home",
    image: "/products/smart-lights.png",
    description:
      "Set the mood with 16 million colors, scenes, and schedules — all controllable from your phone or voice.",
  },
  {
    id: "p11",
    title: "Stoneware Dinnerware Set, 12-Piece",
    merchant: "East Fork",
    price: 320,
    rating: 4.8,
    reviews: 3120,
    category: "Dining",
    image: "/products/dinnerware.png",
    description:
      "Hand-finished speckled stoneware in warm, earthy glazes. Service for four that feels like a hug.",
  },
  {
    id: "p12",
    title: "Crystal Wine Glasses, Set of 4",
    merchant: "Schott Zwiesel",
    price: 89,
    rating: 4.7,
    reviews: 2640,
    category: "Dining",
    image: "/products/wine-glasses.png",
    description:
      "Featherlight, break-resistant crystal glasses that bring out the best in every pour.",
  },
  {
    id: "p13",
    title: "Spa Bath Towel Bundle",
    merchant: "Parachute",
    price: 149,
    rating: 4.8,
    reviews: 6210,
    category: "Bathroom",
    image: "/products/bath-towels.png",
    description:
      "Plush, quick-drying Turkish cotton towels that feel like a five-star hotel, every single day.",
  },
  {
    id: "p14",
    title: "Chunky Knit Wool Throw",
    merchant: "Simons",
    price: 129,
    rating: 4.6,
    reviews: 1840,
    category: "Home Decor",
    image: "/products/throw-blanket.png",
    description:
      "An oversized hand-knit throw in warm oatmeal that turns any couch into the coziest seat in the house.",
  },
  {
    id: "p15",
    title: "Classic Chef Knife Block Set",
    merchant: "Wüsthof",
    price: 399,
    rating: 4.9,
    reviews: 5070,
    category: "Kitchen",
    image: "/products/knife-set.png",
    description:
      "Precision-forged German steel for a lifetime of confident cooking, presented in a light wood block.",
  },
  {
    id: "p16",
    title: "Robot Vacuum & Mop",
    merchant: "iRobot",
    price: 599,
    rating: 4.6,
    reviews: 8720,
    category: "Smart Home",
    image: "/products/robot-vacuum.png",
    description:
      "Maps your home, vacuums and mops on a schedule, and empties itself for weeks of hands-free cleaning.",
  },
  {
    id: "p17",
    title: "Ascent Series High-Speed Blender",
    merchant: "Vitamix",
    price: 549,
    rating: 4.8,
    reviews: 9430,
    category: "Kitchen",
    image: "/products/blender.png",
    description:
      "Pro-grade power for silky smoothies, hot soups, and nut butters, with self-cleaning in 60 seconds.",
  },
  {
    id: "p18",
    title: "2-Slice Retro Toaster",
    merchant: "Smeg",
    price: 199,
    rating: 4.6,
    reviews: 3870,
    category: "Kitchen",
    image: "/products/toaster.png",
    description:
      "A 1950s-inspired icon with six browning levels and a reheat setting, in a creamy pastel finish.",
  },
  {
    id: "p19",
    title: "Pre-Seasoned Cast Iron Skillet",
    merchant: "Lodge",
    price: 45,
    rating: 4.9,
    reviews: 26500,
    category: "Kitchen",
    image: "/products/skillet.png",
    description:
      "The unkillable 12-inch workhorse that sears, bakes, and fries — and only gets better with age.",
  },
  {
    id: "p20",
    title: "Hand-Knit Weighted Blanket",
    merchant: "Bearaby",
    price: 249,
    rating: 4.7,
    reviews: 4120,
    category: "Bedroom",
    image: "/products/weighted-blanket.png",
    description:
      "A breathable, chunky-knit weighted blanket that melts away stress for deeper, calmer sleep.",
  },
  {
    id: "p21",
    title: "Organic Down Pillow, Set of 2",
    merchant: "Coyuchi",
    price: 178,
    rating: 4.6,
    reviews: 2210,
    category: "Bedroom",
    image: "/products/pillows.png",
    description:
      "Responsibly sourced down wrapped in organic cotton for hotel-grade comfort, night after night.",
  },
  {
    id: "p22",
    title: "Modern Flatware Set, 20-Piece",
    merchant: "Material",
    price: 145,
    rating: 4.7,
    reviews: 1980,
    category: "Dining",
    image: "/products/flatware.png",
    description:
      "Beautifully balanced matte-gold flatware, service for four, designed to feel good in the hand.",
  },
  {
    id: "p23",
    title: "Nested Ceramic Serving Bowls",
    merchant: "East Fork",
    price: 168,
    rating: 4.8,
    reviews: 1460,
    category: "Dining",
    image: "/products/serving-bowls.png",
    description:
      "A trio of hand-glazed stoneware bowls for salads, sides, and showstopping centerpieces.",
  },
  {
    id: "p24",
    title: "Waffle-Knit Bath Robe",
    merchant: "Parachute",
    price: 99,
    rating: 4.7,
    reviews: 5340,
    category: "Bathroom",
    image: "/products/robe.png",
    description:
      "A lightweight Turkish-cotton waffle robe that feels like wrapping up in your favorite Sunday morning.",
  },
  {
    id: "p25",
    title: "The Weekender Duffel",
    merchant: "Béis",
    price: 98,
    rating: 4.7,
    reviews: 6890,
    category: "Travel",
    image: "/products/duffel.png",
    description:
      "A do-everything weekender with a trolley pass-through, shoe compartment, and water-resistant lining.",
  },
  {
    id: "p26",
    title: "Compression Packing Cubes, Set of 6",
    merchant: "Calpak",
    price: 68,
    rating: 4.8,
    reviews: 3410,
    category: "Travel",
    image: "/products/packing-cubes.png",
    description:
      "Fit twice as much and stay organized with featherweight compression cubes in calming earth tones.",
  },
  {
    id: "p27",
    title: "Learning Smart Thermostat",
    merchant: "Google Nest",
    price: 249,
    rating: 4.7,
    reviews: 15600,
    category: "Smart Home",
    image: "/products/thermostat.png",
    description:
      "Learns your routine and adjusts itself to save energy, with remote control from anywhere.",
  },
  {
    id: "p28",
    title: "Video Doorbell Pro",
    merchant: "Ring",
    price: 229,
    rating: 4.6,
    reviews: 19800,
    category: "Smart Home",
    image: "/products/doorbell.png",
    description:
      "Crisp head-to-toe HD video, smart motion alerts, and two-way talk so home always feels close.",
  },
  {
    id: "p29",
    title: "Sculptural Table Lamp",
    merchant: "Gantri",
    price: 198,
    rating: 4.8,
    reviews: 920,
    category: "Home Decor",
    image: "/products/table-lamp.png",
    description:
      "A warm, dimmable accent lamp 3D-printed from plant-based materials in a soft sand silhouette.",
  },
  {
    id: "p30",
    title: "Framed Abstract Print Set of 3",
    merchant: "Artfully Walls",
    price: 159,
    rating: 4.6,
    reviews: 740,
    category: "Home Decor",
    image: "/products/wall-art.png",
    description:
      "A curated gallery wall of warm, neutral abstracts in light oak frames — ready to hang together.",
  },
]

export function getCatalogProductById(id: string) {
  return catalog.find((p) => p.id === id)
}

// Shared enum maps (used by the seed builder; the repo has its own copies).
export const statusToDbMap = {
  available: "AVAILABLE",
  reserved: "RESERVED",
  purchased: "PURCHASED",
} as const

export const priorityToDbMap = {
  "must-have": "MUST_HAVE",
  "nice-to-have": "NICE_TO_HAVE",
} as const

// Seed registry items: [productId, status, priority, purchaser?] tuples.
export const seedRegistryItems: {
  productId: string
  status: "available" | "reserved" | "purchased"
  priority: "must-have" | "nice-to-have"
  purchasedBy?: string
  purchasedByEmail?: string
  purchaseDate?: string
  thankYouSent?: boolean
}[] = [
  { productId: "p1", status: "available", priority: "must-have" },
  {
    productId: "p4",
    status: "purchased",
    priority: "must-have",
    purchasedBy: "Aunt Carol",
    purchasedByEmail: "carol.m@example.com",
    purchaseDate: "2026-06-02",
    thankYouSent: true,
  },
  { productId: "p7", status: "reserved", priority: "must-have" },
  { productId: "p3", status: "available", priority: "nice-to-have" },
  { productId: "p8", status: "available", priority: "nice-to-have" },
  { productId: "p15", status: "available", priority: "must-have" },
  {
    productId: "p6",
    status: "purchased",
    priority: "must-have",
    purchasedBy: "James & Priya",
    purchasedByEmail: "jp.wedding@example.com",
    purchaseDate: "2026-05-28",
    thankYouSent: false,
  },
  { productId: "p14", status: "available", priority: "nice-to-have" },
  { productId: "p11", status: "available", priority: "must-have" },
  {
    productId: "p12",
    status: "purchased",
    priority: "nice-to-have",
    purchasedBy: "The Okafor Family",
    purchasedByEmail: "okafor@example.com",
    purchaseDate: "2026-06-10",
    thankYouSent: false,
  },
  { productId: "p13", status: "available", priority: "nice-to-have" },
  { productId: "p5", status: "reserved", priority: "must-have" },
  { productId: "p2", status: "available", priority: "nice-to-have" },
  { productId: "p10", status: "available", priority: "nice-to-have" },
  { productId: "p20", status: "available", priority: "nice-to-have" },
  { productId: "p27", status: "available", priority: "must-have" },
]

export const lifestyleQuestions: {
  id: string
  question: string
  options: string[]
}[] = [
  {
    id: "living",
    question: "Are you already living together?",
    options: ["Yes, fully settled", "Just moved in", "Not yet"],
  },
  {
    id: "home",
    question: "Apartment or house?",
    options: ["Apartment", "House", "Condo / Townhome"],
  },
  {
    id: "bedrooms",
    question: "How many bedrooms?",
    options: ["1", "2", "3", "4+"],
  },
  {
    id: "cooking",
    question: "Do you love cooking?",
    options: ["We live for it", "Sometimes", "Takeout, honestly"],
  },
  {
    id: "coffee",
    question: "Coffee lovers?",
    options: ["Daily ritual", "Casual sippers", "Tea people"],
  },
  {
    id: "travel",
    question: "Do you travel frequently?",
    options: ["Constantly", "A few trips a year", "Homebodies"],
  },
  {
    id: "pets",
    question: "Any pets?",
    options: ["Dog(s)", "Cat(s)", "No pets"],
  },
  {
    id: "outdoors",
    question: "Into outdoor activities?",
    options: ["Always outside", "Now and then", "Indoors please"],
  },
  {
    id: "budget",
    question: "Average guest budget?",
    options: ["$50–100", "$100–200", "$200+"],
  },
]

export const registrySizes = [25, 50, 100]

// ---------------------------------------------------------------------------
// Analytics + insights fallback (computed live from DynamoDB in production).
// ---------------------------------------------------------------------------

export const seedDailyViews = [
  { date: "Jun 1", views: 42, scans: 8 },
  { date: "Jun 4", views: 68, scans: 14 },
  { date: "Jun 7", views: 55, scans: 11 },
  { date: "Jun 10", views: 96, scans: 22 },
  { date: "Jun 13", views: 120, scans: 31 },
  { date: "Jun 16", views: 88, scans: 19 },
  { date: "Jun 19", views: 142, scans: 38 },
  { date: "Jun 22", views: 168, scans: 44 },
  { date: "Jun 25", views: 134, scans: 29 },
]

export const seedPurchasesOverTime = [
  { date: "May", purchases: 2, value: 689 },
  { date: "Jun", purchases: 3, value: 1009 },
  { date: "Jul", purchases: 0, value: 0 },
]

export const seedTopCategories = [
  { category: "Kitchen", added: 6, fill: "var(--chart-1)" },
  { category: "Smart Home", added: 4, fill: "var(--chart-2)" },
  { category: "Dining", added: 2, fill: "var(--chart-3)" },
  { category: "Bedroom", added: 1, fill: "var(--chart-4)" },
  { category: "Bathroom", added: 1, fill: "var(--chart-5)" },
]

export const seedMostViewedGifts = [
  { name: "Stand Mixer", views: 312 },
  { name: "Espresso Machine", views: 268 },
  { name: "Dutch Oven", views: 241 },
  { name: "Knife Set", views: 198 },
  { name: "Smart Lights", views: 176 },
]

export const merchantInsights = {
  mostAdded: [
    { name: "KitchenAid Stand Mixer", value: "8,420 registries" },
    { name: "Dyson V15 Vacuum", value: "6,910 registries" },
    { name: "Le Creuset Dutch Oven", value: "5,640 registries" },
  ],
  highestConverting: [
    { name: "Nespresso Vertuo", value: "62% add-to-purchase" },
    { name: "Our Place Always Pan", value: "58% add-to-purchase" },
    { name: "Brooklinen Sheets", value: "54% add-to-purchase" },
  ],
  averageGiftPrice: "$184",
  popularCategories: ["Kitchen", "Smart Home", "Dining", "Bedroom"],
  seasonalTrends: [
    { season: "Spring", index: 78 },
    { season: "Summer", index: 100 },
    { season: "Fall", index: 64 },
    { season: "Winter", index: 41 },
  ],
  trendingBrands: ["Our Place", "Brooklinen", "Away", "East Fork", "Hydro Flask"],
}

// ---------------------------------------------------------------------------
// Merchant portal seed data.
//
// A merchant account represents one or more catalog brands. Demand analytics
// in the merchant portal aggregate (anonymized) over every registry that
// contains products from these brands. The demo merchant is kitchen-led so the
// dashboard has rich, real numbers even in seed-fallback mode.
// ---------------------------------------------------------------------------

export const DEMO_MERCHANT_ID = "00000000-0000-0000-0000-0000000d0001"
export const DEMO_MERCHANT_USER_ID = "00000000-0000-0000-0000-0000000e0001"

export const demoMerchant: Merchant = {
  id: DEMO_MERCHANT_ID,
  name: "Hearth & Co.",
  slug: "hearth-and-co",
  website: "https://hearthandco.example",
  shopifyMerchantId: "hearth-and-co.myshopify.com",
  plan: "growth",
  // Catalog brands this account sells under.
  brands: [
    "KitchenAid",
    "Le Creuset",
    "Our Place",
    "Breville",
    "Vitamix",
    "Nespresso",
    "Wüsthof",
    "Smeg",
  ],
  contactName: "Ava Mercer",
  email: "merchant@vowcart.app",
}

export const DEMO_MERCHANT_USER = {
  id: DEMO_MERCHANT_USER_ID,
  merchantId: DEMO_MERCHANT_ID,
  email: "merchant@vowcart.app",
  name: "Ava Mercer",
  password: "vowcart-demo",
}

// Sponsored campaigns owned by the demo merchant. Performance counters are
// seeded so the portal renders without live ad traffic.
export const seedSponsoredCampaigns: SponsoredCampaign[] = [
  {
    id: "00000000-0000-0000-0000-0000000f0001",
    merchantId: DEMO_MERCHANT_ID,
    productId: "p7",
    productTitle: "Barista Express Espresso Machine",
    category: "Kitchen",
    status: "active",
    budget: 2500,
    bid: 1.4,
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    impressions: 18420,
    clicks: 1640,
    purchases: 96,
  },
  {
    id: "00000000-0000-0000-0000-0000000f0002",
    merchantId: DEMO_MERCHANT_ID,
    productId: "p4",
    productTitle: "Round Enameled Dutch Oven, 5.5 Qt",
    category: "Kitchen",
    status: "active",
    budget: 1800,
    bid: 1.1,
    startDate: "2026-05-15",
    endDate: "2026-09-15",
    impressions: 12980,
    clicks: 1120,
    purchases: 71,
  },
  {
    id: "00000000-0000-0000-0000-0000000f0003",
    merchantId: DEMO_MERCHANT_ID,
    productId: "p8",
    productTitle: "Always Pan 2.0",
    category: "Kitchen",
    status: "paused",
    budget: 1200,
    bid: 0.9,
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    impressions: 8640,
    clicks: 690,
    purchases: 38,
  },
  {
    id: "00000000-0000-0000-0000-0000000f0004",
    merchantId: DEMO_MERCHANT_ID,
    productId: "p17",
    productTitle: "Ascent Series High-Speed Blender",
    category: "Kitchen",
    status: "draft",
    budget: 1500,
    bid: 1.0,
    startDate: "2026-07-01",
    endDate: "2026-10-01",
    impressions: 0,
    clicks: 0,
    purchases: 0,
  },
]

// Product ids the demo merchant is actively promoting (drives the consumer
// "Sponsored" badge in product discovery + AI recommendations).
export const sponsoredProductIds: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const c of seedSponsoredCampaigns) {
    if (c.status === "active" && c.productId) map[c.productId] = c.id
  }
  return map
})()

export function annotateSponsored(products: Product[]): Product[] {
  return products.map((p) =>
    sponsoredProductIds[p.id]
      ? { ...p, isSponsored: true, sponsoredCampaignId: sponsoredProductIds[p.id] }
      : p,
  )
}

// Curated, paid-placement collections sold through the merchant portal.
export const featuredCollections: FeaturedCollection[] = [
  {
    id: "best-kitchen",
    title: "Best Kitchen Gifts",
    description: "The most-added cookware and appliances on VowCart.",
    slots: 8,
    filled: 6,
    priceFrom: 750,
    categories: ["Kitchen"],
  },
  {
    id: "coffee-lovers",
    title: "Coffee Lover Essentials",
    description: "Espresso machines, grinders, and everything for the daily ritual.",
    slots: 6,
    filled: 4,
    priceFrom: 600,
    categories: ["Kitchen", "Smart Home"],
  },
  {
    id: "first-apartment",
    title: "First Apartment Favorites",
    description: "Starter staples for couples setting up their first home.",
    slots: 10,
    filled: 7,
    priceFrom: 500,
    categories: ["Kitchen", "Bedroom", "Bathroom"],
  },
  {
    id: "under-100",
    title: "Gifts Under $100",
    description: "High-converting, guest-friendly price point.",
    slots: 12,
    filled: 9,
    priceFrom: 400,
    categories: ["Dining", "Bathroom", "Home Decor"],
  },
  {
    id: "premium",
    title: "Premium Wedding Gifts",
    description: "Heirloom-grade pieces for generous guests.",
    slots: 6,
    filled: 3,
    priceFrom: 1200,
    categories: ["Kitchen", "Dining"],
  },
  {
    id: "travel",
    title: "Travel Essentials",
    description: "Luggage and gear for honeymooners and frequent flyers.",
    slots: 6,
    filled: 5,
    priceFrom: 550,
    categories: ["Travel"],
  },
]

// Demo-only AI insights surfaced inside the merchant portal (recommendations,
// never couple-facing). Framed as ROI-oriented guidance for the merchant.
export const merchantAiInsights: { title: string; detail: string }[] = [
  {
    title: "Bundle espresso + grinder",
    detail:
      "Your Barista Express is added alongside a coffee grinder in 41% of registries. A bundled sponsored placement could lift attach rate.",
  },
  {
    title: "Cookware over-indexes",
    detail:
      "Your Dutch oven converts at 38% — well above the 24% Kitchen category average. Consider raising its sponsored bid.",
  },
  {
    title: "Sweet spot $75–$150",
    detail:
      "Products priced $75–$150 are converting best this month across your catalog. Two of your items sit just above this band.",
  },
  {
    title: "Dining demand rising",
    detail:
      "Sponsored Dining placements are seeing higher add rates than Decor. You have no active Dining campaign yet.",
  },
]

export const seedActivity = [
  {
    id: "a1",
    type: "purchase" as const,
    message: "Aunt Carol purchased the Le Creuset Dutch Oven",
    detail: "$420 · Kitchen",
    time: "2 hours ago",
  },
  {
    id: "a2",
    type: "view" as const,
    message: "12 guests viewed your registry today",
    detail: "Registry traffic up 28%",
    time: "5 hours ago",
  },
  {
    id: "a3",
    type: "reserve" as const,
    message: "A guest reserved the Breville Espresso Machine",
    detail: "Reservation expires soon",
    time: "Yesterday",
  },
  {
    id: "a4",
    type: "purchase" as const,
    message: "James & Priya purchased the Brooklinen Sheet Set",
    detail: "$269 · Bedroom",
    time: "2 days ago",
  },
  {
    id: "a5",
    type: "added" as const,
    message: "You added 3 new gifts to the Kitchen category",
    detail: "Registry now has 16 gifts",
    time: "3 days ago",
  },
]
