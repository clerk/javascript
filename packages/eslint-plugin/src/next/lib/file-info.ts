/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/**
 * Utilities for classifying a file by path, kind, and module-level directives.
 */

import path from 'node:path';

import type { TSESTree } from '@typescript-eslint/utils';

export type FileKind = 'page' | 'layout' | 'template' | 'default' | 'route';

const RESOURCE_FILES = new Set<FileKind>(['page', 'layout', 'template', 'default', 'route']);

const RESOURCE_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

/**
 * @param rootDir Project root to relativize against — typically from
 *   `resolveProjectRoot()` (explicit option, nearest `eslint.config.*`, or ESLint
 *   `cwd`). Returns `null` when the file lies outside `rootDir`.
 */
export function getRelativeFolder(filename: string | undefined, rootDir: string | undefined): string | null {
  if (!filename) {
    return null;
  }
  const normalizedFile = filename.replaceAll('\\', '/');

  if (!rootDir) {
    return null;
  }

  const normalizedRoot = rootDir.replaceAll('\\', '/');
  const rel = path.posix.relative(normalizedRoot, normalizedFile);
  if (!rel || rel.startsWith('..')) {
    return null;
  }

  return path.posix.dirname(rel);
}

/**
 * Whether `relativeFolder` lies under a Next.js App Router root, relative to
 * the configured project root. Only Next.js' supported root layouts (`app/...`
 * and `src/app/...`) count; monorepo apps should set `rootDir` per app.
 */
export function isUnderAppRouterRoot(relativeFolder: string): boolean {
  return (
    relativeFolder === 'app' ||
    relativeFolder.startsWith('app/') ||
    relativeFolder === 'src/app' ||
    relativeFolder.startsWith('src/app/')
  );
}

/**
 * App Router resource kind (`page`, `layout`, etc.) when the file lives under an
 * App Router root. Returns `null` for the same basename outside `app/` (e.g.
 * `utils/page.tsx`).
 */
export function getAppRouterFileKind(filename: string | undefined, relativeFolder: string | null): FileKind | null {
  if (!filename || !relativeFolder || !isUnderAppRouterRoot(relativeFolder)) {
    return null;
  }
  const base = path.basename(filename).replace(RESOURCE_EXTENSIONS, '');
  return RESOURCE_FILES.has(base as FileKind) ? (base as FileKind) : null;
}

function hasTopLevelDirective(programNode: TSESTree.Program, name: string): boolean {
  for (const stmt of programNode.body) {
    if (stmt.type !== 'ExpressionStatement') {
      break;
    }
    if (!('directive' in stmt)) {
      break;
    }
    if (stmt.directive === name) {
      return true;
    }
  }
  return false;
}

export function isServerFunctionModule(programNode: TSESTree.Program): boolean {
  return hasTopLevelDirective(programNode, 'use server');
}

export function isClientModule(programNode: TSESTree.Program): boolean {
  return hasTopLevelDirective(programNode, 'use client');
}
