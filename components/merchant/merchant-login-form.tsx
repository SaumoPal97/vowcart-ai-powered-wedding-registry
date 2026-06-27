"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MerchantLoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/merchant/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to sign in.")
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
          <FieldLabel htmlFor="email">Work email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@brand.com"
            defaultValue="merchant@vowcart.app"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            defaultValue="vowcart-demo"
            required
          />
        </Field>
      </FieldGroup>
      <Button type="submit" size="lg" className="h-11" disabled={loading}>
        {loading ? "Signing in..." : "Sign in to portal"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New brand on VowCart?{" "}
        <Link
          href="/merchant/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create a merchant account
        </Link>
      </p>
    </form>
  )
}
