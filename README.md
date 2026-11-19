# Orbit — AI workspace UI prototype

A responsive React/Vite prototype inspired by the Orbit design mockups. It includes schedule and automation controls, a local file library, demo integration toggles, editable settings, a sample task chat with in-chat Canvas, and a Slides & images workspace.

## Run locally

```bash
npm install
npm run dev
```

## Local demo behavior

Schedules and automation rules, integration demo states, settings, chat messages, Canvas drafts, library metadata, and visual preview cards are saved in this browser with `localStorage`. They are browser/device-specific and are removed if site data is cleared. No account login or cloud sync is provided.

The Library file picker records filename/type/size metadata only; it does not read or upload file contents. Blank document and spreadsheet drafts can be edited locally. Canvas edits and follow-up prompts update a local preview, not an AI-generated response. Slides and image entries are CSS preview cards, not generated media. Integration switches do not connect external accounts, and schedule previews do not create live background jobs.

No model, image-generation, or other paid service is called by these prototype flows. Real AI generation, OAuth integrations, durable file storage, and background scheduling require a future backend phase.
