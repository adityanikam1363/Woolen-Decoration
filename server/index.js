import "dotenv/config"

import bcrypt from "bcryptjs"

import express from "express"

import session from "express-session"

import sessionFileStore from "session-file-store"

import rateLimit from "express-rate-limit"

import helmet from "helmet"

import multer from "multer"

import { GridFSBucket, MongoClient, ObjectId } from "mongodb"

import path from "node:path"

import { randomUUID } from "node:crypto"

import { mkdir, readFile, rename, writeFile } from "node:fs/promises"

import { Readable } from "node:stream"

import { pipeline } from "node:stream/promises"

import { fileURLToPath } from "node:url"

import { sampleProducts } from "./seed-products.js"

const app = express()


const port = Number(process.env.PORT || process.env.API_PORT || 3002)


const isProduction = process.env.NODE_ENV === "production"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const dataPath = path.resolve(
  process.env.PRODUCT_STORE_FILE ||
    path.join(__dirname, "data", "products.json"),
)

const uploadPath = path.resolve(
  process.env.UPLOAD_DIR || path.join(__dirname, "..", "public", "uploads"),
)

const sessionPath = path.resolve(
  process.env.SESSION_DIR || path.join(__dirname, "data", "sessions"),
)

const mongoUri = process.env.MONGODB_URI?.trim()

const mongoDatabaseName = process.env.MONGODB_DATABASE?.trim() || "woolen_store"

let mongoClient

let productsCollection

let imageBucket

const requiredEnvironment = [
  "SESSION_SECRET",

  "ADMIN_EMAIL",

  "ADMIN_PASSWORD_HASH",
]

const missingEnvironment = requiredEnvironment.filter(
  (key) => !process.env[key]?.trim(),
)

if (missingEnvironment.length) {
  console.error(
    `Missing required environment variables: ${missingEnvironment.join(", ")}`,
  )

  process.exit(1)
}

if (process.env.SESSION_SECRET.length < 32) {
  console.error("SESSION_SECRET must contain at least 32 characters.")

  process.exit(1)
}

const FileStore = sessionFileStore(session)

const sessionStore = new FileStore({
  path: sessionPath,

  retries: 0,

  logFn: () => {},
})

if (isProduction) app.set("trust proxy", 1)

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],

        "script-src": ["'self'"],

        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],

        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],

        "img-src": ["'self'", "data:", "blob:", "https:"],

        "connect-src": ["'self'"],

        "object-src": ["'none'"],

        "frame-ancestors": ["'none'"],

        "upgrade-insecure-requests": isProduction ? [] : null,
      },
    },
  }),
)

app.use(express.json({ limit: "1mb" }))

app.use(
  session({
    name: "woolen.admin.sid",

    secret: process.env.SESSION_SECRET,

    store: sessionStore,

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      secure: isProduction,

      sameSite: "strict",

      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
)

async function readProducts() {
  if (productsCollection) {
    return productsCollection.find({}).sort({ createdAt: -1 }).toArray()
  }

  return JSON.parse(await readFile(dataPath, "utf8"))
}

async function saveProducts(products) {
  const temporaryPath = `${dataPath}.${randomUUID()}.tmp`

  await writeFile(temporaryPath, `${JSON.stringify(products, null, 2)}\n`, {
    encoding: "utf8",

    mode: 0o600,
  })

  await rename(temporaryPath, dataPath)
}

async function findProduct(id) {
  if (productsCollection) return productsCollection.findOne({ id })

  const products = await readProducts()

  return products.find((product) => product.id === id) || null
}

async function saveProduct(product) {
  if (productsCollection) {
    await productsCollection.replaceOne({ id: product.id }, product, {
      upsert: true,
    })

    return
  }

  const products = await readProducts()

  const index = products.findIndex((item) => item.id === product.id)

  if (index < 0) products.push(product)
  else products[index] = product

  await saveProducts(products)
}

async function removeProduct(id) {
  if (productsCollection) {
    const result = await productsCollection.deleteOne({ id })

    return result.deletedCount > 0
  }

  const products = await readProducts()

  const remaining = products.filter((product) => product.id !== id)

  if (remaining.length === products.length) return false

  await saveProducts(remaining)

  return true
}

function serializeProduct(value) {
  const badge = value.featured
    ? "FEATURED"
    : value.newArrival
      ? "NEW ARRIVAL"
      : undefined

  return {
    id: value.id,

    name: value.name,

    category: value.category,

    priceAmount: value.price,

    price: `₹${Number(value.price).toLocaleString("en-IN")}`,

    image: value.images?.[0] || "",

    images: value.images || [],

    status: value.available ? "Available" : "Out of Stock",

    badge,

    description: value.fullDescription || value.shortDescription || "",

    shortDescription: value.shortDescription || "",

    fullDescription: value.fullDescription || "",

    specifications: value.specifications || "",

    featured: Boolean(value.featured),

    newArrival: Boolean(value.newArrival),
  }
}

function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({ error: "Please sign in to continue." })
  }

  next()
}

