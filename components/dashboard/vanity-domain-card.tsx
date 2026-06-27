"use client"

import { useEffect, useState } from "react"
import { Globe, Crown, Check, Loader2, Trash2, ExternalLink } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { toast } from "sonner"

export function VanityDomainCard() {
  const [domain, setDomain] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/registry/domain")
      .then((r) => r.json())
      .then((d) => setDomain(d.domain ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function connect() {
    const value = input.trim()
    if (!value) return
    setSaving(true)
    try {
      const res = await fetch("/api/registry/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDomain(data.domain)
      setInput("")
      toast.success("Domain connected", {
        description: "Point your DNS as shown below to go live.",
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't connect that domain.")
    } finally {
      setSaving(false)
    }
  }

  async function disconnect() {
    setSaving(true)
    try {
      const res = await fetch("/api/registry/domain", { method: "DELETE" })
      if (!res.ok) throw new Error("failed")
      setDomain(null)
      toast.success("Domain disconnected")
    } catch {
      toast.error("Couldn't disconnect. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="size-4 text-accent" />
          Vanity domain
          <Badge className="gap-1">
            <Crown className="size-3" />
            Premium
          </Badge>
        </CardTitle>
        <CardDescription>
          Point your own domain (e.g. emily-and-james.com) straight at your
          registry — no /r/ link needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : domain ? (
          <>
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                <span className="font-medium text-foreground">{domain}</span>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Open domain"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
            <DnsInstructions domain={domain} />
          </>
        ) : (
          <Field>
            <FieldLabel htmlFor="vanity">Your domain</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="vanity"
                placeholder="emily-and-james.com"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button onClick={connect} disabled={saving || !input.trim()}>
                {saving ? "Connecting…" : "Connect"}
              </Button>
            </div>
            <FieldDescription>
              Enter a bare domain — no “https://” and no path.
            </FieldDescription>
          </Field>
        )}
      </CardContent>
      {domain && (
        <CardFooter>
          <Button variant="ghost" onClick={disconnect} disabled={saving}>
            <Trash2 data-icon="inline-start" />
            Disconnect domain
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

function DnsInstructions({ domain }: { domain: string }) {
  const isApex = domain.split(".").length === 2
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-4 text-sm">
      <p className="font-medium text-foreground">To go live, add this DNS record:</p>
      <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
        {isApex ? (
          <span>A&nbsp;&nbsp;&nbsp;&nbsp;@&nbsp;&nbsp;→&nbsp;&nbsp;76.76.21.21</span>
        ) : (
          <span>
            CNAME&nbsp;&nbsp;{domain.split(".")[0]}&nbsp;&nbsp;→&nbsp;&nbsp;cname.vercel-dns.com
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Then the domain is added to the VowCart project so we can issue HTTPS.
        Once DNS propagates, your registry loads at {domain} automatically.
      </p>
    </div>
  )
}
