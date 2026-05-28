# 🏁 Production Deployment Checklist

Follow these steps to ensure a secure and functional production environment for NOVA Community.

## 1. Supabase Initialization
- [ ] Create a new Supabase Project.
- [ ] Run the initial migration SQL from `/supabase/migrations/` in the Supabase SQL Editor.
- [ ] Create public storage buckets: `avatars`, `projects`, `research`, `surveys`, `thumbnails`, `documents`.
- [ ] Verify that the `handle_new_user` trigger is active in the `auth.users` table.

## 2. Google OAuth Configuration
- [ ] Create a Project in the [Google Cloud Console](https://console.cloud.google.com/).
- [ ] Configure the OAuth Consent Screen (External).
- [ ] Create OAuth 2.0 Client IDs (Web application).
- [ ] In Google Console, add `https://<your-project>.supabase.co/auth/v1/callback` to Authorized Redirect URIs.
- [ ] In Supabase Dashboard (Auth > Providers > Google), enter the Client ID and Secret.

## 3. Vercel Frontend Deployment
- [ ] Push your code to a GitHub/GitLab/Bitbucket repository.
- [ ] Import the project into [Vercel](https://vercel.com).
- [ ] Add Environment Variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deploy the project.

## 4. Post-Deployment Verification
- [ ] Test the Cinematic Intro flow on mobile.
- [ ] Verify Google Sign-In redirects correctly to the Main Hub.
- [ ] Sign in with the admin email (`sherifdeenalimititilope@gmail.com`) and verify access to `/admin`.
- [ ] Create a test post and verify it appears in the Admin moderation queue.
- [ ] Request "Creator Access" and approve it via the Admin dashboard.
- [ ] Test Survey creation and analytics visualization.

## 5. Security Audit
- [ ] Confirm RLS (Row Level Security) is enabled on all tables.
- [ ] Ensure `service_role` keys are NEVER exposed in the frontend.
- [ ] Verify that `/admin` and `/settings` are protected by Middleware.
