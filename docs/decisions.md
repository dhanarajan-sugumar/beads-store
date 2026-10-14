# Architecture & Technical Decisions

## 1. Supabase as Unified Backend
- **Context:** Madhis Handcrafts needs a low-cost, scalable backend on free tiers, with a future Flutter mobile app sharing the same backend.
- **Decision:** Use Supabase PostgreSQL with Row Level Security (RLS) and Storage. All data security lives at the database layer rather than React UI.
- **Key Strategy:** Supabase new publishable key model (`VITE_SUPABASE_PUBLISHABLE_KEY`), with tables defaulting to RLS enabled and explicit SQL GRANT statements for `anon` and `authenticated` roles.

## 2. Web Frontend Architecture
- **Stack:** React + TypeScript + Vite + Tailwind CSS + React Router.
- **Static Hosting:** Cloudflare Pages with single-page app (SPA) fallback (`_redirects`).
- **Cart & PDF:** Client-side cart state with safe localStorage persistence; client-side PDF generation using `jspdf` for easy WhatsApp / Web Share API sharing.
