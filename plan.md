# Orbit UI implementation plan

## Scope
Build a responsive front-end prototype in this repository for the Orbit AI-agent workspace, matching the user-provided concept images. Include the four requested navigation pages—Tasks, Library, Integrations, and Settings—and a task-conversation screen reachable from the in-progress activity card. Tasks follows the latest revision: schedules and automations, not an all-task history list, and no Recent block in the sidebar. No backend, authentication, real file processing, or external integrations are in scope.

## Design
Use the supplied Orbit mockups as the visual reference: warm ivory navigation rail, bright white work surfaces, dark navy actions, muted teal status accents and soft lavender highlights. Keep the interface calm, spacious, grid-aligned, and visually consistent across pages. Use the existing Orbit wordmark concept as a simple original ring mark plus text. Use clear typography, soft borders, rounded cards, and restrained shadows. Interactions should remain lightweight: tab navigation, searchable/filterable items, enabled toggles, schedule creation prompt, upload affordance, and the active-task route. The prototype should not imply that simulated integrations or schedules actually execute.

## Implementation approach
Use Vite + React + lucide-react for a small browser-only SPA. Keep shared shell/navigation in `src/App.jsx`, page-specific UI in `src/pages/`, and visual tokens/layout in `src/styles.css`. Use browser history paths for the primary tabs and `/task/compare` for the running task conversation. Publish the route manifest as `public/manus-routes.json`. Add only client-side sample content; do not add secrets or a backend.

## Project structure
- `index.html`: SPA document entry and page metadata.
- `src/main.jsx`: React bootstrap.
- `src/App.jsx`: shared app shell, navigation, route state, top bar.
- `src/pages/TasksPage.jsx`: schedules and automations page with workspace activity panel.
- `src/pages/LibraryPage.jsx`: file-library and create/upload affordances.
- `src/pages/IntegrationsPage.jsx`: integration catalog and connect states.
- `src/pages/SettingsPage.jsx`: preference and privacy controls.
- `src/pages/TaskChatPage.jsx`: running task conversation and progress timeline.
- `src/styles.css`: responsive design system and page styles.
- `public/manus-routes.json`: SPA page route declarations.

## Constraints
The repository is empty, so establish the front-end toolchain from scratch. Use mocked content and local UI state only. Keep the build self-contained and avoid spending credits on further image generation; the provided images are reference material, not production assets.