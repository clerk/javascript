import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  changedFiles,
  confirmServed,
  fingerprint,
  isBundledOutput,
  isPackageSource,
  isStale,
  isTsdownSource,
  listFiles,
  newest,
  staleInScope,
  staleOutOfScope,
  workspaceDependencies,
  judge,
  type BundleView,
  type Fetched,
  type Fingerprint,
  type GateIO,
  type GateMemory,
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

describe('judge', () => {
  const rel = 'packages/expo/dist/hooks/useAuth.js';
  const body = `var x;__d(function(){},12,[],"../../../${rel}");`;
  const fp = (hash: string, since: number): Fingerprint => ({ [rel]: { mtime: since, size: 1, hash, since } });
  const fresh: GateMemory = { metroPid: 1, spawn: null, seen: {}, outputs: {} };

  it('trusts the first revision of a Metro it started when dist has not changed since', () => {
    const memory = { ...fresh, spawn: fp('a', 1_000) };
    assert.equal(judge(memory, fp('a', 1_000), { revId: 'r1', lastModified: 2_000, body }).verdict, 'fresh');
  });

  it('restarts a Metro whose first bundle cannot be dated against the current dist', () => {
    assert.equal(judge({ ...fresh, spawn: fp('a', 1_000) }, fp('b', 3_000), { revId: 'r1', lastModified: 4_000, body }).verdict, 'restart');
    assert.equal(judge(fresh, fp('a', 1_000), { revId: 'r1', lastModified: 4_000, body }).verdict, 'restart');
  });

  it('does not confirm a revision it already saw paired with older content', () => {
    const afterEdit1 = judge({ ...fresh, spawn: fp('a', 1_000) }, fp('a', 1_000), { revId: 'r1', lastModified: 2_000, body });
    assert.equal(afterEdit1.verdict, 'fresh');
    const lagging = judge(afterEdit1.memory, fp('b', 5_400), { revId: 'r1', lastModified: 2_000, body });
    assert.equal(lagging.verdict, 'stale');
    assert.equal(judge(lagging.memory, fp('b', 5_400), { revId: 'r2', lastModified: 6_000, body }).verdict, 'fresh');
  });

  it('rejects a revision first seen now but dated before the current content', () => {
    const memory = { ...fresh, seen: { r1: 'x' } };
    const early = judge(memory, fp('c', 9_400), { revId: 'r2', lastModified: 8_000, body });
    assert.equal(early.verdict, 'stale');
    assert.equal(judge(early.memory, fp('c', 9_400), { revId: 'r2', lastModified: 8_000, body }).verdict, 'stale');
  });

  it('keeps confirming the same revision after a rewrite with identical content', () => {
    const first = judge({ ...fresh, spawn: fp('a', 1_000) }, fp('a', 1_000), { revId: 'r1', lastModified: 2_000, body });
    const rewritten = { [rel]: { mtime: 7_000, size: 1, hash: 'a', since: 1_000 } };
    assert.equal(judge(first.memory, rewritten, { revId: 'r1', lastModified: 2_000, body }).verdict, 'fresh');
  });

  it('ignores a changed file the bundle does not include', () => {
    const web = 'packages/expo/dist/web/index.js';
    const first = judge({ ...fresh, spawn: fp('a', 1_000) }, fp('a', 1_000), { revId: 'r1', lastModified: 2_000, body });
    const withWeb = { ...fp('a', 1_000), [web]: { mtime: 8_000, size: 1, hash: 'w', since: 8_000 } };
    assert.equal(judge(first.memory, withWeb, { revId: 'r1', lastModified: 2_000, body }).verdict, 'fresh');
  });
});

describe('fingerprint', () => {
  it('keeps the time content first appeared across an identical rewrite', () => {
    const root = scratch();
    const rel = 'a.js';
    writeFileSync(join(root, rel), 'one');
    utimesSync(join(root, rel), 10, 10);
    const first = fingerprint(root, [rel], null);
    writeFileSync(join(root, rel), 'one');
    utimesSync(join(root, rel), 20, 20);
    const second = fingerprint(root, [rel], first);
    assert.equal(second[rel]!.since, first[rel]!.since);
    assert.deepEqual(changedFiles(first, second), []);
    writeFileSync(join(root, rel), 'two');
    utimesSync(join(root, rel), 30, 30);
    assert.equal(fingerprint(root, [rel], second)[rel]!.since, 30_000);
  });
});

