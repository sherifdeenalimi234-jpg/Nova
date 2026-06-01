# Audit Report - Project Visibility & Publication Flow (Phase 1.2B)

## 1. Audit Findings

### Visibility Logic
- **Current Behavior:** `visibility` field exists ('Public', 'Private', 'Team Only').
- **Public Projects:** Correctly fetched in `app/projects/page.tsx` using `.eq('visibility', 'Public')`.
- **Private Projects:** RLS policies allow creators and members to see them, but they are not filtered out of generic lookups if ID is known (except by RLS).

### Publication Flow
- **Current Behavior:** Projects are created with `status: 'Active'` by default.
- **Manual Workflow:** There are no explicit "Publish" buttons found for projects, but the "Initialize" terminology suggests a hidden state.
- **Approved Workflow:** Create -> Active/Visible based on `visibility` immediately.

## 2. Visibility Logic Report
- **Public Projects:** Should be automatically surfaced in Explore and Feeds. Currently, Explore is doing this.
- **Private Projects:** Should remain hidden from all public listings. RLS handles this at the DB level.
- **Publication:** No additional steps are needed. Visibility is the sole controller.

## 3. Required Corrections
- Remove any references to a "Publish" step.
- Ensure "Private" projects are strictly excluded from any discovery queries in the backend actions.
- Standardize the "Create" flow to bypass any draft or initialization states.
