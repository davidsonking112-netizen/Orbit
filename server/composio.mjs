let apiKey = '';
let connectedAt = null;
let mode = null;

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

async function initializeConsumerMcp(key) {
  const response = await fetch('https://connect.composio.dev/mcp', {
    method: 'POST',
    headers: { 'x-consumer-api-key': key, 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'Orbit', version: '0.2.0' } } }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Composio Connect rejected the key (${response.status}).`);
  const line = text.split('\n').find((item) => item.startsWith('data: '));
  const message = line ? JSON.parse(line.slice(6)) : null;
  if (!message?.result) throw new Error('Composio Connect returned no MCP handshake.');
  return message.result;
}

export function getComposioStatus() { return { connected: Boolean(apiKey), connectedAt, mode, toolkitCount: null }; }

export async function connectComposio(value) {
  const nextKey = assertKey(value);
  const consumer = nextKey.startsWith('ck_');
  const data = consumer ? await initializeConsumerMcp(nextKey) : await listToolkits(nextKey);
  apiKey = nextKey;
  connectedAt = new Date().toISOString();
  mode = consumer ? 'connect-mcp' : 'project-rest';
  return { connected: true, connectedAt, mode, toolkitCount: data.total_items ?? data.items?.length ?? null, server: data.serverInfo?.name || null };
}

export function disconnectComposio() { apiKey = ''; connectedAt = null; mode = null; return getComposioStatus(); }