describe('confirmServed', () => {
  const rel = 'packages/expo/dist/hooks/useAuth.js';
  const body = `__d(function(){},1,[],"../../../${rel}");`;
  type Step = { readonly files: Record<string, string>; readonly response: Fetched<BundleView> };
  const harness = (steps: Step[], after: Record<string, string>[] = []) => {
    let clock = 0;
    let call = 0;
    let files: Record<string, string> = steps[0]!.files;
    const touched: string[][] = [];
    let restarts = 0;
    const io: GateIO = {
      list: () => Object.keys(files),
      fingerprint: (rels, previous) =>
        Object.fromEntries(rels.filter((r) => files[r] !== undefined).map((r) => {
          const hash = files[r]!;
          const before = previous?.[r];
          return [r, { mtime: clock, size: hash.length, hash, since: before !== undefined && before.hash === hash ? before.since : clock }];
        })),
      fetch: async () => {
        const step = steps[Math.min(call, steps.length - 1)]!;
        files = after[call] ?? step.files;
        call += 1;
        return step.response;
      },
      touch: (rels) => touched.push([...rels]),
      restart: async () => {
        restarts += 1;
        return 2;
      },
      now: () => clock,
      sleep: async (ms) => {
        clock += ms;
      },
      progress: () => undefined,
    };
    return { io, touched: () => touched, restarts: () => restarts, calls: () => call };
  };
  const ok = (revId: string, lastModified: number): Fetched<BundleView> => ({ ok: true, value: { revId, lastModified, body } });
  const options = { timeoutMs: 20_000, nudgeAfterMs: 5_000, maxRestarts: 2, settledFailureMs: 3_000 };

  it('confirms after two matching reads of a fresh revision', async () => {
    const h = harness([{ files: { [rel]: 'a' }, response: ok('r1', 0) }]);
    const result = await confirmServed(h.io, { metroPid: 1, spawn: { [rel]: { mtime: 0, size: 1, hash: 'a', since: 0 } }, seen: {}, outputs: {} }, options);
    assert.equal(result.ok, true);
    assert.equal(h.calls(), 2);
  });

  it('waits out a 500 while tsdown empties and refills dist, then confirms', async () => {
    const error: Fetched<BundleView> = { ok: false, transient: false, message: 'bundle 500: UnableToResolveError' };
    const h = harness(
      [
        { files: { [rel]: 'a' }, response: error },
        { files: {}, response: error },
        { files: { [rel]: 'b' }, response: ok('r2', 60_000) },
      ],
      [{}, { [rel]: 'b' }],
    );
    const memory: GateMemory = { metroPid: 1, spawn: null, seen: { r1: 'x' }, outputs: { [rel]: { mtime: 0, size: 1, hash: 'a', since: 0 } } };
    const result = await confirmServed(h.io, memory, options);
    assert.equal(result.ok, true, JSON.stringify(result));
  });

  it('fails a 500 only once it has persisted over settled outputs for the settle window', async () => {
    const error: Fetched<BundleView> = { ok: false, transient: false, message: 'bundle 500: SyntaxError' };
    const h = harness([{ files: { [rel]: 'a' }, response: error }]);
    const result = await confirmServed(h.io, { metroPid: 1, spawn: null, seen: { r0: 'x' }, outputs: {} }, options);
    assert.deepEqual(result, { ok: false, kind: 'bundle-error', message: 'bundle 500: SyntaxError' });
    assert.ok(h.io.now() >= 3_000, `failed after ${h.io.now()}ms`);
    assert.ok(h.calls() >= 3);
  });

  it('confirms when a 500 clears within the settle window', async () => {
    const error: Fetched<BundleView> = { ok: false, transient: false, message: 'bundle 500: UnableToResolveError' };
    const h = harness([
      { files: { [rel]: 'a' }, response: error },
      { files: { [rel]: 'a' }, response: error },
      { files: { [rel]: 'a' }, response: ok('r1', 0) },
    ]);
    const memory: GateMemory = { metroPid: 1, spawn: { [rel]: { mtime: 0, size: 1, hash: 'a', since: 0 } }, seen: {}, outputs: {} };
    assert.equal((await confirmServed(h.io, memory, options)).ok, true);
  });

  it('does not confirm a lagging revision after a second edit, and touches the changed file', async () => {
    const memory: GateMemory = { metroPid: 1, spawn: null, seen: { r1: 'digest-of-edit-1' }, outputs: { [rel]: { mtime: 0, size: 1, hash: 'edit-1', since: 0 } } };
    const h = harness([{ files: { [rel]: 'edit-2' }, response: ok('r1', 0) }]);
    const result = await confirmServed(h.io, memory, options);
    assert.equal(result.ok, false);
    assert.ok(h.touched().length > 0);
    assert.deepEqual(h.touched()[0], [rel]);
  });

  it('restarts a Metro with no history, at most maxRestarts times', async () => {
    const h = harness([{ files: { [rel]: 'a' }, response: ok('r1', 0) }]);
    const result = await confirmServed(h.io, { metroPid: 1, spawn: null, seen: {}, outputs: {} }, options);
    assert.equal(h.restarts(), 1);
    assert.equal(result.ok, true);
  });
});

