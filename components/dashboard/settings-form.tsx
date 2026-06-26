"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, Lock, User, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import type { Couple } from "@/lib/types"
import { toast } from "sonner"

export function SettingsForm({ couple }: { couple: Couple }) {
  const router = useRouter()

  const [partnerOne, setPartnerOne] = useState(couple.partnerOne)
  const [partnerTwo, setPartnerTwo] = useState(couple.partnerTwo)
  const [weddingDate, setWeddingDate] = useState(couple.weddingDate)
  const [location, setLocation] = useState(couple.location)
  const [story, setStory] = useState(couple.story)

  const [isPublic, setIsPublic] = useState(couple.isPublic)
  const [allowReservations, setAllowReservations] = useState(true)
  const [hidePurchased, setHidePurchased] = useState(false)
  const [showShipping, setShowShipping] = useState(true)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function save(patch: Record<string, unknown>) {
    setSaving(true)
    try {
      const res = await fetch("/api/registry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error("failed")
      toast.success("Settings saved")
      router.refresh()
    } catch {
      toast.error("Couldn't save your settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteRegistry() {
    setDeleting(true)
    try {
      const res = await fetch("/api/registry", { method: "DELETE" })
      if (!res.ok) throw new Error("failed")
      setIsPublic(false)
      toast.success("Your registry is now private and hidden.")
      router.refresh()
    } catch {
      toast.error("Couldn't update your registry. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="gap-6">
      <TabsList>
        <TabsTrigger value="profile">
          <User data-icon="inline-start" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="privacy">
          <Lock data-icon="inline-start" />
          Privacy
        </TabsTrigger>
        <TabsTrigger value="page">
          <Globe data-icon="inline-start" />
          Public Page
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Couple profile</CardTitle>
            <CardDescription>
              This information appears across your registry and public page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="po">Partner one</FieldLabel>
                  <Input
                    id="po"
                    value={partnerOne}
                    onChange={(e) => setPartnerOne(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="pt">Partner two</FieldLabel>
                  <Input
                    id="pt"
                    value={partnerTwo}
                    onChange={(e) => setPartnerTwo(e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="wd">Wedding date</FieldLabel>
                  <Input
                    id="wd"
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="loc">Location</FieldLabel>
                  <Input
                    id="loc"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="story">Your story</FieldLabel>
                <Textarea
                  id="story"
                  rows={4}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                />
                <FieldDescription>
                  Share a few words for your guests on the public page.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button
              disabled={saving}
              onClick={() =>
                save({ partnerOne, partnerTwo, weddingDate, location, story })
              }
            >
              <Save data-icon="inline-start" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="privacy">
        <Card>
          <CardHeader>
            <CardTitle>Privacy &amp; reservations</CardTitle>
            <CardDescription>
              Control how guests interact with your registry.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <SettingRow
              title="Make registry public"
              description="Anyone with the link can view your registry."
              checked={isPublic}
              onChange={setIsPublic}
            />
            <Separator />
            <SettingRow
              title="Allow gift reservations"
              description="Guests can reserve a gift before purchasing."
              checked={allowReservations}
              onChange={setAllowReservations}
            />
            <Separator />
            <SettingRow
              title="Hide purchased gifts"
              description="Keep the surprise — hide gifts once bought."
              checked={hidePurchased}
              onChange={setHidePurchased}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={saving} onClick={() => save({ isPublic })}>
              <Save data-icon="inline-start" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="mt-6 border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>
              Hide your registry from all guests. You can make it public again
              anytime.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Dialog>
              <DialogTrigger
                render={
                  <Button variant="destructive">
                    <Trash2 data-icon="inline-start" />
                    Delete registry
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete registry?</DialogTitle>
                  <DialogDescription>
                    This will immediately hide your registry from guests and
                    take down your public page. Your gifts and purchases are
                    kept so you can restore it later.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="ghost">Cancel</Button>} />
                  <Button
                    variant="destructive"
                    disabled={deleting}
                    onClick={deleteRegistry}
                  >
                    {deleting ? "Deleting..." : "Yes, delete it"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="page">
        <Card>
          <CardHeader>
            <CardTitle>Public page</CardTitle>
            <CardDescription>
              Your registry lives at vowcart.app/r/{couple.slug}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Field>
              <FieldLabel htmlFor="slug">Custom URL</FieldLabel>
              <Input id="slug" defaultValue={couple.slug} readOnly />
              <FieldDescription>
                Your registry link, shared with guests.
              </FieldDescription>
            </Field>
            <Separator />
            <SettingRow
              title="Show shipping address"
              description="Display where guests can ship physical gifts."
              checked={showShipping}
              onChange={setShowShipping}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={saving} onClick={() => save({ isPublic })}>
              <Save data-icon="inline-start" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
