import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import type { ClerkBackend } from '../src/core/clerk.ts';
import { down, leaseForRun, up, type Deps } from '../src/core/verbs.ts';
import { openWorkspace } from '../src/core/workspace.ts';
import { VerifyFailure, type BuildKey, type Command, type DeviceBackend, type HostAdapter, type HostEntry, type LocalLease, type RunContext, type ScratchPath } from '../src/core/types.ts';

function setup(buildMs: number, runtime?: HostAdapter['runtime']) {
  const dir = mkdtempSync(join(tmpdir(), 'verify-flow-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  writeFileSync(join(dir, 'app.swift'), 'app');
  const events: string[] = [];
  const progress: string[] = [];
  let leases = 0;
  const backend = {
    kind: 'local',
    platform: 'ios',
    supports: () => true,
    reapable: async () => [],
    check: async () => 'held',
    async acquire(request: { waitSeconds: number }): Promise<LocalLease> {
      events.push(`acquire wait=${request.waitSeconds}`);
      leases += 1;
      return { backend: 'local', platform: 'ios', slot: leases, deviceName: `verify-ios-${leases}`, deviceId: `UDID-${leases}`, claimNonce: `c${leases}`, acquiredAt: '', installedBuild: null };
    },
    install: async () => void events.push('install'),
    release: async () => void events.push('release'),
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
    ...(runtime === undefined ? {} : { runtime }),
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
    progress: (line: string) => void progress.push(line),
    clerk: () => ({ deleteByEmail: async () => ({ users: 0, organizations: 0 }) }) as Partial<ClerkBackend> as ClerkBackend,
  };
  return { deps, events, progress };
}

const runCommand: Extract<Command, { verb: 'run' }> = { verb: 'run', selection: { all: true }, skip: [], include: [], video: false, waitSeconds: 0 };

describe('lease flow', () => {
  it('builds before it claims a lane', async () => {
    const { deps, events } = setup(0);
    await up(deps, { verb: 'up', waitSeconds: 0 });
    assert.deepEqual(events, ['build', 'acquire wait=0', 'install']);
  });

  it('lets run join an up that is still building instead of failing DEVICE_BUSY', async () => {
    const { deps, events, progress } = setup(400);
    const building = up(deps, { verb: 'up', waitSeconds: 0 });
    await new Promise((resolve) => setTimeout(resolve, 50));
    progress.length = 0;
    const device = await leaseForRun(deps, 'ios', runCommand, async (outcome) => outcome.lease.backend === 'local' && outcome.lease.deviceName);
    await building;
    assert.equal(device, 'verify-ios-1');
    assert.equal(progress.filter((l) => l.startsWith('wait')).length, 1, 'one wait line while up holds the lock');
    assert.match(progress.find((l) => l.startsWith('wait')) ?? '', /is building ios-[0-9a-f]{12} or leasing the device/);
    assert.deepEqual(events, ['build', 'acquire wait=0', 'install'], 'run reused the lease up made');
  });

  it('holds the device lock for the run, so a second run reports DEVICE_BUSY', async () => {
    const { deps } = setup(0);
    await leaseForRun(deps, 'ios', runCommand, async () => {
      await assert.rejects(leaseForRun(deps, 'ios', runCommand, async () => undefined), (error: VerifyFailure) => {
        assert.equal(error.code, 'DEVICE_BUSY');
        assert.match(error.fix, /bin\/verify run --all --wait <seconds>/, 'the fix names run, the verb that takes --wait');
        return true;
      });
    });
    await leaseForRun(deps, 'ios', runCommand, async () => undefined);
  });

  it('passes run --wait to the lane claim', async () => {
    const { deps, events } = setup(0);
    await leaseForRun(deps, 'ios', { ...runCommand, waitSeconds: 300 }, async () => undefined);
    assert.ok(events.includes('acquire wait=300'));
  });

  it('serves the entry a host runtime returns and ledgers its processes once', async () => {
    const devClient: HostEntry = { kind: 'dev-client', launchArguments: ['-EXDevMenuIsOnboardingFinished', 'YES'], openLink: 'exp+app://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082', androidActivity: '.MainActivity' };
    const metro = { what: 'metro' as const, pid: 4242, startedAt: Date.parse('2026-10-03T00:00:00Z') };
    const { deps } = setup(0, async () => ({ entry: devClient, processes: [metro] }));
    await up(deps, { verb: 'up', waitSeconds: 0 });
    const entry = await leaseForRun(deps, 'ios', runCommand, async (outcome) => outcome.entry);
    assert.deepEqual(entry, devClient);
    const context = JSON.parse(readFileSync(join(deps.workspace.root, 'context.json'), 'utf8')) as RunContext;
    assert.deepEqual(context.targets[0]!.entry, devClient);
    const metros = deps.workspace.unclosedEntries().filter((e) => e.kind === 'process' && e.what === 'metro');
    assert.equal(metros.length, 1, 'a reused Metro is ledgered once');
  });

  it('keeps the binary entry for hosts without a runtime', async () => {
    const { deps } = setup(0);
    assert.deepEqual(await leaseForRun(deps, 'ios', runCommand, async (outcome) => outcome.entry), { kind: 'binary' });
  });

  it('makes down wait for a run that holds the device, with one wait line, instead of failing DEVICE_BUSY', async () => {
    const { deps, progress } = setup(0);
    let downFinished = false;
    let releaseRun: () => void = () => undefined;
    const running = leaseForRun(deps, 'ios', runCommand, () => new Promise<void>((resolve) => (releaseRun = resolve)));
    await new Promise((resolve) => setTimeout(resolve, 100));
    progress.length = 0;
    const downing = down(deps, { verb: 'down', stale: false, dryRun: false }).then((result) => {
      downFinished = true;
      return result;
    });
    await new Promise((resolve) => setTimeout(resolve, 600));
    assert.equal(downFinished, false, 'down is still waiting while the run holds the device');
    releaseRun();
    await running;
    const result = await downing;
    assert.equal(result.dryRun, false);
    assert.equal(progress.filter((l) => l.startsWith('wait')).length, 1);
    assert.match(progress.find((l) => l.startsWith('wait')) ?? '', /driving the device; down waits for it, with no time limit/);
  });
});
