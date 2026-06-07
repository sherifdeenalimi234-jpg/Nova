# SURVEY DATABASE SPECIFICATION V1

## 1. Core Database Entities

### 1.1 Structural Entities
- **`survey_sections`**: Container for groups of questions.
  - `id` (UUID, PK)
  - `survey_id` (UUID, FK)
  - `title` (TEXT)
  - `description` (TEXT)
  - `order_index` (INT)
- **`survey_questions`**: Individual research items.
  - `id` (UUID, PK)
  - `section_id` (UUID, FK, Nullable)
  - `survey_id` (UUID, FK)
  - `type` (TEXT)
  - `title` (TEXT)
  - `config` (JSONB)
  - `order_index` (INT)
- **`survey_options`**: Choices for closed-ended questions.
  - `id` (UUID, PK)
  - `question_id` (UUID, FK)
  - `text` (TEXT)
  - `value` (TEXT)
  - `order_index` (INT)

### 1.2 Logic Engine
- **`survey_logic_nodes`**: Logical pivot points.
  - `id` (UUID, PK)
  - `survey_id` (UUID, FK)
  - `type` (TEXT: trigger, condition, action)
  - `config` (JSONB)
- **`survey_logic_connections`**: Directed edges between nodes.
  - `id` (UUID, PK)
  - `source_node_id` (UUID, FK)
  - `target_node_id` (UUID, FK)
  - `condition_config` (JSONB)

### 1.3 Responses & Data
- **`survey_responses`**: Session-level response record.
  - `id` (UUID, PK)
  - `survey_id` (UUID, FK)
  - `participant_id` (UUID, FK, Nullable)
  - `status` (TEXT: started, completed, abandoned)
  - `metadata` (JSONB: ip, user_agent, duration)
- **`survey_answers`**: Atomic data points.
  - `id` (UUID, PK)
  - `response_id` (UUID, FK)
  - `question_id` (UUID, FK)
  - `option_id` (UUID, FK, Nullable)
  - `text_value` (TEXT, Nullable)
  - `numeric_value` (NUMERIC, Nullable)

### 1.4 Collaboration & Access
- **`survey_members`**: RBAC for the workspace.
  - `id` (UUID, PK)
  - `survey_id` (UUID, FK)
  - `user_id` (UUID, FK)
  - `role` (TEXT: Owner, Editor, Analyst, Viewer)
- **`survey_comments`**: Workspace-level feedback.
  - `id` (UUID, PK)
  - `survey_id` (UUID, FK)
  - `author_id` (UUID, FK)
  - `content` (TEXT)
  - `context` (JSONB: question_id, section_id)

### 1.5 Advanced Systems
- **`survey_versions`**: Immutable snapshots of survey state.
- **`ai_insights`**: Aggregated analysis results.
- **`live_sessions`**: Orchestration for real-time modes.
- **`offline_sync_queue`**: Client-side synchronization buffer.

---

## 2. Relationship Specification
- `Survey (1) -> Sections (N)`
- `Section (1) -> Questions (N)`
- `Survey (1) -> Questions (N)` (Direct backup relationship)
- `Question (1) -> Options (N)`
- `Survey (1) -> Logic Nodes (N)`
- `Logic Node (1) -> Logic Connections (N)`
- `Survey (1) -> Responses (N)`
- `Response (1) -> Answers (N)`
- `Survey (1) -> Members (N)`
- `Survey (1) -> Versions (N)`

---

## 3. RLS Specification
- **Owner**: `ALL` permissions on all survey-related tables.
- **Editor**: `SELECT`, `INSERT`, `UPDATE` on structural and logic tables.
- **Analyst**: `SELECT` on structural and logic tables. `SELECT` on responses and answers.
- **Viewer**: `SELECT` on all tables. No mutation rights.
- **Participant**: `SELECT` on structural tables (if public/invited). `INSERT` on responses and answers.

---

## 4. Index Specification
- `idx_surveys_creator_id`: (surveys.creator_id)
- `idx_survey_questions_survey_id`: (survey_questions.survey_id)
- `idx_survey_responses_survey_id`: (survey_responses.survey_id)
- `idx_survey_answers_response_id`: (survey_answers.response_id)
- `idx_survey_members_user_id`: (survey_members.user_id)
- `idx_survey_logic_survey_id`: (survey_logic_nodes.survey_id)

---

## 5. Storage Specification
- **`survey-assets`**: Brand logos, header images.
- **`survey-media`**: Video/Image stimuli for questions.
- **`survey-attachments`**: File uploads from participants.

---

## 6. Realtime Specification
- **Channel**: `survey_live:[surveyId]`
  - Broadcasts: Response increments, participant join/leave, live session events.
- **Channel**: `survey_collab:[surveyId]`
  - Broadcasts: Cursor presence, active edits, comments.

---

## 7. Offline Specification
- **Storage**: IndexedDB on client.
- **Sync**: UUID-based conflict resolution (Last Write Wins per field).
- **Queue**: `offline_sync_queue` tracks pending `survey_responses` and `survey_answers`.
