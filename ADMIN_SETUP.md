# Admin workspace and MongoDB setup

The admin workspace uses a Node.js/Express API. By default, products are stored in `server/data/products.json`, uploaded images in `public/uploads/`, and sessions in `server/data/sessions/`. These are server-side files and are ignored by Git.

To use MongoDB for products and uploaded images, set `MONGODB_URI` and optionally `MONGODB_DATABASE` in `.env`. Product documents are stored in the `products` collection and uploaded images use MongoDB GridFS in the `product_images.files` and `product_images.chunks` collections. Image uploads are limited to eight JPEG, PNG, or WebP files per product, up to 5 MB each. If MongoDB is not configured, the existing local-file storage remains in use. A configured but unreachable MongoDB server causes the API to fail at startup rather than silently switching storage.

When MongoDB is empty, the API copies products from the existing local product file if it exists; otherwise it seeds the six sample products. Existing `/uploads/` images remain served from local storage. New uploads are stored in MongoDB. Products are not seeded again after the collection has data.

## Connect MongoDB

1. Create a MongoDB Atlas cluster (or use an existing MongoDB server) and a database user with read/write access to the chosen database.
2. Allow your backend machine's IP address in Atlas Network Access. Avoid allowing access from every IP unless you understand the security implications.
3. Copy `.env.example` to `.env`. Set `MONGODB_URI` to the private connection string from Atlas and, if desired, set `MONGODB_DATABASE` (defaults to `woolen_store`). Keep `.env` private and never put the connection string in frontend code or commit it.
4. If the database user's password contains URI-reserved characters, URL-encode the password in the connection string.
5. Start the API and frontend as described below. The API health endpoint (`/api/health`) reports `mongodb` when connected.

## Admin credentials

In `.env`, set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and a private `SESSION_SECRET` of at least 32 characters. The password is never stored in plaintext. Generate a bcrypt hash locally with:

```sh
node --input-type=module -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('choose-a-strong-password', 12))"
```

Do not commit `.env`.

## Add products as the owner

Start both servers and open `/admin/login` on the frontend. Sign in with the configured admin email and password, then use the dashboard to upload product photos, enter product details, and save. Saved products immediately appear in the public catalogue. The admin login protects product creation, editing, deletion, and image uploads.

## Run the site and API

Run the API and Vite frontend in separate terminals:

```sh
npm run api
npm run dev
```

Open `/admin/login`; the Vite server proxies `/api` to port 3002 by default. `API_PORT`, `PRODUCT_STORE_FILE`, `UPLOAD_DIR`, and `SESSION_DIR` can be set in `.env` to choose the backend port or local storage locations.

For production, use a private MongoDB connection string and serve the app over HTTPS. Keep the database credentials server-side and configure Atlas network access narrowly. Session files still use `SESSION_DIR`; use persistent storage for that directory, or configure a production-grade shared session store before running multiple API instances.
