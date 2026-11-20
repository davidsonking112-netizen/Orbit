import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'skills');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  const metadata = {};
  if (!match) return metadata;
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator > 0) metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return metadata;
}

export function loadSkills({ includeInstructions = false } = {}) {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT, { withFileTypes: true }).filter((entry) => entry.isDirectory()).flatMap((entry) => {
    const path = join(ROOT, entry.name, 'SKILL.md');
    if (!existsSync(path)) return [];
    const content = readFileSync(path, 'utf8');
    const metadata = { id: entry.name, ...parseFrontmatter(content) };
    return [{ ...metadata, ...(includeInstructions ? { content } : {}) }];
  });
}

export function chooseSkills(prompt) {
  const normalized = prompt.toLowerCase();
  return loadSkills().filter((skill) => `${skill.name} ${skill.description} ${skill.triggers || ''}`.toLowerCase().split(',').some((term) => normalized.includes(term.trim())));
}
