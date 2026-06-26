"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

type DailyView = { date: string; views: number; scans: number }
type CategorySlice = { category: string; added: number; fill: string }
type ViewedGift = { name: string; views: number }

const trafficConfig = {
  views: { label: "Page views", color: "var(--chart-1)" },
  scans: { label: "QR scans", color: "var(--chart-3)" },
} satisfies ChartConfig

const categoryConfig = {
  added: { label: "Gifts" },
  Kitchen: { label: "Kitchen", color: "var(--chart-1)" },
  "Smart Home": { label: "Smart Home", color: "var(--chart-2)" },
  Dining: { label: "Dining", color: "var(--chart-3)" },
  Bedroom: { label: "Bedroom", color: "var(--chart-4)" },
  Bathroom: { label: "Bathroom", color: "var(--chart-5)" },
} satisfies ChartConfig

const viewsConfig = {
  views: { label: "Views", color: "var(--chart-1)" },
} satisfies ChartConfig

export function TrafficChart({ data }: { data: DailyView[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Registry traffic</CardTitle>
        <CardDescription>
          Page views and QR scans over the last month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trafficConfig} className="h-[280px] w-full">
          <AreaChart data={data} margin={{ left: 4, right: 12 }}>
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-views)"
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-views)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillScans" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-scans)"
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-scans)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="views"
              type="monotone"
              fill="url(#fillViews)"
              stroke="var(--color-views)"
              strokeWidth={2}
            />
            <Area
              dataKey="scans"
              type="monotone"
              fill="url(#fillScans)"
              stroke="var(--color-scans)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function CategoryChart({ data }: { data: CategorySlice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gifts by category</CardTitle>
        <CardDescription>How your registry is distributed.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer
          config={categoryConfig}
          className="mx-auto aspect-square h-[260px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
            <Pie
              data={data}
              dataKey="added"
              nameKey="category"
              innerRadius={55}
              strokeWidth={3}
            >
              {data.map((entry) => (
                <Cell key={entry.category} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="flex-wrap gap-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function MostViewedChart({ data }: { data: ViewedGift[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most viewed gifts</CardTitle>
        <CardDescription>What your guests are eyeing most.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={viewsConfig} className="h-[260px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={110}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="views"
              fill="var(--color-views)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
