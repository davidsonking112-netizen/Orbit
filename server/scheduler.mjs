import { createId, createRun, readStore, writeStore } from './store.mjs';
import { runAgent } from './agent.mjs';

function due(schedule, now = Date.now()) {
  return schedule.enabled && schedule.nextRunAt && new Date(schedule.nextRunAt).getTime() <= now;
}

export function listSchedules() {
  return readStore().schedules.sort((a, b) => String(a.nextRunAt).localeCompare(String(b.nextRunAt)));
}

export function createSchedule(input) {
  const seconds = Math.max(60, Number(input.intervalSeconds) || 3600);
  const now = Date.now();
  const schedule = { id: createId('schedule'), name: String(input.name || 'Orbit automation').slice(0, 120), prompt: String(input.prompt || '').slice(0, 2000), intervalSeconds: seconds, enabled: input.enabled !== false, skillIds: input.skillIds || [], toolIds: input.toolIds || ['web_search'], createdAt: new Date(now).toISOString(), nextRunAt: new Date(now + seconds * 1000).toISOString(), lastRunAt: null };
  const store = readStore(); store.schedules.push(schedule); writeStore(store); return schedule;
}

export function updateSchedule(id, patch) {
  const store = readStore(); const schedule = store.schedules.find((item) => item.id === id);
  if (!schedule) return null;
  Object.assign(schedule, patch);
  if (patch.enabled === true && new Date(schedule.nextRunAt).getTime() < Date.now()) schedule.nextRunAt = new Date(Date.now() + schedule.intervalSeconds * 1000).toISOString();
  writeStore(store); return schedule;
}

export function deleteSchedule(id) { const store = readStore(); const before = store.schedules.length; store.schedules = store.schedules.filter((item) => item.id !== id); writeStore(store); return before !== store.schedules.length; }

export async function runSchedule(schedule) {
  const result = await runAgent({ prompt: schedule.prompt, skillIds: schedule.skillIds, toolIds: schedule.toolIds, source: `schedule:${schedule.id}` });
  const store = readStore();
  const current = store.schedules.find((item) => item.id === schedule.id);
  if (current) { current.lastRunAt = new Date().toISOString(); current.nextRunAt = new Date(Date.now() + current.intervalSeconds * 1000).toISOString(); }
  store.runs.unshift(result); store.runs = store.runs.slice(0, 100); writeStore(store); return result;
}

export function listRuns() { return readStore().runs.slice(0, 50); }

export function startScheduler(log = console) {
  const timer = setInterval(async () => {
    for (const schedule of listSchedules().filter((item) => due(item))) {
      try { await runSchedule(schedule); log.info(`[orbit] completed schedule ${schedule.id}`); } catch (error) { log.error(`[orbit] schedule failed: ${error.message}`); }
    }
  }, 15000);
  timer.unref?.();
  return timer;
}
