# Audit Report - Project Creation Lifecycle (Phase 1.2A)

## 1. Audit Findings

### Frontend
- **Project Creation Page (`app/creator/projects/create/page.tsx`):**
    - Terminology: Uses "Initialize Node" and "Initialize Project".
    - Flow: Redirects to `/creator/projects/[id]/workspace` upon success.
    - Architecture: Does not align with the required redirect to the Project Website Home Page.
- **Project Hub (`app/creator/projects/page.tsx`):**
    - Terminology: Uses "Initialize" in empty state descriptions.
- **Project Workspace (`app/creator/projects/[id]/workspace/page.tsx`):**
    - Terminology: Uses "Node Configuration" and "Decommissioning".
- **Navigation Flow:**
    - Current: Create -> Workspace.
    - Required: Create -> Project Website Home Page (`/projects/[id]`).

### Backend
- **Project Creation Action (`lib/actions/projects.ts`):**
    - `createProject`: Generates slug, inserts project, inserts owner membership.
    - Verification: Missing explicit verification of record existence before returning.
    - Redirection: Relies on the frontend to redirect.
- **Lookup Logic:**
    - `getProject` uses ID. Routing for slugs is not explicitly handled in a dedicated way yet.

### Database
- **`projects` table:** Contains `status` and `visibility` fields.
- **`project_members` table:** Correctly handles ownership.
- **RLS:** Policies exist for visibility and ownership.

## 2. Root Cause Report
The instability in the post-creation flow is due to:
1. **Misaligned Redirection:** The system redirects creators to a "Workspace" instead of the public-facing "Project Website Home Page".
2. **Confusing Terminology:** The use of "Initialize" suggests a multi-step setup process that is no longer required.
3. **Lack of Post-Creation Verification:** The backend action returns immediately after insertion without confirming the full state of the multi-table transaction (Project + Membership).

## 3. Required Corrections
- Update `createProject` to return a fully verified result.
- Update frontend terminology from "Initialize" to "Create".
- Change redirect target to `/projects/[id]`.
- Remove any logic that implies a separate "initialization" or "publication" step.
