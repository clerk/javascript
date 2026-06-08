/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/**
 * Utilities for classifying a file by path, kind, and module-level directives.
 */

import path from 'node:path';

import type { TSESTree } from '@typescript-eslint/utils';

export type FileKind = 'page' | 'layout' | 'template' | 'default' | 'route';

const RESOURCE_FILES = new Set<FileKind>(['page', 'layout', 'template', 'default', 'route']);

const RESOURCE_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

export function getRelativeFolder(filename: string | undefined, cwd: string | undefined): string | null {
  if (!filename) {
    return null;
  }
  const normalizedFile = filename.replaceAll('\\', '/');

  // Prefer a project-relative path so that noise in the absolute prefix (a home
  // directory like `/Users/app/...`, a monorepo root, etc.) can't be mistaken
  // for the Next.js App Router root. When the file lives outside `cwd` (e.g. in
  // `RuleTester`, which lints in-memory code), fall back to the absolute path.
  let candidate = normalizedFile;
  if (cwd) {
    const normalizedCwd = cwd.replaceAll('\\', '/');
    const rel = path.posix.relative(normalizedCwd, normalizedFile);
    if (rel && !rel.startsWith('..')) {
      candidate = rel;
    }
  }

  // The App Router root is the first path segment that is exactly `app` (this
  // also covers the `src/app/` convention, where the leading `src` segment is
  // simply skipped). Folder globs in config are rooted at `app/...`, so we
  // re-root the returned folder there. Matching whole segments (rather than the
  // `/app/` substring) avoids false positives like `myapp` or `app-utils`.
  const segments = candidate.split('/');
  const appIdx = segments.findIndex(seg => seg === 'app');
  if (appIdx !== -1) {
    return path.posix.dirname(segments.slice(appIdx).join('/'));
  }

  // No `app` segment: only meaningful when we have a project-relative path.
  if (candidate !== normalizedFile) {
    return path.posix.dirname(candidate);
  }
  return null;
}

export function getFileKind(filename: string | undefined): FileKind | null {
  if (!filename) {
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

export function isServerActionModule(programNode: TSESTree.Program): boolean {
  return hasTopLevelDirective(programNode, 'use server');
}

export function isClientModule(programNode: TSESTree.Program): boolean {
  return hasTopLevelDirective(programNode, 'use client');
}
