# Orbit — functionality phase plan

## Scope
Add useful, persistent front-end behavior across the existing Orbit screens while preserving the reference-matched design. This phase stays browser-local: it adds no backend, OAuth connection, real background scheduler, LLM call, image-generation call, or new paid service. The user asked to start adding UX/functionality and push the changes to the connected Orbit GitHub repository.

## Product behavior
- **Tasks — schedules & automations:** create schedules with a name, cadence, and time; pause/resume and delete schedules; create, pause/resume, and delete automation rules. Persist demo configuration in this browser. Clearly communicate that it is not yet a live background scheduler.
- **Library:** upload local files into a local library view with filename/type/size metadata; drag-and-drop and browse work; search/filter/grid/list remain functional; create blank-document and spreadsheet preview entries; open a preview and delete an entry. Do not upload user files to a server in this phase.
- **Integrations:** connect/disconnect demo service cards and remember the toggles locally, with clear copy that no external account or OAuth connection is made.
- **Settings:** make the sections and profile/preferences/privacy/notification controls editable; persist settings locally and make Save provide a truthful saved-state confirmation.
- **Chat and Canvas:** preserve chat messages and Canvas mode/type/draft locally; let follow-up prompts update/refine the in-chat document or spreadsheet preview. Do not claim a live AI response; the local preview can only reflect user input and demo content.
- **Slides & images:** persist local presentation/image preview cards; create, search, open, and delete local preview entries. Keep the existing CSS-based previews and do not call image-generation or slide-generation services.

## Design and interaction
Reuse Orbit’s ivory navigation, white panels, navy primary actions, teal status accents, lavender Canvas treatment, and responsive layout. Make controls keyboard-operable, provide labels and clear empty states, show confirmations through the existing toast/modal patterns, and explain browser-local/demo behavior where a control could otherwise imply a real remote action.

## Implementation approach
Continue the existing Vite + React SPA without adding dependencies. Add a small defensive `localStorage` hook for JSON-compatible state and use it only for browser-local metadata/preferences; keep actual `File` objects and file contents transient in memory. Update existing page modules and styles rather than replacing the visual system. Keep `public/manus-routes.json` synchronized. Build and inspect the resulting UI, then commit and push to `origin/main`.

## Project structure
- `src/App.jsx`: shared shell, route selection, and notices.
- `src/hooks/usePersistentState.js`: reusable, error-tolerant browser persistence for UI state.
- `src/pages/TasksPage.jsx`: schedule and automation CRUD/toggle demo flows.
- `src/pages/LibraryPage.jsx`: local file metadata, filters, preview, create, and remove flows.
- `src/pages/IntegrationsPage.jsx`: clearly demo-only connection state.
- `src/pages/SettingsPage.jsx`: editable and locally persisted settings.
- `src/pages/TaskChatPage.jsx`: persistent chat and Canvas draft workspace.
- `src/pages/SlidesImagesPage.jsx`: persistent local previews and detail views.
- `src/styles.css`: retain the reference style and add responsive modal/menu/form states.
- `public/manus-routes.json`: unchanged route set, synchronized if it changes.

## Constraints
No use of image or video generation; no LLM calls or external connectors; no new paid service or dependency. Browser-local state is device/browser-specific and can be cleared by clearing site data. Real accounts, file storage, AI generation, and scheduled execution remain future backend work.