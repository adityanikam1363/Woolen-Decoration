import { MessageCircle } from "lucide-react"
import { getWhatsAppUrl } from "../config"
import type { Product } from "../types/product"

export default function ProductCard({
  product,
  onDetails,
}: {
  product: Product
  onDetails: (product: Product) => void
}) {
  const unavailable = product.status === "Out of Stock"
  return (
    <article className="group overflow-hidden rounded-xl border border-line bg-[#fffdfa] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(61,52,45,.08)]">
      <div className="relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[1.18] w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div
            aria-label={`${product.name} image not available`}
            className="aspect-[1.18] w-full bg-sand"
          />
        )}
        {product.badge && (
          <span className="absolute left-4 top-4 rounded bg-ivory/95 px-3 py-1.5 text-[10px] font-semibold tracking-[.15em] text-terracotta">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-[25px] leading-[1.1]">
            {product.name}
          </h3>
          <p className="shrink-0 text-[14px] font-medium">{product.price}</p>
        </div>
        <p
          className={`mt-4 text-[12px] font-medium ${
            unavailable ? "text-terracotta" : "text-olive"
          }`}
        >
          <span
            className={`mr-2 inline-block size-1.5 rounded-full ${
              unavailable ? "bg-terracotta" : "bg-olive"
            }`}
          />
          {product.status}
        </p>
        <div className="mt-5 grid gap-2">
          <button
            className="button-primary w-full justify-center py-3"
            onClick={() => onDetails(product)}
          >
            View Details
          </button>
          <a
            className="button-outline flex w-full items-center justify-center gap-2 py-3"
            href={getWhatsAppUrl(product.name)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={15} />
            Enquire on WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}
