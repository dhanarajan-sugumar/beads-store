# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
