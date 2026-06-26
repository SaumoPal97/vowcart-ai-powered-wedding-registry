import type { Metadata } from "next"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata: Metadata = {
  title: "Build your registry — VowCart",
}

export default function OnboardingPage() {
  return <OnboardingWizard />
}
