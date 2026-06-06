# Survey Launch Execution Trace

## Execution Flow

1.  **Launch Button Component:** Located in `app/creator/surveys/new/page.tsx`.
    ```tsx
    <button
      onClick={() => handleLaunch('published')}
      disabled={loading}
      className="..."
    >
       {loading ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
       {loading ? 'Launching...' : 'Launch'}
    </button>
    ```

2.  **onClick Handler:** Calls `handleLaunch('published')` within `CreateSurveyPage`.

3.  **Function Called:** `handleLaunch(surveyStatus: 'draft' | 'published')` in `app/creator/surveys/new/page.tsx`.
    - Validates `title`.
    - Sets `loading` to `true`.
    - Calls `createSurvey`.

4.  **Server Action Called:** `createSurvey({ title, description, status: 'published' })` in `lib/actions/surveys.ts`.
    - Authenticates user.
    - Inserts into `public.surveys`:
        - `creator_id`: `user.id`
        - `title`: `data.title`
        - `description`: `data.description`
        - `category`: `'General'` (default)
        - `status`: `'published'`
        - `settings`: `{ anonymous: false, one_response_per_participant: true }`
        - `questions`: `[]`
    - Calls `revalidatePath`.
    - Returns `{ data: survey }`.

5.  **Result returned from `createSurvey()`:** A JSON object containing the full survey record from the database.
    ```json
    {
      "data": {
        "id": "77f3e8f9-...",
        "creator_id": "...",
        "title": "...",
        "description": "...",
        "status": "published",
        "created_at": "...",
        "updated_at": "...",
        ...
      }
    }
    ```

6.  **Survey ID generated:** A standard Postgres UUID (e.g., `77f3e8f9-4b1e-4b2a-8b3c-9d4e5f6a7b8c`).

7.  **Redirect Route Generated:**
    - Logic: `router.push("/creator/surveys/" + res.data.id + "/builder")`
    - Result: `/creator/surveys/77f3e8f9-.../builder`

8.  **Route expected by workspace:** The "Survey Architect" workspace expects `/creator/surveys/[id]/builder`.

9.  **Route actually existing in the application:**
    - `app/creator/surveys/[id]/builder/page.tsx` exists.
    - This route loads `BuilderClient.tsx`.

10. **Exact point where the failure occurs:**
    - **Step:** Navigation to `/creator/surveys/[id]/builder`.
    - **Failure Condition:** The page `app/creator/surveys/[id]/builder/page.tsx` calls `getSurveyForBuilder(id)`.
    - **Internal Failure:** `getSurveyForBuilder` (in `lib/actions/surveys.ts`) attempts a complex join:
      ```typescript
      .select(`
        *,
        questions:survey_questions(
          *,
          options:survey_options(*)
        )
      `)
      ```
    - **Root Cause:** If the database tables `survey_questions` or `survey_options` are missing, or if the RLS on those tables is misconfigured (as seen in some previous audits for projects), this query will fail or return `null`.
    - **Application Symptom:** The page code does `if (error || !survey) notFound();`, resulting in a **404 Not Found** error immediately after "successful" creation.

---

## Verification Summary

| Item | Status | Note |
| :--- | :--- | :--- |
| **Survey row created?** | ✅ YES | Confirmed by `createSurvey` insert logic. |
| **Survey ID returned?** | ✅ YES | Returned via `.select().single()`. |
| **Redirect executed?** | ✅ YES | Triggered by `router.push`. |
| **Workspace route exists?** | ✅ YES | Found at `app/creator/surveys/[id]/builder`. |
| **Workspace can load?** | ❌ NO | Likely fails during `getSurveyForBuilder` due to missing/empty relation data or RLS constraints. |

## Execution Trace (Button -> Failure)

1. **User clicks "Launch"** in `app/creator/surveys/new/page.tsx`.
2. **`handleLaunch`** state becomes `loading`.
3. **`createSurvey`** (Server Action) successfully inserts survey into `public.surveys`.
4. **`createSurvey`** returns the new survey object with its `id`.
5. **`handleLaunch`** receives response, sets status to `success`.
6. **`router.push`** is called with `/creator/surveys/[id]/builder` after 1000ms.
7. **Next.js Router** navigates to the new URL.
8. **`BuilderPage`** (Server Component) executes `getSurveyForBuilder(id)`.
9. **Supabase Query** in `getSurveyForBuilder` attempts to fetch questions and options via nested join.
10. **Failure:** The query returns an error or empty result because while the *survey* exists, the builder expects to resolve the full question tree which may be encountering RLS blocks or schema mismatches (e.g., `survey_questions` table might not have records yet, which is fine, but the join might be failing the `.single()` constraint if not handled).
11. **Result:** `notFound()` is called, and the user sees a **404 Error page**.
