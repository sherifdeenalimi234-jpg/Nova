# NOVA Project Ecosystem: "projects" Table Audit Report

## 1. Columns Currently Existing in Database
Based on the migration history (`20240528000000`, `20240610000000`, `20240611000000`), the `public.projects` table contains:

| Column Name | Data Type | Default / Constraints |
| :--- | :--- | :--- |
| `id` | UUID | `gen_random_uuid()`, PRIMARY KEY |
| `creator_id` | UUID | REFERENCES `profiles(id)` |
| `title` | TEXT | NOT NULL |
| `description` | TEXT | *Deprecated* |
| `thumbnail_url` | TEXT | *Deprecated* |
| `media_urls` | TEXT[] | DEFAULT '{}' |
| `slug` | TEXT | UNIQUE |
| `short_description` | TEXT | |
| `full_description` | TEXT | |
| `category` | TEXT | |
| `status` | TEXT | DEFAULT 'Draft', CHECK ('Draft', 'Active', 'On Hold', 'Completed', 'Archived') |
| `visibility` | TEXT | DEFAULT 'Public', CHECK ('Public', 'Team Only', 'Private') |
| `cover_image` | TEXT | |
| `banner_image` | TEXT | |
| `tags` | TEXT[] | DEFAULT '{}' |
| `project_type` | TEXT | DEFAULT 'Live Project', CHECK ('Live Project', 'Showcase Project') |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

## 2. Columns Referenced in Codebase
The following columns are explicitly referenced in application logic:

| Column | References |
| :--- | :--- |
| `id` | `lib/actions/projects.ts`, `app/projects/[id]/page.tsx`, `components/projects/ProjectCard.tsx`, `components/hub/HeroDashboard.tsx` |
| `creator_id` | `lib/actions/projects.ts`, `app/projects/[id]/page.tsx` |
| `title` | `lib/actions/projects.ts`, `app/projects/create/page.tsx`, `app/projects/[id]/page.tsx`, `components/projects/ProjectCard.tsx` |
| `slug` | `lib/actions/projects.ts` |
| `short_description`| `lib/actions/projects.ts`, `app/projects/create/page.tsx`, `app/projects/[id]/page.tsx`, `components/projects/ProjectCard.tsx` |
| `full_description` | `lib/actions/projects.ts`, `app/projects/create/page.tsx` |
| `category` | `lib/actions/projects.ts`, `app/projects/create/page.tsx`, `app/projects/[id]/page.tsx` |
| `status` | `lib/actions/projects.ts`, `app/projects/page.tsx`, `app/projects/[id]/page.tsx`, `components/projects/ProjectCard.tsx` |
| `visibility` | `lib/actions/projects.ts`, `app/projects/create/page.tsx`, `app/projects/[id]/page.tsx` |
| `project_type` | `lib/actions/projects.ts`, `app/projects/page.tsx`, `app/projects/create/page.tsx`, `app/projects/[id]/page.tsx`, `components/projects/ProjectCard.tsx` |
| `tags` | `lib/actions/projects.ts` |
| `cover_image` | `lib/actions/projects.ts`, `app/projects/create/page.tsx`, `app/projects/[id]/page.tsx`, `components/projects/ProjectCard.tsx` |
| `banner_image` | `lib/actions/projects.ts` |
| `created_at` | `app/projects/[id]/page.tsx` |
| `updated_at` | `app/projects/[id]/page.tsx`, `components/projects/ProjectCard.tsx` |
| `description` | `app/u/[username]/page.tsx` (*Legacy reference*) |
| `thumbnail_url` | `app/u/[username]/page.tsx` (*Legacy reference*) |

---

## 3. Missing Columns
**None identified.** All columns required by the current application logic are defined in the database migrations.

---

## 4. Deprecated or Unused Columns
- **`description`**: Replaced by `short_description` and `full_description`.
- **`thumbnail_url`**: Replaced by `cover_image`.
- **`media_urls`**: Defined in schema but not bound to any active UI elements.

---

## 5. Data Type Requirements
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `slug` | TEXT | URL-friendly identifier |
| `short_description`| TEXT | Brief summary for cards |
| `full_description` | TEXT | Extended project details |
| `tags` | TEXT[] | Categorization array |
| `project_type` | TEXT | Differentiates Live vs Showcase |

---

## 6. Complete Idempotent SQL Migration
```sql
-- PROJECTS SCHEMA SYNC
DO $$
BEGIN
    -- Ensure columns exist
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS short_description TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS full_description TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'Public';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS banner_image TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'Live Project';
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- Data Migration
    UPDATE public.projects SET full_description = description WHERE full_description IS NULL AND description IS NOT NULL;
    UPDATE public.projects SET cover_image = thumbnail_url WHERE cover_image IS NULL AND thumbnail_url IS NOT NULL;

    -- Constraints
    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_status_check CHECK (status IN ('Draft', 'Active', 'On Hold', 'Completed', 'Archived'));

    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_visibility_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_visibility_check CHECK (visibility IN ('Public', 'Team Only', 'Private'));

    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_type_check;
    ALTER TABLE public.projects ADD CONSTRAINT projects_type_check CHECK (project_type IN ('Live Project', 'Showcase Project'));

    -- Trigger
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_projects_updated_at') THEN
        CREATE TRIGGER set_projects_updated_at
            BEFORE UPDATE ON public.projects
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
```

---

## 7. Verification Query
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;
```
