# PROJECT CREATION ROOT CAUSE REPORT (AUDIT)

## Root Cause
The Supabase JavaScript client query builder was being misused in the `getProject` server action. Filter methods like `.eq()` do not mutate the query object in-place; instead, they return a new query instance. The code was calling `.eq()` but discarding the returned filtered query, resulting in `await query.single()` executing an unfiltered query against the `projects` table.

## File Name
`lib/actions/projects.ts`

## Function Name
`getProject(projectIdOrSlug: string)`

## Failing Condition
```typescript
if (isUuid) {
  query.eq('id', projectIdOrSlug); // Result discarded
} else {
  query.eq('slug', projectIdOrSlug); // Result discarded
}

const { data, error } = await query.single(); // Executed select * from projects. If >1 row exists, returns error.
```

## Exact Code Fix
```typescript
if (isUuid) {
  query = query.eq('id', projectIdOrSlug); // Result reassigned
} else {
  query = query.eq('slug', projectIdOrSlug); // Result reassigned
}

const { data, error } = await query.single(); // Now correctly filtered
```

## Why the project exists in the database but cannot be displayed
The project was successfully created and a valid `id` was returned and used for redirection. However, because the subsequent fetch on the landing page failed to apply the `id` filter, Supabase returned an error (likely `PGRST116`: JSON object requested, but multiple rows were returned) because the table contained more than one project. The application interpreted this error/null data as the project not existing.

## Route Parameters
- **Destination Route**: `/projects/[id]`
- **Required Parameter**: Project `id` (UUID)
- **Verified**: `router.push(\`/projects/\${result.data.id}\`)` matches the route structure and passes the correct UUID.

## Additional Fixes
- Added `export const dynamic = "force-dynamic";` to `app/projects/[id]/page.tsx` and `app/projects/create/page.tsx` to prevent stale data during Next.js build-time prerendering or caching.
- Added extensive debug logging to trace the creation and retrieval flow.

## Confirmation
The landing page can now load immediately after project creation because the `getProject` action correctly filters for the specific project ID, ensuring a successful data fetch even when multiple projects exist in the ecosystem.
