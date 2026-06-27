import { redirect } from "next/navigation"

// Recommendations now live as the "For You" tab inside Find Gifts.
export default function RecommendationsPage() {
  redirect("/dashboard/search?tab=recommendations")
}
