import { generateWithGoogleAiStudio, getGoogleAiStudioStatus } from './google-ai-studio.mjs';

export function getAiStatus() {
  const google = getGoogleAiStudioStatus();
  return { connected: google.connected, provider: google.connected ? 'google-ai-studio' : null, model: google.model };
}

export async function synthesizeRun({ prompt, results = [], fallbackSummary }) {
  const status = getAiStatus();
  if (!status.connected) return { summary: fallbackSummary, provider: 'local-fallback' };
  const evidence = results.map((item) => ({ tool: item.toolId, status: item.status, result: item.status === 'completed' ? item.result : item.error })).slice(0, 8);
  const instruction = [
    'You are the Orbit workflow synthesizer.',
    'Return exactly one concise sentence summarizing what was completed. Do not claim actions that are not present in the evidence.',
    `User request: ${String(prompt || '').slice(0, 2000)}`,
    `Evidence: ${JSON.stringify(evidence).slice(0, 12000)}`,
  ].join('\n');
  try {
    const text = await generateWithGoogleAiStudio(instruction);
    return { summary: text.replace(/\s+/g, ' ').trim().slice(0, 500) || fallbackSummary, provider: status.provider };
  } catch {
    return { summary: fallbackSummary, provider: 'local-fallback' };
  }
}
