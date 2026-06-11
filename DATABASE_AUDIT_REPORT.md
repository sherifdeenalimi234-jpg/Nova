# DATABASE AUDIT REPORT

## Table Status (Verified via Migration History)

| Table Name | Status | Columns | RLS | Triggers |
|------------|--------|---------|-----|----------|
| `survey_sections` | Defined | id, survey_id, title, description, order_index, created_at, updated_at | Yes | Yes |
| `survey_questions` | Defined | id, survey_id, section_id, type, title, description, is_required, order_index, placeholder, validation_rules, created_at, updated_at | Yes | Yes |
| `survey_options` | Defined | id, question_id, text, order_index, created_at, updated_at | Yes | Yes |
| `survey_logic_rules` | Defined | id, survey_id, source_question_id, action, condition_type, condition_value, target_id, order_index, created_at, updated_at | Yes | Yes |

## Relationship Map

- `survey_sections.survey_id` → `surveys.id` (CASCADE)
- `survey_questions.survey_id` → `surveys.id` (CASCADE)
- `survey_questions.section_id` → `survey_sections.id` (SET NULL)
- `survey_options.question_id` → `survey_questions.id` (CASCADE)
- `survey_logic_rules.survey_id` → `surveys.id` (CASCADE)
- `survey_logic_rules.source_question_id` → `survey_questions.id` (CASCADE)

## Identified Issues

1. **Table Presence**: Although migrations exist, the tables are reportedly missing in the active environment.
2. **Logic Rules Column Name**: Requirement specifies `question_id`, but migration uses `source_question_id`.
3. **Question Types**: Migration 20240622 defines a set of allowed types. Need to ensure they cover all planned future types or are flexible.

## Recommended Actions

1. Execute a master reconstruction SQL script to ensure all tables, RLS, and triggers are correctly set up.
2. Verify `is_survey_owner` function exists and is used in all policies.
