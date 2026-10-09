import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { app } from '../specs/app.ts';
import { selectBackend } from '../src/core/devices.ts';
import { answer } from '../src/core/remote/recipe.ts';
import { VerifyFailure, type LocalLease, type RemoteLease } from '../src/core/types.ts';
import {
  artifact,
  buildFixture,
  buildInputs,
  nativeInputs,
  nativeProjectIsCurrent,
  type BuildProduct,
  type FixtureSite,
} from '../src/fixture.ts';
import { host, productFor } from '../src/host.ts';
import { LANE_FAILED, LANE_READY, LOG_FILTER, RECORD_SIZE } from '../src/platform/android/emulator.ts';
import { localAndroidBackend } from '../src/platform/android/local.ts';
import { systemImage } from '../src/platform/android/sdk.ts';
import { localIosBackend } from '../src/platform/ios/local.ts';
import sessionDevice from '../src/platform/session-device.ts';

const WORKTREE = join(import.meta.dirname, '..', '..', '..');
const workflow = readFileSync(join(WORKTREE, '.github', 'workflows', 'verify-remote.yml'), 'utf8');

type Line = { readonly command: string; readonly args: readonly string[] };
const line = (command: Line) => `${command.command} ${command.args.join(' ')}`;

describe('where the clerk-expo host runs a device', () => {
  const empty = mkdtempSync(join(tmpdir(), 'verify-expo-remote-'));
  const linux = {
    ...host,
    backends: [
      localIosBackend({ os: 'linux' }),
      localAndroidBackend({ machine: { os: 'linux', arch: 'x64', home: empty, env: {}, kvm: join(empty, 'kvm') } }),
      ...host.backends.filter(backend => backend.kind === 'remote'),
    ],
  };

  it('tries this machine first on each platform and falls back to a runner', () => {
    assert.deepEqual(
      host.backends.map(b => `${b.platform} ${b.kind}`),
      ['ios local', 'android local', 'ios remote', 'android remote'],
    );
  });

  it('picks a runner on a machine with no simulator and no emulator, and says why and which label', () => {
    const ios = selectBackend(linux, 'ios', undefined, null);
    assert.equal(ios.backend.kind, 'remote');
    assert.match(
      ios.why,
      /^local is out: the iOS simulator needs macOS and this machine runs linux.*; the device runs on a CI runner \(macos-26 unless --runner names another\), started through verify-remote\.yml on clerk\/javascript$/,
    );
    const android = selectBackend(linux, 'android', undefined, null);
    assert.equal(android.backend.kind, 'remote');
    assert.match(
      android.why,
      /^local is out: there is no .*kvm.*; the device runs on a CI runner \(ubuntu-24\.04 unless --runner names another\)/,
    );
  });
});

