# Setup & Database Instructions

Follow these steps to configure your Supabase backend and verify Row Level Security (RLS) policies.

---

## 1. Run Schema Migration

1. In your **Supabase Dashboard**, navigate to the **SQL Editor** (`/project/<project-ref>/sql`).
2. Open or paste the contents of `supabase/migrations/0001_init.sql`.
3. Click **Run**.
4. Confirm execution succeeds without errors. This creates:
   - `admin_users` table with RLS enabled
   - `is_admin()` security definer function
   - `products` table with RLS enabled and `updated_at` trigger
   - Explicit table grants (`anon`, `authenticated`)
   - Storage bucket `product-images` with admin-only upload/modify policies and public read access

---

## 2. Seed Initial Products

1. In the **SQL Editor**, open or paste `supabase/seed.sql`.
2. Click **Run**.
3. Go to **Table Editor** > `products` to confirm 3 sample products are populated.

---

## 3. Create Admin User

1. In the Supabase Dashboard, go to **Authentication** > **Users**.
2. Click **Add user** > **Create user**.
3. Enter your admin email and a secure password (make sure **Auto Confirm User** is checked).
4. After creation, copy the user's **User UID** (e.g. `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).
5. Open the **SQL Editor** and run:
   ```sql
   insert into public.admin_users (user_id)
   values ('<PASTE_COPIED_USER_UID_HERE>');
   ```
6. Verify the user is registered by running:
   ```sql
   select * from public.admin_users;
   ```

---

## 4. Verify Row Level Security (RLS)

You can verify RLS directly in the SQL Editor using role switching:

### Check Anonymous Access:
```sql
-- Switch to anon role
set role anon;

-- Should return all active products:
select id, name, price_inr, active from public.products;

-- Should FAIL or return 0 rows:
insert into public.products (name, price_inr) values ('Unauthorized Product', 100);

-- Should FAIL (permission denied):
select * from public.admin_users;

-- Reset role
reset role;
```

### Check Authenticated Non-Admin Access:
```sql
-- Test query for is_admin() function
select public.is_admin(); -- returns false when unauthenticated or non-admin
```

---

## 5. Local Frontend Setup

1. Copy `.env.example` to `.env.local` inside `/web`:
   ```bash
   cp ../.env.example .env.local
   ```
2. Fill in your environment variables:
   - `VITE_SUPABASE_URL`: e.g. `https://<project-ref>.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: e.g. `sb_publishable_...`
   - `VITE_SHOP_NAME`: `Madhis Handcrafts`
3. Install dependencies and start the development server:
   ```bash
   cd web
   npm install
   npm run dev
   ```