describe('scope', () => {
  const workspace = () => {
    const root = scratch();
    const pkg = (dir: string, json: object, files: Record<string, number>, expoModule = false) => {
      const base = join(root, 'packages', dir);
      mkdirSync(join(base, 'node_modules', '@clerk'), { recursive: true });
      writeFileSync(join(base, 'package.json'), JSON.stringify(json));
      if (expoModule) writeFileSync(join(base, 'expo-module.config.json'), '{}');
      for (const [rel, time] of Object.entries(files)) {
        mkdirSync(join(base, rel, '..'), { recursive: true });
        writeFileSync(join(base, rel), rel);
        utimesSync(join(base, rel), time, time);
      }
    };
    pkg('expo', { name: '@clerk/expo', dependencies: { '@clerk/clerk-js': '*', '@clerk/shared': '*', '@clerk/expo-passkeys': '*' } }, { 'src/index.ts': 100, 'dist/index.js': 200 });
    pkg('clerk-js', { name: '@clerk/clerk-js', dependencies: { '@clerk/shared': '*' } }, { 'src/index.ts': 100, 'dist/clerk.js': 200 });
    pkg('shared', { name: '@clerk/shared' }, { 'src/index.ts': 100, 'dist/index.cjs': 200 });
    pkg('expo-passkeys', { name: '@clerk/expo-passkeys', dependencies: { '@clerk/shared': '*' } }, { 'src/index.ts': 100, 'dist/index.js': 200 }, true);
    const link = (from: string, name: string) => symlinkSync(join(root, 'packages', name), join(root, 'packages', from, 'node_modules', '@clerk', name));
    link('expo', 'clerk-js');
    link('expo', 'shared');
    link('expo', 'expo-passkeys');
    link('clerk-js', 'shared');
    link('expo-passkeys', 'shared');
    return { root, expo: join(root, 'packages', 'expo'), touch: (rel: string, time: number) => utimesSync(join(root, 'packages', rel), time, time) };
  };

  it('finds nothing stale on a fresh build', () => {
    const w = workspace();
    assert.deepEqual(staleOutOfScope(w.root, w.expo).stale, []);
    assert.deepEqual(staleInScope(w.root, w.expo).stale, []);
  });

  it('refuses an out-of-scope dependency edit, including packages that bundle it', () => {
    const w = workspace();
    w.touch('shared/src/index.ts', 300);
    assert.deepEqual(staleOutOfScope(w.root, w.expo).stale.map((p) => p.name).sort(), ['@clerk/clerk-js', '@clerk/shared']);
    assert.deepEqual(staleInScope(w.root, w.expo).stale, []);
  });

  it('still refuses @clerk/clerk-js when only @clerk/shared was rebuilt', () => {
    const w = workspace();
    w.touch('shared/src/index.ts', 300);
    w.touch('shared/dist/index.cjs', 400);
    assert.deepEqual(staleOutOfScope(w.root, w.expo).stale.map((p) => p.name), ['@clerk/clerk-js']);
  });

  it('clears a content-neutral touch once it has seen the package built', () => {
    const w = workspace();
    const { records } = staleOutOfScope(w.root, w.expo);
    w.touch('shared/src/index.ts', 300);
    const after = staleOutOfScope(w.root, w.expo, records);
    assert.deepEqual(after.stale, []);
    assert.deepEqual(after.records, records);
  });

  it('still refuses a real edit that a record has seen built from other content', () => {
    const w = workspace();
    const { records } = staleOutOfScope(w.root, w.expo);
    writeFileSync(join(w.root, 'packages', 'shared', 'src', 'index.ts'), 'changed');
    w.touch('shared/src/index.ts', 300);
    assert.deepEqual(staleOutOfScope(w.root, w.expo, records).stale.map((p) => p.name).sort(), ['@clerk/clerk-js', '@clerk/shared']);
  });

  it('accepts a revert of an unbuilt edit, because dist was built from the restored content', () => {
    const w = workspace();
    const { records } = staleOutOfScope(w.root, w.expo);
    const file = join(w.root, 'packages', 'shared', 'src', 'index.ts');
    writeFileSync(file, 'edited');
    w.touch('shared/src/index.ts', 300);
    const refused = staleOutOfScope(w.root, w.expo, records);
    assert.ok(refused.stale.length > 0);
    writeFileSync(file, 'src/index.ts');
    w.touch('shared/src/index.ts', 310);
    assert.deepEqual(staleOutOfScope(w.root, w.expo, refused.records).stale, []);
  });

  it('refuses a touch it has no record for, until the build rewrites dist', () => {
    const w = workspace();
    w.touch('shared/src/index.ts', 300);
    assert.ok(staleOutOfScope(w.root, w.expo).stale.length > 0);
    w.touch('shared/dist/index.cjs', 400);
    w.touch('clerk-js/dist/clerk.js', 400);
    assert.deepEqual(staleOutOfScope(w.root, w.expo).stale, []);
  });

  it('does not rebuild an in-scope sibling again after a content-neutral touch', () => {
    const w = workspace();
    const { records } = staleInScope(w.root, w.expo);
    w.touch('expo-passkeys/src/index.ts', 300);
    assert.deepEqual(staleInScope(w.root, w.expo, records).stale, []);
  });

  it('rebuilds an in-scope Expo module sibling instead of refusing it', () => {
    const w = workspace();
    w.touch('expo-passkeys/src/index.ts', 300);
    assert.deepEqual(staleInScope(w.root, w.expo).stale.map((p) => p.name), ['@clerk/expo-passkeys']);
    assert.deepEqual(staleOutOfScope(w.root, w.expo).stale, []);
  });
});
