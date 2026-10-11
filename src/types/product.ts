export interface Product {
  id: string
  name: string
  price: string
  priceAmount?: number
  image: string
  status: "Available" | "Out of Stock"
  badge?: "FEATURED" | "NEW ARRIVAL"
  description: string
  shortDescription?: string
  fullDescription?: string
  category?: string
  specifications?: string
  images?: string[]
  featured?: boolean
  newArrival?: boolean
}

export interface Category {
  name: string
  image: string
}
