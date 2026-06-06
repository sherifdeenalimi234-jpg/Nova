# Testing Checklist

## 1. Data Integrity
- [ ] Survey record created in `surveys` table.
- [ ] `id` is a valid UUID.
- [ ] `title` matches input.
- [ ] `research_objective` matches input.
- [ ] `project_id` correctly linked (or null if "No Project").
- [ ] `target_audience` correctly stored.
- [ ] `target_responses` correctly stored.
- [ ] `estimated_duration` correctly stored.
- [ ] `visibility` is one of: 'Private', 'Public', 'Invite Only'.
- [ ] `status` initialized as 'draft'.

## 2. Functionality
- [ ] "Create Workspace" button disabled while loading.
- [ ] Validation prevents submission without Name or Objective.
- [ ] Projects are dynamically fetched and populated in dropdown.
- [ ] "Custom" options for Audience/Responses show sub-inputs.

## 3. Navigation
- [ ] Successful creation redirects to `/surveys/[id]/dashboard`.
- [ ] Loading overlay shows correct status messages.

## 4. Legacy Check
- [ ] No "Launch Architect" branding visible on Dashboard.
- [ ] No "Quantum synchronization" or "Logic Node" branding on Blueprint page.
