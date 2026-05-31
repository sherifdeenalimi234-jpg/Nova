# NOVA Project Ecosystem Architecture

## Overview
The NOVA Project Ecosystem is a mobile-first platform designed to manage the entire lifecycle of innovation initiatives, from ideation to live deployment. It moves away from the Creator Studio and becomes a dedicated experience.

## Core Pillars

### 1. Creator Projects Hub
The central entry point for creators. It provides an overview of all their initiatives, active tasks across projects, and quick actions to initiate new builds.
- **Features**: Statistics, Recent Activity, Project Switcher.

### 2. Showcase Projects
A public-facing discovery layer where innovation projects are displayed to the community.
- **Features**: Filtering by category, search, "innovation node" previews, repository access.

### 3. Live Projects
Focuses on projects that are currently in production or live operation.
- **Features**: Real-time status indicators, live metrics integration.

### 4. Project Workspace
A dedicated, immersive environment for a single project.
- **Features**: Unified dashboard, integration of tasks, team, and files.

### 5. Team System
Manages collaboration within a project.
- **Features**: Role-based access (Owner, Researcher, Developer, Designer, Contributor), member invites, permission management.

### 6. Tasks System
Mobile-optimized task management.
- **Features**: Kanban/List views, task assignments, status tracking (Todo, Doing, Done), priority levels.

### 7. Files System
Centralized storage for project assets and documentation.
- **Features**: Versioning, folder organization, integration with Supabase Storage.

### 8. Milestones System
Tracks high-level project progress.
- **Features**: Roadmap visualization, deadline management, achievement tracking.

### 9. Future Survey Integration
Seamlessly connect project milestones with community feedback through the existing Survey system.

---

## Route Structure (Mobile-First)

- `/projects` - Projects Hub (Dashboard)
- `/projects/explore` - Showcase Discovery
- `/projects/live` - Live Projects Directory
- `/projects/create` - New Project Wizard
- `/projects/[projectId]` - Project Overview (Mobile Landing)
- `/projects/[projectId]/workspace` - Main Workspace Dashboard
- `/projects/[projectId]/tasks` - Task Management
- `/projects/[projectId]/team` - Team & Collaboration
- `/projects/[projectId]/files` - Document & Asset Storage
- `/projects/[projectId]/milestones` - Roadmap & Progress
- `/projects/[projectId]/settings` - Project Configuration

---

## Mobile UX Navigation Plan

The navigation will be optimized for thumb-reach and fast switching:
1. **Hub**: Quick overview and stats.
2. **Projects**: Your active projects list.
3. **Create**: (+) Large central action button for new initiatives.
4. **Activity**: Global notification and update feed.
5. **More**: Search, Settings, and Archive.

---

## Infrastructure Foundations

### Database Plan
- **Reusable Tables**: `projects`, `project_members`.
- **Planned Tables**:
    - `project_tasks`: id, project_id, title, description, assignee_id, status, priority, due_date.
    - `project_milestones`: id, project_id, title, target_date, status.
    - `project_files`: id, project_id, name, storage_path, uploader_id, version.
- **Policies**: RLS will be strictly enforced based on `project_members` roles.

### Storage Plan
- **Bucket**: `projects` (Existing).
- **Organization**: `projects/{projectId}/{fileId}`.
- **Access**: Private by default, restricted to project members via RLS.
