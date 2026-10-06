import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { heldInstances } from '../testing/fake-instances.ts';
import { describe, it } from 'node:test';
import { openProcesses } from '../src/core/ledgers.ts';
import { down, type Deps } from '../src/core/verbs.ts';
import { newEntryId, openWorkspace } from '../src/core/workspace.ts';
import type { DeviceBackend, HostAdapter, LocalLease, Platform } from '../src/core/types.ts';

function setup() {
  const skillDir = mkdtempSync(join(tmpdir(), 'verify-down-'));
  const workspace = openWorkspace({ skillDir, worktree: skillDir, home: join(skillDir, 'home') });
  const released: string[] = [];
  const finished: string[] = [];
  const backend = {
    kind: 'local',
    platform: 'ios',
    availability: () => ({ usable: true, why: 'test' }),
    release: async (lease: LocalLease) => void released.push(lease.deviceId),
    reapable: async () => [],
    describe: (lease: LocalLease) => lease.deviceName,
  } as unknown as DeviceBackend;
  const host = { repo: 'clerk-ios', platforms: ['ios'], backends: [backend] } as unknown as HostAdapter;
  const instances = heldInstances({ finish: async (ledger) => (finished.push(ledger.worktree), []) });
  const deps: Deps = { host, workspace, runner: async () => assert.fail('down runs no commands'), env: {}, progress: () => undefined, instances };

  const lease: LocalLease = { backend: 'local', platform: 'ios', slot: 2, deviceName: 'verify-ios-2', deviceId: 'UDID-2', claimNonce: 'claim-2', acquiredAt: '2026-10-03T00:00:00Z', installedBuild: null };
  workspace.writeLease(lease);
  workspace.append({ id: newEntryId(), kind: 'process', what: 'watch', pid: 2147483646, startedAt: '2026-10-03T00:00:00Z' });
  const { run } = workspace.newRun();
  return { deps, workspace, released, finished, run };
}

describe('down', () => {
  it('--dry-run reports the plan and changes nothing', async () => {
    const { deps, workspace, released, finished, run } = setup();
    const ledgerBefore = readFileSync(workspace.ledgerFile, 'utf8');
    const result = await down(deps, { verb: 'down', stale: false, dryRun: true });
    assert.ok(result.dryRun);
    assert.equal('released' in result, false, 'a dry run reports nothing in the past tense');
    assert.deepEqual(result.wouldRelease.map((l) => l.device), ['verify-ios-2']);
    assert.deepEqual(result.keptRuns, [run]);
    assert.deepEqual(released, []);
    assert.deepEqual(finished, []);
    assert.ok(existsSync(workspace.leaseFile('ios')), 'lease file kept');
    assert.equal(readFileSync(workspace.ledgerFile, 'utf8'), ledgerBefore, 'ledger untouched');
  });

  it('releases the lease, finishes the instances of this worktree, tombstones, and keeps runs', async () => {
    const { deps, workspace, released, finished, run } = setup();
    const result = await down(deps, { verb: 'down', stale: false, dryRun: false });
    assert.ok(!result.dryRun);
    assert.deepEqual(released, ['UDID-2']);
    assert.deepEqual(finished, [workspace.worktree]);
    assert.deepEqual(result.stoppedProcesses, ['watch 2147483646 had already exited']);
    assert.equal(workspace.readLease('ios'), null);
    assert.deepEqual(workspace.unclosedEntries(), []);
    assert.ok(existsSync(workspace.runDir(run)), 'evidence survives');
    const again = await down(deps, { verb: 'down', stale: false, dryRun: false });
    assert.ok(!again.dryRun);
    assert.deepEqual(again.released, []);
  });
});

describe('down --stale', () => {
  it('asks a backend this machine can no longer use, because a claim made before that still has to be finished', async () => {
    const { deps } = setup();
    const orphan: LocalLease = { backend: 'local', platform: 'ios', slot: 1, deviceName: 'verify-ios-1', deviceId: 'UDID-1', claimNonce: 'claim-1', acquiredAt: '', installedBuild: null };
    const unusable = { ...deps.host.backends[0]!, availability: () => ({ usable: false, why: 'the SDK was removed' }), reapable: async () => [orphan] } as DeviceBackend;
    const result = await down({ ...deps, host: { ...deps.host, backends: [unusable] } }, { verb: 'down', stale: true, dryRun: true });
    assert.ok(result.dryRun);
    assert.deepEqual(result.wouldRelease.map((l) => l.device), ['verify-ios-2', 'verify-ios-1']);
  });
});

