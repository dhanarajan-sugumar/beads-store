# Beads Store — Madhis Handcrafts

Online catalogue and ordering workflow for handmade beads jewellery from Madhis Handcrafts (family business in India).

## Tech Stack
- **Web App**: React, TypeScript, Vite, Tailwind CSS, React Router
- **Backend / Database**: Supabase (PostgreSQL, Auth, Storage) with Row Level Security (RLS)
- **PDF Generation**: jsPDF (client-side export for WhatsApp order sharing)
- **Hosting**: Cloudflare Pages (static SPA)
- **Mobile**: Flutter app planned for later phase

## Monorepo Layout
- `/web`: React frontend application
- `/supabase`: SQL migrations, RLS policies, and seed data
- `/docs`: Documentation (setup, deploy, decisions)
- `/mobile`: Planned Flutter application
