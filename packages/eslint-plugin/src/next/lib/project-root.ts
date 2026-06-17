/**
 * Resolve the directory paths should be relativized against when classifying
 * App Router folders.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

/** Filenames ESLint searches for when resolving flat config (precedence order). */
export const ESLINT_CONFIG_FILENAMES = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
] as const;

function normalizeDir(dir: string): string {
  return dir.replaceAll('\\', '/');
}

/**
 * Walk up from `filePath` and return the directory of the nearest
 * `eslint.config.*`, mirroring ESLint's per-file config lookup.
 */
export function findEslintProjectRoot(filePath: string): string | null {
  let dir = path.resolve(path.dirname(filePath));
  const { root } = path.parse(dir);

  while (true) {
    for (const name of ESLINT_CONFIG_FILENAMES) {
      if (existsSync(path.join(dir, name))) {
        return normalizeDir(dir);
      }
    }
    if (dir === root) {
      return null;
    }
    dir = path.dirname(dir);
  }
}

export interface ResolveProjectRootOptions {
  /** Explicit override (e.g. `import.meta.dirname` from `eslint.config.mjs`). */
  rootDir?: string;
  /** ESLint `context.cwd` fallback when config discovery finds nothing. */
  cwd?: string;
}

/**
 * Pick the directory to relativize linted file paths against.
 *
 * Precedence: explicit `rootDir` → nearest `eslint.config.*` ancestor → `cwd`.
 */
export function resolveProjectRoot(
  filename: string | undefined,
  { rootDir, cwd }: ResolveProjectRootOptions = {},
): string | undefined {
  if (rootDir) {
    return normalizeDir(rootDir);
  }
  if (filename) {
    const fromConfig = findEslintProjectRoot(filename);
    if (fromConfig) {
      return fromConfig;
    }
  }
  return cwd ? normalizeDir(cwd) : undefined;
}
