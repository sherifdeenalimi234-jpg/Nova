# PROJECT VISIBILITY AUDIT REPORT & ROOT CAUSE ANALYSIS

## 1. Audit Report

### Database Tables & Systems Mapping

| System | Primary Table | Logic Source | Current Rules |
| :--- | :--- | :--- | :--- |
| **Explore** | `projects` | `app/projects/explore/page.tsx` | Fetches `visibility = 'Public'` AND `status = 'Active'`. |
| **Project Hub** | `projects` | `app/projects/page.tsx` | Fetches projects where user is creator/member via `getCreatorProjects`. |
| **Main Feed** | `posts` | `components/feed/FeedGrid.tsx` | Fetches `status = 'approved'`. |
| **Discovery** | `posts` | `components/feed/RingSystem.tsx` | Fetches `status = 'approved'`. |
| **Activity Feed** | `activity_feed` | `components/hub/ActivityFeed.tsx` | Fetches all recent activity log entries. |
| **Search** | `projects` | `app/projects/explore/page.tsx` | Client-side filter on Public/Active projects. |

### Visibility Definitions (Current)
- **Public**: Visible to everyone if status is 'Active'.
- **Team Only**: Intended for restricted group access (to be removed).
- **Private**: Visible only to creator/members.

### Workflow Dependencies (Current)
- **Approval**: `posts` table defaults to `status = 'pending'`, requiring admin intervention via `moderatePost`.
- **Activation**: Projects often default to 'Draft' or require 'Active' status for public visibility.
- **Publishing**: Implicitly tied to both project visibility and post approval.

---

## 2. Root Cause Analysis

The complexity in the existing architecture stems from **Fragmented State Management**.

1.  **Redundant Flags**: Using both `visibility` (Public/Private) and `status` (Draft/Active/Archived) creates a matrix of visibility that is hard to manage. A 'Public' project might still be invisible because its status is 'Draft'.
2.  **Gated Discovery**: The `posts` table, which powers the main discovery engines (Feed and Ring System), is gated by a manual `status = 'approved'` check. This creates a bottleneck and prevents immediate discovery.
3.  **Inconsistent Creation Logic**: Project creation manually overrides the post approval (`status: 'approved'`), while standard post creation does not. This bypasses the intended safety net inconsistently.
4.  **Legacy "Team Only" Mode**: The 'Team Only' visibility adds a third layer of RLS logic that complicates queries and isn't strictly necessary for the core Public/Private distinction.

---

## 3. Targeted Solution Plan

- **Unify Visibility**: Collapse to a binary `Public` or `Private` state.
- **Auto-Discovery**: Default `posts.status` to `approved` so creation results in immediate visibility.
- **Simplify RLS**: Remove status-based visibility gating. If it's Public, it's public.
- **Repurpose Admin**: Transition Admin Dashboard from an "Approval Gate" to a "Moderation Shield" (reactive instead of proactive).

---

## 4. Verification Checklist

- [ ] **Database Integrity**
    - [ ] `projects` table visibility constraint is `('Public', 'Private')`.
    - [ ] `posts` table default status is `approved`.
    - [ ] Existing 'Team Only' projects migrated to 'Private'.
    - [ ] Existing 'pending' posts migrated to 'approved'.
- [ ] **Project Creation & Privacy**
    - [ ] Public Project creation generates a discovery post.
    - [ ] Private Project creation DOES NOT generate a discovery post.
    - [ ] Private Project is visible in Creator Hub but hidden from Explore.
- [ ] **Discovery Workflow**
    - [ ] New Public projects appear in Explore immediately (status check removed).
    - [ ] New Public projects appear in Feed/RingSystem immediately (auto-approved).
- [ ] **Admin Moderation**
    - [ ] Admin dashboard shows recent content instead of just pending content.
    - [ ] "PURGE" action removes content from ecosystem.
    - [ ] "SAFE" action confirms content integrity.