function requireSameOrigin(req, res, next) {
  const origin = req.get("origin")

  const expectedOrigin =
    process.env.FRONTEND_ORIGIN?.replace(/\/$/, "") ||
    `${req.protocol}://${req.get("host")}`

  if (origin && origin !== expectedOrigin) {
    return res.status(403).json({ error: "Request origin is not allowed." })
  }

  next()
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: { error: "Too many sign-in attempts. Please wait and try again." },
})

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", storage: mongoUri ? "mongodb" : "local-files" })
})

app.get("/api/auth/session", (req, res) => {
  res.json({ authenticated: Boolean(req.session.admin) })
})

app.post(
  "/api/auth/login",

  requireSameOrigin,

  loginLimiter,

  async (req, res, next) => {
    try {
      const email =
        typeof req.body?.email === "string"
          ? req.body.email.trim().toLowerCase()
          : ""

      const password =
        typeof req.body?.password === "string" ? req.body.password : ""

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required." })
      }

      const emailMatches =
        email === process.env.ADMIN_EMAIL.trim().toLowerCase()

      const passwordMatches = await bcrypt.compare(
        password,

        process.env.ADMIN_PASSWORD_HASH,
      )

      if (!emailMatches || !passwordMatches) {
        return res.status(401).json({ error: "Incorrect email or password." })
      }

      req.session.regenerate((error) => {
        if (error) return next(error)

        req.session.admin = { email }

        req.session.save((saveError) => {
          if (saveError) return next(saveError)

          res.json({ authenticated: true })
        })
      })
    } catch (error) {
      next(error)
    }
  },
)

app.post(
  "/api/auth/logout",

  requireSameOrigin,

  requireAdmin,

  (req, res, next) => {
    req.session.destroy((error) => {
      if (error) return next(error)

      res.clearCookie("woolen.admin.sid", {
        httpOnly: true,

        secure: isProduction,

        sameSite: "strict",
      })

      res.json({ authenticated: false })
    })
  },
)

app.get("/api/products", async (req, res, next) => {
  try {
    let products = await readProducts()

    if (req.query.category) {
      products = products.filter(
        (product) => product.category === String(req.query.category),
      )
    }

    if (req.query.availability === "available") {
      products = products.filter((product) => product.available)
    }

    if (req.query.availability === "out-of-stock") {
      products = products.filter((product) => !product.available)
    }

    if (req.query.search) {
      const query = String(req.query.search).toLowerCase()

      products = products.filter((product) =>
        product.name.toLowerCase().includes(query),
      )
    }

    products.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    res.json({ products: products.map(serializeProduct) })
  } catch (error) {
    next(error)
  }
})

app.get("/api/products/:id", async (req, res, next) => {
  try {
    const product = await findProduct(req.params.id)

    if (!product) return res.status(404).json({ error: "Product not found." })

    res.json({ product: serializeProduct(product) })
  } catch (error) {
    next(error)
  }
})

