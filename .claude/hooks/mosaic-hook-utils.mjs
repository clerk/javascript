import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function read(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

function parse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function readInput() {
  return parse(read(0)) ?? {};
}

export function toolCalls(transcript) {
  return transcript.split('\n').flatMap(line => {
    const entry = parse(line);
    const content = entry?.type === 'assistant' ? entry.message?.content : undefined;
    return Array.isArray(content) ? content.filter(part => part?.type === 'tool_use') : [];
  });
}

function pascalCase(kebab) {
  return kebab.replace(/(^|-)([a-z0-9])/g, (_, __, char) => char.toUpperCase());
}

export function legacyCounterparts(repoRoot, feature) {
  const name = pascalCase(feature);
  return [join('packages/react/src/components', `${name}.tsx`), join('packages/ui/src/components', name)].filter(path =>
    existsSync(join(repoRoot, path)),
  );
}
