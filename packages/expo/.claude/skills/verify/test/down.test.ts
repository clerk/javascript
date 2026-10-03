import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { newTestEmail, type ClerkBackend } from '../src/core/clerk.ts';
import { down, type Deps } from '../src/core/verbs.ts';
import { newEntryId, newRunId, openWorkspace } from '../src/core/workspace.ts';
import type { DeviceBackend, HostAdapter, LocalLease } from '../src/core/types.ts';

function setup() {
  const skillDir = mkdtempSync(join(tmpdir(), 'verify-down-'));
  const workspace = openWorkspace({ skillDir, worktree: skillDir, home: join(skillDir, 'home') });
  const released: string[] = [];
  const deleted: string[] = [];
  const backend = {
    kind: 'local',
    platform: 'ios',
    supports: () => true,
    release: async (lease: LocalLease) => void released.push(lease.deviceId),
    reapable: async () => [],
    describe: (lease: LocalLease) => lease.deviceName,
  } as unknown as DeviceBackend;
  const host = { repo: 'clerk-ios', platforms: ['ios'], backends: [backend] } as unknown as HostAdapter;
  const clerk = {
    deleteByEmail: async (_instance, email) => {
      deleted.push(email);
      return { users: 1, organizations: 0 };
    },
    previewDeleteByEmail: async (instance) => ({ users: 1, organizations: instance === 'with-email-codes' ? 2 : 0 }),
  } as Partial<ClerkBackend> as ClerkBackend;
  const deps: Deps = { host, workspace, runner: async () => assert.fail('down runs no commands'), env: {}, progress: () => undefined, clerk: () => clerk };

  const lease: LocalLease = { backend: 'local', platform: 'ios', slot: 2, deviceName: 'verify-ios-2', deviceId: 'UDID-2', claimNonce: 'claim-2', acquiredAt: '2026-10-03T00:00:00Z', installedBuild: null };
  workspace.writeLease(lease);
  const { run } = workspace.newRun();
  const email = newTestEmail(run, 1);
  workspace.append({ id: newEntryId(), kind: 'identity', run, instance: 'with-email-codes', email });
  workspace.append({ id: newEntryId(), kind: 'user', run, instance: 'with-email-codes', userId: 'user_1', email });
  workspace.append({ id: newEntryId(), kind: 'identity', run: newRunId(), instance: 'with-session-tasks', email: newTestEmail(run, 2) });
  return { deps, workspace, released, deleted, run };
}

describe('down', () => {
  it('--dry-run reports the plan and changes nothing', async () => {
    const { deps, workspace, released, deleted, run } = setup();
    const ledgerBefore = readFileSync(workspace.ledgerFile, 'utf8');
    const result = await down(deps, { verb: 'down', stale: false, dryRun: true });
    assert.equal(result.dryRun, true);
    assert.deepEqual(result.released.map((l) => l.device), ['verify-ios-2']);
    assert.equal(result.deletedUsers, 2);
    assert.equal(result.deletedOrganizations, 2, 'dry run lists the organizations down would delete');
    assert.deepEqual(result.keptRuns, [run]);
    assert.deepEqual(released, []);
    assert.deepEqual(deleted, []);
    assert.ok(existsSync(workspace.leaseFile('ios')), 'lease file kept');
    assert.equal(readFileSync(workspace.ledgerFile, 'utf8'), ledgerBefore, 'ledger untouched');
  });

  it('releases the lease, deletes each identity once, tombstones, and keeps runs', async () => {
    const { deps, workspace, released, deleted, run } = setup();
    const result = await down(deps, { verb: 'down', stale: false, dryRun: false });
    assert.deepEqual(released, ['UDID-2']);
    assert.equal(deleted.length, 2);
    assert.equal(result.deletedUsers, 2);
    assert.equal(workspace.readLease('ios'), null);
    assert.deepEqual(workspace.unclosedEntries(), []);
    assert.ok(existsSync(workspace.runDir(run)), 'evidence survives');
    const again = await down(deps, { verb: 'down', stale: false, dryRun: false });
    assert.equal(again.deletedUsers, 0);
    assert.deepEqual(again.released, []);
  });
});
