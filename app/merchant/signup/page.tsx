import type { Metadata } from "next"
import { MerchantAuthShell } from "@/components/merchant/merchant-auth-shell"
import { MerchantSignupForm } from "@/components/merchant/merchant-signup-form"

export const metadata: Metadata = {
  title: "Become a VowCart merchant",
}

export default function MerchantSignupPage() {
  return (
    <MerchantAuthShell
      eyebrow="Merchant Portal"
      title="Put your products in front of couples"
      subtitle="Create a merchant account to unlock registry demand analytics and sponsored placements."
    >
      <MerchantSignupForm />
    </MerchantAuthShell>
  )
}
