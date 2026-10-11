import { useEffect, useMemo, useState } from "react"
import { apiRequest } from "./api"
import AdminDashboard from "./admin/AdminDashboard"
import AdminLogin from "./admin/AdminLogin"
import BrandStory from "./components/BrandStory"
import BrandValues from "./components/BrandValues"
import ContactSection from "./components/ContactSection"
import Footer from "./components/Footer"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import ProductDetails from "./components/ProductDetails"
import ProductSection from "./components/ProductSection"
import { featuredProducts, newArrivals } from "./data/products"
import type { Product } from "./types/product"

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "")
  if (path === "/admin/login") return <AdminLogin />
  if (path === "/admin/dashboard" || path === "/admin/products")
    return <AdminDashboard />
  if (path.startsWith("/admin/")) {
    window.location.replace("/admin/login")
    return null
  }
  return <PublicCatalogue />
}

function PublicCatalogue() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([
    ...featuredProducts,
    ...newArrivals,
  ])
  const [apiError, setApiError] = useState("")

  useEffect(() => {
    apiRequest<{ products: Product[] }>("/products")
      .then(({ products: savedProducts }) => {
        setProducts(savedProducts)
        setApiError("")
      })
      .catch((error: unknown) => {
        setApiError(
          error instanceof Error
            ? "Showing the sample catalogue because saved products could not be loaded."
            : "Showing the sample catalogue because the product service is unavailable.",
        )
      })
  }, [])

  const featured = useMemo(
    () =>
      products.filter(
        (product) => product.featured ?? product.badge === "FEATURED",
      ),
    [products],
  )
  const arrivals = useMemo(
    () =>
      products.filter(
        (product) => product.newArrival ?? product.badge === "NEW ARRIVAL",
      ),
    [products],
  )
  const otherProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          !(product.featured ?? product.badge === "FEATURED") &&
          !(product.newArrival ?? product.badge === "NEW ARRIVAL"),
      ),
    [products],
  )
  const hasSearchResults = products.some((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen overflow-x-hidden bg-ivory text-brown">
      <Header onSearch={setSearchQuery} />
      <main>
        {apiError && (
          <p role="status" className="mx-auto max-w-[1200px] px-6 pt-4 text-xs text-brown/55 sm:px-12">
            {apiError}
          </p>
        )}
        <HeroSection />
        <div id="products" className="scroll-mt-24">
          <ProductSection
            eyebrow="THE PIECES WE LOVE"
            heading="Thoughtfully made favorites"
            products={featured}
            searchQuery={searchQuery}
            onDetails={setSelectedProduct}
          />
          <ProductSection
            eyebrow="FRESH FROM OUR HANDS"
            heading="New textures, familiar comfort"
            products={arrivals}
            searchQuery={searchQuery}
            onDetails={setSelectedProduct}
          />
          {otherProducts.length > 0 && (
            <ProductSection
              eyebrow="MORE FROM THE WORKSHOP"
              heading="The rest of the collection"
              products={otherProducts}
              searchQuery={searchQuery}
              onDetails={setSelectedProduct}
            />
          )}
          {searchQuery && !hasSearchResults && (
            <p className="mx-auto max-w-[1200px] px-6 py-20 text-center text-sm sm:px-12">
              No pieces matched “{searchQuery}”. Try another search.
            </p>
          )}
        </div>
        <BrandStory />
        <BrandValues />
        <ContactSection />
      </main>
      <Footer />
      <ProductDetails
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
