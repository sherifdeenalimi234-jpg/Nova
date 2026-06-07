# SURVEY WORKSPACE ARCHITECTURE V1

## 1. Environment Overview
The Survey Workspace is the central operating system for research projects. It provides a persistent shell containing a high-level header and a contextual navigation system.

## 2. Layout Specification

### 2.1 Desktop Layout
- **Header**: Persistent top bar showing Survey Title, Project, Status, Visibility, and Global Actions (Save, Preview, Publish).
- **Sidebar**: Left-aligned navigation for switching between modules (Overview, Build, Logic, Collect, Analytics, AI Lab, Settings).
- **Main Canvas**: Centered work area for the active module.
- **Status Bar**: Bottom bar for system notifications, auto-save status, and versioning info.

### 2.2 Mobile Layout
- **Bottom Navigation**: Tab bar for primary modules (Overview, Build, Collect, Analytics, More).
- **Scrollable Canvas**: Full-width content area.
- **Safe Area Support**: Full integration with notch and home indicator spacing.

## 3. Module Definitions

| Module | Purpose | Default |
|--------|---------|---------|
| **Overview** | Landing page with research summary and progress. | Yes |
| **Build** | Question architect and section manager. | No |
| **Logic** | Visual logic builder and flow manager. | No |
| **Collect** | Distribution channels and collection status. | No |
| **Analytics** | Real-time results and AI insights. | No |
| **AI Lab** | Research assistant and automation tools. | No |
| **Settings** | Survey-specific configurations and permissions. | No |

## 4. Initialization Logic
1. **Verification**: Check if the survey ID exists in the `surveys` table.
2. **Authorization**: Ensure `creator_id` matches `auth.uid()` or the user has a record in `survey_members`.
3. **State Sync**: Fetch metadata (mode, visibility, target responses) to hydrate the shell.
4. **Active Tab**: Default to `Overview`.
