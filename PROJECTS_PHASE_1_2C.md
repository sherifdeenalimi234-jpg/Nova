# Project Website Home Page - Documentation (Phase 1.2C)

## 1. Overview
The Project Website Home Page (`/projects/[id]`) is the public-facing "mini website" for each innovation node. It is designed to be mobile-first and serves as the primary landing page for both creators (immediately after creation) and the community.

## 2. Route Architecture
- **Route:** `/projects/[id]` (or `/projects/[slug]`)
- **Controller:** `app/projects/[id]/page.tsx`
- **Access:**
    - Public if `visibility = 'Public'`.
    - Restricted to Owner/Admin if `visibility = 'Private'`.

## 3. Frontend Architecture (Mobile-First)

### Hero Section
- **Components:** Cover Image, Project Name, Project Type, Visibility Status, Category, Short Description.
- **Logic:** Fallback to NOVA branded placeholder if cover image is null.

### Statistics Section (Auto-calculated)
- **Members:** Count from `project_members`.
- **Files:** Placeholder card (future integration).
- **Activities:** Placeholder card (future integration).
- **Updates:** Placeholder card (future integration).

### Content Sections
- **Featured:** Placeholder for future updates.
- **Highlights:** Placeholder for research milestones.

### Footer Architecture
- **Mandatory Footer** with support for:
    - Project Information
    - Navigation Links
    - Social Links (Website, Instagram, LinkedIn, Facebook, X, YouTube, GitHub)
    - Copyright

## 4. Backend Requirements
- **Project Lookup:** Optimized query to fetch project details and member counts.
- **Visibility Enforcement:** Action-level checks to prevent unauthorized access to private nodes.

## 5. Redirect Flow
`Create Project Form` -> `lib/actions/projects.ts` (Create Project + Membership) -> `Redirect to /projects/[id]`

## 6. Deliverables

### Frontend Changes
- **Project Website Home Page (`app/projects/[id]/page.tsx`):**
    - Mobile-first design.
    - Dynamic Hero section with visibility badges.
    - Auto-calculating Statistics grid.
    - Featured and Highlights placeholder sections.
    - Integrated multi-section Footer.

### Backend Changes
- **`lib/actions/projects.ts`:**
    - Updated `getProject` to include `project_members` for auto-calculating stats.
    - Ensured redirection data (ID and Slug) is correctly returned.

### Footer Architecture
- Mandatory footer implemented in the landing page layout.
- Support for Social Links: Website, Instagram, LinkedIn, Facebook, X, YouTube, GitHub.
- Configured as hidden/placeholder until Project Profile settings are implemented.

### Verification Results
- [x] Redirects to `/projects/[id]` after creation.
- [x] Hero displays correct project metadata.
- [x] Stats correctly count project members.
- [x] Footer contains all required sections.
- [x] Layout is mobile-optimized.
