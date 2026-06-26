import { PageHeader } from "@/components/dashboard/page-header"
import { ProductSearch } from "@/components/dashboard/product-search"

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Find Gifts"
        description="Search real products from Shopify merchants and add them to your registry."
      />
      <div className="p-4 sm:p-6">
        <ProductSearch />
      </div>
    </>
  )
}
