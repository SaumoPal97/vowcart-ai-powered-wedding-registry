"use client"

import { useState } from "react"
import { Globe, Lock, User, Save } from "lucide-react"
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
import { couple } from "@/lib/data"
import { toast } from "sonner"

export function SettingsForm() {
  const [isPublic, setIsPublic] = useState(couple.isPublic)
  const [allowReservations, setAllowReservations] = useState(true)
  const [hidePurchased, setHidePurchased] = useState(false)
  const [showShipping, setShowShipping] = useState(true)

  function save() {
    toast.success("Settings saved")
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
                  <Input id="po" defaultValue={couple.partnerOne} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="pt">Partner two</FieldLabel>
                  <Input id="pt" defaultValue={couple.partnerTwo} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="wd">Wedding date</FieldLabel>
                  <Input id="wd" type="date" defaultValue={couple.weddingDate} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="loc">Location</FieldLabel>
                  <Input id="loc" defaultValue={couple.location} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="story">Your story</FieldLabel>
                <Textarea
                  id="story"
                  rows={4}
                  defaultValue={couple.story}
                />
                <FieldDescription>
                  Share a few words for your guests on the public page.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button onClick={save}>
              <Save data-icon="inline-start" />
              Save changes
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
            <Button onClick={save}>
              <Save data-icon="inline-start" />
              Save changes
            </Button>
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
              <Input id="slug" defaultValue={couple.slug} />
              <FieldDescription>
                Choose a memorable link to share with guests.
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
            <Button onClick={save}>
              <Save data-icon="inline-start" />
              Save changes
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
