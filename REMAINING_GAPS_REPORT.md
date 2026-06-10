# REMAINING GAPS REPORT

## 1. LOGIC ENGINE UI
While the backend now supports logic rules, the UI for adding and managing these rules (`LogicEditor`) has not been implemented yet. Logic rules currently exist only as a database and server action foundation.

## 2. ADVANCED VALIDATION UI
The properties inspector includes placeholders for advanced validation rules. These rules are currently stored as JSONB but lack a dedicated management interface in the UI.

## 3. MULTI-USER CONCURRENCY
The current autosave system works well for a single user, but there is no operational locking or conflict resolution for multiple collaborators editing the same survey simultaneously.

## 4. IMAGE UPLOADS FOR QUESTIONS
The schema supports question descriptions and titles, but there is currently no dedicated UI flow for uploading and associating media directly with specific questions within the builder.
