import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in — VowCart",
}

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to VowCart"
      subtitle="Pick up right where you left off with your registry."
    >
      <SignInForm />
    </AuthShell>
  )
}
