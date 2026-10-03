import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface SourceFile {
  readonly rel: string;
  readonly mtime: number;
}

const BUILT_EXTENSION = /\.(ts|tsx|js|jsx)$/;

const inTestsDir = (rel: string) => rel.split('/').includes('__tests__');

export function isTsdownSource(rel: string): boolean {
  return BUILT_EXTENSION.test(rel) && !/\.test\.(ts|tsx)$/.test(rel) && !inTestsDir(rel);
}

export function isPackageSource(rel: string): boolean {
  return BUILT_EXTENSION.test(rel) && !/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(rel) && !inTestsDir(rel) && !rel.endsWith('.d.ts');
}

export function isBundledOutput(rel: string): boolean {
  return /\.(js|cjs|mjs)$/.test(rel);
}

export function listFiles(root: string, prefix: string, keep: (rel: string) => boolean): readonly SourceFile[] {
  const walk = (dir: string, relDir: string): SourceFile[] => {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const rel = relDir === '' ? entry.name : `${relDir}/${entry.name}`;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(path, rel);
      return entry.isFile() && keep(rel) ? [{ rel: `${prefix}${rel}`, mtime: statSync(path).mtimeMs }] : [];
    });
  };
  return walk(root, '');
}

export const newest = (files: readonly SourceFile[]): number => files.reduce((max, f) => Math.max(max, f.mtime), 0);

export interface WorkspacePackage {
  readonly name: string;
  readonly dir: string;
}

export function workspaceDependencies(worktree: string, packageDir: string): readonly WorkspacePackage[] {
  const packagesRoot = realpathSync(join(worktree, 'packages'));
  const found = new Map<string, WorkspacePackage>();
  const visit = (dir: string) => {
    const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Record<string, Record<string, string> | undefined>;
    const names = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies, ...manifest.optionalDependencies });
    for (const name of names) {
      const link = join(dir, 'node_modules', name);
      if (found.has(name) || !existsSync(link)) continue;
      const real = realpathSync(link);
      if (relative(packagesRoot, real).startsWith('..') || !existsSync(join(real, 'package.json'))) continue;
      found.set(name, { name, dir: real });
      visit(real);
    }
  };
  visit(packageDir);
  return [...found.values()];
}

export function isStale(srcFiles: readonly SourceFile[], distFiles: readonly SourceFile[]): boolean {
  return srcFiles.length > 0 && distFiles.length > 0 && newest(srcFiles) > newest(distFiles);
}

export interface OutputEntry {
  readonly mtime: number;
  readonly size: number;
  readonly hash: string;
}
export type Fingerprint = Readonly<Record<string, OutputEntry>>;

export function fingerprint(root: string, rels: readonly string[], previous: Fingerprint | null): Fingerprint {
  const out: Record<string, OutputEntry> = {};
  for (const rel of rels) {
    const path = join(root, rel);
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    const before = previous?.[rel];
    if (before !== undefined && before.mtime === stat.mtimeMs && before.size === stat.size) {
      out[rel] = before;
      continue;
    }
    let content: Buffer;
    try {
      content = readFileSync(path);
    } catch {
      continue;
    }
    out[rel] = { mtime: stat.mtimeMs, size: stat.size, hash: createHash('sha256').update(content).digest('hex') };
  }
  return out;
}

export function changedFiles(before: Fingerprint, after: Fingerprint): readonly string[] {
  const rels = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...rels].filter((rel) => before[rel]?.hash !== after[rel]?.hash).sort();
}

export const sameContent = (a: Fingerprint, b: Fingerprint): boolean => changedFiles(a, b).length === 0;

export interface ServedState {
  readonly metroPid: number;
  readonly revId: string;
  readonly outputs: Fingerprint;
}

export function inBundle(body: string, rels: readonly string[]): readonly string[] {
  return rels.filter((rel) => body.includes(`${rel}"`));
}

export function bundleIsFresh(state: ServedState | null, current: Fingerprint, response: { readonly revId: string; readonly body: string }): boolean {
  if (state === null) return true;
  const changed = inBundle(response.body, changedFiles(state.outputs, current));
  return changed.length === 0 || response.revId !== state.revId;
}