function validateProduct(body) {
  if (!body || typeof body !== "object") return "Product data is required."

  if (typeof body.name !== "string" || !body.name.trim()) {
    return "Product name is required."
  }

  if (body.name.trim().length > 120) return "Product name is too long."

  if (typeof body.category !== "string" || !body.category.trim()) {
    return "Product category is required."
  }

  if (!Number.isFinite(Number(body.price)) || Number(body.price) <= 0) {
    return "Price must be greater than zero."
  }

  for (const flag of ["available", "featured", "newArrival"]) {
    if (typeof body[flag] !== "boolean") {
      return `${flag} must be true or false.`
    }
  }

  if (!Array.isArray(body.images) || body.images.length > 8) {
    return "Provide up to 8 product image URLs."
  }

  if (
    body.images.some(
      (image) =>
        typeof image !== "string" ||
        image.length > 2048 ||
        (!image.startsWith("/uploads/") &&
          !/^\/api\/images\/[a-f\d]{24}$/i.test(image) &&
          !image.startsWith("https://")),
    )
  ) {
    return "One or more image URLs are invalid."
  }

  return null
}

function toProductDocument(body, previous) {
  const now = new Date().toISOString()

  return {
    id: previous?.id || randomUUID(),

    name: body.name.trim(),

    category: body.category.trim(),

    price: Number(body.price),

    shortDescription: String(body.shortDescription || "")
      .trim()
      .slice(0, 240),

    fullDescription: String(body.fullDescription || "")
      .trim()
      .slice(0, 2000),

    specifications: String(body.specifications || "")
      .trim()
      .slice(0, 500),

    images: body.images,

    available: body.available,

    featured: body.featured,

    newArrival: body.newArrival,

    createdAt: previous?.createdAt || now,

    updatedAt: now,
  }
}

app.post(
  "/api/products",

  requireSameOrigin,

  requireAdmin,

  async (req, res, next) => {
    try {
      const validationError = validateProduct(req.body)

      if (validationError) {
        return res.status(400).json({ error: validationError })
      }

      const product = toProductDocument(req.body)

      await saveProduct(product)

      res.status(201).json({ product: serializeProduct(product) })
    } catch (error) {
      next(error)
    }
  },
)

app.put(
  "/api/products/:id",

  requireSameOrigin,

  requireAdmin,

  async (req, res, next) => {
    try {
      const validationError = validateProduct(req.body)

      if (validationError) {
        return res.status(400).json({ error: validationError })
      }

      const previous = await findProduct(req.params.id)

      if (!previous)
        return res.status(404).json({ error: "Product not found." })

      const product = toProductDocument(req.body, previous)

      await saveProduct(product)

      res.json({ product: serializeProduct(product) })
    } catch (error) {
      next(error)
    }
  },
)

app.delete(
  "/api/products/:id",

  requireSameOrigin,

  requireAdmin,

  async (req, res, next) => {
    try {
      const deleted = await removeProduct(req.params.id)

      if (!deleted) {
        return res.status(404).json({ error: "Product not found." })
      }

      res.json({ deleted: true })
    } catch (error) {
      next(error)
    }
  },
)

const allowedImageTypes = new Map([
  ["image/jpeg", ".jpg"],

  ["image/png", ".png"],

  ["image/webp", ".webp"],
])

const upload = multer({
  storage: mongoUri
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, uploadPath),

        filename: (_req, file, callback) => {
          callback(
            null,
            `${randomUUID()}${allowedImageTypes.get(file.mimetype)}`,
          )
        },
      }),

  limits: { files: 8, fileSize: 5 * 1024 * 1024 },

  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error("Only JPEG, PNG, or WebP images are supported.")

      error.status = 400

      return callback(error)
    }

    callback(null, true)
  },
})

