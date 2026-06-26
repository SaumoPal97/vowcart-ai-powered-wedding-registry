import type {
  ActivityEvent,
  Couple,
  Product,
  ProductCategory,
  RegistryItem,
  ThankYouNote,
} from "./types"

export const CATEGORIES: ProductCategory[] = [
  "Kitchen",
  "Bedroom",
  "Dining",
  "Bathroom",
  "Travel",
  "Home Decor",
  "Smart Home",
]

export const couple: Couple = {
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

export const products: Product[] = [
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
]

export function getProductById(id: string) {
  return products.find((p) => p.id === id)
}

// Initial registry items derived from products with status + priority
export const registryItems: RegistryItem[] = [
  { ...products[0], status: "available", priority: "must-have" },
  {
    ...products[3],
    status: "purchased",
    priority: "must-have",
    purchasedBy: "Aunt Carol",
    purchasedByEmail: "carol.m@example.com",
    purchaseDate: "2026-06-02",
  },
  { ...products[6], status: "reserved", priority: "must-have" },
  { ...products[2], status: "available", priority: "nice-to-have" },
  { ...products[7], status: "available", priority: "nice-to-have" },
  { ...products[14], status: "available", priority: "must-have" },
  {
    ...products[5],
    status: "purchased",
    priority: "must-have",
    purchasedBy: "James & Priya",
    purchasedByEmail: "jp.wedding@example.com",
    purchaseDate: "2026-05-28",
  },
  { ...products[13], status: "available", priority: "nice-to-have" },
  { ...products[10], status: "available", priority: "must-have" },
  {
    ...products[11],
    status: "purchased",
    priority: "nice-to-have",
    purchasedBy: "The Okafor Family",
    purchasedByEmail: "okafor@example.com",
    purchaseDate: "2026-06-10",
  },
  { ...products[12], status: "available", priority: "nice-to-have" },
  { ...products[4], status: "reserved", priority: "must-have" },
  { ...products[1], status: "available", priority: "nice-to-have" },
  { ...products[9], status: "available", priority: "nice-to-have" },
]

export const activityFeed: ActivityEvent[] = [
  {
    id: "a1",
    type: "purchase",
    message: "Aunt Carol purchased the Le Creuset Dutch Oven",
    detail: "$420 · Kitchen",
    time: "2 hours ago",
  },
  {
    id: "a2",
    type: "view",
    message: "12 guests viewed your registry today",
    detail: "Registry traffic up 28%",
    time: "5 hours ago",
  },
  {
    id: "a3",
    type: "reserve",
    message: "A guest reserved the Breville Espresso Machine",
    detail: "Reservation expires soon",
    time: "Yesterday",
  },
  {
    id: "a4",
    type: "purchase",
    message: "James & Priya purchased the Brooklinen Sheet Set",
    detail: "$269 · Bedroom",
    time: "2 days ago",
  },
  {
    id: "a5",
    type: "added",
    message: "You added 3 new gifts to the Kitchen category",
    detail: "Registry now has 14 gifts",
    time: "3 days ago",
  },
]

export const thankYouNotes: ThankYouNote[] = [
  {
    id: "t1",
    gift: "Le Creuset Dutch Oven",
    purchasedBy: "Aunt Carol",
    email: "carol.m@example.com",
    purchaseDate: "2026-06-02",
    status: "sent",
  },
  {
    id: "t2",
    gift: "Brooklinen Sheet Set",
    purchasedBy: "James & Priya",
    email: "jp.wedding@example.com",
    purchaseDate: "2026-05-28",
    status: "pending",
  },
  {
    id: "t3",
    gift: "Stoneware Dinnerware Set",
    purchasedBy: "The Okafor Family",
    email: "okafor@example.com",
    purchaseDate: "2026-06-10",
    status: "pending",
  },
  {
    id: "t4",
    gift: "Crystal Wine Glasses",
    purchasedBy: "Grandma Rose",
    email: "rose@example.com",
    purchaseDate: "2026-05-15",
    status: "sent",
  },
  {
    id: "t5",
    gift: "Spa Bath Towel Bundle",
    purchasedBy: "Tomás Rivera",
    email: "tomas.r@example.com",
    purchaseDate: "2026-06-12",
    status: "pending",
  },
]

// Analytics mock data
export const dailyViews = [
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

export const purchasesOverTime = [
  { date: "May", purchases: 2, value: 689 },
  { date: "Jun", purchases: 3, value: 1009 },
  { date: "Jul", purchases: 0, value: 0 },
]

export const topCategories = [
  { category: "Kitchen", added: 6, fill: "var(--chart-1)" },
  { category: "Smart Home", added: 4, fill: "var(--chart-2)" },
  { category: "Dining", added: 2, fill: "var(--chart-3)" },
  { category: "Bedroom", added: 1, fill: "var(--chart-4)" },
  { category: "Bathroom", added: 1, fill: "var(--chart-5)" },
]

export const mostViewedGifts = [
  { name: "Stand Mixer", views: 312 },
  { name: "Espresso Machine", views: 268 },
  { name: "Dutch Oven", views: 241 },
  { name: "Knife Set", views: 198 },
  { name: "Smart Lights", views: 176 },
]

// Merchant / brand insights (anonymized aggregate)
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

// Lifestyle questionnaire
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
