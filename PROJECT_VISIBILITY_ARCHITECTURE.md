# PROJECT VISIBILITY ARCHITECTURE

## Data Layer Mapping

| Discovery Layer | Route | Primary Data Source | Visibility Rule |
| :--- | :--- | :--- | :--- |
| **Project Explore** | `/projects/explore` | `projects` table | `visibility = 'Public'` |
| **Project Rings** | `/feed` | `posts` table (`post_type = 'project'`) | `status = 'approved'` (Default) |
| **Ecosystem Feed** | `/feed` | `posts` table (`post_type = 'project'`) | `status = 'approved'` (Default) |
| **Creator Project Hub** | `/projects` | `projects` table | `creator_id = auth.uid()` OR `project_members` |
| **Public Portfolio** | `/u/[username]` | `projects` table (via join) | `visibility = 'Public'` |

## Creation Pipeline (lib/actions/projects.ts)

When a creator creates a project:

1.  **Project Record Created**: Saved to `projects` table.
2.  **Membership Saved**: Creator added to `project_members` as 'Owner'.
3.  **Visibility Conditional Branch**:
    -   **If Public**:
        -   `activity_feed` entry created.
        -   `posts` entry created (Discovery Signal).
    -   **If Private**:
        -   No additional discovery entries.

## RLS Enforcement

- **`projects`**:
    - Selectable by anyone if `visibility = 'Public'`.
    - Selectable by creator/members/admin if `visibility = 'Private'`.
- **`posts`**:
    - Selectable by anyone if `status = 'approved'`.
- **`project_members`**:
    - Selectable by project owner/admin/member.
