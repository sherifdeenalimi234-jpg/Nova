# NOVA COMMUNITY

**A Futuristic Innovation Ecosystem Operating System**

NOVA Community is a cinematic, research-driven platform designed to foster collaboration between innovators, researchers, and creators. Built with a mobile-first priority, it provides a premium, immersive experience for exploring and sharing innovation.

## 🚀 Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS 4, Framer Motion, Lucide React.
- **Backend:** Supabase (PostgreSQL, Auth, Storage).
- **Authentication:** Google OAuth via Supabase SSR.
- **Maps:** OpenStreetMap + Leaflet (Phase 8).
- **Analytics:** Recharts (Phase 2/6).
- **Exports:** SheetJS (Phase 6).

## 🏗️ Architecture

### Database Schema
The platform uses a robust PostgreSQL schema managed via Supabase migrations. Key tables include:
- `users` & `profiles`: Core identity system.
- `posts`: Curated content feed (Research, Projects, AI Visuals, etc.).
- `projects` & `surveys`: Innovation showcase and research intelligence.
- `premium_requests`: Manual verification flow for "Verified Creator" access.

### Authentication & Security
- **OAuth:** Secure Google Sign-In with persistent session management.
- **Middleware:** Server-side protection for sensitive routes (e.g., `/admin`).
- **RLS:** Row Level Security policies ensure users can only modify their own data, while public content is read-only.

## 🛠️ Getting Started

### Prerequisites
- Node.js (Latest LTS)
- npm or yarn
- A Supabase Project

### Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Installation
```bash
npm install
npm run dev
```

## 📅 Roadmap

- [x] **Phase 1: Foundation System** - Secure infrastructure, Auth, and DB Schema.
- [ ] **Phase 2: Admin Control Center** - Ecosystem monitoring and moderation.
- [ ] **Phase 3: User Profile System** - Professional innovation identities.
- [ ] **Phase 4: Creator Access System** - Monetization and verified tools.
- [ ] **Phase 5: Posting & Feed System** - Curated research stream.
- [ ] **Phase 6: Survey Intelligence System** - Data collection and analytics.
- [ ] **Phase 7: Collaboration System** - Creator networking.
- [ ] **Phase 8: Cinematic Experience System** - Immersive UI polish.

## 🛡️ Admin Access
The primary administrator is whitelisted by email: `sherifdeenalimititilope@gmail.com`. Admin privileges are automatically assigned upon first sign-in via triggers.

---
Built with ⚡ by the NOVA Team.
