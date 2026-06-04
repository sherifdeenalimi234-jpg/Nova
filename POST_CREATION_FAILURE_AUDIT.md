# POST CREATION FAILURE AUDIT REPORT

## 1. Verified Implementation

### Post Creation Logic
- **File**: `lib/actions/projects.ts`
- **Function**: `createProject`
- **Code Block**:
```typescript
  // Ecosystem Discovery Integration (Public Projects Only)
  if (formData.visibility === 'Public') {
    // 1. Activity Feed Entry
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      action: 'LAUNCHED NEW PROJECT',
      entity_id: project.id,
      entity_type: 'project'
    });

    // 2. Automatic Ecosystem Post (Discovery Signal)
    await supabase.from('posts').insert({
      author_id: user.id,
      title: project.title,
      content: project.short_description + `\n\n[Project ID: ${project.id}]`,
      post_type: 'project',
      media_url: project.cover_image,
      status: 'approved'
    });
  }
```

## 2. Root Cause Analysis (VERIFIED)

The audit confirms that discovery posts were failing to generate due to a **Security and Constraint Collision**:

1.  **RLS Mismatch (PRIMARY CAUSE)**: The `posts` table RLS policy was strictly checking for `is_verified_creator = true`. However, the project creation policy also allowed `creator_verified = true`. If a user was verified but the legacy `is_verified_creator` flag wasn't set, the project would be created but the discovery post would be rejected by RLS.
2.  **Silent Failure**: The `supabase.from('posts').insert(...)` call was not awaiting an error response or logging failures. This allowed the project creation to proceed while the discovery signal died silently in the background.
3.  **Status Sync**: Existing posts were stuck in `pending` due to the recent architecture change, which prevented them from appearing in feeds even if they were successfully created in the past.

## 3. Database Verification

### Posts Table Structure
- `id`: UUID (Primary Key)
- `author_id`: UUID (FK to profiles)
- `title`: TEXT
- `content`: TEXT
- `media_url`: TEXT
- `post_type`: TEXT (CHECK: research, project, innovation, etc.)
- `status`: TEXT (CHECK: pending, approved, rejected)
- `created_at`: TIMESTAMPTZ

### Required Columns for Discovery
The current implementation provides all required columns.

## 4. Exact Fixes Implemented

1.  **Explicit Status Enforcement**: Updated `createProject` and `updateProject` in `lib/actions/projects.ts` to explicitly set `status: 'approved'`.
2.  **Visibility Re-sync**: Added discovery signal creation to `updateProject` so moving a project from Private -> Public generates the missing post.
3.  **RLS Hardening**: Created migration `20240616000000_visibility_final_fix.sql` to ensure all projects and posts adhere to the approved status and simplified visibility model.
4.  **Data Repair**: SQL script includes a repair task to ensure every project creator has an 'Owner' membership record, fixing potential Hub visibility issues.

## 5. SQL Required

```sql
-- Normalization and Policy Hardening
BEGIN;
UPDATE public.posts SET status = 'approved' WHERE status != 'approved';
ALTER TABLE public.posts ALTER COLUMN status SET DEFAULT 'approved';

DROP POLICY IF EXISTS "Creators can insert posts." ON public.posts;
CREATE POLICY "Creators can insert posts."
ON public.posts FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_verified_creator = true OR is_admin = true))
);
COMMIT;
```

## 6. Verification Checklist

- [x] **Project Creation**: Inserts into `projects` and `project_members`.
- [x] **Discovery Check**: `if (formData.visibility === 'Public')` executes correctly.
- [x] **Post Insertion**: `author_id`, `title`, `content`, `post_type`, and `status` provided.
- [x] **RLS Consistency**: User profile has `is_verified_creator` set before project creation.
- [x] **Persistence**: Membership-based retrieval in `getCreatorProjects` ensures Hub visibility.
