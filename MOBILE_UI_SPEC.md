# Mobile UI Specification

## Breakpoints
- **Mobile:** < 768px (Single column layout)
- **Desktop:** >= 768px (Two column grid for metadata fields)

## Safe Areas
- Padding: `px-6` on mobile containers.
- Bottom Margin: `pb-40` to avoid overlap with sticky bars or OS gestures.

## Typography
- **Heading:** `text-4xl font-black` (36px+)
- **Subtitles:** `text-sm text-white/40`
- **Labels:** `text-xs font-bold uppercase tracking-widest`
- **Inputs:** `text-sm px-5 py-4`

## Specific Elements
- **Buttons:** Min-height 60px (`py-5`) for touch accuracy.
- **Selects:** Styled as `appearance-none` to allow custom glassmorphism styling while retaining native select functionality for mobile accessibility.
- **Overlays:** Full-screen `fixed inset-0` with `backdrop-blur-xl` for heavy focus during "Initializing" state.
