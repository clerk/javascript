import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { newTestEmail, type ClerkBackend } from '../src/core/clerk.ts';
import { ensureLease } from '../src/core/devices.ts';
import { newEntryId, newRunId, openWorkspace } from '../src/core/workspace.ts';
import type { BuildKey, DeviceBackend, HostAdapter, LocalLease, ScratchPath } from '../src/core/types.ts';

function worktree(root: string, name: string): string {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  execFileSync('git', ['init', '-q'], { cwd: dir });
  writeFileSync(join(dir, 'app.swift'), name);
  return dir;
}

function fakes(deleted: string[]) {
  const lease: LocalLease = { backend: 'local', platform: 'ios', slot: 1, deviceName: 'verify-ios-1', deviceId: 'UDID', claimNonce: 'c', acquiredAt: '', installedBuild: null };
  const backend = {
    kind: 'local',
    platform: 'ios',
    supports: () => true,
    reapable: async () => [],
    check: async () => 'held',
    acquire: async () => lease,
    install: async () => undefined,
    describe: () => 'verify-ios-1',
  } as unknown as DeviceBackend;
  const host = {
    repo: 'clerk-ios',
    platforms: ['ios'],
    backends: [backend],
    appId: () => 'com.clerk.E2EHost',
    buildInputs: () => ['app.swift'],
    buildSources: () => ['local'],
    async build(platform: 'ios', source: 'local', key: BuildKey, into: ScratchPath) {
      mkdirSync(into, { recursive: true });
      writeFileSync(join(into, 'E2EHost.app'), '');
      return { platform, key, appId: 'com.clerk.E2EHost', path: join(into, 'E2EHost.app') as ScratchPath, source, sourceSha: null };
    },
  } as unknown as HostAdapter;
  const clerk = {
    deleteByEmail: async (_instance, email) => {
      deleted.push(email);
      return { users: 1, organizations: 0 };
    },
  } as Partial<ClerkBackend> as ClerkBackend;
  return { host, clerk };
}

describe('up finishes ledgers of deleted worktrees', () => {
  it('deletes their users, closes their entries, and leaves live worktrees alone', async () => {
    const root = mkdtempSync(join(tmpdir(), 'verify-ledgers-'));
    const home = join(root, 'home');
    const live = worktree(root, 'live');
    const gone = worktree(root, 'gone');
    const other = worktree(root, 'other');
    const run = newRunId();
    const goneLedger = openWorkspace({ skillDir: gone, worktree: gone, home });
    goneLedger.append({ id: newEntryId(), kind: 'lease-intent', platform: 'ios', backend: 'local', worktree: gone });
    goneLedger.append({ id: newEntryId(), kind: 'identity', run, instance: 'with-email-codes', email: newTestEmail(run, 1) });
    goneLedger.append({ id: newEntryId(), kind: 'identity', run, instance: 'with-session-tasks', email: newTestEmail(run, 2) });
    const otherLedger = openWorkspace({ skillDir: other, worktree: other, home });
    otherLedger.append({ id: newEntryId(), kind: 'identity', run, instance: 'with-email-codes', email: newTestEmail(run, 3) });
    rmSync(gone, { recursive: true });

    const deleted: string[] = [];
    const { host, clerk } = fakes(deleted);
    const workspace = openWorkspace({ skillDir: live, worktree: live, home });
    const options = { waitSeconds: 0, progress: () => undefined, clerk: () => clerk, retryWith: 'bin/verify up --wait <seconds>' };
    await workspace.withAcquireLock('ios', (lock) => ensureLease(lock, undefined, workspace, host, options));

    assert.deepEqual(deleted.sort(), [newTestEmail(run, 1), newTestEmail(run, 2)].sort());
    assert.deepEqual(openWorkspace({ skillDir: gone, worktree: gone, home }).unclosedEntries(), []);
    assert.equal(otherLedger.unclosedEntries().length, 1, 'a worktree that still exists keeps its users');

    await workspace.withAcquireLock('ios', (lock) => ensureLease(lock, undefined, workspace, host, options));
    assert.equal(deleted.length, 2, 'a finished ledger is not finished twice');
  });

  it('leaves the ledger open when BAPI fails, so the next up retries', async () => {
    const root = mkdtempSync(join(tmpdir(), 'verify-ledgers-'));
    const home = join(root, 'home');
    const live = worktree(root, 'live');
    const gone = worktree(root, 'gone');
    const run = newRunId();
    openWorkspace({ skillDir: gone, worktree: gone, home }).append({ id: newEntryId(), kind: 'identity', run, instance: 'with-email-codes', email: newTestEmail(run, 1) });
    rmSync(gone, { recursive: true });
    const { host } = fakes([]);
    const failing = { deleteByEmail: async () => assert.fail('BAPI is down') } as Partial<ClerkBackend> as ClerkBackend;
    const lines: string[] = [];
    const workspace = openWorkspace({ skillDir: live, worktree: live, home });
    await workspace.withAcquireLock('ios', (lock) => ensureLease(lock, undefined, workspace, host, { waitSeconds: 0, progress: (l) => lines.push(l), clerk: () => failing, retryWith: 'bin/verify up --wait <seconds>' }));
    assert.equal(openWorkspace({ skillDir: gone, worktree: gone, home }).unclosedEntries().length, 1);
    assert.ok(lines.some((l) => l.includes('left open')));
  });
});
