import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HELD, heldInstances } from '../testing/fake-instances.ts';
import { describe, it } from 'node:test';
import { doctor, down, leaseForRun, up, type Deps } from '../src/core/verbs.ts';
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
    availability: () => ({ usable: true, why: 'test' }),
    reapable: async () => [],
    check: async () => 'held',
    async acquire(request: { waitSeconds: number }): Promise<LocalLease> {
      events.push(`acquire wait=${request.waitSeconds}`);
      leases += 1;
      return { backend: 'local', platform: 'ios', slot: leases, deviceName: `verify-ios-${leases}`, deviceId: `UDID-${leases}`, claimNonce: `c${leases}`, acquiredAt: '', installedBuild: null };
    },
    install: async (lease: LocalLease) => (events.push('install'), lease),
    release: async () => void events.push('release'),
    describe: (lease: LocalLease) => lease.deviceName,
    doctorChecks: async () => ({ toolchain: [], device: [] }),
  } as unknown as DeviceBackend;
  const host = {
    repo: 'clerk-ios',
    platforms: ['ios'],
    backends: [backend],
    features: [],
    appId: () => 'com.clerk.E2EHost',
    buildInputs: () => ['app.swift'],
    ...(runtime === undefined ? { entry: () => ({ kind: 'binary' }) } : { runtime }),
    async build(platform: 'ios', key: BuildKey, into: ScratchPath) {
      events.push('build');
      await new Promise((resolve) => setTimeout(resolve, buildMs));
      mkdirSync(into, { recursive: true });
      writeFileSync(join(into, 'E2EHost.app'), '');
      return { platform, key, appId: 'com.clerk.E2EHost', path: join(into, 'E2EHost.app') as ScratchPath, source: 'local' };
    },
  } as unknown as HostAdapter;
  const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') });
  const deps: Deps = {
    host,
    workspace,
    runner: async () => ({ code: 0, stdout: '', stderr: '' }),
    env: {},
    progress: (line: string) => void progress.push(line),
    instances: heldInstances(),
  };
  return { deps, events, progress };
}

const runCommand: Extract<Command, { verb: 'run' }> = { verb: 'run', selection: { all: true }, skip: [], include: [], video: false, waitSeconds: 0 };

