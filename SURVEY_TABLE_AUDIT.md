# Survey Table Audit Report

**Date:** October 26, 2024
**Subject:** Verification of `public.surveys` table schema and `createSurvey()` synchronization.

## 1. Schema Audit: `public.surveys`

Based on a comprehensive review of the Supabase migration files (`20240528000000`, `20240608000000`, `20240619000000`, and `20240620000000`), the current schema for `public.surveys` is as follows:

| Column | Data Type | Default Value | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `gen_random_uuid()` | `PRIMARY KEY` |
| `creator_id` | `UUID` | - | `NOT NULL`, `REFERENCES public.profiles(id)` |
| `title` | `TEXT` | - | `NOT NULL` |
| `description` | `TEXT` | - | - |
| `status` | `TEXT` | `'draft'` | `CHECK (status IN ('draft', 'published', 'closed'))` |
| `category` | `TEXT` | - | - |
| `questions` | `JSONB` | `'[]'::jsonb` | `NOT NULL` |
| `settings` | `JSONB` | See below* | - |
| `cover_image` | `TEXT` | - | - |
| `estimated_time` | `INTEGER` | `5` | - |
| `tags` | `TEXT[]` | `'{}'` | - |
| `created_at` | `TIMESTAMPTZ` | `now()` | `NOT NULL` |
| `updated_at` | `TIMESTAMPTZ` | `now()` | `NOT NULL` |

*\*Settings Default:* `'{"anonymous": false, "one_response_per_participant": true}'::jsonb`

### Foreign Keys
- `creator_id` references `public.profiles(id)` with `ON DELETE CASCADE`.

### RLS Policies
- **Select:** `(status = 'published' OR auth.uid() = creator_id)` (Allow public viewing of published surveys or owner access).
- **Insert:** `(auth.uid() = creator_id)` (Only the creator can insert their own survey).
- **Update/Delete:** `(auth.uid() = creator_id)` (Only the owner can modify/remove).

---

## 2. Function Audit: `createSurvey()`

The `createSurvey()` function in `lib/actions/surveys.ts` performs the following insert:

```typescript
.insert({
  creator_id: user.id,
  title: data.title,
  description: data.description,
  category: data.category || 'General',
  status: data.status || 'draft',
  settings: { anonymous: false, one_response_per_participant: true },
  questions: []
})
```

### Analysis
- **Does the surveys table contain these columns?** Yes. All columns (`creator_id`, `title`, `description`, `category`, `status`, `settings`, `questions`) are present in the audited schema.
- **Is `createSurvey` attempting to insert columns that do not exist?** No.
- **Are there required columns that Launch is not providing?** No.
  - `creator_id`: Provided by `user.id`.
  - `title`: Provided by the Launch screen.
  - `questions`: Provided as an empty array `[]` (satisfies `NOT NULL`).
- **Would the insert fail because of missing values?** No.
- **Would the insert fail because of foreign keys?** No (provided the user has a valid record in `profiles`).
- **Would the insert fail because of RLS?** No. The insert policy uses `auth.uid() = creator_id`, which matches the logic in the server action.

---

## 3. Launch Screen Analysis

The Launch screen (`app/creator/surveys/new/page.tsx`) and the `CreateSurveyModal.tsx` provide:
- `title`
- `description`

The `CreateSurveyPage` also passes a `status` ('draft' or 'published').

**Conclusion:** The Launch screen provides sufficient data to satisfy the `createSurvey()` function and the database schema constraints.

---

## 4. Potential Issues & Discrepancies

While the `surveys` table is well-synchronized, I identified discrepancies in the **`survey_responses`** table that may cause future failures:

1. **Column Name Mismatch:** The code uses `participant_id` and `responses`, but the migrations define `user_id` and `answers`.
2. **Missing `updated_at` Trigger:** While `surveys` has an `updated_at` trigger, ensure all related tables (`survey_questions`, `survey_options`) have them correctly applied.

---

## 5. Required SQL (Verification Fixes)

No SQL is strictly required for the `surveys` table itself as it matches the function. However, to ensure full system integrity for the Survey System, the following adjustments are recommended for the responses table if they have not been manually updated:

```sql
-- Fix mismatch in survey_responses (if necessary)
DO $$
BEGIN
    -- Rename user_id to participant_id for alignment with lib/actions/surveys.ts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'survey_responses' AND column_name = 'user_id') THEN
        ALTER TABLE public.survey_responses RENAME COLUMN user_id TO participant_id;
    END IF;

    -- Rename answers to responses for alignment with lib/actions/surveys.ts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'survey_responses' AND column_name = 'answers') THEN
        ALTER TABLE public.survey_responses RENAME COLUMN answers TO responses;
    END IF;
END $$;
```

**Audit Status:** ✅ **PASSED** for `public.surveys`.
