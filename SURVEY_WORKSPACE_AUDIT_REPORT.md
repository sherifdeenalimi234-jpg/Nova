# SURVEY WORKSPACE AUDIT REPORT

## 1. Creation Flow Trace
- **Source**: `app/surveys/blueprint/page.tsx`
- **Action**: `createSurveyWorkspace` in `lib/actions/surveys.ts`
- **Current Redirection**: `router.push("/creator/surveys/${result.id}/builder")`
- **Issue identified**: The redirect points to `/builder`, which is a legacy/question-builder path. If the middleware or the page itself has issues, or if the user expectation is a full "Workspace Shell", this path is insufficient.
- **Root Cause of Homepage Redirect**:
  1. The path `/creator/surveys/[id]` (without `/builder`) does not have a `page.tsx`, causing a 404 which might be caught by middleware and redirected to `/`.
  2. The `middleware.ts` might be blocking access to `/creator/surveys/[id]/builder` if the survey is newly created and some "verification" or "profile" state hasn't updated, though unlikely for creators.
  3. The most likely cause is that `router.push` is called on a route that doesn't exist or isn't properly handled by the App Router's file structure.

## 2. Route Audit
- **Blueprint Route**: `/surveys/blueprint`
- **Workspace Target Route**: `/creator/surveys/[id]` (Currently missing `page.tsx`)
- **Legacy Builder Route**: `/creator/surveys/[id]/builder` (Exists, but is specialized for question building, not the full workspace shell)
- **Legacy Creation Route**: `/creator/surveys/new` (Redirects to blueprint)

## 3. Database State
- **Surveys Table**: Exists with V1 metadata (objective, mode, audience, etc.).
- **Workspace Tables**: `survey_sections`, `survey_logic_nodes`, `survey_members` are currently **MISSING** (defined in spec but not implemented).
- **Initialization**: `createSurveyWorkspace` successfully creates the `surveys` record, but no workspace-specific configuration (like default sections or members) is initialized.

## 4. Recommendations
- Create `app/creator/surveys/[id]/page.tsx` to act as the Workspace Home (Overview).
- Create `app/creator/surveys/[id]/layout.tsx` to host the Workspace Shell (Header, Sidebar).
- Update the Blueprint redirect to `/creator/surveys/[id]`.
- Implement a robust initialization check in the Workspace layout.