describe('the two build products', () => {
  it('builds a dev client for a device on this machine and a standalone app for a runner', () => {
    assert.equal(productFor('local', {}), 'dev-client');
    assert.equal(productFor('remote', {}), 'standalone');
  });

  it('builds a standalone app for a device on this machine when VERIFY_LOCAL_BUILD asks for one', () => {
    assert.equal(productFor('local', { VERIFY_LOCAL_BUILD: 'standalone' }), 'standalone');
    assert.equal(productFor('local', { VERIFY_LOCAL_BUILD: 'dev-client' }), 'dev-client');
    assert.equal(productFor('local', { VERIFY_LOCAL_BUILD: '' }), 'dev-client');
    assert.equal(productFor('remote', { VERIFY_LOCAL_BUILD: 'dev-client' }), 'standalone');
    assert.throws(
      () => productFor('local', { VERIFY_LOCAL_BUILD: 'release' }),
      (error: VerifyFailure) => error.code === 'USAGE' && error.message.startsWith('VERIFY_LOCAL_BUILD=release'),
    );
  });

  it('keys a dev client on native inputs only, so a JS edit reaches it through Metro with no rebuild', () => {
    assert.deepEqual(buildInputs('ios', 'dev-client'), nativeInputs('ios'));
    assert.deepEqual(buildInputs('android', 'dev-client'), nativeInputs('android'));
  });

  it('keys a standalone app on the JS it embeds as well, so a pushed JS edit makes the session rebuild', () => {
    const inputs = buildInputs('ios', 'standalone');
    for (const input of [
      ...nativeInputs('ios'),
      'pnpm-lock.yaml',
      'packages/expo',
      'packages/shared',
      'packages/react',
      'packages/clerk-js',
      'integration/templates/expo-native',
    ])
      assert.ok(inputs.includes(input), input);
    for (const input of inputs) assert.ok(existsSync(join(WORKTREE, input)), input);
  });

  it('launches a standalone app as a plain binary, with no Metro and no watch build beside it', async () => {
    const lease = { backend: 'remote', platform: 'android' } as RemoteLease;
    const runtime = await host.runtime!(lease, () => undefined);
    assert.deepEqual(runtime, { devServer: null, processes: [] });
    assert.deepEqual(app.entry(lease.platform, runtime.devServer), { kind: 'binary' });
  });

  it('gives a local device the same plain binary and the same build key when VERIFY_LOCAL_BUILD asks for the standalone app', async () => {
    const before = process.env.VERIFY_LOCAL_BUILD;
    process.env.VERIFY_LOCAL_BUILD = 'standalone';
    try {
      const lease = { backend: 'local', platform: 'android', slot: 1, deviceId: 'emulator-5560' } as LocalLease;
      const runtime = await host.runtime!(lease, () => undefined);
      assert.deepEqual(runtime, { devServer: null, processes: [] });
      assert.deepEqual(app.entry(lease.platform, runtime.devServer), { kind: 'binary' });
      assert.deepEqual(host.buildInputs('ios', 'local'), buildInputs('ios', 'standalone'));
    } finally {
      if (before === undefined) delete process.env.VERIFY_LOCAL_BUILD;
      else process.env.VERIFY_LOCAL_BUILD = before;
    }
  });

  it('finds each product where the fixture build leaves it', () => {
    assert.match(
      artifact('ios', 'dev-client'),
      /ios\/build\/Build\/Products\/Debug-iphonesimulator\/ClerkExpoNativeBuildFixture\.app$/,
    );
    assert.match(artifact('ios', 'standalone'), /Release-iphonesimulator\/ClerkExpoNativeBuildFixture\.app$/);
    assert.match(artifact('android', 'dev-client'), /android\/app\/build\/outputs\/apk\/debug\/app-debug\.apk$/);
    assert.match(artifact('android', 'standalone'), /apk\/release\/app-release\.apk$/);
  });
});

