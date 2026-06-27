"use client"

import { Search, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductSearch } from "@/components/dashboard/product-search"
import { Recommendations } from "@/components/dashboard/recommendations"
import type { RecommendationGroup } from "@/lib/types"

export function FindGifts({
  groups,
  coupleNames,
  defaultTab = "search",
}: {
  groups: RecommendationGroup[]
  coupleNames: string
  defaultTab?: "search" | "recommendations"
}) {
  return (
    <Tabs defaultValue={defaultTab} className="gap-6">
      <TabsList>
        <TabsTrigger value="search">
          <Search data-icon="inline-start" />
          Search
        </TabsTrigger>
        <TabsTrigger value="recommendations">
          <Sparkles data-icon="inline-start" />
          For You
        </TabsTrigger>
      </TabsList>

      <TabsContent value="search">
        <ProductSearch />
      </TabsContent>

      <TabsContent value="recommendations">
        {/* Groups are pre-filtered server-side to exclude registry items, so
            nothing here is already added — pass an empty baseline. */}
        <Recommendations groups={groups} coupleNames={coupleNames} alreadyAdded={[]} />
      </TabsContent>
    </Tabs>
  )
}
