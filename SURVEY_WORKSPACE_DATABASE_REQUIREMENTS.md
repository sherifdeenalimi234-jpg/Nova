# Survey Workspace Database Requirements

## Existing Tables Used

### `public.surveys`
- `id` (UUID, Primary Key)
- `creator_id` (UUID, Foreign Key to profiles)
- `project_id` (UUID, Foreign Key to projects)
- `title` (TEXT)
- `research_objective` (TEXT)
- `survey_mode` (TEXT)
- `target_audience` (TEXT)
- `target_responses` (INTEGER)
- `visibility` (TEXT)
- `status` (TEXT: draft, published, closed)
- `estimated_duration` (TEXT)
- `research_category` (TEXT)
- `tags` (TEXT[])
- `language` (TEXT)
- `research_timeline` (TEXT)
- `research_notes` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### `public.survey_questions`
- `id` (UUID, Primary Key)
- `survey_id` (UUID, Foreign Key)
- `type` (TEXT)
- `title` (TEXT)
- `order_index` (INTEGER)

### `public.survey_responses`
- `id` (UUID, Primary Key)
- `survey_id` (UUID, Foreign Key)
- `responses` (JSONB)

## Missing/Required Columns (To be audited)

- Ensure `visibility` column exists in `public.surveys`.
- Ensure all blueprint fields (objective, mode, audience, etc.) are correctly mapped in the schema.
- (Optional) `is_archived` boolean for soft-deletes.

## Relationships

- Survey belongs to a Project.
- Survey belongs to a Creator (Profile).
- Survey has many Questions.
- Survey has many Responses.
