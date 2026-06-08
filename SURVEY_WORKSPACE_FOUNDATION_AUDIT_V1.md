# SURVEY WORKSPACE SHELL FOUNDATION AUDIT (PHASE 1B)

## 1. Workspace Shell Audit

| Module | Status | Current Functionality | Missing Functionality | Frontend Issues | Backend Dependencies | Database Req. |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Overview** | **Operational** | Metadata display, target response metrics, quick action shortcuts. | Real-time response data syncing. | None. | `getSurveyForBuilder` | `surveys` (blueprint cols) |
| **Build** | **Placeholder** | UI Shell, Phase 2 integration message, feature checklist. | Drag-and-drop architect, live preview. | None. | `saveQuestion` | `survey_questions`, `survey_options` |
| **Logic** | **Placeholder** | UI Shell, node system visualization placeholder. | Branching rules, custom trigger engine. | None. | Future Logic API | `survey_logic_rules` (Missing) |
| **Collect** | **Placeholder** | UI Shell, distribution channel summary. | Link generation, QR codes, embed tools. | None. | Future Collect API | `survey_responses` |
| **Analytics** | **Placeholder** | UI Shell, core metric card placeholders. | Data viz (Recharts), CSV/XLSX export. | None. | `getSurveyStats` | `survey_responses` |
| **AI Lab** | **Placeholder** | UI Shell, neural assistant entry points. | AI context injection, research agents. | None. | Future AI API | None |
| **Settings** | **Placeholder** | UI Shell, access control, danger zone. | Config updates, collaborative permissions. | None. | `updateSurveyDetails` | `surveys` table |

## 2. Creator Survey Separation

- **Verified Independence:**
    - **Path Isolation:** `/app/creator-surveys` is technically and visually distinct from `/app/creator`.
    - **Responsibility Check:**
        - **Hub (`/creator-surveys`):** Exclusively manages survey assets (Search, Filter, Create).
        - **Studio (`/creator`):** Manages the creator profile, portfolio, and post-based analytics.
- **Leaked Functionality:** None detected. Workspace rendering is contained within `[id]` layouts of the survey hub.

## 3. Workspace Routing Verification

- **Current Routes:**
    - `/creator-surveys`: Asset library.
    - `/creator-surveys/[id]`: Intelligence node (Overview).
- **Behavioral Verification:**
    - **Creation:** Redirect from Blueprint to Workspace is operational.
    - **Exit:** "Exit Workspace" returns user to the Hub (`/creator-surveys`).
    - **Studio Linkage:** Studio Sidebar provides a link *to* the hub but does not attempt to render workspace modules inline.

## 4. Mobile UX Audit

- **Sidebar:** Successfully transforms into a collapsible drawer.
- **Bottom Navigation:** Implemented for the four core modules (Overview, Build, Collect, Analytics).
- **Drawers:** Functional "More" menu for AI Lab and Settings on small screens.
- **Touch Targets:** Buttons and navigation items meet the 44px minimum target requirement.

## 5. Backend & Database Gap Analysis

### Current Schema State
- `surveys`: Operational with blueprint columns.
- `survey_questions`: Relational storage functional.
- `survey_options`: Operational.
- `survey_responses`: Operational (JSONB storage).

### Missing Infrastructure
1. **Normalization:** `survey_answers` table required to separate responses from metadata for advanced analytics.
2. **Structure:** `survey_sections` required for multi-phase/paged research nodes.
3. **Intelligence:** `survey_logic_rules` required for the Logic Engine.
4. **Collaboration:** `survey_members` required for Workspace-specific RBAC.

## 6. Workspace Persistence

- **Determination:** A dedicated `survey_workspaces` table is **NOT** required. The current model where the `surveys` table acts as the workspace root is more performant for single-survey creators.
- **Recommendation:** Add a `workspace_state` JSONB column to `surveys` to persist UI preferences (collapsed panels, last active sub-tab).

---

## SQL Database Stabilization (Run in SQL Editor)

```sql
-- 1. Create survey_sections for structured flows
CREATE TABLE IF NOT EXISTS public.survey_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create survey_logic_rules for the Logic Engine
CREATE TABLE IF NOT EXISTS public.survey_logic_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    source_question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    condition_type TEXT, -- 'equals', 'contains', 'greater_than'
    condition_value TEXT,
    action_type TEXT, -- 'jump_to', 'hide_question', 'end_survey'
    target_id UUID, -- Target question or section ID
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create survey_answers for normalized data analysis
CREATE TABLE IF NOT EXISTS public.survey_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES public.survey_responses(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    answer_value JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create survey_members for team collaboration
CREATE TABLE IF NOT EXISTS public.survey_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'editor', -- 'owner', 'editor', 'analyst', 'viewer'
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(survey_id, user_id)
);

-- 5. Add UI State persistence to surveys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='workspace_state') THEN
    ALTER TABLE surveys ADD COLUMN workspace_state JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 6. Indexes for high-concurrency research
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_response_id ON public.survey_answers(response_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

## 7. Recommended Implementation Order

1. **Database Stabilization:** Run the SQL provided above.
2. **Build Module V1:** Basic question creation with direct DB persistence.
3. **Logic Engine V1:** Implementation of "Linear Jump" logic rules.
4. **Collect Module:** Generation of public survey participation nodes.
