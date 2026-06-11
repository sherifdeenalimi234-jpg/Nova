# BUILD MODULE INFRASTRUCTURE AUDIT

## PHASE 1: DATABASE AUDIT

Based on the verification of migration history and current server logic:

| Table | Status | Columns | RLS | Triggers |
|-------|--------|---------|-----|----------|
| `surveys` | OK | id, creator_id, title, description, status, legacy_questions, settings, ... | YES | YES |
| `survey_responses` | OK | id, survey_id, participant_id, responses, created_at | YES | NO |
| `survey_sections` | MISSING* | id, survey_id, title, description, order_index | YES | YES |
| `survey_questions` | MISSING* | id, survey_id, section_id, type, title, is_required, order_index | YES | YES |
| `survey_options` | MISSING* | id, question_id, text, order_index | YES | YES |
| `survey_logic_rules` | MISSING* | id, survey_id, source_question_id, action, condition | YES | YES |

*\*Reported missing by user and confirmed by failure to create records.*

### Integrity Check:
- **Foreign Keys**: `ON DELETE CASCADE` is missing or inconsistent in early migrations.
- **Namespaces**: Collision between `surveys.questions` and `survey_questions` joins was identified previously.

## PHASE 2: STORAGE AUDIT

| Bucket | Status | Public | Policies |
|--------|--------|--------|----------|
| `survey-assets` | MISSING | TRUE | NO |
| `survey-media` | MISSING | TRUE | NO |
| `uploads` | MISSING | FALSE | NO |
| `attachments` | MISSING | FALSE | NO |

## PHASE 3: SERVER ACTIONS AUDIT

- `lib/actions/surveys.ts` exists.
- Actions use `supabase.from('survey_sections').insert(...)`.
- **FAILURE POINT**: Database rejects insertions because tables `survey_sections`, `survey_questions`, etc. do not exist in the active schema, or RLS policies prevent the authenticated user from inserting into these specific tables even if they exist.

## PHASE 4: FRONTEND AUDIT

- `BuildWorkspace.tsx` uses optimistic updates correctly but the background save fails.
- `PropertiesInspector.tsx` is wired to `handleUpdateItem` but persistence is broken.
- **FAILURE POINT**: "Add Section" triggers `saveSection` server action which returns an error (404/42P01 - Relation not found) because the table is missing.

## PHASE 5: DATA FLOW AUDIT

**UI** (New Section) -> **Server Action** (`saveSection`) -> **Supabase** -> **Database** (Error: Table 'survey_sections' not found) -> **Action Response** (`{ error: ... }`) -> **UI** (Sync Error).

---

## PHASE 6: RESTORATION CODE

### 1. SQL Restoration (Tables & RLS)
See `MASTER_DATABASE_RECONSTRUCTION.sql`.

### 2. Storage Restoration
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('survey-assets', 'survey-assets', true),
  ('survey-media', 'survey-media', true),
  ('uploads', 'uploads', false),
  ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for survey-assets (Public View, Auth Upload)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'survey-assets');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'survey-assets' AND auth.role() = 'authenticated');
```

## PHASE 7: VERIFICATION QUERIES

```sql
-- 1. Table Verification
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'survey_%';

-- 2. Bucket Verification
SELECT id, name, public FROM storage.buckets WHERE id LIKE 'survey-%' OR id IN ('uploads', 'attachments');

-- 3. RLS Verification
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'survey_%';
```
