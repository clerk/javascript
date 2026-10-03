import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import type { ClerkBackend } from '../src/core/clerk.ts';
import { leaseForRun, up, type Deps } from '../src/core/verbs.ts';
import { openWorkspace } from '../src/core/workspace.ts';
import type { BuildKey, Command, DeviceBackend, HostAdapter, LocalLease, ScratchPath } from '../src/core/types.ts';

function setup(buildMs: number) {
  const dir = mkdtempSync(join(tmpdir(), 'verify-flow-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  writeFileSync(join(dir, 'app.swift'), 'app');
  const events: string[] = [];
  let leases = 0;
  const backend = {
    kind: 'local',
    platform: 'ios',
    supports: () => true,
    reapable: async () => [],
    check: async () => 'held',
    async acquire(): Promise<LocalLease> {
      events.push('acquire');
      leases += 1;
      return { backend: 'local', platform: 'ios', slot: leases, deviceName: `verify-ios-${leases}`, deviceId: `UDID-${leases}`, claimNonce: `c${leases}`, acquiredAt: '', installedBuild: null };
    },
    install: async () => void events.push('install'),
    describe: (lease: LocalLease) => lease.deviceName,
  } as unknown as DeviceBackend;
  const host = {
    repo: 'clerk-ios',
    platforms: ['ios'],
    backends: [backend],
    appId: () => 'com.clerk.E2EHost',
    entry: () => ({ kind: 'binary' }),
    buildInputs: () => ['app.swift'],
    buildSources: () => ['local'],
    async build(platform: 'ios', source: 'local', key: BuildKey, into: ScratchPath) {
      events.push('build');
      await new Promise((resolve) => setTimeout(resolve, buildMs));
      mkdirSync(into, { recursive: true });
      writeFileSync(join(into, 'E2EHost.app'), '');
      return { platform, key, appId: 'com.clerk.E2EHost', path: join(into, 'E2EHost.app') as ScratchPath, source, sourceSha: null };
    },
  } as unknown as HostAdapter;
  const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') });
  const deps: Deps = {
    host,
    workspace,
    runner: async () => ({ code: 0, stdout: '', stderr: '' }),
    env: {},
    progress: () => undefined,
    clerk: () => ({}) as ClerkBackend,
  };
  return { deps, events };
}

const runCommand: Extract<Command, { verb: 'run' }> = { verb: 'run', selection: { all: true }, skip: [], video: false, waitSeconds: 0 };

describe('lease flow', () => {
  it('builds before it claims a lane', async () => {
    const { deps, events } = setup(0);
    await up(deps, { verb: 'up', waitSeconds: 0 });
    assert.deepEqual(events, ['build', 'acquire', 'install']);
  });

  it('lets run join an up that is still building instead of failing DEVICE_BUSY', async () => {
    const { deps, events } = setup(400);
    const building = up(deps, { verb: 'up', waitSeconds: 0 });
    await new Promise((resolve) => setTimeout(resolve, 50));
    const device = await leaseForRun(deps, 'ios', runCommand, async (outcome) => outcome.lease.backend === 'local' && outcome.lease.deviceName);
    await building;
    assert.equal(device, 'verify-ios-1');
    assert.deepEqual(events, ['build', 'acquire', 'install'], 'run reused the lease up made');
  });

  it('holds the device lock for the run, so a second run reports DEVICE_BUSY', async () => {
    const { deps } = setup(0);
    await leaseForRun(deps, 'ios', runCommand, async () => {
      await assert.rejects(leaseForRun(deps, 'ios', runCommand, async () => undefined), { code: 'DEVICE_BUSY' });
    });
    await leaseForRun(deps, 'ios', runCommand, async () => undefined);
  });
});
