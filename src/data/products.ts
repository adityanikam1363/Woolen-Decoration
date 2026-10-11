import type { Category, Product } from "../types/product"

const images = {
  knit: "https://framerusercontent.com/images/P5EMRbCJPUz1FWu8aMToBSnDjWM.jpg?width=900&height=900",
  scarf:
    "https://framerusercontent.com/images/Yyl2Z0fX7IczpIO5TWuyLThWvN0.jpg?width=900&height=903",
  basket:
    "https://framerusercontent.com/images/sPjl5PvqL99JYitrmQEd8b01ew.jpg?width=900&height=903",
  crochet:
    "https://framerusercontent.com/images/F2N0G9ggQdtb69Dl3fxy9ub2ZFU.jpg?width=900&height=998",
  yarn: "https://framerusercontent.com/images/iz0l2qo03WLiveOH1CadVMlPBWY.jpg?width=900&height=900",
  woven:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvIWFf12W1J2WfPrb3ITqFMDjso0FITNDzjQEhnBB45LSrxS8z",
}

export const categories: Category[] = [
  { name: "Woolen Decorations", image: images.knit },
  { name: "Handmade Woolen Crafts", image: images.scarf },
  { name: "Knitted Products", image: images.basket },
  { name: "Woolen Accessories", image: images.crochet },
  { name: "Home Décor", image: images.yarn },
  { name: "Seasonal Collection", image: images.woven },
]

export const featuredProducts: Product[] = [
  {
    id: "cloud-knit-throw",
    name: "Cloud Knit Throw",
    price: "₹2,450",
    image: images.knit,
    status: "Available",
    badge: "FEATURED",
    description:
      "A softly textured knit throw made to bring warmth and quiet character to your favorite corner.",
  },
  {
    id: "terracotta-cable-scarf",
    name: "Terracotta Cable Scarf",
    price: "₹1,250",
    image: images.scarf,
    status: "Available",
    badge: "FEATURED",
    description:
      "A warm, richly textured scarf in an earthy terracotta tone, finished slowly by hand.",
  },
  {
    id: "nest-crochet-basket",
    name: "Nest Crochet Basket",
    price: "₹890",
    image: images.basket,
    status: "Available",
    badge: "FEATURED",
    description:
      "A sturdy crochet basket for yarn, keepsakes, and all the small things that make a home.",
  },
]

export const newArrivals: Product[] = [
  {
    id: "ivory-crochet-table-accent",
    name: "Ivory Crochet Table Accent",
    price: "₹650",
    image: images.crochet,
    status: "Available",
    badge: "NEW ARRIVAL",
    description:
      "A delicate ivory crochet accent that adds handmade softness to a table or shelf.",
  },
  {
    id: "meadow-craft-yarn-set",
    name: "Meadow Craft Yarn Set",
    price: "₹480",
    image: images.yarn,
    status: "Out of Stock",
    badge: "NEW ARRIVAL",
    description:
      "A tactile set of soft yarns in fresh, natural shades for unhurried creative afternoons.",
  },
  {
    id: "woven-winter-keepsake",
    name: "Woven Winter Keepsake",
    price: "₹1,150",
    image: images.woven,
    status: "Available",
    badge: "NEW ARRIVAL",
    description:
      "A warm woven keepsake with a natural palette and a beautifully tactile finish.",
  },
]

export const heroImage =
  "https://img.magnific.com/free-photo/still-life-with-cozy-variety-yarn-knitting_169016-1749.jpg?semt=ais_hybrid&w=740&q=80"
export const fallbackHeroImage =
  "https://framerusercontent.com/images/2yFTsPFTyCcXA0iRI3qRvV2wDA.jpg?width=1600&height=1067"
export const storyImage =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvIWFf12W1J2WfPrb3ITqFMDjso0FITNDzjQEhnBB45LSrxS8z"
