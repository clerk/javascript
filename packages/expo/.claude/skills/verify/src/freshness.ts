import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface SourceFile {
  readonly rel: string;
  readonly mtime: number;
}

const BUILT_EXTENSION = /\.(ts|tsx|js|jsx)$/;

const inTestsDir = (rel: string) => rel.split('/').includes('__tests__');

export function isTsdownSource(rel: string): boolean {
  return BUILT_EXTENSION.test(rel) && !/\.test\.(ts|tsx)$/.test(rel) && !inTestsDir(rel);
}

export function isTsupSource(rel: string): boolean {
  return BUILT_EXTENSION.test(rel) && !inTestsDir(rel);
}

export function isBundledOutput(rel: string): boolean {
  return rel.endsWith('.js');
}

export function listFiles(root: string, prefix: string, keep: (rel: string) => boolean): readonly SourceFile[] {
  const walk = (dir: string, relDir: string): SourceFile[] => {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const rel = relDir === '' ? entry.name : `${relDir}/${entry.name}`;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return walk(path, rel);
      return entry.isFile() && keep(rel) ? [{ rel: `${prefix}${rel}`, mtime: statSync(path).mtimeMs }] : [];
    });
  };
  return walk(root, '');
}

export const newest = (files: readonly SourceFile[]): number => files.reduce((max, f) => Math.max(max, f.mtime), 0);

export interface ServedState {
  readonly metroPid: number;
  readonly revId: string;
  readonly confirmedAt: number;
}

export interface BundleResponse {
  readonly revId: string;
  readonly lastModified: number;
  readonly body: string;
}

export function changedSince(state: ServedState | null, outputs: readonly SourceFile[]): readonly SourceFile[] {
  return state === null ? [] : outputs.filter((f) => f.mtime > state.confirmedAt);
}

export function bundleIsFresh(state: ServedState | null, changed: readonly SourceFile[], response: BundleResponse): boolean {
  const served = changed.filter((f) => response.body.includes(`${f.rel}"`));
  if (state === null || served.length === 0) return true;
  const changedSecond = Math.floor(newest(served) / 1000) * 1000;
  return response.revId !== state.revId && response.lastModified >= changedSecond;
}
