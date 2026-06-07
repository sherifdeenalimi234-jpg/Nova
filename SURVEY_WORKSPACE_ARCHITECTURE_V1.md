# Survey Workspace Architecture V1

## Overview
The Survey Workspace is the operating system for the Nova Survey ecosystem. It is a mobile-first, modular environment designed to host all survey-related activities from building to analysis.

## Core Components

### 1. Workspace Shell (`WorkspaceShell.tsx`)
- **Parent Container:** Manages the overall layout and navigation state.
- **Mobile Bottom Nav:** Primary navigation for mobile devices.
- **Desktop Sidebar:** Primary navigation for desktop devices.
- **Sticky Actions:** Context-aware buttons (Save, Preview, Publish).

### 2. Layout Structure
- **Workspace Header:** Survey/Project names, status, and global actions.
- **Main Canvas:** The area where specific module content (Build, Analytics, etc.) is rendered.
- **Right Context Panel:** (Desktop only) Context-aware information or settings.
- **Status Bar:** Real-time feedback (Auto-save, sync status).

### 3. Navigation Modules
- **Overview:** Default landing screen.
- **Build:** Question architect and structure (Placeholder V1).
- **Logic:** Branching and logic engine (Placeholder V1).
- **Collect:** Distribution and live survey management.
- **Analytics:** Data visualization and insights.
- **AI Lab:** AI-powered research assistance.
- **Settings:** Survey-specific configurations.

## Design Philosophy
- **Mobile-First:** Every action must be performable on a mobile device without friction.
- **Glassmorphism:** Modern UI with blurred backgrounds and neon accents.
- **Instant Feedback:** Auto-save indicators and clear status messaging.
- **Zero-Latency Feel:** Using Framer Motion for smooth transitions between tabs.
