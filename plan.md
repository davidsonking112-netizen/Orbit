# Orbit UI implementation plan

## Scope
Build a responsive front-end prototype for the Orbit AI-agent workspace. The app includes the revised Tasks page (schedules and automations, not a task-history list), Library, Integrations, Settings, and an active-task chat. Canvas is not a navigation tab: users open Canvas from the chat composer’s plus button, select a document or spreadsheet, describe the file, and see the work area and preview inline in chat. Add one separate “Slides & images” tab with presentation and image previews.

## Design
Follow the supplied Orbit mockups: warm ivory navigation rail, white work surfaces, dark navy actions, muted teal status accents and soft lavender highlights. Keep spacing, cards, typography, and controls consistent. Preserve the active-task progress and approval context. Present Canvas as an in-chat tool mode, not a standalone page. Present slide/image work as a gallery and preview workspace in its own tab.

## Implementation approach
Continue the existing Vite + React SPA and local-only interaction model. Extend the chat composer to open a plus menu, switch on Canvas mode, choose a document/spreadsheet, accept a prompt, and show an inline Canvas draft preview. Add `/slides-images` with presentation/image sections and CSS-rendered sample previews; no image generation, model calls, or paid credits are needed. Keep integrations, schedules, Canvas actions and slide/image creation clearly as prototype-only local UI until backend services are connected.

## Project structure
- `src/App.jsx`: shared shell/navigation and routing.
- `src/pages/TaskChatPage.jsx`: active conversation, Canvas mode and inline draft preview.
- `src/pages/SlidesImagesPage.jsx`: presentations and images tab with sample previews.
- Existing Tasks, Library, Integrations, Settings page modules remain in `src/pages/`.
- `src/styles.css`: shared and responsive styling, including Canvas and visual-preview components.
- `public/manus-routes.json`: synchronized SPA routes.

## Constraints
Use existing dependencies and mock/sample UI data. Do not invoke image generation or any credit-consuming model. Do not add credentials or backend integrations; real AI generation can be connected later when model/API behavior and budget are approved.