let apiKey = '';
let connectedAt = null;

function assertKey(value) {
  if (typeof value !== 'string' || !value.trim().startsWith('ck_')) throw new Error('Enter a valid Composio project API key.');
  return value.trim();
}

async function listToolkits(key) {
  const response = await fetch('https://backend.composio.dev/api/v3.1/toolkits?limit=1', { headers: { 'x-api-key': key } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Composio rejected the key (${response.status}).`);
  return data;
}

export function getComposioStatus() { return { connected: Boolean(apiKey), connectedAt, toolkitCount: null }; }

export async function connectComposio(value) {
  const nextKey = assertKey(value);
  const data = await listToolkits(nextKey);
  apiKey = nextKey;
  connectedAt = new Date().toISOString();
  return { connected: true, connectedAt, toolkitCount: data.total_items ?? data.items?.length ?? 0 };
}

export function disconnectComposio() { apiKey = ''; connectedAt = null; return getComposioStatus(); }
