-- Patel Markt database schema.
-- Run this in the Supabase SQL editor (or `supabase db push`) once after
-- creating your project.

-- ─────────────────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id            text primary key,
  name          text not null,
  name_de       text not null default '',
  description   text not null default '',
  description_de text not null default '',
  price         numeric(10,2) not null default 0,
  unit          text not null default '',
  category      text not null,
  image         text not null default '',
  in_stock      boolean not null default true,
  stock_qty     integer not null default 0,
  featured      boolean not null default false,
  brand         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.products enable row level security;

-- Anyone may read the catalogue.
drop policy if exists "products are public" on public.products;
create policy "products are public"
  on public.products for select
  using (true);

-- Writes happen only through the service-role key (admin API), which bypasses
-- RLS — so no public insert/update/delete policies are defined on purpose.

-- ─────────────────────────────────────────────────────────────────────────
-- PROFILES  (extends auth.users with contact/delivery details)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  phone      text not null default '',
  address    text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "users upsert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a user signs up, using the metadata passed at
-- registration time.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'address', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  customer_name  text not null,
  phone          text not null,
  address        text not null,
  items          jsonb not null,
  subtotal       numeric(10,2) not null default 0,
  shipping       numeric(10,2) not null default 0,
  total          numeric(10,2) not null default 0,
  status         text not null default 'new',
  created_at     timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Logged-in customers can read their own orders.
drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Order inserts and admin reads go through the service-role key.

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
