let config = null;

function validateUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Supabase URL must use http or https.');
    return url.toString().replace(/\/$/, '');
  } catch {
    throw new Error('Enter a valid Supabase project URL.');
  }
}

function validateKey(value) {
  if (typeof value !== 'string' || value.trim().length < 10) throw new Error('Enter a valid Supabase API key.');
  return value.trim();
}

function headers() {
  return { apikey: config.key, authorization: `Bearer ${config.key}`, accept: 'application/json' };
}

export function getSupabaseStatus() {
  return { connected: Boolean(config), url: config?.url || null, mode: config?.mode || null, connectedAt: config?.connectedAt || null };
}

export async function connectSupabase({ url, key, mode = 'anon' } = {}) {
  const next = { url: validateUrl(url), key: validateKey(key), mode: mode === 'service_role' ? 'service_role' : 'anon' };
  const response = await fetch(`${next.url}/rest/v1/`, { headers: { apikey: next.key, authorization: `Bearer ${next.key}`, accept: 'application/openapi+json, application/json' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Supabase rejected the connection (${response.status}). Check the URL and key.`);
  config = { ...next, connectedAt: new Date().toISOString() };
  return getSupabaseStatus();
}

export function disconnectSupabase() {
  config = null;
  return getSupabaseStatus();
}

export async function testSupabase() {
  if (!config) throw new Error('Connect Supabase first.');
  const response = await fetch(`${config.url}/rest/v1/`, { headers: headers(), signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Supabase test failed (${response.status}).`);
  return { ok: true, url: config.url, mode: config.mode };
}

export async function persistRun(run) {
  if (!config) return { stored: false, provider: 'local' };
  const response = await fetch(`${config.url}/rest/v1/orbit_runs`, { method: 'POST', headers: { ...headers(), 'content-type': 'application/json', prefer: 'return=minimal' }, body: JSON.stringify({ id: run.id, source: run.source, prompt: run.prompt, status: run.status, summary: run.summary, tool_ids: run.toolIds || [], results: run.results || [], created_at: run.createdAt, updated_at: run.updatedAt }) });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    return { stored: false, provider: 'supabase', error: `Run persistence failed (${response.status})${detail ? `: ${detail.slice(0, 180)}` : ''}` };
  }
  return { stored: true, provider: 'supabase' };
}

const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (envUrl && envKey) config = { url: validateUrl(envUrl), key: validateKey(envKey), mode: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon', connectedAt: new Date().toISOString() };