describe('the fixture build', () => {
  type Call = { readonly what: string; readonly args: readonly string[]; readonly markerSeen: boolean };

  function site(failAt?: string): { site: FixtureSite; calls: Call[]; fixture: string } {
    const worktree = mkdtempSync(join(tmpdir(), 'verify-expo-build-'));
    const fixture = join(worktree, 'fixture');
    mkdirSync(join(worktree, 'node_modules'));
    mkdirSync(fixture);
    writeFileSync(join(fixture, 'package.sdk-57.json'), '{}');
    const calls: Call[] = [];
    const marker = join(fixture, 'ios', '.verify-native-project');
    const must: FixtureSite['must'] = async (what, _command, args) => {
      calls.push({ what, args, markerSeen: existsSync(marker) });
      if (what === failAt) throw new VerifyFailure('BUILD_FAILED', `${what} was interrupted`, 'retry');
      if (what === 'pnpm add the workspace packages') mkdirSync(join(fixture, 'node_modules'), { recursive: true });
      if (what === 'expo prebuild') {
        const generated = join(fixture, args.at(-1)!);
        rmSync(generated, { recursive: true, force: true });
        mkdirSync(generated);
      }
    };
    return { site: { worktree, fixture, must }, calls, fixture };
  }

  const build = (product: BuildProduct, nativeKey: string, at: FixtureSite, buildPackages = false) =>
    buildFixture({ platform: 'ios', product, nativeKey, buildPackages, progress: () => undefined }, at);
  const steps = (calls: readonly Call[]) => calls.map(call => call.what);
  const GENERATE = ['pnpm add the workspace packages', 'expo install', 'expo prebuild', 'xcodebuild'];

  it('generates the native project on a first build and returns where the app is', async () => {
    const first = site();
    const built = await build('standalone', 'key-1', first.site);
    assert.deepEqual(steps(first.calls), GENERATE);
    assert.equal(built, artifact('ios', 'standalone', first.fixture));
    assert.equal(nativeProjectIsCurrent(first.site, 'ios', 'standalone key-1'), true);
  });

  it('keeps the native project for a second build from the same native inputs, so a JS edit costs no prebuild', async () => {
    const kept = site();
    await build('standalone', 'key-1', kept.site);
    kept.calls.length = 0;
    await build('standalone', 'key-1', kept.site, true);
    assert.deepEqual(steps(kept.calls), ['turbo build', 'xcodebuild']);
  });

  it('generates it again when the native inputs changed, and when the other product is asked for', async () => {
    const changed = site();
    await build('standalone', 'key-1', changed.site);
    changed.calls.length = 0;
    await build('standalone', 'key-2', changed.site);
    assert.deepEqual(steps(changed.calls), GENERATE);
    changed.calls.length = 0;
    await build('dev-client', 'key-2', changed.site);
    assert.deepEqual(steps(changed.calls), GENERATE);
  });

  it('forgets the old project before it touches the install, so an interrupted build is never taken for a finished one', async () => {
    const interrupted = site();
    await build('standalone', 'key-1', interrupted.site);
    const failing: FixtureSite = {
      ...interrupted.site,
      must: async (what, command, args, cwd) => {
        if (what === 'pnpm add the workspace packages') {
          assert.equal(existsSync(join(interrupted.fixture, 'ios', '.verify-native-project')), false);
          throw new VerifyFailure('BUILD_FAILED', 'interrupted', 'retry');
        }
        await interrupted.site.must(what, command, args, cwd);
      },
    };
    await assert.rejects(build('standalone', 'key-2', failing), /interrupted/);
    assert.equal(nativeProjectIsCurrent(interrupted.site, 'ios', 'standalone key-1'), false);
    assert.equal(nativeProjectIsCurrent(interrupted.site, 'ios', 'standalone key-2'), false);
    interrupted.calls.length = 0;
    await build('standalone', 'key-1', interrupted.site);
    assert.deepEqual(steps(interrupted.calls), GENERATE);
  });

  it('does not keep a native project whose installed packages are gone', async () => {
    const pruned = site();
    await build('standalone', 'key-1', pruned.site);
    rmSync(join(pruned.fixture, 'node_modules'), { recursive: true });
    assert.equal(nativeProjectIsCurrent(pruned.site, 'ios', 'standalone key-1'), false);
  });

  it('installs the dev client and builds Debug for a local lease, and neither for a runner', async () => {
    const local = site();
    await build('dev-client', 'key-1', local.site);
    const remote = site();
    await build('standalone', 'key-1', remote.site);
    const installed = (calls: readonly Call[]) => calls.find(call => call.what === 'expo install')!.args;
    const configuration = (calls: readonly Call[]) => {
      const args = calls.find(call => call.what === 'xcodebuild')!.args;
      return args[args.indexOf('-configuration') + 1];
    };
    assert.ok(installed(local.calls).includes('expo-dev-client'));
    assert.equal(installed(remote.calls).includes('expo-dev-client'), false);
    assert.equal(configuration(local.calls), 'Debug');
    assert.equal(configuration(remote.calls), 'Release');
  });

  it('bundles the JS again on every Android build for a runner, because Gradle does not see a change in a linked package', async () => {
    const java = mkdtempSync(join(tmpdir(), 'verify-expo-jdk-'));
    writeFileSync(join(java, 'release'), 'JAVA_VERSION="21.0.4"\n');
    const previous = process.env.JAVA_HOME;
    process.env.JAVA_HOME = java;
    try {
      const gradle = async (product: BuildProduct) => {
        const android = site();
        await buildFixture(
          { platform: 'android', product, nativeKey: 'key-1', buildPackages: false, progress: () => undefined },
          android.site,
        );
        return android.calls.find(call => call.what.startsWith('gradlew'))!.args;
      };
      assert.deepEqual(await gradle('standalone'), [
        ':app:createBundleReleaseJsAndAssets',
        '--rerun',
        'assembleRelease',
        '-q',
      ]);
      assert.deepEqual(await gradle('dev-client'), ['assembleDebug', '-q']);
    } finally {
      if (previous === undefined) delete process.env.JAVA_HOME;
      else process.env.JAVA_HOME = previous;
    }
  });

  it('refuses to build before the monorepo is installed', async () => {
    const bare = site();
    rmSync(join(bare.site.worktree, 'node_modules'), { recursive: true });
    await assert.rejects(
      build('standalone', 'key-1', bare.site),
      (error: VerifyFailure) => error.code === 'NOT_READY' && error.fix.endsWith('pnpm install'),
    );
    assert.deepEqual(bare.calls, []);
  });
});

