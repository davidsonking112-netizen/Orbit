# Orbit — AI workspace

A responsive React/Vite workspace with a server-side automation runtime integrated into the Tasks tab. It includes live public web search, Manus-style progressive-disclosure skills, composable tools that can execute in parallel, persisted server schedules, a local file library, editable settings, task runs with in-chat Canvas, a Ctrl/Cmd+K command palette, and a Slides & images workspace.

## Run locally

```bash
npm install
npm run dev
```

In a second terminal, start the runtime with `npm run server`. The frontend proxies `/api` to port `8787` during development.

The Tasks tab exposes the live skill and tool catalogs, `POST /api/agent/run`, and schedule management under `/api/schedules`. Skills are folders containing a `SKILL.md`; frontmatter is loaded as low-cost metadata and the full file is loaded only when a skill is selected for a run. The current read-only tools are public web search, URL fetching, and skill discovery. Selected tools execute concurrently and each result is stored in run history.

Schedules persist in `.orbit-server-data.json` and run through the live server scheduler. They can be tested, paused, resumed, or deleted from the Tasks tab. For production, place the server behind an always-on/reserved runtime or connect the same schedule records to a platform heartbeat callback; the frontend alone cannot execute background work while closed.

## Local demo behavior

Schedules and automation rules, integration demo states, settings, task runs, chat messages, Canvas drafts, library metadata, and visual preview cards are saved in this browser with `localStorage`. They are browser/device-specific and are removed if site data is cleared. Settings can export or restore a JSON backup, or clear Orbit's local data after confirmation. No account login or cloud sync is provided.

The Library file picker records filename/type/size metadata only; it does not read or upload file contents. Blank document and spreadsheet drafts can be edited locally. Canvas edits and follow-up prompts update a local preview, not an AI-generated response; documents download as Markdown and spreadsheets as CSV. Local task plan and approval controls only change demo state and do not start an agent or background task. Slides and image entries are CSS preview cards, not generated media. Integration switches do not connect external accounts, and schedule previews do not create live background jobs.

The existing local prototype flows remain local-only, but the Tasks tab now provides a real server runtime for read-only web research and schedules. Real model execution, OAuth integrations, durable cloud storage, and external side effects still require a separately approved backend phase.

## Google AI Studio testing

Integrations includes a Google AI Studio API-key input with a backend connection test. The key is sent to the Orbit runtime, tested against Gemini, and held only in process memory; it is not written to browser storage or committed to the repository. Restarting the runtime or choosing Disconnect clears it. For production, use an environment variable or a secret manager instead of a user-entered key.
