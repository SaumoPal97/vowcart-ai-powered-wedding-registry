import type { Metadata } from "next"
import { MerchantAuthShell } from "@/components/merchant/merchant-auth-shell"
import { MerchantLoginForm } from "@/components/merchant/merchant-login-form"

export const metadata: Metadata = {
  title: "Merchant sign in · VowCart",
}

export default function MerchantLoginPage() {
  return (
    <MerchantAuthShell
      eyebrow="Merchant Portal"
      title="Welcome back"
      subtitle="Sign in to view your registry demand analytics and sponsored campaigns."
    >
      <MerchantLoginForm />
    </MerchantAuthShell>
  )
}
