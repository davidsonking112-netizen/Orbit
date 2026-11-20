import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

const DATA_FILE = join(process.cwd(), '.orbit-server-data.json');
const defaults = { schedules: [], runs: [] };

export function readStore() {
  if (!existsSync(DATA_FILE)) return structuredClone(defaults);
  try {
    const value = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    return { ...structuredClone(defaults), ...value };
  } catch {
    return structuredClone(defaults);
  }
}

export function writeStore(store) {
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

export function createId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

export function createRun(record) {
  const now = new Date().toISOString();
  return { id: createId('run'), createdAt: now, updatedAt: now, status: 'completed', ...record };
}

export { DATA_FILE };
