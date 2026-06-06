# PHASE 1A — SURVEY BLUEPRINT SYSTEM AUDIT REPORT

## 1. Existing Architecture
The survey system currently utilizes a Next.js App Router structure with a Supabase backend. It has transitioned from a legacy unified "Survey Architect" to a two-phase system:
- **Phase 1: Survey Blueprint** (Initialization & Metadata)
- **Phase 2: Survey Workspace** (Question Building, Logic, & Publishing)

## 2. Legacy Dependencies
- **Legacy Survey Architect**: Previously located at `/creator/surveys/new`, this page handled both metadata and question building. It has been replaced by a redirect to the Blueprint system.
- **Legacy Questions Column**: The `surveys` table contains a JSONB `questions` column (now renamed to `legacy_questions` in some audits) that is deprecated in favor of normalized `survey_questions` and `survey_options` tables.
- **Legacy Initialization**: The old `createSurvey` action in `lib/actions/surveys.ts` is bypassed by the new `createSurveyWorkspace` service for Blueprint-based creation.

## 3. Database Mapping
| Blueprint Field | Database Column | Type |
|-----------------|-----------------|------|
| Survey Name | `title` | TEXT |
| Research Objective | `research_objective` | TEXT |
| Linked Project | `project_id` | UUID (FK) |
| Survey Mode | `survey_mode` | TEXT |
| Target Audience | `target_audience` | TEXT |
| Target Responses | `target_responses` | TEXT (Supports "Custom") |
| Visibility | `visibility` | TEXT |
| Estimated Duration | `estimated_duration` | TEXT |
| Research Category | `research_category` | TEXT |
| Tags | `tags` | TEXT[] |
| Language | `language` | TEXT |
| Research Timeline | `research_timeline` | TEXT |
| Research Notes | `research_notes` | TEXT |

## 4. Route Mapping
- `/surveys/blueprint`: Entry point for creating new surveys.
- `/creator/surveys/new`: Legacy route, now redirects to `/surveys/blueprint`.
- `/creator/surveys/[id]/builder`: The Survey Workspace where the survey is built after blueprinting.
- `/creator/surveys`: Management dashboard for creators.

## 5. Frontend Flow
1. **Creator** accesses "New Survey" via Dashboard or Hub.
2. **Redirect** (if legacy) or Direct Access to `/surveys/blueprint`.
3. **Completion** of the Blueprint Form (Required & Optional fields).
4. **Validation** ensures all required parameters are met.
5. **Initialization** overlay appears while records are generated.
6. **Redirect** to Survey Workspace (`/creator/surveys/[id]/builder`).

## 6. Backend Flow
1. **Action Call**: `createSurveyWorkspace` is invoked with form data.
2. **Validation**: Server-side check of required fields.
3. **Database Insert**: Atomic insertion into `public.surveys` table.
4. **Activity Logging**: Event added to `activity_feed` for audit trail.
5. **Revalidation**: Next.js cache paths revalidated for real-time updates.
6. **Response**: Return Survey ID for frontend redirection.

## 7. Required Refactors
- **Type Definitions**: Updated `Survey` interface in `lib/types/surveys.ts` to include all Blueprint fields.
- **Service Enhancement**: Refactored `createSurveyWorkspace` to handle the expanded V1 specification.
- **UI Rebuild**: Complete replacement of the Blueprint page with Nova Creator Studio V1 design system.

## 8. Required SQL
The system requires the addition of several columns to the `surveys` table:
```sql
ALTER TABLE public.surveys
ADD COLUMN survey_mode TEXT,
ADD COLUMN research_category TEXT,
ADD COLUMN language TEXT DEFAULT 'English',
ADD COLUMN research_timeline TEXT,
ADD COLUMN research_notes TEXT,
ADD COLUMN tags TEXT[] DEFAULT '{}';
```

## 9. Required Migrations
- `supabase/migrations/20240621000000_survey_blueprint_v1.sql`: Implements the schema changes required for V1.

## 10. Final Blueprint Architecture
The final system is an independent, high-fidelity initialization layer that enforces research structure before allowing the creator to enter the building environment. It ensures data integrity by requiring key research parameters up front and provides a modern, responsive UX aligned with the Nova Creator Studio branding.
