import type { Product } from "../types/product"
import ProductCard from "./ProductCard"
import SectionHeading from "./SectionHeading"

export default function ProductSection({
  eyebrow,
  heading,
  products,
  searchQuery,
  onDetails,
}: {
  eyebrow: string
  heading: string
  products: Product[]
  searchQuery: string
  onDetails: (product: Product) => void
}) {
  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (visibleProducts.length === 0) return null

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 sm:px-12">
      <SectionHeading eyebrow={eyebrow} heading={heading} />
      <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDetails={onDetails}
          />
        ))}
      </div>
    </section>
  )
}
