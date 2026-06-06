# Survey Initialization System Audit

## Current Route
- Primary: `/surveys/blueprint`
- Legacy Entry: `/creator/surveys/new`

## Current Components
- `app/surveys/blueprint/page.tsx`: Main blueprint interface using Framer Motion for transitions.
- `app/creator/surveys/new/page.tsx`: Simplified creation form.

## Current API Calls / Server Actions
- `createBlueprint` (`lib/actions/blueprint.ts`):
    - Validates name and objective.
    - Inserts into `surveys` table.
    - Inserts into `activity_feed`.
- `createSurvey` (`lib/actions/surveys.ts`):
    - Basic insertion into `surveys` table with default settings.

## Current Database Interactions
- Table: `public.surveys`
    - `id` (UUID)
    - `creator_id` (UUID)
    - `title` (TEXT)
    - `description` (TEXT)
    - `status` (TEXT) - currently 'open', 'draft', 'published', 'closed'.
    - `questions` (JSONB) - legacy column, now replaced by `survey_questions` table but still present in some actions.
    - `target_audience` (TEXT[])
    - `target_responses` (INTEGER)
    - `estimated_duration` (TEXT)
    - `visibility` (TEXT)
    - `anonymous_responses` (BOOLEAN)
    - `collect_identity` (BOOLEAN)
    - `advanced_settings` (JSONB)

## Current Redirect Flow
- `/surveys/blueprint` -> `createBlueprint` -> `/surveys/[id]/dashboard`
- `/creator/surveys/new` -> `createSurvey` -> `/creator/surveys/[id]/builder`

## Current Table Dependencies
- `surveys`: Main record.
- `survey_questions`: Related questions (initialized empty).
- `activity_feed`: Tracks creation.
- `posts`: Created when a survey is published (not relevant to initialization).

## Current RLS Policies
- `surveys`:
    - `SELECT`: `status = 'published' OR auth.uid() = creator_id`
    - `INSERT`: `auth.uid() = creator_id`
    - `UPDATE/DELETE`: `auth.uid() = creator_id`

## Current Storage Dependencies
- `cover_image` column in `surveys` table (Points to Supabase storage if used).

## Legacy Architecture Identifiers
- "Launch Architect" branding in `app/surveys/[id]/dashboard/page.tsx`.
- "Initialize New Survey" and "Establish research node parameters" in `/creator/surveys/new`.
- References to "Logic Nodes" and "Quantum synchronization".
- Use of `questions` JSONB column in some legacy handlers despite migration to `survey_questions` table.
- "Independent Survey" default for linked project instead of actual project selection.
