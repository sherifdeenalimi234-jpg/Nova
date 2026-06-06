# Survey Route Map

## Initialization Flow
1. **Entry Point:** `/surveys/blueprint`
   - User fills out the Survey Blueprint form.
2. **Action:** `createSurveyWorkspace`
   - Validates data.
   - Creates `surveys` record.
   - Redirects user.
3. **Target:** `/surveys/[id]/dashboard`
   - Existing Survey Dashboard for managing the newly created workspace.

## Related Routes
- **Dashboard:** `/surveys/[id]/dashboard`
- **Builder (Legacy/Refactored):** `/creator/surveys/[id]/builder`
- **Management:** `/creator/surveys`
- **Analytics:** `/surveys/[id]/analytics`

## Redirect logic
The `Create Workspace` button performs a POST request via server action and upon success, the client-side router pushes the user to the Dashboard.
