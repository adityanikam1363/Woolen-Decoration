import { MessageCircle, X } from "lucide-react"
import { useEffect } from "react"
import { getWhatsAppUrl } from "../config"
import type { Product } from "../types/product"

export default function ProductDetails({
  product,
  onClose,
}: {
  product: Product | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!product) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [product, onClose])
  if (!product) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-brown/55 p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-labelledby="product-dialog-title"
        aria-modal="true"
        role="dialog"
        className="relative grid max-h-[90vh] w-full max-w-[880px] overflow-auto rounded-xl bg-ivory shadow-2xl md:grid-cols-2"
      >
        <button
          aria-label="Close product details"
          className="icon-button absolute right-4 top-4 z-10 bg-ivory shadow"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full min-h-[300px] w-full object-cover"
          />
        ) : (
          <div className="min-h-[300px] bg-sand md:min-h-full" />
        )}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          {product.badge && <p className="eyebrow">{product.badge}</p>}
          <h2
            id="product-dialog-title"
            className="mt-5 font-display text-4xl leading-none"
          >
            {product.name}
          </h2>
          <p className="mt-4 text-lg">{product.price}</p>
          <p className="mt-6 text-sm leading-7 text-brown/75">
            {product.fullDescription ||
              product.shortDescription ||
              product.description}
          </p>
          {product.category && (
            <p className="mt-4 text-xs uppercase tracking-[.12em] text-brown/55">
              {product.category}
            </p>
          )}
          {product.specifications && (
            <p className="mt-3 text-sm leading-6 text-brown/65">
              {product.specifications}
            </p>
          )}
          <p
            className={`mt-5 text-sm font-medium ${
              product.status === "Out of Stock"
                ? "text-terracotta"
                : "text-olive"
            }`}
          >
            {product.status}
          </p>
          <a
            className="button-primary mt-8 inline-flex items-center justify-center gap-2"
            href={getWhatsAppUrl(product.name)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} />
            Enquire on WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
