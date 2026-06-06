# Survey System Architectural Audit & Refactor Analysis

## 1. Current Architecture
The system has been successfully decoupled into two distinct stages:
- **Stage 1: Initialization** (`app/creator/surveys/new/page.tsx`): Responsible for metadata collection (Title, Description).
- **Stage 2: Dashboard/Workspace** (`app/creator/surveys/[id]/builder/page.tsx`): Responsible for building the survey tree (Questions, Options, Settings).

## 2. Current Workflow (Observed)
1.  **Initialize New Survey** page collects "Initialization Title" and "Objective Overview".
2.  **Create Survey** button triggers `handleCreate`.
3.  `createSurvey` server action inserts a `draft` record into `public.surveys`.
4.  Redirects to `/creator/surveys/[id]/builder` (Survey Workspace).
5.  Workspace loads empty questions and provides building tools.

## 3. Intended Workflow
Initialization Title
↓
Objective Overview
↓
Create Survey
↓
Create Survey Record (Status: Draft)
↓
Generate Survey ID
↓
Redirect to Survey Workspace
↓
Info (Editable) | Questions | Settings | Preview
↓
Publish (Deployment Stage)

## 4. Legacy Dependencies & Remnants
- **Naming Conflict:** The `surveys` table contains a legacy `questions` JSONB column which conflicts with the relationship join alias used in the workspace loader.
- **Terminology:** "Launch" was still appearing in some error strings and UI logic (now corrected to "Create Survey").
- **UI Branding:** The initialization page was using the "Survey Architect" header (now corrected to "Initialize New Survey").
- **Schema Mismatch:** `survey_responses` was using `user_id` instead of `participant_id`.

## 5. Route Analysis
- **Initialization Route:** `/creator/surveys/new`
- **Dashboard/Workspace Route:** `/creator/surveys/[id]/builder`
- **Status:** Routes are properly separated. The redirect logic is now stable.

## 6. Database Analysis
| Entity | Status | Requirement |
| :--- | :--- | :--- |
| `public.surveys` | ✅ Exists | Rename legacy `questions` column to avoid join collisions. |
| `public.survey_questions` | ✅ Exists | Ensure RLS allows insertion for authenticated creators. |
| `public.survey_options` | ✅ Exists | Ensure RLS allows insertion for authenticated creators. |
| `public.survey_responses` | ✅ Exists | Rename `user_id` -> `participant_id` to match server action. |

## 7. Dashboard Analysis
The Dashboard (`BuilderClient`) is independent and capable of loading empty surveys. The "404 Not Found" issue was traced to the database namespace collision during the join query, not a missing route or missing questions.

## 8. Root Cause Analysis
- **Primary Failure:** A namespace collision in the `getSurveyForBuilder` query. Supabase could not distinguish between the `questions` column and the `questions` join alias.
- **Secondary Failure:** Legacy "Launch" logic was enforcing publishing constraints during initialization. This has been removed.

## 9. Required Refactor Plan
1.  **Rename Legacy Columns:** Execute `SURVEY_DATABASE_FIX.sql`.
2.  **Explicit Data Fetching:** Use explicit column lists in server actions to bypass legacy JSONB fields.
3.  **UI Label Refinement:** Ensure the Initialization page uses "Initialize New Survey" and the Dashboard uses "Survey Workspace".

## 10. Required SQL (SURVEY_DATABASE_FIX.sql)
```sql
-- Correct naming and resolve collisions
ALTER TABLE public.survey_responses RENAME COLUMN user_id TO participant_id;
ALTER TABLE public.survey_responses RENAME COLUMN answers TO responses;
ALTER TABLE public.surveys RENAME COLUMN questions TO legacy_questions;
ALTER TABLE public.surveys ALTER COLUMN legacy_questions DROP NOT NULL;
```

---

## Final Audit Conclusions

- **Is the Initialization page truly independent?** YES. It now only performs record initialization.
- **Is it still using old Survey Architect logic?** NO. The logic has been replaced with a streamlined `createSurvey` call.
- **Is the Survey Dashboard properly separated?** YES. It exists at a distinct route and acts as the builder environment.
- **Is a rebuild required?** NO. The current architecture is correct; the failures were caused by legacy naming conflicts.
- **Verdict:** This was a legacy architecture cleanup and namespace resolution issue.
