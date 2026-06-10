-- VERIFICATION QUERIES
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('surveys', 'survey_sections', 'survey_questions', 'survey_options', 'survey_logic_rules', 'survey_responses')
ORDER BY table_name;

-- Verify survey_responses columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'survey_responses'
AND column_name IN ('participant_id', 'responses');

-- Verify RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('survey_sections', 'survey_questions', 'survey_options', 'survey_logic_rules', 'survey_responses');
