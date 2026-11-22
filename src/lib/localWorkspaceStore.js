const WORKSPACE_PREFIX = 'orbit:';
const BACKUP_FORMAT = 'orbit-local-workspace';
const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

const initialCanvas = {
  enabled: false,
  type: 'Document',
  title: 'Untitled document',
  content: '',
  prompt: '',
  revision: 0,
  rows: [
    ['Item', 'Details', 'Status'],
    ['Research', 'Sources and notes', 'Planned'],
    ['Summary', 'Key findings', 'In progress'],
  ],
};

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createLocalRun(initialPrompt = '') {
  const now = new Date().toISOString();
  const prompt = initialPrompt.trim();
  const titleText = prompt.split(/[.!?\n]/)[0].trim().slice(0, 42) || 'New task';
  const title = titleText[0].toUpperCase() + titleText.slice(1);
  const seeded = Boolean(prompt);
  return {
    id: createId(),
    title,
    prompt,
    status: seeded ? 'plan-review' : 'draft',
    createdAt: now,
    updatedAt: now,
    messages: seeded ? [{ id: createId(), text: prompt, role: 'user', createdAt: now }] : [],
    planSteps: seeded ? createSuggestedPlan() : [],
    statusHistory: [{ status: seeded ? 'plan-review' : 'draft', label: seeded ? 'Request saved for local plan review' : 'Local run created', at: now }],
    canvas: structuredCloneSafe(initialCanvas),
  };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createSuggestedPlan() {
  return [
    'Review and clarify the request',
    'Identify information needed',
    'Prepare the requested output',
    'Review the draft before sharing',
  ].map((title) => ({ id: createId(), title, done: false }));
}

function orbitKeys(storage) {
  return Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter((key) => typeof key === 'string' && key.startsWith(WORKSPACE_PREFIX));
}

export function buildWorkspaceBackup(storage = window.localStorage) {
  const data = {};
  for (const key of orbitKeys(storage)) {
    const raw = storage.getItem(key);
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadWorkspaceBackup(storage = window.localStorage) {
  const backup = buildWorkspaceBackup(storage);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `orbit-workspace-${date}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return anchor.download;
}

export function restoreWorkspaceBackup(text, storage = window.localStorage) {
  if (typeof text !== 'string' || text.length > MAX_BACKUP_BYTES) {
    throw new Error('The backup is too large to restore in this browser.');
  }

  let backup;
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }

  if (backup?.format !== BACKUP_FORMAT || backup?.version !== BACKUP_VERSION || !backup.data || typeof backup.data !== 'object' || Array.isArray(backup.data)) {
    throw new Error('This is not a supported Orbit workspace backup.');
  }

  const entries = Object.entries(backup.data);
  if (entries.length > 2000) throw new Error('This backup contains too many workspace entries.');

  const staged = entries.map(([key, value]) => {
    if (!/^orbit:v[12]:[A-Za-z0-9:_-]+$/.test(key)) {
      throw new Error('The backup contains an unsupported workspace key.');
    }
    const raw = JSON.stringify(value);
    if (typeof raw !== 'string') throw new Error('The backup contains an unsupported value.');
    return [key, raw];
  });

  const previous = orbitKeys(storage).map((key) => [key, storage.getItem(key)]);
  try {
    for (const [key] of previous) storage.removeItem(key);
    for (const [key, raw] of staged) storage.setItem(key, raw);
  } catch {
    for (const key of orbitKeys(storage)) storage.removeItem(key);
    for (const [key, raw] of previous) storage.setItem(key, raw);
    throw new Error('The browser could not store this backup. Your previous Orbit data was restored.');
  }

  return { restoredCount: staged.length };
}

export function clearWorkspaceData(storage = window.localStorage) {
  const keys = orbitKeys(storage);
  for (const key of keys) storage.removeItem(key);
  return keys.length;
}
