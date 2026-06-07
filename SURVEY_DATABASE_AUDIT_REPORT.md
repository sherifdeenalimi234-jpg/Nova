# SURVEY DATABASE AUDIT REPORT

## 1. Existing Infrastructure Audit

### Existing Tables
- `public.profiles`: User profiles and verification status.
- `public.projects`: Research projects linked to surveys.
- `public.surveys`: Core survey metadata and configuration.
- `public.survey_questions`: Normalized survey questions.
- `public.survey_options`: Normalized options for multiple choice questions.
- `public.survey_responses`: Participant responses (currently storing JSONB).
- `public.activity_feed`: System-wide audit log.
- `public.posts`: Discovery layer integration.
- `public.notifications`: User notifications.
- `public.creator_profiles`: Detailed creator metadata.

### Existing Columns (surveys table)
- `id` (UUID, PK)
- `creator_id` (UUID, FK)
- `project_id` (UUID, FK)
- `title` (TEXT)
- `description` (TEXT)
- `research_objective` (TEXT)
- `survey_mode` (TEXT)
- `status` (TEXT)
- `visibility` (TEXT)
- `target_audience` (TEXT)
- `target_responses` (TEXT)
- `estimated_duration` (TEXT)
- `language` (TEXT)
- `tags` (TEXT[])
- `research_category` (TEXT)
- `research_timeline` (TEXT)
- `research_notes` (TEXT)
- `cover_image` (TEXT)
- `settings` (JSONB)
- `legacy_questions` (JSONB, Deprecated)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Existing Foreign Keys
- `surveys.creator_id` -> `profiles.id`
- `surveys.project_id` -> `projects.id`
- `survey_questions.survey_id` -> `surveys.id`
- `survey_options.question_id` -> `survey_questions.id`
- `survey_responses.survey_id` -> `surveys.id`
- `survey_responses.participant_id` -> `profiles.id`

### Existing RLS Policies
- `surveys`: Creators have full control. Public can select if `visibility = 'Public'` and `status = 'published'`.
- `survey_questions`: Creators manage, public views if survey is published.
- `survey_options`: Creators manage, public views if survey is published.
- `survey_responses`: Participants can view/insert own. Creators can view all for their surveys.

### Existing Storage Buckets
- `avatars`
- `projects`
- `research`
- `surveys`
- `thumbnails`
- `documents`

---

## 2. Gap Analysis (Nova Survey Architecture vs. Actual State)

### Missing Tables
- `survey_sections`: Required for multi-page/multi-part surveys.
- `survey_logic_nodes`: Required for the advanced logic engine.
- `survey_logic_connections`: Required for mapping flows between nodes.
- `survey_answers`: Required for normalized answer tracking (currently JSONB in `survey_responses`).
- `survey_participants`: Required for tracking invited/unauthenticated participants.
- `survey_members`: Required for team collaboration (Owner, Editor, etc.).
- `survey_comments`: Required for collaboration and feedback.
- `survey_versions`: Required for version control and snapshots.
- `survey_metrics`: Required for high-performance analytics.
- `survey_events`: Required for audit trails and behavioral tracking.
- `ai_generations`: Required for tracking AI-assisted question/content creation.
- `ai_insights`: Required for storing AI-generated analysis.
- `live_sessions`: Required for Live Survey mode.
- `live_participants`: Required for tracking active session users.
- `live_events`: Required for real-time interaction logs.
- `offline_devices`: Required for device registration in Offline mode.
- `offline_sync_queue`: Required for background synchronization.

### Missing Functionality
- **Realtime**: Limited configuration for survey-specific high-concurrency channels.
- **Offline**: No schema support for sync queue or conflict resolution.
- **Collaboration**: No RBAC within the survey workspace beyond the single creator.

---

## 3. Recommended Immediate Actions
1. **Normalize Answers**: Transition from JSONB `responses` in `survey_responses` to a dedicated `survey_answers` table.
2. **Implement Sections**: Introduce `survey_sections` to support structured research flows.
3. **Collaboration Layer**: Create `survey_members` to support the required roles (Editor, Analyst, etc.).
4. **Logic Engine Preparation**: Initialize `survey_logic_nodes` and `survey_logic_connections`.
