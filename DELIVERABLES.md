# PROJECT VISIBILITY REBUILD DELIVERABLES

## 1. Audit Report & 2. Root Cause Analysis
Located in [PROJECT_VISIBILITY_AUDIT.md](./PROJECT_VISIBILITY_AUDIT.md).

## 3. Frontend Changes
- **Explore Page (`app/projects/explore/page.tsx`)**: Removed `status = 'Active'` filter. Now shows all Public projects immediately.
- **Admin Content Management (`app/admin/content/page.tsx`)**: Replaced "Pending" queue with a "Recent Content" feed for reactive moderation.
- **Moderation UI (`components/admin/ContentModeration.tsx`)**: Updated labels to "SAFE" and "PURGE" and removed "Pending" wording.

## 4. Backend Changes
- **Project Action (`lib/actions/projects.ts`)**: Simplified `createProject` to only handle 'Public' and 'Private' visibility. Post-creation discovery signals are strictly gated to 'Public' projects.
- **Post Action (`lib/actions/posts.ts`)**: Defaulted new posts to 'approved' status (handled by DB default, explicit 'pending' assignment removed).

## 5. Database Changes Required & 6. SQL Scripts & 8. Migration Documentation
Located in [supabase/migrations/20240615000000_project_visibility_rebuild.sql](./supabase/migrations/20240615000000_project_visibility_rebuild.sql).
- Simplifies `visibility` check constraint.
- Sets `posts.status` default to 'approved'.
- Updates RLS policies for `projects` and `posts` to support immediate visibility for Public content.

## 7. Bucket/Storage Changes Required
None required for this phase. Existing 'projects' bucket handles media.

## 9. Verification Checklist
Detailed checklist available at the end of [PROJECT_VISIBILITY_AUDIT.md](./PROJECT_VISIBILITY_AUDIT.md#4-verification-checklist).

### Quick Summary:
- [x] Public projects visible in Explore immediately.
- [x] Private projects hidden from Explore/Feeds.
- [x] Posts appear in main feed immediately without admin approval.
- [x] Admin terminal transitioned to reactive moderation mode.
