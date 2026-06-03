# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Environment Variables

Copy `.env.example` to `.env.local`. Required keys:

- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe payments
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — PayPal payments
- `NEXT_PUBLIC_STORE_URL` — Base URL (e.g. `https://patel-markt.de`)
- `NEXT_PUBLIC_BANK_IBAN` / `NEXT_PUBLIC_BANK_BIC` / `NEXT_PUBLIC_BANK_NAME` — Bank transfer display info
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase (DB + user auth). `SUPABASE_SERVICE_ROLE_KEY` is server-only, never exposed to the client.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` — seller admin login (defaults: `patelmarkt` / `patelmarktadmin`). Set a strong `ADMIN_SESSION_SECRET` in production.
- `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_MERCHANT_NUMBER` — WhatsApp Cloud API for server-side order delivery.

See `docs/SETUP-SUPABASE.md` for first-time Supabase setup (schema + seeding). The app degrades gracefully: with Supabase unset, the storefront uses the static catalogue and auth/admin features are hidden/disabled.

## Architecture

**Patel Markt** is a Next.js 14 (App Router) e-commerce store for Indian grocery products, targeting German-speaking customers (DE/AT/CH).

### Routing & i18n

All pages live under `app/[locale]/` with locales `de` (default), `en`, `hi`. The `next-intl` middleware in `middleware.ts` handles locale detection and routing. Translation strings are in `messages/{de,en,hi}.json`. Use `useTranslations()` in client components and `getTranslations()` in server components.

### Product Data

`lib/products.ts` holds the static catalogue (bilingual `name`/`nameDE`, `description`/`descriptionDE`, plus the `categories` array and `categoryEmoji` map). This is the **seed + fallback**. When Supabase is configured, the live catalogue lives in the `products` table and is read via `lib/catalog.ts#getProducts()` (DB → `Product` mapping, with static fallback). The storefront fetches the live list from `GET /api/products`; the admin panel manages it.

### Auth, Admin & Persistence (Supabase)

- **Clients:** `lib/supabase/{client,server,admin}.ts` (browser / cookie-based server / service-role server-only). `lib/supabase/config.ts#isSupabaseConfigured()` gates all Supabase features.
- **Schema:** `supabase/schema.sql` — `products` (public read), `profiles` (RLS: own row), `orders` (RLS: own read). All writes go through the service-role key in server routes; RLS blocks everything else.
- **User auth:** Supabase Auth email/password. Pages: `app/[locale]/{register,login,account}`. Registration metadata (full name, phone, address) creates a `profiles` row via DB trigger. `Header.tsx` reflects auth state.
- **Admin:** `app/admin` (outside `[locale]`, excluded from the intl middleware matcher). Hardcoded-credential gate via `lib/admin-auth.ts` (HMAC token in an httpOnly cookie). `/admin` server-guards and redirects to `/admin/login`. Admin APIs under `app/api/admin/*` (login/logout/products/orders/seed) re-check the cookie and use the service-role client.
- **Orders:** `POST /api/order` recomputes totals server-side, persists to `orders` (service role, attaching `user_id` if signed in), and notifies the merchant via WhatsApp Cloud API. Customer PII travels in the POST body — never a URL.

### Cart State

`lib/store.ts` exports `useCartStore` — a Zustand store with `persist` middleware that saves to `localStorage` under the key `patel-markt-cart`. Cart open/close state is also managed here. This is client-side only (`'use client'`).

### Payment Flow

1. User reviews cart at `/[locale]/cart`
2. Cart page calls `POST /api/checkout` with `{ items, locale }` → creates a Stripe Checkout Session
3. User is redirected to Stripe's hosted checkout (supports card + PayPal)
4. On success, Stripe redirects to `/?order=success`; webhook at `/api/webhook` handles `checkout.session.completed` (currently just logs — no DB persistence yet)
5. Bank transfer details are shown as a static alternative using `NEXT_PUBLIC_BANK_*` env vars

Shipping is EUR only, restricted to DE/AT/CH. Free shipping threshold and standard shipping (€4.99) are hardcoded in `app/api/checkout/route.ts`.

### Styling

Tailwind CSS with a custom palette: `brand` (#e31e25 red), `saffron` (orange scale), `maroon` (red scale). Font is Inter. Hero section uses an inline SVG background pattern via `bg-hero-pattern`.

### Key Components

- `components/Header.tsx` — nav with cart icon badge, language switcher
- `components/CartSidebar.tsx` — slide-out cart drawer driven by `useCartStore`
- `components/ProductCard.tsx` — product tile with add-to-cart
- `components/CategoryGrid.tsx` — category browse grid
- `components/LanguageSwitcher.tsx` — locale toggle using `next-intl`'s `useRouter`

### Image Handling

Product images mix local files (`/public/images/products/`) and external CDN URLs (spicevillage.eu, jamoona.com). Remote hostnames are whitelisted in `next.config.mjs`. `images.unoptimized: true` is set — Next.js image optimization is disabled.
