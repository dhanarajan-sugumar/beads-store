-- 0002_add_sku_and_category.sql: Add category and SKU to products

-- 1. Add columns to products table
alter table public.products
  add column if not exists category text not null default 'other',
  add column if not exists sku text;

-- 2. Indexes for category and SKU
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_sku on public.products(sku);

-- 3. Backfill sample existing data
update public.products
set category = 'bracelet', sku = 'BR-101'
where name ilike '%bracelet%' and (sku is null or sku = '');

update public.products
set category = 'necklace', sku = 'NL-101'
where name ilike '%necklace%' and (sku is null or sku = '');

update public.products
set category = 'other', sku = concat('OT-', floor(100 + random() * 899)::int)
where sku is null or sku = '';
