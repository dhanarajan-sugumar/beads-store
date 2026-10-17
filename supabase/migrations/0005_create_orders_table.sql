-- 0005_create_orders_table.sql: Create orders and order_items tables with RLS for express checkout and order logging

-- 1. Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  total_amount numeric not null check (total_amount >= 0),
  status text not null default 'new' check (status in ('new', 'contacted', 'paid', 'shipped', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to maintain updated_at on orders
drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function public.handle_updated_at();

-- 2. Create order_items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_title text not null,
  product_sku text,
  unit_price numeric not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

-- 3. Indexes for queries
create index if not exists idx_orders_order_ref on public.orders(order_ref);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- 4. Enable Row Level Security (RLS)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- 5. Explicit table GRANTs
grant insert on public.orders to anon, authenticated;
grant insert on public.order_items to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
grant select, update, delete on public.order_items to authenticated;

-- 6. RLS Policies for orders
-- Anyone (visitors placing an order) can insert
create policy "Anyone can insert an order"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Admins can view all orders
create policy "Admins can select all orders"
  on public.orders for select
  to authenticated
  using (public.is_admin());

-- Admins can update orders
create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete orders
create policy "Admins can delete orders"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- 7. RLS Policies for order_items
-- Anyone can insert items for an order
create policy "Anyone can insert order items"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

-- Admins can view all order items
create policy "Admins can select all order items"
  on public.order_items for select
  to authenticated
  using (public.is_admin());

-- Admins can update order items
create policy "Admins can update order items"
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete order items
create policy "Admins can delete order items"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());
