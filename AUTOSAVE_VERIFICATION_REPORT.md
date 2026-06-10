# AUTOSAVE & SYNCHRONIZATION VERIFICATION

## 1. Mechanism
- **Debounce**: 1000ms delay on all inspector and canvas updates.
- **Queueing**: `pendingUpdatesRef` tracks concurrent changes to ensure no data loss during overlapping saves.
- **Status UI**: Visual feedback via the "Sync Status Overlay" (Syncing... / Synced / Sync Error).

## 2. Error Recovery
- Optimistic updates are applied immediately to the local `survey` state.
- Errors during server action execution trigger a "Sync Error" state in the UI.