describe("a remote session's device recipe", () => {
  const simulator = sessionDevice({ id: 'UDID-1', platform: 'ios' });
  const emulator = sessionDevice({ id: 'emulator-5560', platform: 'android' });
  const build = (device: typeof simulator, work = '/work') => answer(device, { op: 'build', work }) as readonly Line[];

  it('builds the standalone app with the same module the local build uses, waits for the simulator, and installs it', () => {
    const steps = build(simulator);
    assert.match(line(steps[0]!), /node\S* \S*src\/fixture\.ts ios$/);
    assert.equal(line(steps[1]!), 'xcrun simctl bootstatus UDID-1 -b');
    assert.equal(line(steps[2]!), `xcrun simctl install UDID-1 ${artifact('ios', 'standalone')}`);
  });

  it('builds the standalone app, waits for the emulator, and installs the release APK', () => {
    const steps = build(emulator);
    assert.match(line(steps[0]!), /node\S* \S*src\/fixture\.ts android$/);
    assert.equal(steps[1]!.command, 'sh');
    assert.equal(line(steps[2]!), `adb -s emulator-5560 install -r -t ${artifact('android', 'standalone')}`);
  });

  it('records the simulator with simctl, and stops screenrecord on the emulator before it pulls the file', () => {
    const ios = answer(simulator, { op: 'record', file: '/work/recording.mp4' }) as { start: Line; stop: null };
    assert.equal(line(ios.start), 'xcrun simctl io UDID-1 recordVideo --codec=h264 --force /work/recording.mp4');
    assert.equal(ios.stop, null);
    const android = answer(emulator, { op: 'record', file: '/work/recording.mp4' }) as {
      start: Line;
      stop: readonly Line[];
      collect: readonly Line[];
    };
    assert.equal(
      line(android.start),
      `adb -s emulator-5560 shell screenrecord --size ${RECORD_SIZE} --time-limit 0 /data/local/tmp/verify-session.mp4`,
    );
    assert.match(
      line(android.stop[0]!),
      /^adb -s emulator-5560 shell pkill -INT screenrecord; .*while pidof screenrecord/,
    );
    assert.deepEqual(android.collect.map(line), [
      'adb -s emulator-5560 pull /data/local/tmp/verify-session.mp4 /work/recording.mp4',
      'adb -s emulator-5560 shell rm -f /data/local/tmp/verify-session.mp4',
    ]);
  });

  it('reads the same logcat tags as the local lane', () => {
    const logs = answer(emulator, {
      op: 'logs',
      since: new Date(1_791_014_000_123).toISOString(),
      predicate: 'Expo:V',
    }) as Line;
    assert.equal(
      line(logs),
      `adb -s emulator-5560 logcat -d -v threadtime -T 1791014000.123 ${[...LOG_FILTER.slice(0, -1), 'Expo:V', '*:S'].join(' ')}`,
    );
  });
});

describe('the session workflow serves both platforms', () => {
  const empty = mkdtempSync(join(tmpdir(), 'verify-expo-workflow-'));

  it('passes the platform of the request to the session job and loads this module for the device', () => {
    assert.ok(workflow.includes('PLATFORM: ${{ fromJSON(needs.plan.outputs.request).platform }}'));
    assert.ok(
      workflow.includes('VERIFY_SESSION_DEVICE_MODULE: integration/expo-native/src/platform/session-device.ts'),
    );
  });

  it('installs the image the lane AVD names and waits on the boot files this code writes', () => {
    const image = systemImage({ os: 'linux', arch: 'x64', home: empty, env: {}, kvm: join(empty, 'kvm') });
    assert.ok(workflow.includes(`IMAGE="${image}"`), image);
    for (const file of [LANE_READY, LANE_FAILED]) assert.ok(workflow.includes(`$VERIFY_SESSION_WORK/${file}`), file);
    assert.ok(workflow.includes('src/platform/android/session-lane.ts" boot "$VERIFY_SESSION_WORK"'));
  });

  it('creates the simulator on the runtime the workflow names and readies it with the script the package ships', () => {
    assert.match(workflow, /\n  IOS_RUNTIME: com\.apple\.CoreSimulator\.SimRuntime\.iOS-\d+-\d+\n/);
    assert.ok(workflow.includes('xcrun simctl create "$DEVICE 1" "$DEVICE" "$IOS_RUNTIME"'));
    assert.ok(workflow.includes('integration/expo-native/bin/boot-ios-simulators.sh wait'));
    assert.ok(existsSync(join(import.meta.dirname, '..', 'bin', 'boot-ios-simulators.sh')));
  });

  it('installs pnpm and the JDK the fixture build needs before the agent starts building', () => {
    const session = workflow.slice(workflow.indexOf('\n  session:\n'));
    const agent = session.indexOf('Start the session agent and tunnel');
    for (const needle of ['pnpm/action-setup@', 'actions/setup-java@', 'node-version: 24.15.0'])
      assert.ok(session.indexOf(needle) > 0 && session.indexOf(needle) < agent, needle);
  });
});
