"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MerchantSignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/merchant/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantName: form.get("merchantName"),
          contactName: form.get("contactName"),
          email: form.get("email"),
          password: form.get("password"),
          website: form.get("website"),
          shopifyMerchantId: form.get("shopifyMerchantId"),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to create account.")
        setLoading(false)
        return
      }
      router.push("/merchant/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="merchantName">Brand / merchant name</FieldLabel>
          <Input id="merchantName" name="merchantName" placeholder="Hearth & Co." required />
        </Field>
        <Field>
          <FieldLabel htmlFor="contactName">Contact name</FieldLabel>
          <Input id="contactName" name="contactName" placeholder="Ava Mercer" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Work email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="you@brand.com" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="website">Website</FieldLabel>
          <Input id="website" name="website" placeholder="https://brand.com" />
        </Field>
        <Field>
          <FieldLabel htmlFor="shopifyMerchantId">Shopify shop ID</FieldLabel>
          <Input
            id="shopifyMerchantId"
            name="shopifyMerchantId"
            placeholder="brand.myshopify.com"
          />
          <FieldDescription>Optional — connect your store for live demand sync.</FieldDescription>
        </Field>
      </FieldGroup>
      <Button type="submit" size="lg" className="h-11" disabled={loading}>
        {loading ? "Creating account..." : "Create merchant account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/merchant/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
