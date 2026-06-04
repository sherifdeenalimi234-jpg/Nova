# DISCOVERY SYSTEM FAILURE AUDIT REPORT

## 1. Verified Failure Analysis

The audit confirms that discovery posts were failing to generate and appear due to a **Security and Constraint Mismatch**.

### Exact Failing Logic
- **File**: `lib/actions/projects.ts`
- **Function**: `createProject`
- **Failing Line**: `await supabase.from('posts').insert({ ... })` (Line 80)
- **Error Message**: `new row violates row-level security policy for table "posts"`

### Exact Root Causes

| Problem | Cause | Impact | Fix |
| :--- | :--- | :--- | :--- |
| **RLS Violation** | `posts` table checked `is_verified_creator`. Project creation allowed `creator_verified`. Flag mismatch blocked posts. | Silent failure: Project saved, Post rejected. | Aligned RLS policy to check both flags. |
| **Missing Select Policy** | `activity_feed` had RLS enabled but NO select policy defined. | Feed empty despite successful inserts. | Added `FOR SELECT USING (true)` policy. |
| **Silent Insertion** | Errors from `posts.insert` were not awaited, caught, or logged. | Discovery failed with zero developer feedback. | Implemented `const { error }` checks and logging. |
| **Constraint Mismatch** | `post_type` check constraint was missing 'project' in some environments. | DB rejected 'project' type posts. | Normalized `posts_post_type_check` constraint. |

## 2. Implemented Fixes

### Backend (`lib/actions/projects.ts`)
- Added explicit `status: 'approved'` to discovery posts to bypass legacy defaults.
- Implemented `const { error } = await ...` checks with `console.error` logging.
- Added discovery signal generation to `updateProject` (Private -> Public transition).

### Database (`supabase/migrations/20240618000000_discovery_repair_final.sql`)
- **Aligned RLS**: Updated `posts` insertion policy to allow `creator_verified OR is_verified_creator`.
- **Feed Visibility**: Added `SELECT` policy for `activity_feed`.
- **Normalized State**: Set `approved` as default status and updated existing records.
- **Repaired Memberships**: Auto-filled missing creator-owner records to ensure Hub persistence.

## 3. Verification Checklist

- [x] **Project Creation**: Inserts into `projects` and `project_members`.
- [x] **Post Generation**: `posts` record created with `status: 'approved'` (Verified with error logging).
- [x] **Activity Log**: `activity_feed` record created and visible (Fixed missing SELECT policy).
- [x] **RLS Alignment**: Verified creator status correctly triggers post insertion.
- [x] **Persistence**: ID-based Hub query ensures creator remains owner across sessions.
- [x] **Discovery**: Public projects appear in Explore (filter removed) and Feed (post generated).
