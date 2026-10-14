# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-10-14
### Added
- Protected `/admin` management portal with Supabase Auth (email/password).
- Database-level authorization via `is_admin()` RPC; unauthorized users are cleanly rejected and signed out.
- Product CRUD operations: Create, Read, Update, Delete with confirmation modal, and 1-click active/hidden toggle.
- In-browser WebP image compressor (`imageCompressor.ts`, max 1200px, quality 0.85, <= 200KB) with Supabase Storage upload to `product-images` bucket.
- Storefront category filter pills (`All`, `Necklaces`, `Bracelets`, `Other`) with live item count badges.
- System-generated SKU format (`NL-`, `BR-`, `OT-`) mapped to product categories with auto-generation and manual override.
- Synchronized SKU display across product cards, detail modal, cart drawer, PDF order documents, and WhatsApp order messages.
- Full-screen lightbox image viewer on dark backdrop with ESC dismissal.
- Restored uniform edge-to-edge card tiles on catalogue grid while preserving uncropped views in modal.
- Supabase migration `0002_add_sku_and_category.sql` for category & SKU indexing and backfill.

## [0.4.0] - 2026-10-14
### Added
- Browser-side A4 PDF order document generation using `jsPDF` with item photos and totals.
- Synchronized unique Order Reference code (e.g. `MH-779654`) across PDF and WhatsApp messages.
- WhatsApp message builder for instant 1-click order transmission.
- Dedicated `OrderShareModal` presenting clear alternatives: direct WhatsApp order transmission OR A4 PDF document download.
- Automatic closing of the Cart Drawer when launching the share dialog to eliminate visual overlap.

## [0.3.0] - 2026-10-14
### Added
- Persistent shopping cart state in React via `CartContext` and `useCart`.
- Safe `localStorage` utility `cartStorage.ts` with error resilience against blocked storage/private browsing.
- Accessible off-canvas `CartDrawer` with keyboard dismissal, focus management, and touch targets >= 44px.
- Real-time line item quantity increment/decrement controls, line totals, and grand total.
- Dynamic cart count badge in the Header.
- Comprehensive unit test suite for cart persistence and error edge cases.

## [0.2.0] - 2026-10-14
### Added
- Responsive product catalogue grid (2 columns on mobile, 3 on tablet, 4 on desktop).
- Supabase live data hook `useProducts` querying active items with RLS.
- Accessible `ProductCard` component with INR pricing, lazy loading, and broken image fallbacks.
- Shimmer pulse loading skeleton `ProductSkeleton`.
- Empty and error states with a retry mechanism.
- Full product detail modal (`ProductDetailModal`) with accessibility (ESC key, focus trapping, backdrop dismiss).

## [0.1.0] - 2026-10-14
### Added
- Monorepo structure with `/web`, `/supabase`, `/docs`, `/mobile`.
- Supabase schema `0001_init.sql` for products and admin users with explicit RLS, `is_admin()` security definer function, updated_at trigger, and storage policies.
- Supabase seed script `seed.sql` with 3 placeholder products.
- Setup documentation in `docs/setup.md` and architecture decisions in `docs/decisions.md`.
- Vite + React 18 + TypeScript + Tailwind CSS web application.
- Strict environment variable validation and sanitization in `web/src/config/env.ts`.
- Responsive layout with Header (accessible touch targets >= 44px) and Footer.
- Typed Supabase client and database schema definitions.
- Unit tests for cart math calculations and INR currency formatting (`₹1,299`).
