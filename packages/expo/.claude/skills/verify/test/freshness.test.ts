import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { bundleIsFresh, changedSince, isTsdownSource, isTsupSource, listFiles, newest, type ServedState } from '../src/freshness.ts';

describe('which sources the watch builds', () => {
  it('counts only the files tsdown builds for @clerk/expo', () => {
    assert.equal(isTsdownSource('hooks/useAuth.ts'), true);
    assert.equal(isTsdownSource('native/AuthView.tsx'), true);
    assert.equal(isTsdownSource('hooks/useAuth.test.ts'), false);
    assert.equal(isTsdownSource('hooks/__tests__/useAuth.ts'), false);
    assert.equal(isTsdownSource('hooks/.useAuth.ts.swp'), false);
    assert.equal(isTsdownSource('.DS_Store'), false);
  });

  it('counts tsup sources for @clerk/expo-biometrics, which keeps .test files', () => {
    assert.equal(isTsupSource('index.ts'), true);
    assert.equal(isTsupSource('__tests__/index.test.ts'), false);
  });

  it('ignores an edited test file when deciding whether dist caught up', () => {
    const root = mkdtempSync(join(tmpdir(), 'verify-fresh-'));
    mkdirSync(join(root, 'src', 'hooks'), { recursive: true });
    mkdirSync(join(root, 'dist', 'hooks'), { recursive: true });
    writeFileSync(join(root, 'src', 'hooks', 'useAuth.ts'), '');
    writeFileSync(join(root, 'dist', 'hooks', 'useAuth.js'), '');
    writeFileSync(join(root, 'src', 'hooks', 'useAuth.test.ts'), '');
    utimesSync(join(root, 'src', 'hooks', 'useAuth.ts'), 100, 100);
    utimesSync(join(root, 'dist', 'hooks', 'useAuth.js'), 200, 200);
    utimesSync(join(root, 'src', 'hooks', 'useAuth.test.ts'), 300, 300);
    const src = newest(listFiles(join(root, 'src'), '', isTsdownSource));
    const dist = newest(listFiles(join(root, 'dist'), '', (rel) => rel.endsWith('.js')));
    assert.ok(dist >= src, 'dist counts as current although a test file is newer');
  });
});

describe('bundleIsFresh', () => {
  const state: ServedState = { metroPid: 1, revId: 'rev-a', confirmedAt: 10_000 };
  const edited = { rel: 'packages/expo/dist/hooks/useAuth.js', mtime: 12_400 };
  const body = 'var x;__d(function(){},12,[],"../../../packages/expo/dist/hooks/useAuth.js");';

  it('reports a stale bundle when Metro still serves the revision from before the edit', () => {
    assert.deepEqual(changedSince(state, [edited, { rel: 'packages/expo/dist/old.js', mtime: 9_000 }]), [edited]);
    assert.equal(bundleIsFresh(state, [edited], { revId: 'rev-a', lastModified: 10_000, body }), false);
  });

  it('reports a stale bundle when the new revision predates the edited file', () => {
    assert.equal(bundleIsFresh(state, [edited], { revId: 'rev-b', lastModified: 11_000, body }), false);
  });

  it('accepts a new revision built in or after the second the file changed', () => {
    assert.equal(bundleIsFresh(state, [edited], { revId: 'rev-b', lastModified: 12_000, body }), true);
  });

  it('does not wait for a changed file the bundle never includes', () => {
    const webOnly = { rel: 'packages/expo/dist/web/index.js', mtime: 12_400 };
    assert.equal(bundleIsFresh(state, [webOnly], { revId: 'rev-a', lastModified: 10_000, body }), true);
  });

  it('accepts any bundle on the first check after Metro starts', () => {
    assert.deepEqual(changedSince(null, [edited]), []);
    assert.equal(bundleIsFresh(null, [], { revId: 'rev-a', lastModified: 0, body }), true);
  });
});
