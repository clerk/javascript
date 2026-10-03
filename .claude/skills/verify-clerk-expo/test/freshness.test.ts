import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  bundleIsFresh,
  changedFiles,
  fingerprint,
  isBundledOutput,
  isPackageSource,
  isStale,
  isTsdownSource,
  listFiles,
  newest,
  workspaceDependencies,
  type ServedState,
} from '../src/freshness.ts';

const scratch = () => mkdtempSync(join(tmpdir(), 'verify-fresh-'));

describe('which sources the builds read', () => {
  it('counts only the files tsdown builds for @clerk/expo', () => {
    assert.equal(isTsdownSource('hooks/useAuth.ts'), true);
    assert.equal(isTsdownSource('native/AuthView.tsx'), true);
    assert.equal(isTsdownSource('hooks/useAuth.test.ts'), false);
    assert.equal(isTsdownSource('hooks/__tests__/useAuth.ts'), false);
    assert.equal(isTsdownSource('hooks/.useAuth.ts.swp'), false);
  });

  it('ignores tests, specs, and declarations in a sibling package', () => {
    assert.equal(isPackageSource('index.ts'), true);
    assert.equal(isPackageSource('index.spec.ts'), false);
    assert.equal(isPackageSource('types.d.ts'), false);
    assert.equal(isPackageSource('__tests__/x.ts'), false);
  });

  it('ignores an edited test file when deciding whether dist caught up', () => {
    const root = scratch();
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
    assert.ok(dist >= src);
  });

  it('treats .cjs and .mjs chunks as bundled output, and not maps or declarations', () => {
    for (const rel of ['index.js', 'internal.cjs', 'hooks-ByQmbuum.cjs', 'index.mjs']) assert.equal(isBundledOutput(rel), true, rel);
    for (const rel of ['index.js.map', 'index.d.ts', 'errors.d.cts']) assert.equal(isBundledOutput(rel), false, rel);
  });

  it('flags a sibling whose source is newer than its dist', () => {
    assert.equal(isStale([{ rel: 'a.ts', mtime: 300 }], [{ rel: 'a.js', mtime: 200 }]), true);
    assert.equal(isStale([{ rel: 'a.ts', mtime: 100 }], [{ rel: 'a.js', mtime: 200 }]), false);
    assert.equal(isStale([{ rel: 'a.ts', mtime: 300 }], []), false);
  });
});

describe('workspaceDependencies', () => {
  it('follows runtime dependencies into the workspace, transitively, and skips dev dependencies', () => {
    const root = scratch();
    const pkg = (dir: string, json: object) => {
      mkdirSync(join(root, 'packages', dir, 'node_modules', '@clerk'), { recursive: true });
      writeFileSync(join(root, 'packages', dir, 'package.json'), JSON.stringify(json));
    };
    pkg('expo', { name: '@clerk/expo', dependencies: { '@clerk/react': '*' }, peerDependencies: { '@clerk/expo-passkeys': '*' }, devDependencies: { '@clerk/testing': '*' } });
    pkg('react', { name: '@clerk/react', dependencies: { '@clerk/shared': '*' } });
    pkg('shared', { name: '@clerk/shared' });
    pkg('expo-passkeys', { name: '@clerk/expo-passkeys' });
    pkg('testing', { name: '@clerk/testing' });
    const link = (from: string, name: string, to: string) => symlinkSync(join(root, 'packages', to), join(root, 'packages', from, 'node_modules', '@clerk', name));
    link('expo', 'react', 'react');
    link('expo', 'expo-passkeys', 'expo-passkeys');
    link('expo', 'testing', 'testing');
    link('react', 'shared', 'shared');
    const names = workspaceDependencies(root, join(root, 'packages', 'expo')).map((p) => p.name).sort();
    assert.deepEqual(names, ['@clerk/expo-passkeys', '@clerk/react', '@clerk/shared']);
  });
});

describe('the Metro freshness gate', () => {
  const rel = 'packages/expo/dist/hooks/useAuth.js';
  const body = `var x;__d(function(){},12,[],"../../../${rel}");`;
  const setup = () => {
    const root = scratch();
    mkdirSync(join(root, 'packages', 'expo', 'dist', 'hooks'), { recursive: true });
    writeFileSync(join(root, rel), 'module.exports = 1;');
    const confirmed = fingerprint(root, [rel], null);
    const state: ServedState = { metroPid: 1, revId: 'rev-a', outputs: confirmed };
    return { root, state };
  };

  it('does not wait for a new revision when a rewrite leaves the content identical', () => {
    const { root, state } = setup();
    writeFileSync(join(root, rel), 'module.exports = 1;');
    utimesSync(join(root, rel), 5_000, 5_000);
    const now = fingerprint(root, [rel], state.outputs);
    assert.deepEqual(changedFiles(state.outputs, now), []);
    assert.equal(bundleIsFresh(state, now, { revId: 'rev-a', body }), true);
  });

  it('waits for a new revision when the content changed', () => {
    const { root, state } = setup();
    writeFileSync(join(root, rel), 'module.exports = 2;');
    const now = fingerprint(root, [rel], state.outputs);
    assert.deepEqual(changedFiles(state.outputs, now), [rel]);
    assert.equal(bundleIsFresh(state, now, { revId: 'rev-a', body }), false);
    assert.equal(bundleIsFresh(state, now, { revId: 'rev-b', body }), true);
  });

  it('sees a write that lands after the outputs were listed', () => {
    const { root, state } = setup();
    const listed = fingerprint(root, [rel], state.outputs);
    writeFileSync(join(root, rel), 'module.exports = 3;');
    const afterFetch = fingerprint(root, [rel], listed);
    assert.notDeepEqual(changedFiles(listed, afterFetch), []);
    assert.equal(bundleIsFresh(state, afterFetch, { revId: 'rev-a', body }), false);
  });

  it('does not wait for a changed file the bundle never includes', () => {
    const { root, state } = setup();
    const web = 'packages/expo/dist/web/index.js';
    mkdirSync(join(root, 'packages', 'expo', 'dist', 'web'), { recursive: true });
    writeFileSync(join(root, web), 'web');
    const now = fingerprint(root, [rel, web], state.outputs);
    assert.deepEqual(changedFiles(state.outputs, now), [web]);
    assert.equal(bundleIsFresh(state, now, { revId: 'rev-a', body }), true);
  });

  it('accepts any bundle from a Metro it has not confirmed before', () => {
    const { root } = setup();
    assert.equal(bundleIsFresh(null, fingerprint(root, [rel], null), { revId: 'rev-a', body }), true);
  });

  it('rehashes only files whose size or mtime moved', () => {
    const { root, state } = setup();
    const again = fingerprint(root, [rel], state.outputs);
    assert.equal(again[rel], state.outputs[rel]);
  });
});
