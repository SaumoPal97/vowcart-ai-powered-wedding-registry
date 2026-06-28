import { redirect } from "next/navigation"

// AI Copilot now lives as a tab inside Find Gifts.
export default function CopilotPage() {
  redirect("/dashboard/search?tab=copilot")
}
