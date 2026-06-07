# Survey Workspace Implementation Plan

## Phase 1B: Rebuilding the Shell

### 1. Cleanup
- Remove legacy files and sub-routes under `app/creator-surveys/[id]`.

### 2. Base Shell
- Implement `WorkspaceShell.tsx` with responsive layout.
- Integrate `lucide-react` for iconography.
- Use `framer-motion` for layout animations and drawer.

### 3. Module Development
- **Overview:** Build a rich dashboard summarizing survey metadata.
- **Placeholders:** Create standardized placeholder screens for Build, Logic, Collect, Analytics, AI Lab, and Settings.

### 4. Integration
- Update `app/creator-surveys/page.tsx` with the new zero-state and list designs.
- Fix the redirect logic in `blueprint/page.tsx` and `lib/actions/surveys.ts`.

### 5. Verification
- Test on mobile and desktop breakpoints.
- Ensure state persistence (active tab) via URL segments.
- Validate that creation flow lands on the Overview tab.