describe('down --platform on a host with two platforms', () => {
  function twoPlatforms(leased: readonly Platform[]) {
    const skillDir = mkdtempSync(join(tmpdir(), 'verify-down-two-'));
    const workspace = openWorkspace({ skillDir, worktree: skillDir, home: join(skillDir, 'home') });
    const backends = (['ios', 'android'] as const).map(
      (platform) => ({ kind: 'local', platform, availability: () => ({ usable: true, why: 'test' }), release: async () => undefined, reapable: async () => [], describe: (lease: LocalLease) => lease.deviceName }) as unknown as DeviceBackend,
    );
    const host = { repo: 'clerk-expo', platforms: ['ios', 'android'], backends } as unknown as HostAdapter;
    const keptApplications: boolean[] = [];
    const instances = heldInstances({ finish: async (_ledger, options) => (keptApplications.push(options.keepApplications), []) });
    const deps: Deps = { host, workspace, runner: async () => assert.fail('down runs no commands'), env: {}, progress: () => undefined, instances };
    for (const platform of leased) {
      workspace.writeLease({ backend: 'local', platform, slot: 1, deviceName: `verify-${platform}-1`, deviceId: `${platform}-device`, claimNonce: `claim-${platform}`, acquiredAt: '2026-10-03T00:00:00Z', installedBuild: null });
    }
    workspace.append({ id: newEntryId(), kind: 'application', name: 'verify-throwaway-two', workspace: 'a workspace' });
    const children: ChildProcess[] = [];
    const start = (): { readonly pid: number; readonly startedAt: string } => {
      const child = spawn('sleep', ['30'], { stdio: 'ignore' });
      children.push(child);
      return { pid: child.pid!, startedAt: new Date().toISOString() };
    };
    const ledgered = (what: 'metro' | 'watch', platform?: Platform): string => {
      const { pid, startedAt } = start();
      workspace.append({ id: newEntryId(), kind: 'process', what, pid, startedAt, ...(platform === undefined ? {} : { platform }) });
      return `${what} ${pid}`;
    };
    const watch = ledgered('watch');
    const iosMetro = ledgered('metro', 'ios');
    const androidMetro = ledgered('metro', 'android');
    const daemon = start();
    mkdirSync(workspace.agentDeviceDir, { recursive: true });
    writeFileSync(join(workspace.agentDeviceDir, 'daemon.json'), JSON.stringify({ pid: daemon.pid, processStartTime: daemon.startedAt }));
    const exited = async (line: string, withinMs: number): Promise<boolean> => {
      const child = children.find((c) => c.pid === Number(line.split(' ')[1]))!;
      for (let waited = 0; waited < withinMs && child.exitCode === null && child.signalCode === null; waited += 20) await new Promise((resolve) => setTimeout(resolve, 20));
      return child.exitCode !== null || child.signalCode !== null;
    };
    const stopped = (line: string) => exited(line, 2000);
    const stillRuns = async (...lines: string[]) => (await Promise.all(lines.map((line) => exited(line, 200)))).every((gone) => !gone);
    const stop = (platform: Platform, dryRun: boolean) => down(deps, { verb: 'down', platform, stale: false, dryRun });
    return { workspace, keptApplications, watch, iosMetro, androidMetro, daemon: `agent-device ${daemon.pid}`, stopped, stillRuns, stop, cleanup: () => children.forEach((child) => child.kill()) };
  }

  it('stops only the processes of the platform asked for while the other platform stays leased, and a dry run lists the same', async () => {
    const w = twoPlatforms(['ios', 'android']);
    try {
      const planned = await w.stop('ios', true);
      assert.ok(planned.dryRun);
      assert.deepEqual(planned.wouldStop, [w.iosMetro]);
      assert.deepEqual(planned.wouldDelete, [], 'the android lease still uses the application');
      const result = await w.stop('ios', false);
      assert.ok(!result.dryRun);
      assert.deepEqual(result.stoppedProcesses, planned.wouldStop);
      assert.equal(await w.stopped(w.iosMetro), true);
      assert.equal(await w.stillRuns(w.watch, w.androidMetro, w.daemon), true, 'the watch build, the other Metro, and the daemon keep running');
      assert.deepEqual(openProcesses(w.workspace).map((entry) => `${entry.what} ${entry.pid}`), [w.watch, w.androidMetro, w.daemon]);
      assert.deepEqual(w.keptApplications, [true]);
      assert.notEqual(w.workspace.readLease('android'), null);
    } finally {
      w.cleanup();
    }
  });

  it('stops what every lease shares once no other platform is leased, and leaves a process of a platform it was not asked about', async () => {
    const w = twoPlatforms(['android']);
    try {
      const planned = await w.stop('android', true);
      assert.ok(planned.dryRun);
      assert.deepEqual(planned.wouldStop, [w.watch, w.androidMetro, w.daemon]);
      assert.deepEqual(planned.wouldDelete, [{ kind: 'application', name: 'verify-throwaway-two' }]);
      const result = await w.stop('android', false);
      assert.ok(!result.dryRun);
      assert.deepEqual(result.stoppedProcesses, planned.wouldStop);
      assert.deepEqual([await w.stopped(w.watch), await w.stopped(w.androidMetro), await w.stopped(w.daemon)], [true, true, true]);
      assert.equal(await w.stillRuns(w.iosMetro), true);
      assert.deepEqual(openProcesses(w.workspace).map((entry) => `${entry.what} ${entry.pid}`), [w.iosMetro]);
      assert.deepEqual(w.keptApplications, [false]);
    } finally {
      w.cleanup();
    }
  });
});
