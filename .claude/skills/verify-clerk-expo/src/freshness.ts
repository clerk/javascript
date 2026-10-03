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

export function isExpoModule(pkg: WorkspacePackage): boolean {
  return existsSync(join(pkg.dir, 'expo-module.config.json'));
}

const builtFrom = (pkg: WorkspacePackage) => listFiles(join(pkg.dir, 'src'), '', isPackageSource);
const builtTo = (pkg: WorkspacePackage) => listFiles(join(pkg.dir, 'dist'), '', isBundledOutput);
const hasBuild = (pkg: WorkspacePackage) => existsSync(join(pkg.dir, 'src')) && existsSync(join(pkg.dir, 'dist'));

export function staleInScope(worktree: string, expoDir: string): readonly WorkspacePackage[] {
  return workspaceDependencies(worktree, expoDir).filter((pkg) => isExpoModule(pkg) && hasBuild(pkg) && isStale(builtFrom(pkg), builtTo(pkg)));
}

export function staleOutOfScope(worktree: string, expoDir: string): readonly WorkspacePackage[] {
  return workspaceDependencies(worktree, expoDir).filter((pkg) => {
    if (isExpoModule(pkg) || !hasBuild(pkg)) return false;
    const sources = [pkg, ...workspaceDependencies(worktree, pkg.dir).filter(hasBuild)].flatMap(builtFrom);
    return isStale(sources, builtTo(pkg));
  });
}

export function isStale(srcFiles: readonly SourceFile[], distFiles: readonly SourceFile[]): boolean {
  return srcFiles.length > 0 && distFiles.length > 0 && newest(srcFiles) > newest(distFiles);
}

export interface OutputEntry {
  readonly mtime: number;
  readonly size: number;
  readonly hash: string;
  readonly since: number;
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
    const hash = createHash('sha256').update(content).digest('hex');
    out[rel] = { mtime: stat.mtimeMs, size: stat.size, hash, since: before !== undefined && before.hash === hash ? before.since : stat.mtimeMs };
  }
  return out;
}

export function changedFiles(before: Fingerprint, after: Fingerprint): readonly string[] {
  const rels = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...rels].filter((rel) => before[rel]?.hash !== after[rel]?.hash).sort();
}

export const sameContent = (a: Fingerprint, b: Fingerprint): boolean => changedFiles(a, b).length === 0;

export function inBundle(body: string, rels: readonly string[]): readonly string[] {
  return rels.filter((rel) => body.includes(`${rel}"`));
}

export function bundledDigest(current: Fingerprint, body: string): string {
  const hash = createHash('sha256');
  for (const rel of inBundle(body, Object.keys(current)).slice().sort()) hash.update(`${rel}:${current[rel]!.hash}\n`);
  return hash.digest('hex');
}

const STALE = 'stale';

export interface GateMemory {
  readonly metroPid: number;
  readonly spawn: Fingerprint | null;
  readonly seen: Readonly<Record<string, string>>;
  readonly outputs: Fingerprint;
}

export interface BundleView {
  readonly revId: string;
  readonly lastModified: number;
  readonly body: string;
}

export type Verdict = 'fresh' | 'stale' | 'restart';

export function judge(memory: GateMemory, current: Fingerprint, bundle: BundleView): { readonly verdict: Verdict; readonly memory: GateMemory } {
  const digest = bundledDigest(current, bundle.body);
  const known = memory.seen[bundle.revId];
  if (known !== undefined) return { verdict: known === digest ? 'fresh' : 'stale', memory };
  let verdict: Verdict;
  if (Object.keys(memory.seen).length === 0) {
    verdict = memory.spawn !== null && bundledDigest(memory.spawn, bundle.body) === digest ? 'fresh' : 'restart';
  } else {
    const lastContent = Math.max(0, ...inBundle(bundle.body, Object.keys(current)).map((rel) => current[rel]!.since));
    verdict = bundle.lastModified >= Math.floor(lastContent / 1000) * 1000 ? 'fresh' : 'stale';
  }
  if (verdict === 'restart') return { verdict, memory };
  return { verdict, memory: { ...memory, seen: { ...memory.seen, [bundle.revId]: verdict === 'fresh' ? digest : STALE } } };
}

