let apiKey = '';
let connectedAt = null;
const model = 'gemini-2.5-flash';

function assertKey(value) {
  if (typeof value !== 'string' || value.trim().length < 10) throw new Error('Enter a valid Google AI Studio API key.');
  return value.trim();
}

export async function generateWithGoogleAiStudio(prompt) {
  if (!apiKey) throw new Error('Connect a Google AI Studio API key first.');
  return generateWithKey(apiKey, prompt);
}
async function generateWithKey(key, prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || 'Google AI Studio rejected the request.';
    throw new Error(message);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || '';
  if (!text) throw new Error('Google AI Studio returned no text.');
  return text;
}

export function getGoogleAiStudioStatus() {
  return { connected: Boolean(apiKey), model: apiKey ? model : null, connectedAt };
}

export async function connectGoogleAiStudio(value) {
  const nextKey = assertKey(value);
  const text = await generateWithKey(nextKey, 'Reply with exactly: Orbit Gemini connection test passed.');
  apiKey = nextKey;
  connectedAt = new Date().toISOString();
  return { ...getGoogleAiStudioStatus(), testReply: text };
}

export function disconnectGoogleAiStudio() {
  apiKey = '';
  connectedAt = null;
  return getGoogleAiStudioStatus();
}

export async function testGoogleAiStudio(prompt = 'Reply with exactly: Orbit Gemini connection test passed.') {
  if (!apiKey) throw new Error('Connect a Google AI Studio API key first.');
  return { model, text: await generateWithKey(apiKey, prompt) };
}

if (process.env.GOOGLE_AI_STUDIO_API_KEY) {
  apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY.trim();
  connectedAt = new Date().toISOString();
}
