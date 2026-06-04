# PROJECTS VISIBILITY AUDIT REPORT

## 1. Verified Implementation Report

### A. Project Creation Lifecycle
- **Project Insertion**: Verified in `lib/actions/projects.ts`. Projects are saved with `status: 'Active'` and chosen `visibility`.
- **Project Members**: Verified in `lib/actions/projects.ts`. Creators are automatically inserted as 'Owner'.
- **Discovery Signals**:
    - **Public**: Creates `activity_feed` entry and `posts` entry (explicitly set to `status: 'approved'`).
    - **Private**: No discovery signals created.

### B. Project Hub (Creator View)
- **Data Retrieval**: Powered by `getCreatorProjects`.
- **Logic**: Now uses a two-step retrieval (Fetch IDs from `project_members` -> Fetch Projects by ID). This bypasses complex join-induced RLS recursion.
- **Persistence**: Since it queries `project_members`, the project remains visible as long as the membership exists, across all sessions.

### C. Discovery Layers
- **Explore**: Queries `projects` where `visibility = 'Public'`. Status check removed to ensure immediate visibility.
- **Rings & Feed**: Powered by `posts` table where `status = 'approved'`. New projects create these records immediately.

---

## 2. Root Cause Analysis

| Problem | Root Cause | Fix |
| :--- | :--- | :--- |
| **Missing in Explore** | Legacy `status = 'Active'` check or RLS delay. | Removed explicit status check; Hardened RLS. |
| **Missing in Rings/Feed** | Dependence on DB default for `status`, which might lag or be overridden. | Explicitly set `status: 'approved'` in Server Action. |
| **Missing in Hub** | Complex Inner Join in `getCreatorProjects` failing under specific RLS conditions. | Simplified to ID-based multi-step query. |
| **Visibility Sync Failure** | `updateProject` didn't trigger discovery signals when moving from Private to Public. | Added discovery signal logic to `updateProject`. |

---

## 3. Files Involved
- `lib/actions/projects.ts`: Core logic for creation, update, and retrieval.
- `app/projects/explore/page.tsx`: Explore page query.
- `supabase/migrations/20240616000000_visibility_final_fix.sql`: Security and data integrity enforcement.

---

## 4. Verification Checklist

- [x] **Creation**: Project record + Owner membership created.
- [x] **Discovery (Public)**: `posts` record created with `status: 'approved'`.
- [x] **Discovery (Public)**: `activity_feed` record created.
- [x] **Privacy (Private)**: No `posts` or `activity_feed` records created.
- [x] **Hub Persistence**: Project appears in Hub immediately and persists across login/logout.
- [x] **Explore Visibility**: Public projects appear in Explore regardless of status.
- [x] **Sync Visibility**: Moving a project from Private -> Public triggers discovery signals.
- [x] **RLS Integrity**: Guests cannot see Private projects; Members can always see their projects.