export type Fetched<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly transient: boolean; readonly message: string };

export interface GateIO {
  list(): readonly string[];
  fingerprint(rels: readonly string[], previous: Fingerprint | null): Fingerprint;
  fetch(): Promise<Fetched<BundleView>>;
  touch(rels: readonly string[]): void;
  restart(): Promise<number>;
  now(): number;
  sleep(ms: number): Promise<void>;
  progress(line: string): void;
}

export interface GateOptions {
  readonly timeoutMs: number;
  readonly nudgeAfterMs: number;
  readonly maxRestarts: number;
}

export type GateResult =
  | { readonly ok: true; readonly memory: GateMemory; readonly revId: string }
  | { readonly ok: false; readonly kind: 'timeout' | 'bundle-error'; readonly message: string };

const complete = (rels: readonly string[], fp: Fingerprint) => rels.length === Object.keys(fp).length;

export async function confirmServed(io: GateIO, start: GateMemory, options: GateOptions): Promise<GateResult> {
  let memory = start;
  let current = memory.outputs;
  let candidate: { readonly revId: string; readonly outputs: Fingerprint } | null = null;
  let failure: { readonly message: string; readonly outputs: Fingerprint; readonly rels: string } | null = null;
  let lastError = '';
  let staleSince: number | null = null;
  let restarts = 0;
  let delay = 500;
  const deadline = io.now() + options.timeoutMs;
  while (io.now() < deadline) {
    const rels = io.list();
    const before = io.fingerprint(rels, current);
    const bundle = await io.fetch();
    const after = io.fingerprint(io.list(), before);
    current = after;
    const settled = sameContent(before, after) && complete(rels, after) && complete(io.list(), after);
    if (!bundle.ok) {
      candidate = null;
      lastError = bundle.message;
      const key = rels.join('\n');
      if (!bundle.transient && settled) {
        if (failure !== null && failure.message === bundle.message && failure.rels === key && sameContent(failure.outputs, after)) {
          return { ok: false, kind: 'bundle-error', message: bundle.message };
        }
        failure = { message: bundle.message, outputs: after, rels: key };
      } else {
        failure = null;
      }
      await io.sleep(delay);
      delay = Math.min(delay * 2, 8_000);
      continue;
    }
    failure = null;
    delay = 500;
    if (!settled) {
      candidate = null;
      await io.sleep(500);
      continue;
    }
    const judged = judge(memory, after, bundle.value);
    memory = judged.memory;
    if (judged.verdict === 'restart') {
      if (restarts >= options.maxRestarts) return { ok: false, kind: 'timeout', message: 'Metro kept serving a bundle that predates the current dist' };
      restarts += 1;
      io.progress('metro   restarting Metro, because dist changed after it started and its first bundle cannot be dated');
      const pid = await io.restart();
      memory = { metroPid: pid, spawn: io.fingerprint(io.list(), after), seen: {}, outputs: memory.outputs };
      candidate = null;
      continue;
    }
    if (judged.verdict === 'stale') {
      candidate = null;
      staleSince ??= io.now();
      if (io.now() - staleSince >= options.nudgeAfterMs) {
        const missed = inBundle(bundle.value.body, changedFiles(memory.outputs, after));
        io.progress(`metro   still serving an older bundle; touching ${missed.length} changed file(s) so Metro's watcher sees them`);
        io.touch(missed);
        staleSince = io.now();
      }
      await io.sleep(500);
      continue;
    }
    staleSince = null;
    if (candidate !== null && candidate.revId === bundle.value.revId && sameContent(candidate.outputs, after)) {
      return { ok: true, memory: { ...memory, outputs: after }, revId: bundle.value.revId };
    }
    candidate = { revId: bundle.value.revId, outputs: after };
    await io.sleep(500);
  }
  return { ok: false, kind: 'timeout', message: lastError };
}
