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

## 🚀 Deployment

### Backend (Supabase)
1. **Database:** Go to the SQL Editor in your Supabase Dashboard and run the contents of `supabase/migrations/20240528000000_initial_schema.sql` to initialize the tables, RLS policies, and triggers.
2. **Storage:** Manually create the following public buckets in the Storage section:
   - `avatars`
   - `projects`
   - `research`
   - `surveys`
   - `thumbnails`
   - `documents`
3. **Authentication:**
   - Enable **Google** as an Auth Provider.
   - Configure the Client ID and Secret in the Supabase Dashboard.
   - Add your production URL (e.g., `https://nova-community.vercel.app/auth/callback`) to the Google Cloud Console "Authorized redirect URIs".

### Frontend (Vercel)
1. **Connect Repository:** Import your project into Vercel.
2. **Environment Variables:** Add the following to your Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
3. **Build Settings:** Vercel will automatically detect Next.js settings. Click **Deploy**.

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
