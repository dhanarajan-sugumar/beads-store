-- 0004_add_stock_status.sql: Add stock_status column to products table

-- 1. Add stock_status column with check constraint and default 'in_stock'
alter table public.products
  add column if not exists stock_status text not null default 'in_stock'
  check (stock_status in ('in_stock', 'made_to_order', 'out_of_stock'));

-- 2. Index for stock_status queries
create index if not exists idx_products_stock_status on public.products(stock_status);
