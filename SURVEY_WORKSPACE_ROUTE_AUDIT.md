# SURVEY WORKSPACE ROUTE AUDIT

## 1. Active Routes
| Route | Purpose | Status |
|-------|---------|--------|
| `/surveys/blueprint` | Survey Initialization Layer | Active (V1) |
| `/creator/surveys` | Creator Dashboard | Active |
| `/creator/surveys/[id]/builder` | Legacy Question Builder | Active (To be integrated) |

## 2. New Workspace Architecture Routes
| Route | Purpose | Action |
|-------|---------|--------|
| `/creator/surveys/[id]` | Workspace Overview | **TO BE CREATED** |
| `/creator/surveys/[id]/build` | Question Builder Module | **TO BE CREATED** |
| `/creator/surveys/[id]/logic` | Logic Engine Module | **TO BE CREATED** |
| `/creator/surveys/[id]/collect` | Data Collection Module | **TO BE CREATED** |
| `/creator/surveys/[id]/analytics` | Analytics Module | **TO BE CREATED** |
| `/creator/surveys/[id]/ai-lab` | AI Intelligence Module | **TO BE CREATED** |
| `/creator/surveys/[id]/settings` | Workspace Settings | **TO BE CREATED** |

## 3. Redirection Rules
- Redirect `/creator/surveys/new` → `/surveys/blueprint` (Implemented).
- Redirect Blueprint Success → `/creator/surveys/[id]` (Workspace Home).
- Unauthorized access to `/creator/*` → `/feed` or `/`.

## 4. Observations
The current redirect in `blueprint/page.tsx` to `/builder` skips the intended Workspace Shell. By introducing a layout at `/creator/surveys/[id]/layout.tsx`, we can encapsulate all modules within the shell.
