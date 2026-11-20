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
- [x] **Repository delivery:** Push the finished, tested changes to the connected `Orbit` repository’s `main` branch.

## Approved Phase 2 outcomes
- [x] **Task runs:** Make New task open a fresh local run instead of the hard-coded sample. Persist the prompt, editable plan steps, and run state. Show explicit draft, plan-review, waiting/working, review-required, paused, cancelled, and completed states with approve, pause, resume, retry, and cancel controls. Keep every state clearly marked as a local demo; do not imply that an agent or background job actually ran. Keep the Tasks tab dedicated to Schedules & automations, not task history.
- [x] **Command palette:** Make Ctrl/Cmd+K open a keyboard-accessible palette for navigation, New task, and key local actions; support keyboard focus, selection, and Escape to close.
- [x] **Canvas exports:** Keep Canvas in chat, retain editable title/content locally, and let users download a document draft as Markdown or a spreadsheet as CSV using the browser; do not upload draft contents.
- [x] **Local data controls:** Add Settings actions to export the local workspace as JSON, restore a valid JSON backup, and clear Orbit's local data only after explicit confirmation. Explain that data stays in this browser and backups are needed to move it to another device.
- [x] **Design and cost boundary:** Reuse the current Orbit visual system and existing dependencies. Do not add an LLM/model call, image-generation call, connector, backend, new paid service, or real background scheduler in this phase.
- [x] **Repository delivery:** After implementation and checks, push the changes to the connected `Orbit` repository's `main` branch.