async function until(holds: () => boolean, what: string): Promise<void> {
  const deadline = Date.now() + 15_000;
  while (!holds()) {
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

describe('lease flow', () => {
  it('builds before it claims a lane', async () => {
    const { deps, events } = setup(0);
    await up(deps, { verb: 'up', waitSeconds: 0 });
    assert.deepEqual(events, ['build', 'acquire wait=0', 'install']);
  });

  it('doctor creates no directory and no file, in the worktree or in the machine-wide state', async () => {
    const { deps } = setup(0);
    const report = await doctor(deps, { verb: 'doctor', live: false });
    assert.equal(report.checks.find((c) => c.id === 'build')!.ok, false);
    assert.equal(existsSync(deps.workspace.root), false);
    assert.equal(existsSync(deps.workspace.home), false);
  });

  it('doctor names the platform in the build fix when the host has more than one', async () => {
    const { deps } = setup(0);
    const fix = async (host: { readonly platforms?: HostAdapter['platforms'] }, command: Partial<Extract<Command, { verb: 'doctor' }>>) => (await doctor({ ...deps, host: { ...deps.host, ...host } }, { verb: 'doctor', live: false, ...command })).checks.find((c) => c.id === 'build')!.fix;
    assert.equal(await fix({}, {}), '{cli} up');
    assert.equal(await fix({ platforms: ['ios', 'android'] }, {}), '{cli} up --platform ios');
  });

  it('doctor only warns about a gh that cannot attach, and says what attach then cannot do', async () => {
    const { deps } = setup(0);
    const gh = (await doctor(deps, { verb: 'doctor', live: false })).checks.find((c) => c.id === 'gh-attach')!;
    assert.deepEqual(gh, {
      id: 'gh-attach',
      ok: true,
      state: 'warning',
      detail: "this gh has no `gh pr comment --attach`, so `{cli} attach` cannot post a run's video and screenshots from this machine",
      fix: 'install a gh build whose `gh pr comment` has --attach',
    });
  });

  it('leases no device when no Platform API credential works', async () => {
    const { deps, events } = setup(0);
    const noCredential: Deps['instances'] = { ...deps.instances, access: async () => Promise.reject(new VerifyFailure('KEYS_MISSING', 'no Clerk Platform API credential works here', 'set one')) };
    await assert.rejects(up({ ...deps, instances: noCredential }, { verb: 'up', waitSeconds: 0 }), (error: VerifyFailure) => error.code === 'KEYS_MISSING');
    assert.deepEqual(events, [], 'nothing was built or leased');
  });

  it('keeps the lease and says so when the instances fail after the device was leased', async () => {
    const { deps, events } = setup(0);
    const failing = { ...deps.instances, ensure: async () => Promise.reject(new VerifyFailure('INSTANCE_MISCONFIGURED', 'the instance does not match its file', 'correct the file')) };
    await assert.rejects(up({ ...deps, instances: failing }, { verb: 'up', waitSeconds: 0 }), (error: VerifyFailure) => error.code === 'INSTANCE_MISCONFIGURED' && error.fix === 'correct the file; the device stays leased until `{cli} down`');
    assert.deepEqual(events, ['build', 'acquire wait=0', 'install'], 'the lease finished and reached the lease file');
    assert.notEqual(deps.workspace.readLease('ios'), null);
  });

  it('reports the instances it brought up', async () => {
    const { deps } = setup(0);
    assert.deepEqual((await up(deps, { verb: 'up', waitSeconds: 0 })).instances, [HELD]);
  });

  it('lets run join an up that is still building instead of failing DEVICE_BUSY', async () => {
    const { deps, events, progress } = setup(400);
    const building = up(deps, { verb: 'up', waitSeconds: 0 });
    await until(() => events.includes('build'), 'up to start building');
    progress.length = 0;
    const device = await leaseForRun(deps, 'ios', runCommand, { willChange: false }, async (outcome) => outcome.lease.backend === 'local' && outcome.lease.deviceName);
    await building;
    assert.equal(device, 'verify-ios-1');
    assert.equal(progress.filter((l) => l.startsWith('wait')).length, 1, 'one wait line while up holds the lock');
    assert.match(progress.find((l) => l.startsWith('wait')) ?? '', /is building ios-[0-9a-f]{12} or leasing the device/);
    assert.deepEqual(events, ['build', 'acquire wait=0', 'install'], 'run reused the lease up made');
  });

  it('holds the device lock for the run, so a second run reports DEVICE_BUSY', async () => {
    const { deps } = setup(0);
    await leaseForRun(deps, 'ios', runCommand, { willChange: false }, async () => {
      await assert.rejects(leaseForRun(deps, 'ios', runCommand, { willChange: false }, async () => undefined), (error: VerifyFailure) => {
        assert.equal(error.code, 'DEVICE_BUSY');
        assert.match(error.fix, /\{cli\} run --all --wait <seconds>/, 'the fix names run, the verb that takes --wait');
        return true;
      });
    });
    await leaseForRun(deps, 'ios', runCommand, { willChange: false }, async () => undefined);
  });

  it('passes run --wait to the lane claim', async () => {
    const { deps, events } = setup(0);
    await leaseForRun(deps, 'ios', { ...runCommand, waitSeconds: 300 }, { willChange: false }, async () => undefined);
    assert.ok(events.includes('acquire wait=300'));
  });

  it('serves the entry a host runtime returns and ledgers its processes once', async () => {
    const devClient: HostEntry = { kind: 'dev-client', launchArguments: ['-EXDevMenuIsOnboardingFinished', 'YES'], openLink: 'exp+app://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082', androidActivity: '.MainActivity' };
    const metro = { what: 'metro' as const, pid: 4242, startedAt: Date.parse('2026-10-03T00:00:00Z') };
    const { deps, progress } = setup(0, async (_lease, say) => (say('metro   starting'), { entry: devClient, processes: [metro] }));
    await up(deps, { verb: 'up', waitSeconds: 0 });
    assert.ok(progress.includes('metro   starting'), 'what a runtime reports goes through the CLI\'s own progress output');
    const entry = await leaseForRun(deps, 'ios', runCommand, { willChange: false }, async (outcome) => outcome.entry);
    assert.deepEqual(entry, devClient);
    const context = JSON.parse(readFileSync(join(deps.workspace.root, 'context.json'), 'utf8')) as RunContext;
    assert.deepEqual(context.targets[0]!.entry, devClient);
    const metros = deps.workspace.unclosedEntries().filter((e) => e.kind === 'process' && e.what === 'metro');
    assert.equal(metros.length, 1, 'a reused Metro is ledgered once');
  });

  it('keeps the binary entry for hosts without a runtime', async () => {
    const { deps } = setup(0);
    assert.deepEqual(await leaseForRun(deps, 'ios', runCommand, { willChange: false }, async (outcome) => outcome.entry), { kind: 'binary' });
  });

  it('makes down wait for a run that holds the device, with one wait line, instead of failing DEVICE_BUSY', async () => {
    const { deps, progress } = setup(0);
    let downFinished = false;
    let releaseRun: () => void = () => undefined;
    let driving = false;
    const running = leaseForRun(deps, 'ios', runCommand, { willChange: false }, () => new Promise<void>((resolve) => ((driving = true), (releaseRun = resolve))));
    await until(() => driving, 'the run to hold the device');
    progress.length = 0;
    const downing = down(deps, { verb: 'down', stale: false, dryRun: false }).then((result) => {
      downFinished = true;
      return result;
    });
    await until(() => progress.some((line) => line.startsWith('wait')), 'down to say it is waiting');
    assert.equal(downFinished, false, 'down is still waiting while the run holds the device');
    releaseRun();
    await running;
    const result = await downing;
    assert.equal(result.dryRun, false);
    assert.equal(progress.filter((l) => l.startsWith('wait')).length, 1);
    assert.match(progress.find((l) => l.startsWith('wait')) ?? '', /driving the device; down waits for it, with no time limit/);
  });
});
