import { loadSkills } from './skills.mjs';
import { callComposioTool } from './composio.mjs';

const USER_AGENT = 'Orbit/1.0 (local agent workspace)';

async function requestText(url) {
  const response = await fetch(url, { headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.text();
}

function stripHtml(value) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

export async function webSearch({ query, limit = 5 }) {
  if (!query?.trim()) throw new Error('A search query is required.');
  const html = await requestText(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.trim())}`);
  const results = [];
  const pattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html)) && results.length < Math.min(limit, 10)) {
    const url = decodeURIComponent(match[1].replace(/.*uddg=/, '').split('&')[0]);
    results.push({ title: stripHtml(match[2]), url, snippet: stripHtml(match[3]) });
  }
  return { query, results };
}

export async function fetchUrl({ url }) {
  if (!/^https?:\/\//i.test(url || '')) throw new Error('Only http and https URLs can be fetched.');
  const html = await requestText(url);
  const text = stripHtml(html).slice(0, 12000);
  return { url, title: text.slice(0, 160), text };
}

export const toolCatalog = [
  { id: 'web_search', name: 'Web search', description: 'Searches the public web and returns titled results with URLs and snippets.', input: '{ query, limit }', sideEffect: 'read-only' },
  { id: 'fetch_url', name: 'Fetch URL', description: 'Reads a public HTTP(S) page for source verification.', input: '{ url }', sideEffect: 'read-only' },
  { id: 'list_skills', name: 'List skills', description: 'Loads skill metadata without loading full instructions.', input: '{}', sideEffect: 'read-only' },
  { id: 'composio_mcp', name: 'Composio MCP', description: 'Searches connected Composio apps and returns the best available tools for the requested outcome.', input: '{ prompt }', sideEffect: 'read-only discovery; selected app tools require explicit execution' },
];

export async function executeTool(id, input = {}) {
  if (id === 'web_search') return webSearch(input);
  if (id === 'fetch_url') return fetchUrl(input);
  if (id === 'list_skills') return { skills: loadSkills().map(({ content, ...metadata }) => metadata) };
  if (id === 'composio_mcp') return callComposioTool('COMPOSIO_SEARCH_TOOLS', { queries: [{ use_case: input.prompt || 'find tools for this request' }], session: { generate_id: true }, search_strategy: 'auto' });
  throw new Error(`Unknown tool: ${id}`);
}
