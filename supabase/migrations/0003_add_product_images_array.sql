-- 0003_add_product_images_array.sql: Add images array column to products table

-- 1. Add images column as text[] with default empty array
alter table public.products
  add column if not exists images text[] not null default '{}';

-- 2. Backfill existing image_url values into images array
update public.products
set images = array[image_url]
where image_url is not null
  and (images is null or cardinality(images) = 0);
