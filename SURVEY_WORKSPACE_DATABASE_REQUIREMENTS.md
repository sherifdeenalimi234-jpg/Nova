# SURVEY WORKSPACE DATABASE REQUIREMENTS

## 1. Existing Schema Audit
- **Table**: `public.surveys`
  - Columns: `id`, `creator_id`, `project_id`, `title`, `description`, `research_objective`, `survey_mode`, `visibility`, `status`, `target_audience`, `target_responses`, `estimated_duration`, `language`, `tags`.
- **Status**: Sufficient for Phase 2 initialization.

## 2. Missing Schema (Future Phases)
- **`survey_sections`**: Required for multi-page surveys in Build module.
- **`survey_logic_nodes`**: Required for Logic module.
- **`survey_members`**: Required for Collaboration features.
- **`survey_versions`**: Required for Workspace Version Control.

## 3. Relationship Requirements
- `Survey (1) -> Project (1)`: Link to research context (Currently UUID).
- `Survey (1) -> Creator (1)`: Link to owner (Currently UUID).

## 4. Required Data for Workspace V1
The workspace requires real-time access to the following survey metadata to populate the header and overview:
- `title`
- `status`
- `visibility`
- `research_objective`
- `survey_mode`
- `target_audience`
- `target_responses`
- `estimated_duration`
