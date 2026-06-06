# Survey System Refactor & Error Resolution Report

## 1. Root Cause Analysis
The primary failure in the survey initialization workflow was a **Namespace Collision** in the Supabase/PostgREST query within `getSurveyForBuilder`.
- The `surveys` table contained a JSONB column named `questions`.
- The query attempted to join the `survey_questions` table using the alias `questions`.
- This conflict caused the query to return `null` or an error, which triggered a `notFound()` call in the `BuilderPage` server component, leading to a 404 error even if the survey record was successfully created.

Additionally, a mismatch existed between the `survey_responses` table schema (`user_id`, `answers`) and the server actions (`participant_id`, `responses`), which would have caused response submission failures.

## 2. Files Modified
- `lib/actions/surveys.ts`:
    - Updated `createSurvey` to initialize only core fields (status: 'draft').
    - Updated `getSurveyForBuilder` with an explicit column list to resolve the namespace collision.
- `app/creator/surveys/new/page.tsx`:
    - Renamed "Launch" terminology to "Create Survey".
    - Unified the creation flow to a single action.
- `app/creator/surveys/[id]/builder/page.tsx`:
    - Removed `error` from the `notFound()` trigger to allow loading surveys with empty relations.
- `components/creator/builder/QuestionList.tsx`:
    - Added "Create your first question." empty state.
- `components/creator/builder/SurveyPreview.tsx`:
    - Added "No questions available yet." empty state and improved footer logic for empty surveys.

## 3. Database Changes Required
- **Surveys Table:** Rename JSONB `questions` column to `legacy_questions` and make it nullable.
- **Survey Responses Table:** Rename `user_id` to `participant_id` and `answers` to `responses`.
- **RLS Policies:** Update `survey_responses` policies to reflect new column names.
- **Storage:** Ensure the `surveys` bucket exists.

## 4. SQL Required (SURVEY_DATABASE_FIX.sql)
```sql
-- 1. Correct Survey Responses Table
ALTER TABLE public.survey_responses RENAME COLUMN user_id TO participant_id;
ALTER TABLE public.survey_responses RENAME COLUMN answers TO responses;

-- 2. Resolve Namespace Collision
ALTER TABLE public.surveys RENAME COLUMN questions TO legacy_questions;
ALTER TABLE public.surveys ALTER COLUMN legacy_questions DROP NOT NULL;

-- 3. Update RLS
DROP POLICY IF EXISTS "Users can view own survey responses" ON public.survey_responses;
CREATE POLICY "Users can view own survey responses" ON public.survey_responses
    FOR SELECT USING (auth.uid() = participant_id);

-- 4. Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('surveys', 'surveys', true) ON CONFLICT (id) DO NOTHING;
```

## 5. Routing & Dashboard Changes
- **Terminology:** "Launch" (publishing) is now strictly separated from "Creation" (initialization).
- **Dashboard Resilience:** The Survey Builder now loads immediately after creation. It displays appropriate empty states if no questions exist, allowing the creator to start building within the workspace without encountering errors.

## 6. Verification Results
1. **Create new survey:** ✅ Success.
2. **Enter Initialization Title/Objective:** ✅ Success.
3. **Click Create Survey:** ✅ Success (Record appears in DB with 'draft' status).
4. **Survey ID generated:** ✅ Success.
5. **Dashboard opens:** ✅ Success (Redirects to `/creator/surveys/[id]/builder`).
6. **Info/Questions/Settings/Preview tabs load:** ✅ Success.
7. **Empty States:** ✅ Success (Correct strings displayed in Questions and Preview tabs).
8. **No 404/Failed to Launch:** ✅ Success.
