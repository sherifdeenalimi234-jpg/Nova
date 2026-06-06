# UI Architecture

## Design Language
- **Theme:** Dark Mode (#050505 background)
- **Accents:** Nova Purple (#BC13FE), Nova Cyan (#00F2FF)
- **Styling:** Glassmorphism (semi-transparent backgrounds, blur effects), Neon glows, rounded-2xl/3xl corners.

## Component Structure
- **Layout:** `app/layout.tsx` provides the base.
- **Page Container:** `max-w-3xl mx-auto` for readability and focus.
- **Form Sections:** Responsive grid (`grid-cols-1 md:grid-cols-2`) for field organization.
- **Interactions:**
  - `framer-motion` for page entrance and overlay transitions.
  - `lucide-react` for consistent iconography.

## Mobile Considerations
- Stacked inputs on small screens.
- Touch-optimized tap targets (padding-5, rounded-2xl).
- Sticky or prominent action buttons for easy thumb reach.
