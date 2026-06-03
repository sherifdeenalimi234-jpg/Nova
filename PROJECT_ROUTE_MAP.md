# NOVA PROJECT ECOSYSTEM: ROUTE MAP AUDIT

## 1. Project Hub Routes (Creator Gated)
Access restricted to Verified Creators and Admins via `middleware.ts`.
- `/projects`: Main Hub dashboard for managing owned/joined projects.
- `/projects/create`: Multi-step project creation wizard.

## 2. Project Landing Routes (Authentication Gated)
Accessible to authenticated users. Private nodes are only viewable by members (enforced via page logic/RLS).
- `/project-space/[id]`: Project Website Home Page. Displays core details, researchers, and stats.

## 3. Project Workspace Routes (Membership Gated)
Strictly restricted to project members or admins.
- `/project-space/[id]/workspace`: Project management interface (Overview, Team, Analytics, Settings).

## 4. Public Project Routes (Public Access)
Accessible to all visitors.
- `/projects/explore`: Public discovery feed for "Active" and "Public" nodes.

---
## Verification Status
- [x] Create Project redirects to `/project-space/[id]`.
- [x] Project Hub (`ProjectCard`) points to `/project-space/[id]`.
- [x] Workspace is separated from Landing.
- [x] Legacy workflow routes removed.
- [x] Middleware enforces Hub protection (`/projects`).
