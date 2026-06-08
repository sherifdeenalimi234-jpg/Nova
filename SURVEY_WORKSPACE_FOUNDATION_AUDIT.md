# Phase 1B Workspace Shell Foundation Audit

## 1. Workspace Shell Audit

| Module | Status | Current Functionality | Missing Functionality | Frontend Issues | Backend Dependencies | Database Req. |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Overview** | **Operational** | Metadata display, metrics summary, quick actions. | Live data stream sync. | None detected. | `getSurveyForBuilder` | `surveys` table (blueprint cols) |
| **Build** | **Placeholder** | UI Shell, module entry point. | Question architect, drag-and-drop. | N/A (Placeholder) | `saveQuestion` | `survey_questions`, `survey_options` |
| **Logic** | **Placeholder** | UI Shell, node system placeholder. | Branching engine, custom triggers. | N/A (Placeholder) | None (Future logic API) | `survey_logic_rules` (Missing) |
| **Collect** | **Placeholder** | UI Shell, distribution summary. | Channel management, link generation. | N/A (Placeholder) | None (Future collect API) | `survey_responses` |
| **Analytics** | **Placeholder** | UI Shell, zero-state metrics. | Real-time charts, export engine. | N/A (Placeholder) | `getSurveyStats` | `survey_responses` |
| **AI Lab** | **Placeholder** | UI Shell, assistant entry points. | Neural model integration. | N/A (Placeholder) | None (Future AI API) | None |
| **Settings** | **Placeholder** | UI Shell, permission overview. | Functional config updates, deletion. | N/A (Placeholder) | `updateSurveyDetails` | `surveys` table |

## 2. Creator Survey Separation

- **Independence Verified:**
    - `Creator Survey` is isolated in `/app/creator-surveys`.
    - `Creator Studio` is isolated in `/app/creator`.
- **Responsibilities:**
    - `/creator-surveys` handles all survey lifecycle management (Listing, Search, Filter, Create).
    - `/creator` handles profile, monetization, and broad creator analytics.
- **Isolation Check:** Workspace functionality is strictly contained within `/creator-surveys/[id]` and never leaks into `/creator`.

## 3. Workspace Routing Verification

- **Routes Audit:**
    - `/creator-surveys`: Library & Management.
    - `/creator-surveys/[id]`: Workspace Root (Overview).
- **Behavioral Check:**
    - **Creation:** Blueprint redirects to `/creator-surveys/[id]` successfully.
    - **Exit:** "Exit Workspace" button correctly routes back to `/creator-surveys`.
    - **Listing:** All survey records remain exclusive to the Creator Survey hub.

## 4. Mobile UX Audit

- **Sidebar:** Collapses into a high-fidelity drawer on mobile.
- **Navigation:** Primary module navigation uses a thumb-friendly bottom bar.
- **Tabs:** Tab transitions are smooth (Framer Motion) and responsive.
- **Drawers:** Full-screen navigation drawer for "More" options.
- **Forms:** Input fields and selectors optimized for mobile viewport height.

## 5. Backend Audit & Database Gap Analysis

### Existing Tables
- `surveys`: Stores core metadata.
- `survey_questions`: Stores question definitions.
- `survey_options`: Stores choice items.
- `survey_responses`: Stores participant data.

### Missing Tables (Phase 2/3 Requirements)
- `survey_sections`: To support multi-page surveys.
- `survey_logic_rules`: To support advanced branching.
- `survey_members`: To support team collaboration within a workspace.

### Missing Indexes/Policies
- Need index on `survey_questions(survey_id)` for faster ordering.
- Need index on `survey_responses(survey_id)` for analytics performance.
- RLS policy check: Ensure `creator_id` check is consistently applied to all sub-tables.

## 6. Workspace Persistence

- **Current Method:** Direct storage in `surveys` table via blueprint columns.
- **Requirement Analysis:** A dedicated `survey_workspaces` table is **NOT** required at this stage. Extending the `surveys` table provides a flatter, more efficient query structure. However, a `workspace_config` JSONB column in `surveys` is recommended for UI-state persistence (e.g., last active tab, panel visibility).

## 7. Recommended Implementation Order

1. **Database Schema Update:** Run the SQL repair script to ensure all blueprint columns exist.
2. **Build Module V1:** Integrate basic question creation logic.
3. **Logic Engine V1:** Implement simple "Next Step" branching.
4. **Collect Module:** Implement public link generation.

---

## SQL Repair Script (Run in SQL Editor)

```sql
-- Phase 1B/2 Survey Table Self-Healing
DO $$
BEGIN
  -- Add missing blueprint columns to surveys table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='research_objective') THEN
    ALTER TABLE surveys ADD COLUMN research_objective TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='project_id') THEN
    ALTER TABLE surveys ADD COLUMN project_id UUID REFERENCES projects(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='survey_mode') THEN
    ALTER TABLE surveys ADD COLUMN survey_mode TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='target_audience') THEN
    ALTER TABLE surveys ADD COLUMN target_audience TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='target_responses') THEN
    ALTER TABLE surveys ADD COLUMN target_responses INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='visibility') THEN
    ALTER TABLE surveys ADD COLUMN visibility TEXT DEFAULT 'Private';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='estimated_duration') THEN
    ALTER TABLE surveys ADD COLUMN estimated_duration TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='research_category') THEN
    ALTER TABLE surveys ADD COLUMN research_category TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='language') THEN
    ALTER TABLE surveys ADD COLUMN language TEXT DEFAULT 'English';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='research_timeline') THEN
    ALTER TABLE surveys ADD COLUMN research_timeline TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='research_notes') THEN
    ALTER TABLE surveys ADD COLUMN research_notes TEXT;
  END IF;

  -- Ensure questions column exists for legacy sync
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='questions') THEN
    ALTER TABLE surveys ADD COLUMN questions JSONB DEFAULT '[]'::jsonb;
  END IF;

END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
```
