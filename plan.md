# Orbit — proposed Phase 2 plan

## Current baseline

Phase 1 is implemented and pushed to `main` (`3acc24a` before this plan update). Orbit has a responsive shell, schedule/automation management, a browser-local Library, demo integration switches, editable local Settings, sample task chat, in-chat Canvas, and local Slides & images preview cards. The app currently has no server-side agent execution, AI provider calls, OAuth, file uploads, or live scheduler. The Tasks tab is intentionally **Schedules & automations**, not a list of all tasks.

## Proposed next phase: Manus-like workbench, without model/API spend

Improve the user's path from a new request to a reviewed artifact, while keeping this phase fully local and clearly labeled as a prototype:

- **Run-centered task flow:** Make **New task** create a fresh local run/session rather than reopening the single hard-coded sample conversation. Store the prompt, editable plan steps, and visible state for that run. Present a Manus-style timeline with explicit draft, plan review, waiting/working, review-required, paused, cancelled, and completed states. Pause, resume, cancel, retry, and approve actions may update only local demo state; the UI must never imply that a real agent or background job has executed. Do not turn the Tasks tab into task history.
- **Efficient navigation:** Implement the existing command/shortcut affordance as a keyboard-accessible command palette (Ctrl/Cmd+K) for navigation, New task, and key local actions. Keep the current left navigation and route set unless implementation requires a new explicit route.
- **Useful Canvas outputs:** Keep Canvas in chat, add reliable editable title/content and save-state feedback, and provide browser downloads for document drafts as Markdown and spreadsheet drafts as CSV. Retain current content locally; do not upload it.
- **User-controlled local data:** Add a Settings control to export and restore Orbit's local workspace as JSON, plus a clear-all-data action with an explicit confirmation. Keep all stored values on the device and explain that a backup is needed to transfer them to another browser/device.
- **Preserve visual/product decisions:** Keep the ivory sidebar, white work area, navy actions, teal state accents, lavender Canvas treatment, mobile responsiveness, and the existing Slides & images preview page. No all-task list, new remote integrations, or decorative image generation in this phase.

## Design and interaction

Reuse the established Orbit workspace style rather than redesigning it. Make the command palette a compact, high-contrast overlay; keep the task timeline and plan in the existing split workbench; place review/approval actions near the relevant step or artifact. Maintain readable status labels, keyboard focus management, confirmation before cancel/clear actions, and plain-language disclosure when a state is only a local preview. Prefer short, responsive transitions and avoid progress animation that suggests real execution.

Brand essence remains: **a calm, dependable personal workbench for getting useful work organized and reviewed**. Personality: focused, clear, capable. Keep the Orbit mark and wordmark; the signature teal status cue and restrained lavender Canvas accent stay consistent. Voice: concise, specific, and transparent. Example copy: “Review the plan before continuing.” / “Saved in this browser; no agent run was started.”

## Implementation approach and project structure

Continue with the existing React/Vite SPA and current `lucide-react` icons; add no dependency, AI/model call, image-generation call, connector, server, or paid service. Use browser `localStorage` and native download/file APIs only. A small storage utility under `src/lib/` will own a versioned workspace schema, safe JSON import/export, and clear/reset behavior; `src/hooks/usePersistentState.js` remains the page-level hook. `src/App.jsx` owns New task routing, shared shell, and the command-palette shortcut. A focused component under `src/components/` owns palette keyboard/focus behavior. `src/pages/TaskChatPage.jsx` owns the local run lifecycle and inline Canvas actions; `TasksPage.jsx` remains only Schedules & automations. `LibraryPage.jsx`, `SettingsPage.jsx`, and `SlidesImagesPage.jsx` retain their current local-first responsibilities, with Settings exposing backup/reset. `src/styles.css` holds palette, timeline, modal, focus, and responsive states. `public/manus-routes.json` is updated only if a route actually changes.

There is no backend in this phase. Real LLM task execution, browser/tool control, account connections, durable cloud files, and live scheduling are a later separately scoped phase because they require provider/connector choices and may consume credits. Do not call these services without the user's explicit approval.

## Approval status

The user approved this Phase 2 scope on 2026-11-19. Implementation may proceed within the stated local-only, no-model/no-image-generation constraints. Any real AI execution, external connector, backend, or paid service remains out of scope and requires a separate explicit plan and approval.
