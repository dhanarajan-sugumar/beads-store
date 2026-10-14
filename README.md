# Madhis Handcrafts — Handmade Beads Jewellery Store

An elegant, quiet-luxury online catalogue and WhatsApp ordering system for **Madhis Handcrafts**, a handmade bead jewellery boutique in India.

Built with a mobile-first philosophy, this platform enables customers to discover handcrafted necklaces and bracelets, curate an order, and seamlessly share it directly on WhatsApp or generate a printable A4 PDF order summary.

---

## ✨ Features

- **Quiet-Luxury Boutique Aesthetics**: Custom design tokens (warm ivory `#FAF5EC`, rich ink `#2B2623`, gold `#B08D57`, and deep oxblood `#6B1F2A`) with refined Cormorant Garamond and Jost typography.
- **Mobile-First Responsive Grid**: Optimized for 360px phones up to 4K desktops. 4:5 portrait cards with subtle 600ms hover zoom, visible touch targets ($\ge 44\text{px}$), and instant visibility above the fold.
- **Category Tabs & Instant Filtering**: Smooth, sticky filter tabs for *All*, *Necklaces*, *Bracelets*, and *Other* with real-time product counts.
- **Interactive Shopping Bag & Stepper**: Client-side persisted shopping cart with quantity stepper (`- 1 +`), animated badge indicators, and accessible toast alerts.
- **One-Tap WhatsApp Ordering**: Directly routes pre-filled order summaries (item names, SKUs, quantities, and prices) to the store's WhatsApp number (`+91 99447 17970`).
- **Client-Side PDF Generator**: Generates clean, printable A4 order invoices via `jsPDF` with product photos, order reference codes, and payment instructions.
- **Secure Admin Management Portal (`/admin`)**:
  - Protected by Supabase Auth and database-level Row Level Security (`is_admin()` security definer function).
  - Product catalog CRUD: add new items, edit details, adjust sort order, and toggle active visibility.
  - In-browser client-side WebP compression (<200KB, max 1200px) and direct Supabase Storage uploads.
- **Production Edge Hosting**: Zero-config single-page application (SPA) routing for Cloudflare Pages with `_redirects` fallback.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Blazing fast client-side SPA with TypeScript |
| **Styling & Design Tokens** | Tailwind CSS v3 | Custom token palette, Cormorant Garamond, Jost fonts |
| **State & Persistence** | React Context + LocalStorage | Resilient offline cart state with JSON error handling |
| **PDF Generation** | `jsPDF` | Browser-based A4 document generation |
| **Backend & Database** | Supabase (PostgreSQL) | Managed database in Mumbai/Singapore region |
| **Security & Auth** | PostgreSQL RLS + Supabase Auth | Strict database policies, public read for active items |
| **Asset Storage** | Supabase Storage (`product-images`) | Public read bucket with authenticated admin write access |
| **Hosting** | Cloudflare Pages | Global edge CDN, automated Git CI/CD, SSL/TLS |

---

## 📁 Repository Structure

```text
beads-store/
├── README.md                      # Project documentation and quickstart guide
├── .env.example                   # Environment variable template
├── docs/
│   ├── setup.md                   # Database migrations, RLS verification, & admin setup
│   ├── deploy.md                  # Comprehensive Cloudflare Pages deployment guide
│   └── decisions.md               # Architecture Decision Records (ADRs)
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql          # Core tables, RLS policies, triggers, & grants
│   └── seed.sql                   # Sample product dataset for initial setup
└── web/                           # React frontend application
    ├── public/
    │   ├── _redirects             # Cloudflare Pages SPA rewrite rule
    │   ├── logo.png               # Official boutique brand logo
    │   ├── favicon.ico            # Multi-resolution browser favicon
    │   └── og-image.png           # Social share & WhatsApp OpenGraph preview
    ├── src/
    │   ├── components/            # UI components (catalogue, cart, admin, layout)
    │   ├── context/               # CartContext and ToastContext
    │   ├── hooks/                 # Custom React hooks (useProducts, useAdminAuth)
    │   ├── lib/                   # Supabase client singleton
    │   ├── utils/                 # PDF generator, image compressor, formatters
    │   └── types/                 # Database and entity TypeScript definitions
    └── package.json
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18 or v20+
- **npm**: v9+
- A configured Supabase project (see [`docs/setup.md`](docs/setup.md))

### 2. Installation
Clone the repository and install frontend dependencies:
```bash
git clone https://github.com/dhanarajan-sugumar/beads-store.git
cd beads-store/web
npm install
```

### 3. Configure Environment Variables
Copy the example environment file inside `web/`:
```bash
cp ../.env.example .env.local
```
Update `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SHOP_NAME=Madhis Handcrafts
VITE_WHATSAPP_NUMBER=+91 99447 17970
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Code Quality

The codebase enforces strict quality gates:

```bash
# Run unit tests (Cart math, formatters, storage resilience, compression)
npm run test

# Type checking (Strict TypeScript without emit)
npm run typecheck

# Code linting (ESLint 9 rules)
npm run lint

# Production build test
npm run build
```

---

## 🔒 Database & Security Model

The backend is secured using Supabase Row Level Security (RLS) with explicit table grants. Security is enforced strictly in PostgreSQL so future platforms (such as the planned Flutter mobile app) inherit identical rules:

1. **Anonymous Public Access**:
   - `SELECT` allowed on `public.products` **only where `active = true`**.
   - No access to `admin_users` or inactive draft products.
2. **Admin Operations**:
   - Access to `INSERT`, `UPDATE`, and `DELETE` on `public.products` requires the user UID to exist in `public.admin_users`.
   - Evaluated securely via `public.is_admin()` Security Definer function.
3. **Storage Security**:
   - `product-images` bucket allows public image reads.
   - File uploads and deletions require verified admin authorization.

For full database migration steps and SQL instructions, see [`docs/setup.md`](docs/setup.md).

---

## 🌐 Production Deployment

The web app is deployed as a static Single Page Application on **Cloudflare Pages**:
- **Build Command**: `npm run build`
- **Root Directory**: `web`
- **Output Directory**: `dist`
- **SPA Routing**: Handled via `web/public/_redirects` (`/* /index.html 200`).

For detailed instructions on configuring Cloudflare Pages, custom domains, and SSL certificates, refer to the [Cloudflare Pages Deployment Guide](docs/deploy.md).

---

## 📄 License

Private repository for Madhis Handcrafts. All rights reserved.
