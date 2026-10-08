import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const CORE_DIR = dirname(fileURLToPath(import.meta.url));
const MANIFEST_FILE = join(CORE_DIR, 'MANIFEST');

function coreFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return coreFiles(path);
    return entry.name === 'MANIFEST' ? [] : [path];
  });
}

function computeManifest(): string {
  return coreFiles(CORE_DIR)
    .map((file) => `${createHash('sha256').update(readFileSync(file)).digest('hex')}  ${relative(CORE_DIR, file).split('\\').join('/')}`)
    .sort((a, b) => a.slice(66).localeCompare(b.slice(66)))
    .join('\n')
    .concat('\n');
}

export function manifestDrift(): readonly string[] {
  const parse = (text: string) => new Map(text.split('\n').filter(Boolean).map((line) => [line.slice(66), line.slice(0, 64)] as const));
  let committed: Map<string, string>;
  try {
    committed = parse(readFileSync(MANIFEST_FILE, 'utf8'));
  } catch {
    return ['MANIFEST'];
  }
  const actual = parse(computeManifest());
  const names = new Set([...committed.keys(), ...actual.keys()]);
  return [...names].filter((name) => committed.get(name) !== actual.get(name)).sort();
}

export function coreVersion(): string {
  try {
    return createHash('sha256').update(readFileSync(MANIFEST_FILE)).digest('hex').slice(0, 12);
  } catch {
    return 'unknown';
  }
}

if (import.meta.main && process.argv.includes('--write')) {
  writeFileSync(MANIFEST_FILE, computeManifest());
}
