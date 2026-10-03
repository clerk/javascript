import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CORE_DIR = dirname(fileURLToPath(import.meta.url));
export const MANIFEST_FILE = join(CORE_DIR, 'MANIFEST');

function coreFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return coreFiles(path);
    return entry.name === 'MANIFEST' ? [] : [path];
  });
}

export function computeManifest(dir: string = CORE_DIR): string {
  return coreFiles(dir)
    .map((file) => `${createHash('sha256').update(readFileSync(file)).digest('hex')}  ${relative(dir, file).split('\\').join('/')}`)
    .sort((a, b) => a.slice(66).localeCompare(b.slice(66)))
    .join('\n')
    .concat('\n');
}

export function manifestDrift(dir: string = CORE_DIR): readonly string[] {
  const parse = (text: string) => new Map(text.split('\n').filter(Boolean).map((line) => [line.slice(66), line.slice(0, 64)] as const));
  let committed: Map<string, string>;
  try {
    committed = parse(readFileSync(join(dir, 'MANIFEST'), 'utf8'));
  } catch {
    return ['MANIFEST'];
  }
  const actual = parse(computeManifest(dir));
  const names = new Set([...committed.keys(), ...actual.keys()]);
  return [...names].filter((name) => committed.get(name) !== actual.get(name)).sort();
}

if (import.meta.main && process.argv.includes('--write')) {
  writeFileSync(MANIFEST_FILE, computeManifest());
}
