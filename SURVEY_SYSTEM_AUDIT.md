# Survey System Audit & Architecture Report

## 1. Audit Report: Existing Infrastructure

### Existing Survey Pages
- `app/surveys/page.tsx`: Participant discovery page. Lists all surveys with 'open' status.
- `app/surveys/[id]/analytics/page.tsx`: Result visualization page using Recharts.
- `app/creator/surveys/page.tsx`: Creator management dashboard (currently populated with mock data).
- `app/creator/surveys/new/page.tsx`: Comprehensive survey builder ("Survey Architect").
- `app/admin/surveys/page.tsx`: Admin moderation portal.

### Existing Survey Routes
- `/surveys`: Participant discovery.
- `/surveys/[id]/analytics`: Analytics view (Public/Creator).
- `/creator/surveys`: Creator dashboard.
- `/creator/surveys/new`: Survey creation.
- `/admin/surveys`: Admin oversight.

### Existing Survey Components
- `TakeSurveyModal.tsx`: Multi-step UI for responding to surveys.
- `CreateSurveyModal.tsx`: Modal-based survey creator (integrated into feed).
- `SurveysContent.tsx`: Admin list and stat visualization.

### Existing Survey UI Elements
- Modern dark-mode cards with "Logic Node" indicators.
- Animated progress bars for survey participation.
- Recharts-based bar charts for analytics.
- "Survey Architect" drag-and-drop/ordered list UI.

### Existing Survey APIs & Actions
- `lib/actions/surveys.ts`:
    - `createSurvey`: Saves survey metadata and questions (as JSONB) to the `surveys` table.
    - `submitSurveyResponse`: Saves answers (as JSONB) to the `survey_responses` table.
- `lib/actions/admin.ts`:
    - `moderateSurvey`: Updates survey status.

### Existing Database Tables
- `public.surveys`: Stores `creator_id`, `title`, `description`, `status`, and `questions` (JSONB).
- `public.survey_responses`: Stores `survey_id`, `user_id`, and `answers` (JSONB).

### Existing Permissions
- **Middleware**: Routes starting with `/creator` require `is_verified_creator`. Routes starting with `/admin` require `is_admin`.
- **RLS**: `surveys` has a public select policy. `survey_responses` lacks restrictive policies for creators.

### Existing Navigation Integrations
- `components/navigation/BottomNav.tsx`: Links to `/creator/surveys` (Creator) and `/surveys` (Participant).
- `components/creator/MobileNav.tsx`: Link to `/creator/surveys`.
- `components/hub/ModuleGrid.tsx`: "Surveys" module integrated into the Hub.

### Identified Issues
- **Inconsistencies**: The `JSONB` structure for questions and answers makes complex analytics and individual answer tracking difficult.
- **Broken Workflow**: The creator dashboard uses mock data and does not show real surveys from the database.
- **Security**: The analytics page (`/surveys/[id]/analytics`) does not verify if the viewer is the creator or an admin.
- **Duplicate Logic**: `CreateSurveyModal` and `CreateSurveyPage` implement similar logic but with different UI and slightly different data structures.

---

## 2. Reusable Components
- `TakeSurveyModal`: Excellent UX for participants; needs data-binding refactor.
- `SurveysContent`: High-quality admin dashboard UI.
- `Survey Architect` UI: The layout and state management for building questions are solid.

## 3. Components Requiring Refactoring
- **Survey Architect**: Needs to be updated to support the new normalized database schema (Questions and Options as separate tables).
- **TakeSurveyModal**: Needs to fetch normalized questions/options.
- **Survey Dashboard**: Needs to replace mock data with real Supabase queries.

## 4. Components Requiring Removal
- `CreateSurveyModal`: Redundant; survey creation should be centralized in the main "Architect" flow.
- Mock data arrays in `app/creator/surveys/page.tsx`.

---

## 5. Proposed Folder Structure
```text
app/
  (participant)/
    survey/
      discover/        # Survey discovery grid
      [surveyId]/      # Individual survey participation
      history/         # User participation history
  (creator)/
    creator/
      surveys/         # Management dashboard
      create/          # Survey Architect
      manage/[id]/     # Settings & Editing
      responses/[id]/  # Analytics & Data Export
```

## 6. Proposed Route Structure
- `/survey/discover`: Discovery
- `/survey/[surveyId]`: Participation
- `/survey/my-participation`: History
- `/creator/surveys`: Dashboard
- `/creator/create`: Creator Builder
- `/creator/manage/[id]`: Management
- `/creator/responses/[id]`: Analytics

## 7. Proposed Database Architecture
### Table: `surveys`
- `id` (UUID, PK)
- `creator_id` (UUID, FK to profiles)
- `title` (TEXT)
- `description` (TEXT)
- `status` (TEXT: draft, published, closed)
- `created_at` (TIMESTAMPTZ)

### Table: `survey_questions`
- `id` (UUID, PK)
- `survey_id` (UUID, FK to surveys)
- `type` (TEXT: text, multiple_choice, rating, file)
- `question_text` (TEXT)
- `order_index` (INT)
- `is_required` (BOOLEAN)

### Table: `survey_options`
- `id` (UUID, PK)
- `question_id` (UUID, FK to survey_questions)
- `option_text` (TEXT)
- `order_index` (INT)

### Table: `survey_responses`
- `id` (UUID, PK)
- `survey_id` (UUID, FK to surveys)
- `user_id` (UUID, FK to profiles)
- `created_at` (TIMESTAMPTZ)

### Table: `survey_answers`
- `id` (UUID, PK)
- `response_id` (UUID, FK to survey_responses)
- `question_id` (UUID, FK to survey_questions)
- `option_id` (UUID, FK to survey_options, Nullable)
- `text_answer` (TEXT, Nullable)

---

## 8. Proposed API Architecture
- `lib/actions/surveys/create.ts`: Atomic transaction to create survey, questions, and options.
- `lib/actions/surveys/submit.ts`: Handles response submission and answer logging.
- `lib/actions/surveys/manage.ts`: Update status, delete survey, or edit metadata.
- `lib/actions/surveys/fetch.ts`: Optimized queries for fetching survey trees and analytics.

---

## 9. Proposed Permission Architecture
- **RLS Policy (surveys)**:
    - `SELECT`: Allow if `status = 'published'` OR `creator_id = auth.uid()`.
    - `INSERT/UPDATE/DELETE`: Only if `creator_id = auth.uid()`.
- **RLS Policy (survey_responses)**:
    - `SELECT`: Only if `user_id = auth.uid()` OR `survey.creator_id = auth.uid()`.
    - `INSERT`: Allow for authenticated users.

---

## 10. Integration Plan
1. **Database Migration**: Deploy the normalized schema and establish RLS.
2. **Server Action Refactor**: Implement the new atomic `createSurvey` and `submitResponse` actions.
3. **Creator Dashboard Sync**: Connect `app/creator/surveys/page.tsx` to the database.
4. **Survey Architect Update**: Update the builder to use the new normalized data structure.
5. **Analytics Rebuild**: Rebuild the analytics view to aggregate data from the `survey_answers` table.
6. **Participant UI Update**: Update discovery and participation modals to fetch from the new schema.
