# Cloudflare Pages Deployment Guide

This guide outlines the exact, step-by-step procedure for deploying **Madhis Handcrafts** (`beads-store`) to **Cloudflare Pages** with custom domains, automatic SSL/TLS, and client-side single-page application (SPA) routing.

---

## 1. Architecture & Hosting Overview

- **Hosting Platform**: Cloudflare Pages (Free tier, global edge CDN, unlimited bandwidth).
- **Backend & Database**: Supabase (Postgres with Row Level Security, Supabase Auth, Storage bucket for compressed WebP photos).
- **Client Application**: React 18 + Vite + TypeScript + Tailwind CSS with SPA fallback.
- **Routing**: Single Page Application (SPA) handled by React Router via Cloudflare `_redirects`.

---

## 2. Prerequisites

Before deploying, ensure you have:
1. **GitHub Repository**: [dhanarajan-sugumar/beads-store](https://github.com/dhanarajan-sugumar/beads-store) with your latest code on `main`.
2. **Cloudflare Account**: [dash.cloudflare.com](https://dash.cloudflare.com).
3. **Supabase Project Credentials**:
   - `VITE_SUPABASE_URL`: (e.g., `https://hkgzmjzqbnqvbwaqsqmb.supabase.co`)
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: (e.g., `sb_publishable_...`)
   - Completed schema migration (`supabase/migrations/0001_init.sql`) and admin user creation in `public.admin_users`.

---

## 3. Step-by-Step Cloudflare Pages Setup

### Step 1: Connect GitHub Repository
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. On the left sidebar, click **Workers & Pages**.
3. Click **Create application** > select the **Pages** tab > click **Connect to Git**.
4. Select your GitHub account and choose the repository: **`dhanarajan-sugumar/beads-store`**.
5. Click **Begin setup**.

---

### Step 2: Build & Deployment Settings

Configure the build parameters exactly as follows:

| Field | Setting | Explanation |
| :--- | :--- | :--- |
| **Project Name** | `madhis-handcrafts` (or `beads-store`) | Subdomain for `*.pages.dev` |
| **Production Branch** | `main` | Deploys automatically on merge to `main` |
| **Framework Preset** | `Vite` (or `None`) | Standard Vite configuration |
| **Root Directory** | `web` | **Important**: Tells Cloudflare the app is inside `/web` |
| **Build Command** | `npm run build` | Runs `tsc && vite build` |
| **Build Output Directory** | `dist` | Relative to the root directory (`web/dist`) |

---

### Step 3: Configure Environment Variables

Under **Environment variables (advanced)**, add the following variables for both **Production** and **Preview**:

| Variable Name | Required | Example / Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | `https://<project-ref>.supabase.co` | Your Supabase Project API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Yes** | `sb_publishable_...` | Supabase Publishable Key |
| `VITE_SHOP_NAME` | No | `Madhis Handcrafts` | Brand name displayed across UI & PDFs |
| `VITE_WHATSAPP_NUMBER` | No | `+91 99447 17970` | Destination WhatsApp number for orders |
| `VITE_INSTAGRAM_URL` | No | `https://instagram.com/...` | (Optional) Instagram profile URL |
| `NODE_VERSION` | Recommended | `20` | Ensures modern Node.js runtime |

> [!IMPORTANT]
> Never put Supabase secret or service-role keys into frontend environment variables. Only use the client `publishable` key (`sb_publishable_...`).

---

### Step 4: Deploy and Verify
1. Click **Save and Deploy**.
2. Cloudflare Pages will clone the repository, install dependencies, run `npm run build`, and publish your site in ~60-90 seconds.
3. Once deployed, Cloudflare will output your public URL:
   ```
   https://madhis-handcrafts.pages.dev
   ```

---

## 4. Single-Page Application (SPA) Routing Verification

Cloudflare Pages automatically reads the [`web/public/_redirects`](../web/public/_redirects) file during the build and copies it to `dist/_redirects`.

The rule is:
```text
/* /index.html 200
```

### Verification Test:
- Navigate to `https://madhis-handcrafts.pages.dev/admin`.
- Press **Refresh (F5 / Cmd+R)**.
- If SPA routing is working correctly, the Admin Login view will load without returning a 404 Not Found error.

---

## 5. Setting Up a Custom Domain

To link your boutique domain (e.g. `madhishandcrafts.com` or `shop.madhishandcrafts.com`):

1. In the Cloudflare Pages project dashboard, click the **Custom domains** tab.
2. Click **Set up a custom domain**.
3. Enter your domain name (e.g., `shop.madhishandcrafts.com`).
4. **If your domain's DNS is managed by Cloudflare**:
   - Cloudflare automatically adds the required CNAME record and issues a free Universal SSL/TLS certificate.
5. **If your domain is with an external registrar (e.g. GoDaddy, Namecheap)**:
   - Add a `CNAME` record in your DNS provider:
     - **Name / Host**: `shop` (or `@` for apex)
     - **Target**: `<your-project>.pages.dev`
   - Wait 5-15 minutes for DNS propagation and certificate validation.
6. Ensure **SSL/TLS encryption mode** is set to **Full** or **Full (Strict)** under SSL/TLS settings.

---

## 6. Production Health Checklist

Perform this 5-minute sanity check on your deployed production site:

- [ ] **Storefront Catalogue**: Products display with correct photos, names, and prices in INR (₹).
- [ ] **Category Filtering**: Switching between `All`, `Necklaces`, `Bracelets`, and `Other` filters correctly.
- [ ] **Add to Order**: Quantity stepper increments, toast notification appears, and cart badge updates.
- [ ] **WhatsApp Direct Messaging**: Clicking "Open WhatsApp & Send Order" opens WhatsApp with `+91 99447 17970` and pre-filled order text.
- [ ] **A4 PDF Download**: Clicking "Download Order PDF" produces a high-res printable summary with items, order reference, and contact number.
- [ ] **Admin Portal Security**:
  - Direct URL `/admin` loads without 404.
  - Logging in with non-admin credentials shows "Access Denied".
  - Logging in with admin credentials shows product list and allows adding, editing, and uploading photos.
