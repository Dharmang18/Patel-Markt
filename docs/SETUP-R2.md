# Cloudflare R2 — product image storage

Product images are stored in **Cloudflare R2** (S3-compatible) instead of
Supabase Storage. R2 gives **10 GB free** with **zero egress fees**, which keeps
images from counting against the Supabase quota. The database (products, orders,
auth) stays on Supabase — only the image *files* live in R2.

## 1. Create the bucket

1. Cloudflare dashboard → **R2** → **Create bucket**.
2. Name it `product-images` (or anything; set `R2_BUCKET` to match).
3. Region: leave **Automatic**.

## 2. Enable public access

The store links to images by public URL, so the bucket needs a public base URL.

**Option A — r2.dev (quickest):**
- Open the bucket → **Settings** → **Public Development URL** → **Enable**.
- Copy the URL, e.g. `https://pub-xxxxxxxx.r2.dev`.

**Option B — custom domain (recommended for production):**
- Bucket → **Settings** → **Custom Domains** → add e.g. `img.patel-markt.de`.
- Use `https://img.patel-markt.de` as the public URL.

## 3. Create an API token

1. R2 → **Manage R2 API Tokens** → **Create API token**.
2. Permission: **Object Read & Write**, scoped to this bucket.
3. Copy the **Access Key ID** and **Secret Access Key** (shown once).
4. Your **Account ID** is on the R2 overview page.

## 4. Fill in `.env.local`

```env
R2_ACCOUNT_ID=<account id>
R2_ACCESS_KEY_ID=<access key id>
R2_SECRET_ACCESS_KEY=<secret access key>
R2_BUCKET=product-images
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev          # no trailing slash
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev   # same value (hero image, client-side)
```

`R2_*` are server-only. `NEXT_PUBLIC_R2_PUBLIC_URL` is the same public URL,
exposed to the browser for the hero image. Restart `npm run dev` after editing.

## 5. Migrate existing images (one-off)

Copies all current images from Supabase Storage to R2 and re-points the
`products.image` URLs. Safe dry-run first:

```bash
npm run migrate:r2          # dry run — reports what would happen
npm run migrate:r2:apply    # actually copy files + update DB
```

After verifying the storefront shows all images, you can delete the old files
from the Supabase `product-images` bucket to free the quota (e.g. via the
Supabase dashboard, or `npm run clean:images:apply` once nothing references
them).

## How it works in the app

- **Upload** (`app/api/admin/upload/route.ts`) → writes to R2, returns the public URL.
- **Delete / image swap** (`app/api/admin/products/route.ts`) → `removeUploadedImage`
  deletes the backing R2 object (and still cleans up any legacy Supabase files).
- `lib/storage/r2.ts` holds the R2 client and helpers.
- Admin panel behaviour is unchanged — add/edit/delete/upload all work the same.
