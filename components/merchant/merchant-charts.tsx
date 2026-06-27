"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { MerchantCategoryStat } from "@/lib/types"

const demandConfig = {
  added: { label: "Added to registries", color: "var(--chart-1)" },
  purchased: { label: "Purchased", color: "var(--chart-3)" },
} satisfies ChartConfig

/** Added vs. purchased by category — the core demand view for a merchant. */
export function CategoryDemandChart({ data }: { data: MerchantCategoryStat[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Demand by category</CardTitle>
        <CardDescription>
          Products added vs. purchased across all registries (anonymized).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={demandConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ left: 4, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="added" fill="var(--color-added)" radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="purchased"
              fill="var(--color-purchased)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const convConfig = {
  conversionRate: { label: "Conversion %", color: "var(--chart-2)" },
} satisfies ChartConfig

/** Add→purchase conversion rate by category. */
export function CategoryConversionChart({
  data,
}: {
  data: MerchantCategoryStat[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion by category</CardTitle>
        <CardDescription>Add-to-purchase rate.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={convConfig} className="h-[300px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
              width={92}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="conversionRate"
              fill="var(--color-conversionRate)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
