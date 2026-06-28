"use client"

import { Search, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductSearch } from "@/components/dashboard/product-search"
import { Recommendations } from "@/components/dashboard/recommendations"
import { RegistryCopilot } from "@/components/dashboard/registry-copilot"
import type { RecommendationGroup, RegistryItem } from "@/lib/types"

export function FindGifts({
  groups,
  coupleNames,
  items,
  defaultTab = "search",
  recsSource,
}: {
  groups: RecommendationGroup[]
  coupleNames: string
  items: RegistryItem[]
  defaultTab?: "search" | "copilot"
  recsSource?: "cache" | "ai" | "ucp" | "fallback"
}) {
  return (
    <Tabs defaultValue={defaultTab} className="gap-6">
      <TabsList>
        <TabsTrigger value="search">
          <Search data-icon="inline-start" />
          Search
        </TabsTrigger>
        <TabsTrigger value="copilot">
          <Sparkles data-icon="inline-start" />
          AI Copilot
        </TabsTrigger>
      </TabsList>

      <TabsContent value="search">
        <div className="flex flex-col gap-10">
          <ProductSearch />
          {/* For You suggestions live here, below the search. Groups are
              pre-filtered server-side to exclude registry items, so nothing
              shown is already added — pass an empty baseline. */}
          <Recommendations
            groups={groups}
            coupleNames={coupleNames}
            alreadyAdded={[]}
            source={recsSource}
          />
        </div>
      </TabsContent>

      <TabsContent value="copilot">
        <RegistryCopilot initialItems={items} />
      </TabsContent>
    </Tabs>
  )
}
