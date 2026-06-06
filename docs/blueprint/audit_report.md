# SURVEY BLUEPRINT — ARCHITECTURE & AUDIT REPORT

## 1. Architecture Audit
The new Survey Blueprint system replaces the legacy "Survey Architect" initialization flow. It uses a single-page initialization workspace that captures metadata, target goals, and configuration before creating the database record.

- **Frontend:** Next.js 15 Client Component (`/surveys/blueprint`).
- **Backend:** Next.js Server Action (`createBlueprint`) with Supabase integration.
- **State Management:** Local React state with Framer Motion transitions.

## 2. Database Audit
### Status: REFACTORED
The `public.surveys` table has been refactored to support the new blueprint metadata.

| Column | Action | Purpose |
|--------|--------|---------|
| `id` | KEEP | Primary UUID |
| `creator_id` | KEEP | Ownership |
| `title` | KEEP | Name |
| `description` | KEEP | Objective |
| `questions` | KEEP | Dynamic array |
| `status` | KEEP | lifecycle |
| `project_id` | **ADD** | Project relationship |
| `target_audience` | **ADD** | Grid selector data |
| `target_responses`| **ADD** | Analytics goal |
| `estimated_duration`|**ADD** | Config |
| `visibility` | **ADD** | Permissions |
| `anonymous_responses`|**ADD** | Privacy toggle |
| `collect_identity` | **ADD** | Privacy toggle |
| `advanced_settings` | **ADD** | Scalability |

## 3. Legacy Dependency Audit
The following systems have been marked for removal or bypass:
- **REMOVED:** Mock post initialization in `FeedGrid`.
- **REPLACED:** `CreateSurveyModal` in the feed is now a redirect link to `/surveys/blueprint`.
- **BYPASSED:** Legacy multi-step wizard logic.

## 4. Testing Checklist
- [ ] Responsive grid selection on mobile.
- [ ] Multi-select for audience.
- [ ] Custom response input reveal.
- [ ] Sticky action bar visibility.
- [ ] Server Action validation.
- [ ] Immediate redirect to `/surveys/[id]/dashboard`.
- [ ] Database record integrity (check JSONB fields).

## 5. UI/UX Specification
- **Theme:** Dark Cinematic (Black/Purple/Cyan).
- **Typography:** Black (Inter/Sans), Mono (Space Mono) for labels.
- **Grids:** 2-column (Audience/Duration) and 3-column (Target).
- **Interactions:** Initializing -> Creating -> Redirecting transitions.
