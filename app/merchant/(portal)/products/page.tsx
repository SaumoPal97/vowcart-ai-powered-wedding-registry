import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { ProductInsightsTable } from "@/components/merchant/product-insights-table"
import {
  getMerchantForRequest,
  getMerchantProductStats,
} from "@/lib/repos/merchant"

export const dynamic = "force-dynamic"

export default async function MerchantProductsPage() {
  const merchant = await getMerchantForRequest()
  if (!merchant) redirect("/merchant/login")
  const products = await getMerchantProductStats(merchant)

  return (
    <>
      <PageHeader
        title="Product insights"
        description="Per-product registry demand, aggregated and anonymized across the network."
      />
      <div className="p-4 sm:p-6">
        <ProductInsightsTable products={products} />
      </div>
    </>
  )
}
