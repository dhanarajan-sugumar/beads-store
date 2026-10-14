-- 0001_init.sql: Initial schema for beads-store (Madhis Handcrafts)

-- 1. Helper function for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. Admin users table (references auth.users)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Enable RLS explicitly on admin_users
alter table public.admin_users enable row level security;

-- 3. Security definer function to check admin status without recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- Grant execution of is_admin function to anon and authenticated
grant execute on function public.is_admin() to anon, authenticated;

-- 4. Products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_inr integer not null check (price_inr >= 0),
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS explicitly on products
alter table public.products enable row level security;

-- Trigger to maintain updated_at on products
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row
  execute function public.handle_updated_at();

-- 5. Explicit table GRANTs
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant select on public.admin_users to authenticated;

-- 6. RLS Policies for products
-- Public / Anon & Authenticated can view active products
create policy "Active products are viewable by everyone"
  on public.products for select
  using (active = true);

-- Admins can view all products (including inactive)
create policy "Admins can select all products"
  on public.products for select
  to authenticated
  using (public.is_admin());

-- Admins can insert products
create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

-- Admins can update products
create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete products
create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- 7. RLS Policies for admin_users
-- Logged-in user can only select their own row; no client writes permitted
create policy "Logged-in users can select own admin row"
  on public.admin_users for select
  to authenticated
  using (auth.uid() = user_id);

-- 8. Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Public read access for images in the product-images bucket
create policy "Public read access on product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Admin write access for images in the product-images bucket
create policy "Admins can insert product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
