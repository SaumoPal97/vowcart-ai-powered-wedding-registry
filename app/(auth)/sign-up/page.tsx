import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Create your account — VowCart",
}

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Get started free"
      title="Create your registry account"
      subtitle="Join thousands of couples building smarter registries with VowCart."
    >
      <SignUpForm />
    </AuthShell>
  )
}
