# Supabase Setup (Database + Auth + Admin + Orders)

The store works without Supabase (static catalogue, no accounts). To enable the
admin panel, user accounts, persisted orders, and live stock management, connect
a Supabase project once.

## 1. Create a project

1. Go to <https://supabase.com> → **New project**.
2. After it provisions, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ server-only secret — never commit or expose it to the browser)

## 2. Configure env

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Admin (seller) login — change the secret in production
ADMIN_USERNAME=patelmarkt
ADMIN_PASSWORD=patelmarktadmin
ADMIN_SESSION_SECRET=<long-random-string>
```

## 3. Create the schema

Open **SQL Editor** in Supabase, paste the contents of [`supabase/schema.sql`](../supabase/schema.sql),
and run it. This creates the `products`, `profiles`, and `orders` tables with
Row Level Security and the signup trigger that auto-creates a profile.

## 4. Email auth settings (optional)

In **Authentication → Providers → Email**, you can toggle "Confirm email". If
left on, new users must confirm via email before a session is created (the
register page shows a "check your email" message). For quick testing you may
turn it off.

## 5. Seed the catalogue

1. Start the app (`npm run dev`) and go to **`/admin`**.
2. Log in with `patelmarkt` / `patelmarktadmin`.
3. Click **Import catalogue** — this upserts the products from `lib/products.ts`
   into the database (stock defaults to 50). From then on, edit stock, prices,
   add, or delete products from the admin panel.

## Security notes

- All tables have **RLS enabled**. The public can only *read* products.
  Customers can only read their **own** profile and orders.
- All privileged writes (product CRUD, order inserts, reading every order) go
  through the **service-role key**, which is used **only** in server-side route
  handlers under `app/api/*`. It is never imported into client code.
- The admin session is an **httpOnly, SameSite=Lax** cookie holding an HMAC
  token (not the password). Set a strong `ADMIN_SESSION_SECRET` in production.
- Customer details are sent to the server in a **POST body**, never in a URL, so
  they don't leak into browser history, referrers, or access logs.
