import { redirect } from "next/navigation"

// "For You" recommendations now live inside the Find Gifts → Search tab.
export default function RecommendationsPage() {
  redirect("/dashboard/search")
}
