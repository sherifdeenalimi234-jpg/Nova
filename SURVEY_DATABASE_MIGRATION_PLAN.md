# SURVEY DATABASE MIGRATION PLAN

## 1. Overview
This migration plan outlines the steps to transition the current survey database to the Phase 1B Workspace Architecture. The focus is on normalization, collaboration, and logic engine support.

## 2. Missing Components
- **Tables**: `survey_sections`, `survey_logic_nodes`, `survey_logic_connections`, `survey_answers`, `survey_members`, `survey_comments`, `survey_versions`, `survey_metrics`, `survey_events`, `ai_generations`, `ai_insights`, `live_sessions`, `live_participants`, `live_events`, `offline_devices`, `offline_sync_queue`.
- **Columns**: `section_id` in `survey_questions`.
- **Indexes**: Specific performance indexes for responses and collaboration.
- **Policies**: Multi-role RLS for survey teams.

## 3. Migration Strategy

### Phase 1: Structural Expansion
1. Create `survey_sections` table.
2. Add `section_id` foreign key to `survey_questions`.
3. Create `survey_members` table for RBAC.
4. Apply basic RLS for collaboration.

### Phase 2: Logic Engine & Data Normalization
1. Create `survey_logic_nodes` and `survey_logic_connections`.
2. Create `survey_answers` table.
3. (Optional) Migrate existing JSONB data from `survey_responses.responses` to `survey_answers` if data persistence is required for legacy responses.
4. Update `survey_responses` status and metadata columns.

### Phase 3: Analytics & Audit
1. Create `survey_metrics`, `survey_events`, and `survey_versions`.
2. Implement triggers for version control and metric aggregation.

### Phase 4: Special Modes
1. Create `live_*` tables for real-time surveys.
2. Create `offline_*` tables and sync queue.
3. Create `ai_*` tables for intelligence features.

## 4. Risk Assessment
- **Data Loss**: Potential risk during normalization of `survey_responses`. **Mitigation**: Perform a dry run migration and keep the legacy `responses` JSONB column as a backup.
- **Performance**: High-concurrency inserts in `survey_answers`. **Mitigation**: Proper indexing and partitioning if the volume exceeds millions of rows.
- **RLS Complexity**: Circular dependencies in policies. **Mitigation**: Use helper functions for "can_access_survey" checks.

## 5. Rollback Strategy
- Each migration script should include a corresponding `ROLLBACK` block.
- Database snapshots should be taken before each phase of the migration.
