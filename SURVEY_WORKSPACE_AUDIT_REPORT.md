# Survey Workspace Audit Report

## Audit Trace: Survey Creation & Redirect Flow

1. **Source:** `app/creator-surveys/blueprint/page.tsx`
2. **Action:** User fills form and clicks "Create Workspace".
3. **Server Action:** `createSurveyWorkspace()` in `lib/actions/surveys.ts`.
4. **Database:** Survey record is successfully created in `public.surveys` table with blueprint metadata.
5. **Return:** Server action returns `{ success: true, id: "[SURVEY_ID]" }`.
6. **Redirect:** Client-side `router.push("/creator-surveys/[SURVEY_ID]")` is executed.
7. **Observation:** User is redirected to the homepage instead of entering the workspace.

## Root Cause Analysis

1. **What survey ID is returned?**
   - A valid UUID for the newly created survey is returned.

2. **What route is currently being called?**
   - `/creator-surveys/[id]`

3. **Why the homepage redirect occurs?**
   - **Hypothesis A (Middleware):** The middleware might be intercepting the new route and redirecting to `/` if it thinks the user is not authorized or if the session is not properly detected on the new route.
   - **Hypothesis B (Layout Redirect):** `app/creator-surveys/[id]/layout.tsx` or `page.tsx` might be calling `redirect('/')` because `getSurveyForBuilder` might fail or return an error shortly after creation (race condition or revalidation delay).
   - **Hypothesis C (Next.js Cache):** The new route might not be "known" yet by the client-side router due to lack of immediate revalidation or cache mismatch.

4. **Whether the workspace route exists?**
   - Yes, `app/creator-surveys/[id]/page.tsx` and `app/creator-surveys/[id]/layout.tsx` exist.

5. **Whether route permissions are blocking access?**
   - `middleware.ts` allows access to `/creator-surveys` for verified creators. The sub-route should be covered.

6. **Whether initialization is failing silently?**
   - The server action logs success, so the DB part is fine. The failure happens during or after redirect.

## Recommendations

- Implement explicit `revalidatePath("/creator-surveys")` in the server action.
- Add defensive checks in `WorkspaceLayout` to ensure it doesn't redirect to `/` unless absolutely necessary (no user).
- Ensure the destination route is fully initialized before the user arrives.
