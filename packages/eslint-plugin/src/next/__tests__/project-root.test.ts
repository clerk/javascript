import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getRelativeFolder } from '../lib/file-info';
import { classifyFolder } from '../lib/match-folders';
import { findEslintProjectRoot, resolveProjectRoot } from '../lib/project-root';

let projectRoot: string;

beforeEach(async () => {
  projectRoot = await mkdtemp(path.join(tmpdir(), 'clerk-project-root-'));
});

afterEach(async () => {
  await rm(projectRoot, { recursive: true, force: true });
});

describe('findEslintProjectRoot', () => {
  it('returns the directory containing eslint.config.js', async () => {
    await writeFile(path.join(projectRoot, 'eslint.config.js'), 'export default [];\n');
    const file = path.join(projectRoot, 'app', 'dashboard', 'page.tsx');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, '');

    expect(findEslintProjectRoot(file)).toBe(projectRoot.replaceAll('\\', '/'));
  });

  it('walks up past intermediate directories', async () => {
    const appRoot = path.join(projectRoot, 'apps', 'web');
    await mkdir(appRoot, { recursive: true });
    await writeFile(path.join(appRoot, 'eslint.config.mjs'), 'export default [];\n');
    const file = path.join(appRoot, 'app', 'sign-in', 'page.tsx');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, '');

    expect(findEslintProjectRoot(file)).toBe(appRoot.replaceAll('\\', '/'));
  });

  it('returns null when no eslint.config.* exists', async () => {
    const file = path.join(projectRoot, 'app', 'page.tsx');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, '');

    expect(findEslintProjectRoot(file)).toBeNull();
  });
});

describe('resolveProjectRoot', () => {
  it('prefers explicit rootDir over discovered config and cwd', async () => {
    await writeFile(path.join(projectRoot, 'eslint.config.js'), 'export default [];\n');
    const file = path.join(projectRoot, 'app', 'page.tsx');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, '');

    const explicit = path.join(projectRoot, 'explicit-root');
    expect(resolveProjectRoot(file, { rootDir: explicit, cwd: '/elsewhere' })).toBe(explicit.replaceAll('\\', '/'));
  });

  it('uses nearest eslint.config.* when rootDir is omitted', async () => {
    await writeFile(path.join(projectRoot, 'eslint.config.js'), 'export default [];\n');
    const file = path.join(projectRoot, 'app', 'page.tsx');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, '');

    expect(resolveProjectRoot(file, { cwd: '/Users' })).toBe(projectRoot.replaceAll('\\', '/'));
  });

  it('falls back to cwd when config discovery finds nothing', () => {
    expect(resolveProjectRoot('/no/config/here/app/page.tsx', { cwd: '/no/config/here' })).toBe('/no/config/here');
  });
});

describe('path classification with project root', () => {
  it('classifies public folders correctly when ESLint cwd is above the project', async () => {
    const myproj = path.join(projectRoot, 'work', 'myproj');
    await mkdir(myproj, { recursive: true });
    await writeFile(path.join(myproj, 'eslint.config.js'), 'export default [];\n');
    const file = path.join(myproj, 'app', 'sign-in', 'page.tsx');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, '');

    const resolved = resolveProjectRoot(file, { cwd: projectRoot });
    const folder = getRelativeFolder(file, resolved);
    const classification = classifyFolder(folder!, {
      protected: ['app/**'],
      public: ['app/sign-in/**'],
    });

    expect(folder).toBe('app/sign-in');
    expect(classification).toBe('public');
  });

  it('fixes misclassification when only a high cwd is available but rootDir is explicit', () => {
    const file = '/Users/app/work/myproj/app/sign-in/page.tsx';
    const root = '/Users/app/work/myproj';
    const folder = getRelativeFolder(file, resolveProjectRoot(file, { rootDir: root, cwd: '/Users' }));

    expect(folder).toBe('app/sign-in');
    expect(
      classifyFolder(folder!, {
        protected: ['app/**'],
        public: ['app/sign-in/**'],
      }),
    ).toBe('public');
  });
});
