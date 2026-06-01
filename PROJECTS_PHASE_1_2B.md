# Audit Report - Project Visibility & Publication Flow (Phase 1.2B)

## 1. Audit Findings

### Visibility Logic
- **Current Behavior:** `visibility` field exists ('Public', 'Private', 'Team Only').
- **Public Projects:** Correctly fetched in `app/projects/page.tsx` using `.eq('visibility', 'Public')`.
- **Private Projects:** RLS policies allow creators and members to see them, but they are not filtered out of generic lookups if ID is known (except by RLS).

### Publication Flow
- **Current Behavior:** Projects are created with `status: 'Active'` by default.
- **Manual Workflow:** There are no explicit "Publish" buttons found for projects, but the "Initialize" terminology suggests a hidden state.
- **Approved Workflow:** Create -> Active/Visible based on `visibility` immediately.

## 2. Visibility Logic Report
- **Public Projects:** Should be automatically surfaced in Explore and Feeds. Currently, Explore is doing this.
- **Private Projects:** Should remain hidden from all public listings. RLS handles this at the DB level.
- **Publication:** No additional steps are needed. Visibility is the sole controller.

## 3. Required Corrections
- Remove any references to a "Publish" step.
- Ensure "Private" projects are strictly excluded from any discovery queries in the backend actions.
- Standardize the "Create" flow to bypass any draft or initialization states.

## 4. Deliverables

### Public Project Behavior
- Immediately appears in Explore (`/projects`).
- Immediately appears in Community Feed (`/feed`) as a Project signal.
- Accessible through `/projects/[id]` by any user.

### Private Project Behavior
- Does not appear in Explore.
- Does not appear in Community Feed.
- Restricted to Owner and Members via RLS and backend filters.

### Feed Integration
- `lib/actions/projects.ts` now automatically inserts a record into the `posts` table when a public project is created.
- Post type set to `project`.
- Status set to `approved`.

### Database Logic
- Visibility field is checked during creation to determine if a feed post should be generated.
- RLS policies on `projects` and `project_members` enforce data isolation for private nodes.

### Verification Results
- [x] Public project appears in Explore grid.
- [x] Public project generates a feed post.
- [x] Private project remains hidden from public listings.
- [x] No manual publication button found in the system.
