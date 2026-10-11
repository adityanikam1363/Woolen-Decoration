import {
  ArrowLeft,
  Check,
  ImagePlus,
  LogOut,
  PackagePlus,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, DragEvent, FormEvent } from "react"
import { apiRequest } from "../api"
import type { Product } from "../types/product"

const categories = [
  "Woolen Decorations",
  "Home Décor",
  "Handmade Accessories",
  "Gifts",
  "Handmade Woolen Crafts",
  "Knitted Products",
  "Seasonal Collection",
]

type ProductInput = {
  name: string
  category: string
  price: string
  shortDescription: string
  fullDescription: string
  specifications: string
  images: string[]
  available: boolean
  featured: boolean
  newArrival: boolean
}

const emptyProduct: ProductInput = {
  name: "",
  category: categories[0],
  price: "",
  shortDescription: "",
  fullDescription: "",
  specifications: "",
  images: [],
  available: true,
  featured: false,
  newArrival: false,
}

type ProductResponse = { products: Product[] }

function toProductInput(product: Product): ProductInput {
  const amount =
    product.priceAmount ?? (Number(product.price.replace(/[^\d.]/g, "")) || 0)
  return {
    name: product.name,
    category: product.category || categories[0],
    price: String(amount),
    shortDescription: product.shortDescription || product.description,
    fullDescription: product.fullDescription || product.description,
    specifications: product.specifications || "",
    images: product.images?.length ? product.images : [product.image],
    available: product.status === "Available",
    featured: product.featured ?? product.badge === "FEATURED",
    newArrival: product.newArrival ?? product.badge === "NEW ARRIVAL",
  }
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<ProductInput>(emptyProduct)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)

  async function loadProducts() {
    const result = await apiRequest<ProductResponse>("/products")
    setProducts(result.products)
  }

  useEffect(() => {
    apiRequest<{ authenticated: boolean }>("/auth/session")
      .then(async ({ authenticated: loggedIn }) => {
        if (!loggedIn) {
          window.location.replace("/admin/login")
          return
        }
        setAuthenticated(true)
        await loadProducts()
      })
      .catch((loadError) => {
        if (
          loadError instanceof Error &&
          "status" in loadError &&
          loadError.status === 401
        ) {
          window.location.replace("/admin/login")
          return
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load products.",
        )
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesName = product.name
          .toLowerCase()
          .includes(search.trim().toLowerCase())
        const matchesCategory =
          !categoryFilter || product.category === categoryFilter
        const matchesAvailability =
          !availabilityFilter || product.status === availabilityFilter
        return matchesName && matchesCategory && matchesAvailability
      }),
    [products, search, categoryFilter, availabilityFilter],
  )

  function editProduct(product: Product) {
    setEditingId(product.id)
    setForm(toProductInput(product))
    setMessage("")
    setError("")
    setPreviewOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function resetForm() {
    setForm(emptyProduct)
    setEditingId(null)
    setPreviewOpen(false)
  }

  async function uploadFiles(files: FileList | File[]) {
    const selected = Array.from(files)
    if (!selected.length) return
    if (form.images.length + selected.length > 8) {
      setError("You can add up to 8 images per product.")
      return
    }
    const body = new FormData()
    selected.forEach((file) => body.append("images", file))
    setError("")
    setUploading(true)
    try {
      const result = await apiRequest<{ images: string[] }>("/uploads", {
        method: "POST",
        body,
      })
      setForm((current) => ({
        ...current,
        images: [...current.images, ...result.images],
      }))
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed.",
      )
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void uploadFiles(event.target.files)
    event.target.value = ""
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    if (event.dataTransfer.files) void uploadFiles(event.dataTransfer.files)
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setMessage("")
    const price = Number(form.price)
    if (!form.name.trim() || !Number.isFinite(price) || price <= 0) {
      setError("Enter a product name and a price greater than ₹0.")
      return
    }
    if (uploading) {
      setError("Please wait for image uploads to finish.")
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price,
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      specifications: form.specifications.trim(),
      images: form.images,
      available: form.available,
      featured: form.featured,
      newArrival: form.newArrival,
    }
    try {
      const result = await apiRequest<{ product: Product }>(
        editingId ? `/products/${editingId}` : "/products",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      )
      setMessage(`“${result.product.name}” saved successfully.`)
      resetForm()
      try {
        await loadProducts()
      } catch {
        setError("Product was saved, but the catalogue list could not refresh.")
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Product could not be saved.",
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`))
      return
    setError("")
    try {
      await apiRequest(`/products/${product.id}`, { method: "DELETE" })
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      )
      if (editingId === product.id) resetForm()
      setMessage(`“${product.name}” was deleted.`)
      try {
        await loadProducts()
      } catch {
        setError("Product was deleted, but the catalogue list could not refresh.")
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Product could not be deleted.",
      )
    }
  }

  async function logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" })
      window.location.assign("/admin/login")
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : "Unable to log out.",
      )
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-ivory text-sm text-brown/70">
        Checking admin session…
      </main>
    )
  }
  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-ivory px-6 text-center">
        <div>
          <p className="text-sm text-brown/70">
            Admin access is unavailable. Check that the API server is running
            and configured.
          </p>
          <a href="/admin/login" className="button-primary mt-5">
            Go to login
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ivory px-4 py-8 text-brown sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-brown/70 transition-colors hover:text-terracotta"
          >
            <ArrowLeft size={16} /> Back to Catalogue
          </a>
          <button
            type="button"
            onClick={() => void logout()}
            className="button-outline inline-flex items-center gap-2 px-4 py-2"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>

        <section className="mt-7 rounded-xl border border-line bg-white p-5 shadow-[0_18px_60px_rgba(61,52,45,.06)] sm:p-8 lg:p-10">
          <div className="mb-8 border-b border-line pb-6">
            <span className="inline-flex rounded-full bg-sand px-3 py-1.5 text-[10px] font-semibold tracking-[.16em] text-terracotta">
              ADMIN WORKSPACE
            </span>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl leading-none sm:text-5xl">
                  Add / Edit Product
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-brown/65">
                  Product changes are saved on the server and appear in the
                  public catalogue.
                </p>
              </div>
              <p className="text-xs text-brown/55">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>
            </div>
          </div>

          {message && (
            <p role="status" className="mb-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="mb-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <form className="grid gap-x-6 gap-y-5 md:grid-cols-2" onSubmit={saveProduct}>
            <label className="block text-sm font-medium">
              Product Name <span className="text-terracotta">*</span>
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="admin-input"
                placeholder="e.g. Cloud Knit Throw"
              />
            </label>
            <label className="block text-sm font-medium">
              Product Category
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                className="admin-input"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Product Price in ₹ <span className="text-terracotta">*</span>
              <input
                required
                min="1"
                step="0.01"
                type="number"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                className="admin-input"
                placeholder="1250"
              />
            </label>
            <label className="block text-sm font-medium">
              Short Description
              <input
                maxLength={240}
                value={form.shortDescription}
                onChange={(event) =>
                  setForm({ ...form, shortDescription: event.target.value })
                }
                className="admin-input"
                placeholder="A soft woolen accent, finished by hand."
              />
            </label>
            <label className="block text-sm font-medium md:col-span-2">
              Full Description
              <textarea
                rows={4}
                maxLength={2000}
                value={form.fullDescription}
                onChange={(event) =>
                  setForm({ ...form, fullDescription: event.target.value })
                }
                className="admin-input resize-y"
                placeholder="Describe the materials, care, and details of this piece."
              />
            </label>
            <label className="block text-sm font-medium md:col-span-2">
              Product Specifications
              <input
                value={form.specifications}
                onChange={(event) =>
                  setForm({ ...form, specifications: event.target.value })
                }
                className="admin-input"
                placeholder="Material, size, care instructions"
              />
            </label>
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium">Product Images</p>
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#cdbbab] bg-ivory/60 px-4 py-6 text-center transition-colors hover:border-terracotta"
              >
                <ImagePlus className="mb-2 text-terracotta" size={24} />
                <span className="text-sm font-medium">
                  {uploading ? "Uploading images…" : "Drag and drop or choose images"}
                </span>
                <span className="mt-1 text-xs text-brown/55">
                  Up to 8 images, 5 MB each. JPEG, PNG, or WebP.
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              {form.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {form.images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative aspect-square overflow-hidden rounded-md border border-line"
                    >
                      <img src={image} alt={`Product image ${index + 1}`} className="size-full object-cover" />
                      <button
                        type="button"
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-brown shadow"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            images: current.images.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <fieldset className="flex flex-wrap gap-x-7 gap-y-3 border-0 p-0 md:col-span-2">
              {([
                ["available", "Available / In Stock"],
                ["featured", "Featured Product"],
                ["newArrival", "New Arrival"],
              ] as const).map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.checked })
                    }
                    className="size-4 accent-[#b76d51]"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <div className="flex flex-wrap gap-3 border-t border-line pt-5 md:col-span-2">
              <button className="button-primary gap-2" type="submit" disabled={saving || uploading}>
                <Check size={16} /> {saving ? "Saving…" : editingId ? "Update Product" : "Save Product"}
              </button>
              <button
                className="button-outline"
                type="button"
                onClick={() => setPreviewOpen((open) => !open)}
              >
                {previewOpen ? "Hide Preview" : "Preview Catalogue"}
              </button>
              {editingId && (
                <>
                  <button
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm text-red-800 transition-colors hover:bg-red-50"
                    type="button"
                    onClick={() => {
                      const product = products.find((item) => item.id === editingId)
                      if (product) void deleteProduct(product)
                    }}
                  >
                    <Trash2 size={15} /> Delete Product
                  </button>
                  <button
                    className="button-link"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel edit
                  </button>
                </>
              )}
            </div>
          </form>

          {previewOpen && (
            <section className="mt-7 max-w-sm rounded-xl border border-line bg-[#fffdfa] p-4 shadow-sm">
              <p className="mb-3 text-[10px] font-semibold tracking-[.16em] text-terracotta">
                CATALOGUE PREVIEW
              </p>
              {form.images[0] ? (
                <img
                  src={form.images[0]}
                  alt={form.name || "Product preview"}
                  className="aspect-[1.18] w-full rounded-lg object-cover"
                />
              ) : (
                <div className="grid aspect-[1.18] place-items-center rounded-lg bg-sand text-sm text-brown/55">
                  Add an image to preview
                </div>
              )}
              <div className="mt-4 flex justify-between gap-3">
                <h2 className="font-display text-2xl">
                  {form.name || "Your product name"}
                </h2>
                <span className="shrink-0 text-sm">
                  {form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "₹—"}
                </span>
              </div>
              <p className="mt-3 text-xs text-brown/60">
                {form.shortDescription || "Your short description will appear here."}
              </p>
              <p className="mt-3 text-xs text-olive">
                {form.available ? "Available" : "Out of Stock"}
              </p>
            </section>
          )}
        </section>

        <section className="mt-7 rounded-xl border border-line bg-white p-5 shadow-[0_18px_60px_rgba(61,52,45,.04)] sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">YOUR CATALOGUE</p>
              <h2 className="mt-2 font-display text-3xl">Manage Products</h2>
            </div>
            <button
              type="button"
              className="button-outline inline-flex items-center gap-2"
              onClick={resetForm}
            >
              <PackagePlus size={15} /> Add new
            </button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_200px]">
            <label className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/50" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="admin-input mt-0 pl-9"
                placeholder="Search by product name"
                aria-label="Search products"
              />
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="admin-input mt-0"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
              className="admin-input mt-0"
              aria-label="Filter by availability"
            >
              <option value="">All availability</option>
              <option>Available</option>
              <option>Out of Stock</option>
            </select>
          </div>
          <div className="mt-5 divide-y divide-line">
            {filteredProducts.map((product) => (
              <article key={product.id} className="flex flex-wrap items-center gap-4 py-4">
                {product.image ? (
                  <img src={product.image} alt="" className="size-16 rounded-md object-cover" />
                ) : (
                  <div className="grid size-16 place-items-center rounded-md bg-sand">
                    <ImagePlus size={18} />
                  </div>
                )}
                <div className="min-w-[160px] flex-1">
                  <h3 className="font-display text-xl leading-tight">{product.name}</h3>
                  <p className="mt-1 text-xs text-brown/60">
                    {product.category || "Uncategorized"} · {product.price} · {product.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => editProduct(product)}
                  className="button-outline inline-flex items-center gap-2 px-3 py-2"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${product.name}`}
                  onClick={() => void deleteProduct(product)}
                  className="grid size-10 place-items-center rounded-md text-red-800 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
            {filteredProducts.length === 0 && (
              <p className="py-8 text-center text-sm text-brown/55">
                {products.length ? "No products match these filters." : "No products found."}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
