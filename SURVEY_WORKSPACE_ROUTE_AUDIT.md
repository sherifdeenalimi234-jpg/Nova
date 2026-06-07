# Survey Workspace Route Audit

## Official Routes (Phase 1B)

- `/creator-surveys`: Library and management hub.
- `/creator-surveys/blueprint`: Initialization flow.
- `/creator-surveys/[id]`: Workspace root (Overview).
- `/creator-surveys/[id]/build`: Question builder.
- `/creator-surveys/[id]/logic`: Logic engine.
- `/creator-surveys/[id]/collect`: Collection hub.
- `/creator-surveys/[id]/analytics`: Data center.
- `/creator-surveys/[id]/ai-lab`: AI assistant.
- `/creator-surveys/[id]/settings`: Configuration.

## Deprecated/Legacy Routes

- `/creator-surveys/new`: Redirects to blueprint.
- `/creator-surveys/[id]/architect`: Renamed to `/build` (Standardized).
- Legacy routes under `/creator/surveys` (if any) are retired.

## Redirect Rules

1. **Guest Access:** Redirect to `/`.
2. **Post-Creation:** Redirect from `/blueprint` to `/creator-surveys/[id]`.
3. **Internal Exit:** "Exit Workspace" returns to `/creator-surveys`.
4. **Invalid Survey:** Redirect to `/creator-surveys`.
