# WORKSPACE REDIRECT FAILURE AUDIT

## 1. Current Flow
1. **User Input**: User completes the Survey Blueprint form at `/surveys/blueprint`.
2. **Submission**: User clicks "Create Workspace", triggering `handleCreate()`.
3. **Server Action**: `createSurveyWorkspace()` (in `lib/actions/surveys.ts`) is called.
   - It successfully inserts the survey into the `surveys` table.
   - It inserts an entry into the `activity_feed`.
   - **Critical Step**: It calls `revalidatePath('/surveys/blueprint')`.
4. **Client Response**: `handleCreate()` awaits the result.
5. **Redirection**: On success, `handleCreate()` uses `setTimeout` (1500ms) to call `router.push("/creator/surveys/${result.id}")`.

## 2. Failure Point
The failure occurs due to the interaction between `revalidatePath` and the client-side navigation:
- **Immediate Refresh**: Calling `revalidatePath` on the active route (`/surveys/blueprint`) within a server action can trigger a data refresh or a full component re-render in the App Router.
- **State Reset**: This refresh often resets the client-side state of the Blueprint page. Since `isInitializing` and the `setTimeout` are part of this state, they can be lost if the refresh happens before the timeout completes.
- **Apparent Redirect**: To the user, it looks like the page "completes" and then they are still on the Blueprint page (or it refreshes to its initial state), which feels like being "redirected back".

## 3. Secondary Issue: Route Mismatch
Even if the redirect to `/creator/surveys/[id]` succeeds, subsequent navigation within the Workspace Shell is broken:
- **WorkspaceShell.tsx** links the "Build" tab to `/creator/surveys/[id]/build`.
- The actual directory is `app/creator/surveys/[id]/builder`.
- **Legacy Redirect**: `app/creator/surveys/[id]/builder/page.tsx` currently redirects to `/build`, which does not exist, causing a 404 or further redirect loops.

## 4. Root Cause Summary
- **Primary**: `revalidatePath('/surveys/blueprint')` in `lib/actions/surveys.ts` interrupts the client-side navigation flow.
- **Secondary**: Folder naming mismatch (`builder` vs `build`) and incorrect legacy redirects.

## 5. Required Fix
1. **Action Fix**: Remove `revalidatePath('/surveys/blueprint')` from `createSurveyWorkspace` in `lib/actions/surveys.ts`.
2. **Directory Sync**: Rename `app/creator/surveys/[id]/builder` to `app/creator/surveys/[id]/build`.
3. **Page Update**: Modify `app/creator/surveys/[id]/build/page.tsx` to directly render the builder content (using `BuilderClient`) instead of redirecting.
4. **Redirection Cleanup**: Remove unnecessary delays in `handleCreate()` that might be susceptible to race conditions.
