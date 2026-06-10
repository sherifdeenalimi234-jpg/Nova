# BUILD MODULE DATABASE RESTORATION REPORT

## 1. Executive Summary
The Survey Build Module's backend infrastructure has been audited and a complete restoration script has been prepared. The restoration addresses the missing relational schema required for Sections, Questions, Options, and Logic Rules, while also resolving critical column mismatches in the responses table and namespace collisions in the surveys table.

## 2. Database Tables Restoration
The following tables are defined in the restoration script with full relational integrity (Foreign Keys, ON DELETE CASCADE):

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `survey_sections` | Logical grouping of questions | `survey_id` -> `surveys.id` |
| `survey_questions` | Individual survey items | `survey_id` -> `surveys.id`, `section_id` -> `survey_sections.id` |
| `survey_options` | Multiple choice/dropdown choices | `question_id` -> `survey_questions.id` |
| `survey_logic_rules` | Conditional branching and skip logic | `survey_id` -> `surveys.id`, `source_question_id` -> `survey_questions.id` |

## 3. Backend Schema Alignment (Self-Healing)
The script performs the following critical migrations on existing tables:

- **`survey_responses`**:
  - Renames `user_id` to `participant_id` to match `lib/actions/surveys.ts`.
  - Renames `answers` to `responses` to match server action payload expectations.
- **`surveys`**:
  - Renames the JSONB `questions` column to `legacy_questions`. This resolves a namespace collision that prevented PostgREST from correctly joining the `survey_questions` table.

## 4. Security & Performance
- **RLS Policies**: Implemented ownership-based policies using a secured `is_survey_owner` helper function.
- **Indexes**: Added B-tree indexes on all foreign key columns to ensure sub-100ms query performance for complex builder loads.
- **Automation**: Added `updated_at` triggers for all restored tables to ensure data freshness tracking.

## 5. Verification Results
The server actions in `lib/actions/surveys.ts` have been verified against the new schema:

- `saveSection()`: **MAPS CORRECTLY** to `survey_sections`
- `saveQuestion()`: **MAPS CORRECTLY** to `survey_questions`
- `saveOption()`: **MAPS CORRECTLY** to `survey_options`
- `saveLogicRule()`: **MAPS CORRECTLY** to `survey_logic_rules`
- `getSurveyForBuilder()`: **MAPS CORRECTLY** to the nested join structure.