app.post(
  "/api/uploads",

  requireSameOrigin,

  requireAdmin,

  upload.array("images", 8),

  async (req, res, next) => {
    try {
      const files = req.files || []

      if (!files.length) {
        return res.status(400).json({ error: "Choose at least one image." })
      }

      if (!imageBucket) {
        return res.status(201).json({
          images: files.map((file) => `/uploads/${file.filename}`),
        })
      }

      const images = await Promise.all(
        files.map(async (file) => {
          const stream = imageBucket.openUploadStream(
            `${randomUUID()}${allowedImageTypes.get(file.mimetype)}`,

            { metadata: { contentType: file.mimetype } },
          )

          await pipeline(Readable.from([file.buffer]), stream)

          return `/api/images/${stream.id.toString()}`
        }),
      )

      res.status(201).json({ images })
    } catch (error) {
      next(error)
    }
  },
)

app.get("/api/images/:id", async (req, res, next) => {
  if (!imageBucket || !ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: "Image not found." })
  }

  try {
    const id = new ObjectId(req.params.id)

    const [file] = await imageBucket.find({ _id: id }).toArray()

    if (!file) return res.status(404).json({ error: "Image not found." })

    res.set(
      "Content-Type",
      file.metadata?.contentType || "application/octet-stream",
    )

    res.set("Cache-Control", "public, max-age=31536000, immutable")

    const stream = imageBucket.openDownloadStream(id)

    stream.on("error", next)

    stream.pipe(res)
  } catch (error) {
    next(error)
  }
})

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found." })
})

app.use("/uploads", express.static(uploadPath, { fallthrough: false }))

const distPath = path.resolve(__dirname, "../dist")

app.use(express.static(distPath))

app.get(/.*/, (_req, res, next) => {
  res.sendFile(path.join(distPath, "index.html"), (error) => {
    if (error) next(error)
  })
})

app.use((error, _req, res, _next) => {
  console.error(error)

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Images must be 5 MB or smaller."
        : "Upload up to 8 images at a time."

    return res.status(400).json({ error: message })
  }

  const status = Number(error.status || error.statusCode) || 500

  res.status(status).json({
    error:
      status >= 500
        ? "The server could not complete the request."
        : error.message,
  })
})

await mkdir(path.dirname(dataPath), { recursive: true })

await mkdir(uploadPath, { recursive: true })

await mkdir(sessionPath, { recursive: true })

if (mongoUri) {
  mongoClient = new MongoClient(mongoUri)

  await mongoClient.connect()

  const database = mongoClient.db(mongoDatabaseName)

  productsCollection = database.collection("products")

  imageBucket = new GridFSBucket(database, { bucketName: "product_images" })
}

async function createSampleDocuments() {
  const now = new Date().toISOString()

  return sampleProducts.map((product, index) => ({
    id: randomUUID(),

    name: product.name,

    category: product.category,

    price: product.price,

    shortDescription: product.shortDescription,

    fullDescription: product.fullDescription,

    specifications: product.specifications,

    images: product.images,

    available: product.available,

    featured: product.featured,

    newArrival: product.newArrival,

    createdAt: new Date(Date.now() - index).toISOString(),

    updatedAt: now,
  }))
}

if (productsCollection) {
  if ((await productsCollection.countDocuments()) === 0) {
    let initialProducts

    try {
      const localProducts = JSON.parse(await readFile(dataPath, "utf8"))

      initialProducts = Array.isArray(localProducts) ? localProducts : []
    } catch (error) {
      if (error.code !== "ENOENT") throw error

      initialProducts = []
    }

    if (!initialProducts.length) initialProducts = await createSampleDocuments()

    await productsCollection.insertMany(initialProducts)
  }
} else {
  try {
    await readFile(dataPath, "utf8")
  } catch (error) {
    if (error.code !== "ENOENT") throw error

    await saveProducts(await createSampleDocuments())
  }
}

app.listen(port, "0.0.0.0", () => {
  console.log(
    `Woolen Decorations API listening on port ${port} (${
      mongoUri ? "MongoDB" : "local-file"
    } storage)`,
  )
})
