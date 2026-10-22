import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { heldInstances } from '../testing/fake-instances.ts';
import { describe, it } from 'node:test';
import { ensureLease } from '../src/core/devices.ts';
import { newEntryId, openWorkspace } from '../src/core/workspace.ts';
import type { BuildKey, DeviceBackend, HostAdapter, LedgerEntry, LocalLease, ScratchPath } from '../src/core/types.ts';

function worktree(root: string, name: string): string {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  execFileSync('git', ['init', '-q'], { cwd: dir });
  writeFileSync(join(dir, 'app.swift'), name);
  return dir;
}

const application = (name: string): LedgerEntry => ({ id: newEntryId(), kind: 'application', name, workspace: 'org_test' });

function fakes(finished: string[]) {
  const lease: LocalLease = { backend: 'local', platform: 'ios', slot: 1, deviceName: 'verify-ios-1', deviceId: 'UDID', claimNonce: 'c', acquiredAt: '', installedBuild: null };
  const backend = {
    kind: 'local',
    platform: 'ios',
    availability: () => ({ usable: true, why: 'test' }),
    reapable: async () => [],
    check: async () => 'held',
    acquire: async () => lease,
    install: async (held: LocalLease) => held,
    describe: () => 'verify-ios-1',
  } as unknown as DeviceBackend;
  const host = {
    repo: 'clerk-ios',
    platforms: ['ios'],
    backends: [backend],
    appId: () => 'com.clerk.E2EHost',
    buildInputs: () => ['app.swift'],
    async build(platform: 'ios', key: BuildKey, into: ScratchPath) {
      mkdirSync(into, { recursive: true });
      writeFileSync(join(into, 'E2EHost.app'), '');
      return { platform, key, appId: 'com.clerk.E2EHost', path: join(into, 'E2EHost.app') as ScratchPath, source: 'local' };
    },
  } as unknown as HostAdapter;
  const instances = heldInstances({ finish: async (ledger) => (finished.push(ledger.worktree), []) });
  return { host, instances };
}

describe('up finishes ledgers of deleted worktrees', () => {
  it('finishes their instances, closes their entries, and leaves live worktrees alone', async () => {
    const root = mkdtempSync(join(tmpdir(), 'verify-ledgers-'));
    const home = join(root, 'home');
    const live = worktree(root, 'live');
    const gone = worktree(root, 'gone');
    const other = worktree(root, 'other');
    const goneLedger = openWorkspace({ packageDir: gone, worktree: gone, home });
    goneLedger.append({ id: newEntryId(), kind: 'lease-intent', platform: 'ios', backend: 'local', worktree: gone });
    goneLedger.append(application('verify-throwaway-gone'));
    const otherLedger = openWorkspace({ packageDir: other, worktree: other, home });
    otherLedger.append(application('verify-throwaway-other'));
    rmSync(gone, { recursive: true });

    const finished: string[] = [];
    const { host, instances } = fakes(finished);
    const workspace = openWorkspace({ packageDir: live, worktree: live, home });
    const options = { waitSeconds: 0, progress: () => undefined, instances, retryWith: '{cli} up --wait <seconds>' };
    await workspace.withAcquireLock('ios', (lock) => ensureLease(lock, undefined, workspace, host, options));

    assert.deepEqual(finished, [gone]);
    assert.deepEqual(openWorkspace({ packageDir: gone, worktree: gone, home }).unclosedEntries(), []);
    assert.equal(otherLedger.unclosedEntries().length, 1, 'a worktree that still exists keeps its instances');

    await workspace.withAcquireLock('ios', (lock) => ensureLease(lock, undefined, workspace, host, options));
    assert.equal(finished.length, 1, 'a finished ledger is not finished twice');
  });

  it('leaves the ledger open when its instances cannot be deleted, so the next up retries', async () => {
    const root = mkdtempSync(join(tmpdir(), 'verify-ledgers-'));
    const home = join(root, 'home');
    const live = worktree(root, 'live');
    const gone = worktree(root, 'gone');
    openWorkspace({ packageDir: gone, worktree: gone, home }).append(application('verify-throwaway-gone'));
    rmSync(gone, { recursive: true });
    const { host } = fakes([]);
    const failing = heldInstances({ finish: async () => assert.fail('the Platform API is down') });
    const lines: string[] = [];
    const workspace = openWorkspace({ packageDir: live, worktree: live, home });
    await workspace.withAcquireLock('ios', (lock) => ensureLease(lock, undefined, workspace, host, { waitSeconds: 0, progress: (l) => lines.push(l), instances: failing, retryWith: '{cli} up --wait <seconds>' }));
    assert.equal(openWorkspace({ packageDir: gone, worktree: gone, home }).unclosedEntries().length, 1);
    assert.ok(lines.some((l) => l.includes('left open')));
  });

  it('reaps a removed worktree whose package lived at another path, using the path its ledger recorded', async () => {
    const root = mkdtempSync(join(tmpdir(), 'verify-ledgers-'));
    const home = join(root, 'home');
    const live = worktree(root, 'live');
    const gone = worktree(root, 'gone');
    const packageDir = join(gone, 'tools', 'device-tests');
    const goneLedger = openWorkspace({ packageDir, worktree: gone, home });
    goneLedger.append(application('verify-throwaway-gone'));
    const owner = readFileSync(goneLedger.ledgerFile.replace(/\.jsonl$/, '.owner'), 'utf8').trim().split('\n');
    assert.deepEqual(owner, [gone, packageDir], 'the ledger records its worktree and its package directory');
    rmSync(gone, { recursive: true });
    const finished: string[] = [];
    const { host, instances } = fakes(finished);
    const workspace = openWorkspace({ packageDir: live, worktree: live, home });
    await workspace.withAcquireLock('ios', (lock) =>
      ensureLease(lock, undefined, workspace, host, { waitSeconds: 0, progress: () => undefined, instances, retryWith: '{cli} up --wait <seconds>' }),
    );
    assert.deepEqual(finished, [gone]);
    assert.deepEqual(openWorkspace({ packageDir, worktree: gone, home }).unclosedEntries(), []);
  });
});
