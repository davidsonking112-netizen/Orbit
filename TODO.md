# TODO

## Previously delivered interface outcomes
- [x] Shared Orbit shell, navigation, and the reference palette.
- [x] Tasks as schedules and automations, without an all-task history page or Recent sidebar block.
- [x] Library screen, Integrations screen, Settings screen, and active-task chat with progress and approval context.
- [x] Canvas is enabled from the chat composer plus menu, not a navigation tab; it supports document/spreadsheet preview inline in chat.
- [x] Separate Slides & images tab with presentation and image preview cards.

## Approved Phase 1 functionality outcomes
- [x] **Schedules and automations:** Create schedules with a name, cadence, and time; pause/resume or delete schedules; create, pause/resume, or delete automation rules; keep their demo state after browser refresh; clearly state these are not live background jobs.
- [x] **Library:** Add local files by picker or drag-and-drop and show their name, type, and size; retain searchable/filterable and grid/list views; create blank document/spreadsheet preview entries; open a preview and delete an entry; do not upload files to a server.
- [x] **Integrations:** Search and filter service cards; toggle demo connection state and retain it after refresh; clearly disclose that a toggle does not connect an external account or perform OAuth.
- [x] **Settings:** Edit profile, preferences, privacy, and notification controls; save and restore those values locally; show an honest saved-state confirmation.
- [x] **Chat and Canvas:** Retain chat messages, Canvas type, and draft across page navigation and refresh; let follow-up prompts update the inline document/spreadsheet preview using local demo content, without claiming or invoking a live AI response.
- [x] **Slides & images:** Create, search, open, and delete presentation/image preview entries; persist the entries locally and clearly identify them as previews rather than generated media.
- [x] **Cross-screen UX:** Preserve the existing responsive Orbit visual design, add keyboard-accessible controls and useful empty/confirmation states, and confirm the production build succeeds.
- [ ] **Repository delivery:** Push the finished, tested changes to the connected `Orbit` repository’s `main` branch.