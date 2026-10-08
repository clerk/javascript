import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const CORE_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = join(CORE_DIR, '..', '..');
const MANIFEST_FILE = join(CORE_DIR, 'MANIFEST');

export const SHARED_ROOTS = ['src/core', 'specs/support', 'specs/fixtures.ts', 'e2e.config.ts'] as const;

function filesUnder(path: string): string[] {
  const found = statSync(path, { throwIfNoEntry: false });
  if (found === undefined) return [];
  if (found.isFile()) return path === MANIFEST_FILE ? [] : [path];
  return readdirSync(path).flatMap((name) => filesUnder(join(path, name)));
}

function computeManifest(): string {
  return SHARED_ROOTS.flatMap((root) => filesUnder(join(PACKAGE_DIR, root)))
    .map((file) => `${createHash('sha256').update(readFileSync(file)).digest('hex')}  ${relative(PACKAGE_DIR, file).split('\\').join('/')}`)
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
