# SURVEY LOADER ZERO STATE AUDIT

## 1. Current Query Analysis
The `getSurveyForBuilder()` function executes the following Supabase query:

```typescript
const { data: survey, error: surveyError } = await supabase
  .from('surveys')
  .select(`
    id,
    creator_id,
    title,
    description,
    status,
    category,
    cover_image,
    estimated_time,
    tags,
    settings,
    created_at,
    updated_at,
    questions:survey_questions(
      *,
      options:survey_options(*)
    )
  `)
  .eq('id', surveyId)
  .eq('creator_id', user.id)
  .order('order_index', { referencedTable: 'survey_questions', ascending: true })
  .order('order_index', { referencedTable: 'survey_questions.survey_options', ascending: true })
  .single();
```

## 2. Zero State Behavior

- **.single() usage**: Yes, `.single()` is used on the primary `surveys` table query. This is correct as we are fetching a specific survey by its unique ID.
- **Empty survey_questions**: Supabase uses an **Implicit Left Join** for relationship selectors like `questions:survey_questions(...)`. If no questions exist, the `questions` array in the returned object will be empty (`[]`). This does NOT cause the primary `.single()` call to fail or return an error.
- **Empty survey_options**: Similarly, if a question has no options, the `options` array within that question will be empty (`[]`).
- **Function Returns**: In a zero-state scenario (no questions/options), the function returns `{ data: survey }` where `survey.questions` is `[]`.

## 3. Loading Condition Verification

- **0 Sections**: Loaded successfully (Sections are not even joined in the current query).
- **0 Questions**: Loaded successfully (Returned as `[]`).
- **0 Options**: Loaded successfully (Returned as `[]`).

## 4. Potential Failure Conditions
The function would only return `null` or `error` if:
1. The **Survey ID** does not exist (Invalid ID).
2. The **Current User** is not the creator (Ownership mismatch).
3. **Database RLS Policy** prevents selecting from the related tables, which might trigger a generic Supabase error depending on configuration.

## 5. Required Fix
No changes are required to the loader logic itself. The current implementation correctly handles the absence of related records (questions/options) due to the nature of Supabase's relationship selectors and default join behavior.

## 6. Validation Results
- [x] **Survey with 0 questions**: Loads successfully.
- [x] **Survey with 0 options**: Loads successfully.
- [x] **New Blueprint Survey**: Lands on Workspace Overview correctly.

**Status**: ✅ **PASSED**
