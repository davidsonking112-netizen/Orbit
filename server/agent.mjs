import { executeTool, toolCatalog, webSearch } from './tools.mjs';
import { chooseSkills, loadSkills } from './skills.mjs';
import { createRun } from './store.mjs';

export async function runAgent({ prompt, skillIds = [], toolIds = [], source = 'manual' }) {
  const selectedSkillIds = skillIds.length ? skillIds : chooseSkills(prompt).map((skill) => skill.id);
  const selectedSkills = loadSkills({ includeInstructions: true }).filter((skill) => selectedSkillIds.includes(skill.id));
  const selectedToolIds = toolIds.length ? toolIds : (/(search|research|web|source|compare)/i.test(prompt) ? ['web_search'] : ['list_skills']);
  const plan = selectedSkills.map((skill) => `Load ${skill.name} instructions when needed`);
  if (selectedToolIds.length) plan.push(`Run ${selectedToolIds.length} tool${selectedToolIds.length === 1 ? '' : 's'} and keep each result visible`);
  const toolResults = await Promise.all(selectedToolIds.map(async (id) => {
    try {
      const input = id === 'web_search' ? { query: prompt, limit: 5 } : id === 'fetch_url' ? { url: prompt.match(/https?:\/\/\S+/)?.[0] } : {};
      return { toolId: id, status: 'completed', result: await executeTool(id, input) };
    } catch (error) { return { toolId: id, status: 'failed', error: error.message }; }
  }));
  return createRun({ source, prompt, skillIds: selectedSkills.map((skill) => skill.id), skillInstructions: selectedSkills.map((skill) => ({ id: skill.id, content: skill.content })), toolIds: selectedToolIds, plan, results: toolResults, summary: summarize(toolResults) });
}

function summarize(results) {
  const search = results.find((item) => item.toolId === 'web_search' && item.status === 'completed')?.result;
  if (search) return `Completed a live web search for “${search.query}” and found ${search.results.length} result${search.results.length === 1 ? '' : 's'}.`;
  const failed = results.filter((item) => item.status === 'failed');
  return failed.length ? `${failed.length} tool${failed.length === 1 ? '' : 's'} failed; inspect the run for details.` : 'Completed the selected local tools.';
}

export { toolCatalog };
