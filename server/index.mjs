import { createServer } from 'node:http';
import { runAgent } from './agent.mjs';
import { loadSkills } from './skills.mjs';
import { toolCatalog } from './tools.mjs';
import { createSchedule, deleteSchedule, listRuns, listSchedules, runSchedule, startScheduler, updateSchedule } from './scheduler.mjs';
import { connectGoogleAiStudio, disconnectGoogleAiStudio, getGoogleAiStudioStatus, testGoogleAiStudio } from './google-ai-studio.mjs';
import { connectComposio, disconnectComposio, getComposioStatus } from './composio.mjs';

const port = Number(process.env.PORT || 8787);
const json = (response, status, value) => { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'no-store' }); response.end(JSON.stringify(value)); };
async function body(request) { let raw = ''; for await (const chunk of request) raw += chunk; try { return raw ? JSON.parse(raw) : {}; } catch { throw new Error('Request body must be valid JSON.'); } }

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.method === 'OPTIONS') return json(response, 204, {});
  try {
    if (request.method === 'GET' && url.pathname === '/api/health') return json(response, 200, { ok: true, service: 'orbit-agent-runtime', scheduler: 'active' });
    if (request.method === 'GET' && url.pathname === '/api/capabilities') return json(response, 200, { skills: loadSkills(), tools: toolCatalog, scheduling: { enabled: true, minimumIntervalSeconds: 60, persistence: 'server file store' } });
    if (request.method === 'GET' && url.pathname === '/api/skills') return json(response, 200, { skills: loadSkills({ includeInstructions: url.searchParams.get('instructions') === 'true' }) });
    if (request.method === 'GET' && url.pathname === '/api/tools') return json(response, 200, { tools: toolCatalog });
    if (request.method === 'GET' && url.pathname === '/api/schedules') return json(response, 200, { schedules: listSchedules(), runs: listRuns() });
    if (request.method === 'GET' && url.pathname === '/api/providers/google-ai-studio') return json(response, 200, getGoogleAiStudioStatus());
    if (request.method === 'POST' && url.pathname === '/api/providers/google-ai-studio/connect') return json(response, 200, await connectGoogleAiStudio((await body(request)).apiKey));
    if (request.method === 'POST' && url.pathname === '/api/providers/google-ai-studio/test') return json(response, 200, await testGoogleAiStudio((await body(request)).prompt));
    if (request.method === 'DELETE' && url.pathname === '/api/providers/google-ai-studio') return json(response, 200, disconnectGoogleAiStudio());
    if (request.method === 'GET' && url.pathname === '/api/providers/composio') return json(response, 200, getComposioStatus());
    if (request.method === 'POST' && url.pathname === '/api/providers/composio/connect') return json(response, 200, await connectComposio((await body(request)).apiKey));
    if (request.method === 'DELETE' && url.pathname === '/api/providers/composio') return json(response, 200, disconnectComposio());
    if (request.method === 'POST' && url.pathname === '/api/agent/run') return json(response, 200, { run: await runAgent(await body(request)) });
    if (request.method === 'POST' && url.pathname === '/api/schedules') return json(response, 201, { schedule: createSchedule(await body(request)) });
    const scheduleMatch = url.pathname.match(/^\/api\/schedules\/([^/]+)(?:\/run)?$/);
    if (scheduleMatch) {
      const id = decodeURIComponent(scheduleMatch[1]);
      if (request.method === 'DELETE') return json(response, 200, { deleted: deleteSchedule(id) });
      if (request.method === 'PATCH') return json(response, 200, { schedule: updateSchedule(id, await body(request)) });
      if (request.method === 'POST' && url.pathname.endsWith('/run')) { const schedule = listSchedules().find((item) => item.id === id); if (!schedule) return json(response, 404, { error: 'Schedule not found' }); return json(response, 200, { run: await runSchedule(schedule) }); }
    }
    return json(response, 404, { error: 'Not found' });
  } catch (error) { return json(response, 500, { error: error.message || 'Orbit runtime error' }); }
});
server.listen(port, '0.0.0.0', () => console.log(`[orbit] agent runtime listening on ${port}`));
startScheduler();
