import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { isRunning, run } from '../src/core/exec.ts';
import type { EvidencePath, LocalLease } from '../src/core/types.ts';
import { readClaim, takeSlot } from '../src/core/claims.ts';
import { LOG_FILTER, RECORD_SIZE, emulatorArgs, laneSettingsCommand, laneSettingsHold, laneSettingsReadCommand, logFilter, logcatSince } from '../src/platform/android/emulator.ts';
import { lanePort, localAndroidBackend, laneSerial, parseAdbDevices, startScreenrecord, terminateGroup } from '../src/platform/android/local.ts';
import { ensureLaneAvd, jdkCheck, localAvailability, resolveJavaHome, sdkRoot, systemImage, type Machine } from '../src/platform/android/sdk.ts';

function machineHomedInScratch(dir: string, overrides: Partial<Machine> = {}): Machine {
  return { os: 'darwin', arch: 'arm64', home: dir, env: {}, kvm: join(dir, 'kvm'), ...overrides };
}

const doctorOptions = { live: false, worktree: '/nowhere', progress: () => undefined };

function fakeJdk(root: string, version: string): string {
  const home = join(root, `jdk-${version}`);
  mkdirSync(home, { recursive: true });
  writeFileSync(join(home, 'release'), `IMPLEMENTOR="test"\nJAVA_VERSION="${version}"\n`);
  return home;
}

describe('android lanes', () => {
  it('puts slot 1 on emulator-5560 and slot 2 on emulator-5562', () => {
    assert.equal(lanePort(1), 5560);
    assert.equal(laneSerial(2), 'emulator-5562');
  });

  it('reads adb devices, skipping the header and blank lines', () => {
    const devices = parseAdbDevices('List of devices attached\nemulator-5560\tdevice\nemulator-5562\toffline\n\n');
    assert.deepEqual([...devices], [['emulator-5560', 'device'], ['emulator-5562', 'offline']]);
  });

  it('asks logcat for lines since the run started, in epoch seconds', () => {
    assert.equal(logcatSince(new Date(1_791_014_000_123)), '1791014000.123');
  });

  it('keeps the host, SDK, network, and React Native console tags and silences the rest', () => {
    assert.deepEqual(LOG_FILTER.slice(-1), ['*:S']);
    for (const tag of ['ClerkVerify:V', 'ClerkLog:V', 'OkHttp:V', 'ReactNativeJS:V']) assert.ok(LOG_FILTER.includes(tag), tag);
  });

  it('adds a host log predicate before the final silence spec', () => {
    assert.deepEqual(logFilter('Expo:V  ReactNative:W').slice(-3), ['Expo:V', 'ReactNative:W', '*:S']);
    assert.deepEqual(logFilter(), LOG_FILTER);
  });

  it('boots with no -prop, which the emulator refuses outside qemu.* and never shows in getprop, so the lane is marked after boot', () => {
    for (const os of ['darwin', 'linux'] as const) assert.equal(emulatorArgs(5560, os).includes('-prop'), false, os);
  });

  it('boots a headless lane with software graphics on Linux and leaves the Mac lane as it was', () => {
    assert.deepEqual(emulatorArgs(5560, 'darwin'), ['-avd', 'Clerk_Verify_Pixel', '-read-only', '-no-window', '-no-audio', '-no-boot-anim', '-port', '5560']);
    assert.deepEqual(emulatorArgs(5560, 'linux'), ['-avd', 'Clerk_Verify_Pixel', '-read-only', '-no-window', '-no-audio', '-no-boot-anim', '-gpu', 'swiftshader_indirect', '-port', '5560']);
  });

  it('turns off the window, transition, and animator animations on a lane, and reads the same settings back', () => {
    for (const scale of ['window_animation_scale', 'transition_animation_scale', 'animator_duration_scale']) {
      assert.ok(laneSettingsCommand().split(' && ').includes(`settings put global ${scale} 0`), scale);
      assert.ok(laneSettingsReadCommand().split(' && ').includes(`settings get global ${scale}`), scale);
    }
    assert.equal(laneSettingsCommand().split(' && ').length, laneSettingsReadCommand().split(' && ').length);
  });

  it('hides the system\'s "isn\'t responding" and "keeps stopping" dialogs on a lane, which cover the app and which agent-device will not tap through', () => {
    assert.ok(laneSettingsCommand().split(' && ').includes('settings put global hide_error_dialogs 1'));
    assert.ok(laneSettingsReadCommand().split(' && ').includes('settings get global hide_error_dialogs'));
  });

  it('counts a lane as set up only when every setting reads back as written', () => {
    const written = laneSettingsCommand().split(' && ').map((command) => command.split(' ').at(-1) as string);
    assert.equal(laneSettingsHold(written.join('\n')), true);
    assert.equal(laneSettingsHold(`${written.map((value) => `${value}.0`).join('\n')}\n`), true, 'the settings provider may print 0 as 0.0');
    assert.equal(laneSettingsHold(['1.0', ...written.slice(1)].join('\n')), false, 'one animation scale still on');
    assert.equal(laneSettingsHold([...written.slice(0, -1), '0'].join('\n')), false, 'error dialogs still shown');
    assert.equal(laneSettingsHold(written.slice(1).join('\n')), false, 'a setting that did not answer');
    assert.equal(laneSettingsHold(written.map(() => 'null').join('\n')), false, 'a device that never had them set');
    assert.equal(laneSettingsHold(''), false);
  });

  it('records at the panel\'s aspect ratio, because the codec refuses 1280x2856 and screenrecord then falls back to 720x1280', () => {
    const [width, height] = RECORD_SIZE.split('x').map(Number) as [number, number];
    assert.ok(Math.abs(width / height - 1280 / 2856) < 0.001, RECORD_SIZE);
  });

});

describe('android JDK', () => {
  const root = mkdtempSync(join(tmpdir(), 'verify-jdk-'));
  const jbr = fakeJdk(root, '21.0.8');
  const java17 = fakeJdk(root, '17.0.17');

  it('fails JAVA_HOME on Java 17 with a fix that names the Java 21 JBR', () => {
    const check = jdkCheck({ JAVA_HOME: java17 }, jbr);
    assert.equal(check.ok, false);
    assert.match(check.detail, /Java 17/);
    assert.equal(check.fix, `export JAVA_HOME="${jbr}"`);
  });

  it('builds with the JBR when JAVA_HOME is unset, and with JAVA_HOME when it is 21', () => {
    assert.deepEqual(resolveJavaHome({}, jbr), { ok: true, home: jbr, detail: 'Java 21 from the Android Studio JBR' });
    const java21 = fakeJdk(root, '21.0.2');
    const chosen = resolveJavaHome({ JAVA_HOME: java21 }, join(root, 'missing'));
    assert.equal(chosen.ok && chosen.home, java21);
  });

  it('fails with an install fix when there is no JBR and no JAVA_HOME', () => {
    const check = jdkCheck({}, join(root, 'missing'));
    assert.equal(check.ok, false);
    assert.match(check.fix ?? '', /install Android Studio/);
  });
});

describe('android screenrecord', () => {
  it('stops on the device, waits for pidof to empty, and only then pulls, because a recording stopped from the host has no moov atom', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-adb-'));
    const log = join(dir, 'adb.log');
    const adb = join(dir, 'adb');
    writeFileSync(
      adb,
      [
        '#!/bin/bash',
        `echo "$*" >> ${log}`,
        `state=${dir}/recording`,
        'case "$*" in',
        '  *"shell screenrecord"*) touch "$state"; while [ -f "$state" ]; do sleep 0.1; done ;;',
        '  *"shell pidof screenrecord"*) [ -f "$state" ] && echo 4242 ;;',
        '  *"shell pkill -INT screenrecord"*) rm -f "$state" ;;',
        '  *" pull "*) echo mp4 > "${@: -1}" ;;',
        'esac',
        '',
      ].join('\n'),
    );
    chmodSync(adb, 0o755);
    const into = join(dir, 'r20261003-040814-846e') as EvidencePath;
    mkdirSync(into);

    const recording = await startScreenrecord({ adbBin: adb, serial: 'emulator-5560', into });
    const video = await recording.stop();

    assert.equal(video, join(into, 'video.mp4'));
    assert.ok(existsSync(video));
    const calls = readFileSync(log, 'utf8').trim().split('\n');
    const record = calls.findIndex((c) => c.includes('shell screenrecord'));
    const kill = calls.findIndex((c) => c.includes('pkill -INT screenrecord'));
    const pull = calls.findIndex((c) => c.includes(' pull '));
    const lastPidof = calls.findLastIndex((c) => c.includes('pidof screenrecord'));
    assert.match(calls[record]!, new RegExp(`--size ${RECORD_SIZE} --time-limit 0 /data/local/tmp/verify-r20261003-040814-846e\\.mp4`));
    assert.ok(record < kill && kill < lastPidof && lastPidof < pull, calls.join('\n'));
    assert.ok(calls.some((c) => c.includes('rm -f /data/local/tmp/verify-r20261003-040814-846e.mp4')), 'removes the device copy');
  });

  it('fails stop with adb\'s error when the pull fails', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-adb-'));
    const adb = fakeTool(dir, 'adb', [
      `state=${dir}/recording`,
      'case "$*" in',
      '  *"shell screenrecord"*) touch "$state"; while [ -f "$state" ]; do sleep 0.1; done ;;',
      '  *"shell pidof screenrecord"*) [ -f "$state" ] && echo 4242 ;;',
      '  *"shell pkill -INT screenrecord"*) rm -f "$state" ;;',
      '  *" pull "*) echo "adb: error: remote object does not exist" >&2; exit 1 ;;',
      'esac',
    ]);
    const into = join(dir, 'r20261003-040814-846e') as EvidencePath;
    mkdirSync(into);
    const recording = await startScreenrecord({ adbBin: adb, serial: 'emulator-5560', into });
    await assert.rejects(recording.stop(), { code: 'NOT_READY', message: /remote object does not exist/ });
  });
});

function fakeTool(dir: string, name: string, body: readonly string[]): string {
  const path = join(dir, name);
  writeFileSync(path, ['#!/bin/bash', `echo "$*" >> ${join(dir, 'calls.log')}`, ...body, ''].join('\n'));
  chmodSync(path, 0o755);
  return path;
}

describe('android lane ownership', () => {
  function setup(avd: string, laneProperty: (ownNonce: string) => string) {
    const dir = mkdtempSync(join(tmpdir(), 'verify-lane-'));
    const claimsDir = join(dir, 'claims');
    const claim = takeSlot(claimsDir, 'android', 1, 0, join(dir, 'worktree'))!;
    const killed = join(dir, 'killed');
    const adbBin = fakeTool(dir, 'adb', [
      'case "$*" in',
      `  "devices") echo "List of devices attached"; [ -f ${killed} ] || printf "emulator-5560\\tdevice\\n" ;;`,
      `  *"emu avd name"*) printf "${avd}\\nOK\\n" ;;`,
      `  *"getprop debug.verify.lane"*) echo "${laneProperty(claim.nonce)}" ;;`,
      '  *"getprop sys.boot_completed"*) echo 1 ;;',
      `  *"emu kill"*) touch ${killed} ;;`,
      'esac',
    ]);
    const emulatorBin = fakeTool(dir, 'emulator', ['echo Clerk_Verify_Pixel']);
    const lease: LocalLease = { backend: 'local', platform: 'android', slot: 1, deviceName: 'verify-android-1', deviceId: 'emulator-5560', claimNonce: claim.nonce, acquiredAt: '', installedBuild: null };
    const calls = () => readFileSync(join(dir, 'calls.log'), 'utf8');
    return { backend: localAndroidBackend({ claimsDir, adbBin, emulatorBin, machine: machineHomedInScratch(dir) }), lease, dir, calls };
  }

  it('never kills another AVD that sits on a lane port, and frees the claim', async () => {
    const { backend, lease, calls } = setup('Pixel_9_Pro', () => '');
    await backend.release(lease);
    assert.doesNotMatch(calls(), /emu kill/);
    assert.equal(await backend.check(lease), 'lost');
  });

  it('never kills a Clerk_Verify_Pixel emulator booted for another claim', async () => {
    const { backend, lease, calls } = setup('Clerk_Verify_Pixel', () => 'someone-elses-claim');
    await backend.release(lease);
    assert.doesNotMatch(calls(), /emu kill/);
  });

  it('kills the lane it booted', async () => {
    const { backend, lease, calls } = setup('Clerk_Verify_Pixel', (own) => own);
    assert.equal(await backend.check(lease), 'held');
    await backend.release(lease);
    assert.match(calls(), /-s emulator-5560 emu kill/);
  });

  it('doctor flags a foreign emulator on a lane port with a kill command for its owner', async () => {
    const { backend } = setup('Pixel_9_Pro', () => '');
    const lanePorts = (await backend.doctorChecks(doctorOptions)).device.find((c) => c.id === 'lane-ports');
    assert.equal(lanePorts?.ok, false);
    assert.match(lanePorts?.detail ?? '', /emulator-5560 \(Pixel_9_Pro, not a verify lane\)/);
    assert.match(lanePorts?.fix ?? '', /^adb -s emulator-5560 emu kill, but only if that emulator is yours/);
  });

  it('doctor passes a lane port that holds this claim\'s own lane', async () => {
    const { backend } = setup('Clerk_Verify_Pixel', (own) => own);
    assert.equal((await backend.doctorChecks(doctorOptions)).device.find((c) => c.id === 'lane-ports')?.ok, true);
  });

  it('reports a foreign emulator on a lane port in POOL_FULL instead of claiming it', async () => {
    const { backend, lease, dir } = setup('Pixel_9_Pro', () => '');
    await backend.release(lease);
    takeSlot(join(dir, 'claims'), 'android', 2, 0, join(dir, 'other'));
    await assert.rejects(backend.acquire({ platform: 'android', worktree: join(dir, 'worktree'), waitSeconds: 0, app: null as never, retryWith: 'e2e-tests/bin/control-clerk-android up --wait <seconds>', progress: () => undefined }), {
      code: 'POOL_FULL',
      message: /emulator-5560 \(Pixel_9_Pro, not a verify lane\), verify-android-2 \(held by .*other\)/,
      fix: /`adb -s emulator-5560 emu kill` frees a lane, but only if that emulator is yours/,
    });
  });
});

describe('android lane settings at boot', () => {
  function bootingLane(settingsReadBack: string) {
    const dir = mkdtempSync(join(tmpdir(), 'verify-lane-settings-'));
    const claimsDir = join(dir, 'claims');
    const booted = join(dir, 'booted');
    const killed = join(dir, 'killed');
    const mark = join(dir, 'mark');
    const emulatorPid = join(dir, 'emulator.pid');
    const adbBin = fakeTool(dir, 'adb', [
      'case "$*" in',
      `  "devices") echo "List of devices attached"; if [ -f ${booted} ] && [ ! -f ${killed} ]; then printf "emulator-5560\\tdevice\\n"; fi ;;`,
      '  *"emu avd name"*) printf "Clerk_Verify_Pixel\\nOK\\n" ;;',
      `  *"emu kill"*) touch ${killed}; kill "$(cat ${emulatorPid})" ;;`,
      `  *"setprop debug.verify.lane "*) echo "\${@: -1}" | sed 's/.* //' > ${mark} ;;`,
      `  *"getprop debug.verify.lane"*) cat ${mark} ;;`,
      '  *"getprop sys.boot_completed"*) echo 1 ;;',
      '  *"getprop init.svc.bootanim"*) echo stopped ;;',
      '  *"getprop persist.sys.locale"*) echo en-US ;;',
      `  *"settings get global"*) printf "${settingsReadBack}" ;;`,
      'esac',
    ]);
    const emulatorBin = fakeTool(dir, 'emulator', ['case "$*" in', '  *-list-avds*) echo Clerk_Verify_Pixel ;;', `  *) echo $$ > ${emulatorPid}; touch ${booted}; exec sleep 20 ;;`, 'esac']);
    const backend = localAndroidBackend({ claimsDir, adbBin, emulatorBin, emulatorsDir: join(dir, 'emulators'), machine: machineHomedInScratch(dir) });
    const request = { platform: 'android' as const, worktree: join(dir, 'worktree'), waitSeconds: 0, app: null as never, retryWith: 'up --wait <seconds>', progress: () => undefined };
    return { backend, request, claimsDir, killed, calls: () => readFileSync(join(dir, 'calls.log'), 'utf8') };
  }

  it('writes the lane settings after boot and leases the lane when they read back as written', async () => {
    const written = laneSettingsCommand().split(' && ').map((command) => command.split(' ').at(-1) as string);
    const { backend, request, calls } = bootingLane(`${written.join('\\n')}\\n`);
    const lease = await backend.acquire(request);
    assert.equal(lease.deviceId, 'emulator-5560');
    assert.ok(calls().includes(`-s emulator-5560 shell ${laneSettingsCommand()}`), 'the settings were written on the lane');
    await backend.release(lease);
  });

  it('fails up when a lane setting did not take, kills the lane it booted, and frees the slot', async () => {
    const { backend, request, claimsDir, killed } = bootingLane('0\\n0\\n0\\nnull\\n');
    await assert.rejects(backend.acquire(request), { code: 'NOT_READY', message: /emulator-5560 did not take the lane settings: .*hide_error_dialogs read back as 0, 0, 0, null/ });
    assert.equal(existsSync(killed), true, 'the emulator this claim booted was killed');
    assert.equal(readClaim(claimsDir, 'android', 1).claim, null, 'slot 1 is free again');
  });
});

describe('android lanes verify spawned', () => {
  function fakeEmulatorProcess(port: number): { readonly pid: number; readonly startedAt: number } {
    const child = spawn('bash', ['-c', `exec -a "qemu-system-aarch64-headless -avd Clerk_Verify_Pixel -read-only -port ${port}" sleep 60`], { detached: true, stdio: 'ignore' });
    child.unref();
    return { pid: child.pid!, startedAt: Date.now() };
  }

  async function setup(pidRecord: (own: string) => object | null) {
    const dir = mkdtempSync(join(tmpdir(), 'verify-spawned-'));
    const emulatorsDir = join(dir, 'emulators');
    mkdirSync(emulatorsDir);
    const claimsDir = join(dir, 'claims');
    const worktree = join(dir, 'worktree');
    const claim = takeSlot(claimsDir, 'android', 1, 0, worktree)!;
    const adbBin = fakeTool(dir, 'adb', ['case "$*" in', '  "devices") echo "List of devices attached" ;;', 'esac']);
    const emulatorBin = fakeTool(dir, 'emulator', ['echo Clerk_Verify_Pixel']);
    const emulator = fakeEmulatorProcess(5560);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const record = pidRecord(claim.nonce);
    if (record !== null) writeFileSync(join(emulatorsDir, 'android-1.pid'), JSON.stringify({ ...emulator, ...record }));
    const backend = localAndroidBackend({ claimsDir, adbBin, emulatorBin, emulatorsDir, machine: machineHomedInScratch(dir) });
    return { backend, emulator, emulatorsDir, worktree };
  }

  it('reclaims an interrupted boot that left its pid file, through the next up\'s reap', async () => {
    const { backend, emulator, emulatorsDir, worktree } = await setup((own) => ({ nonce: own }));
    assert.ok(isRunning(emulator));
    const [stale] = await backend.reapable(worktree);
    await backend.release(stale!);
    assert.equal(isRunning(emulator), false, 'the emulator verify spawned is gone');
    assert.equal(existsSync(join(emulatorsDir, 'android-1.pid')), false, 'the pid file is removed');
  });

  it('never kills a hand-booted Clerk_Verify_Pixel with no pid file', async () => {
    const { backend, emulator, worktree } = await setup(() => null);
    const [stale] = await backend.reapable(worktree);
    await backend.release(stale!);
    assert.ok(isRunning(emulator));
    process.kill(-emulator.pid, 'SIGKILL');
  });

  it('never kills a Clerk_Verify_Pixel whose pid file names another claim', async () => {
    const { backend, emulator, worktree } = await setup(() => ({ nonce: 'another-claim' }));
    const [stale] = await backend.reapable(worktree);
    await backend.release(stale!);
    assert.ok(isRunning(emulator));
    process.kill(-emulator.pid, 'SIGKILL');
  });

  it('doctor does not flag a claimed lane that is still booting, before its marker is set', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-booting-'));
    const emulatorsDir = join(dir, 'emulators');
    mkdirSync(emulatorsDir);
    const claim = takeSlot(join(dir, 'claims'), 'android', 1, 0, join(dir, 'worktree'))!;
    const adbBin = fakeTool(dir, 'adb', [
      'case "$*" in',
      '  "devices") printf "List of devices attached\\nemulator-5560\\toffline\\n" ;;',
      '  *"emu avd name"*) printf "Clerk_Verify_Pixel\\nOK\\n" ;;',
      'esac',
    ]);
    const emulator = fakeEmulatorProcess(5560);
    await new Promise((resolve) => setTimeout(resolve, 300));
    writeFileSync(join(emulatorsDir, 'android-1.pid'), JSON.stringify({ ...emulator, nonce: claim.nonce }));
    const backend = localAndroidBackend({ claimsDir: join(dir, 'claims'), adbBin, emulatorBin: fakeTool(dir, 'emulator', ['echo Clerk_Verify_Pixel']), emulatorsDir, machine: machineHomedInScratch(dir) });
    assert.equal((await backend.doctorChecks(doctorOptions)).device.find((c) => c.id === 'lane-ports')?.ok, true);
    process.kill(-emulator.pid, 'SIGKILL');
  });

  it('stops an emulator that has already exited without throwing, both before Node has reaped it, when macOS answers the kill with EPERM, and after, when the answer is ESRCH', async () => {
    const child = spawn('sh', ['-c', 'exit 0'], { detached: true, stdio: 'ignore' });
    const exited = once(child, 'exit');
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    assert.equal(child.exitCode, null, 'Node has not yet seen the exit');
    assert.doesNotThrow(() => terminateGroup(child.pid!));
    await exited;
    assert.doesNotThrow(() => terminateGroup(child.pid!));
    assert.throws(() => terminateGroup(Number.NaN), { code: 'ERR_INVALID_ARG_TYPE' }, 'a failure that is not about a process that is gone still surfaces');
  });

  it('never kills a reused pid that is no longer the emulator it recorded', async () => {
    const { backend, emulator, worktree } = await setup((own) => ({ nonce: own, startedAt: Date.now() - 600_000 }));
    const [stale] = await backend.reapable(worktree);
    await backend.release(stale!);
    assert.ok(isRunning(emulator));
    process.kill(-emulator.pid, 'SIGKILL');
  });
});

describe('whether this machine can run the emulator', () => {
  function fakeSdk(dir: string, machine: Machine, options: { readonly image?: boolean } = {}): string {
    const root = join(dir, 'sdk');
    for (const tool of [join('emulator', 'emulator'), join('platform-tools', 'adb')]) {
      mkdirSync(join(root, tool, '..'), { recursive: true });
      writeFileSync(join(root, tool), '');
    }
    if (options.image !== false) {
      const image = join(root, ...systemImage(machine).split(';'));
      mkdirSync(image, { recursive: true });
      writeFileSync(join(image, 'system.img'), '');
    }
    return root;
  }
  const scratch = () => mkdtempSync(join(tmpdir(), 'verify-machine-'));

  it('says yes on a Mac that has the SDK and the system image, lane AVD or not', () => {
    const dir = scratch();
    const mac = machineHomedInScratch(dir);
    const root = fakeSdk(dir, mac);
    const found = localAvailability({ ...mac, env: { ANDROID_HOME: root } });
    assert.deepEqual(found, { usable: true, why: `this Mac runs the emulator itself, from the SDK at ${root}` });
  });

  it('finds an SDK in the OS default place and through the tools on PATH', () => {
    const dir = scratch();
    const linux = machineHomedInScratch(dir, { os: 'linux', arch: 'x64' });
    const root = fakeSdk(dir, linux);
    assert.equal(sdkRoot({ ...linux, env: { PATH: `/usr/bin:${join(root, 'platform-tools')}` } }), root);
    const home = scratch();
    mkdirSync(join(home, 'Android'), { recursive: true });
    assert.equal(sdkRoot(machineHomedInScratch(home, { os: 'linux' })), join(home, 'Android', 'Sdk'));
    assert.equal(sdkRoot(machineHomedInScratch(home, { os: 'darwin' })), join(home, 'Library', 'Android', 'sdk'));
  });

  it('says no and names what is missing when there is no SDK or no system image', () => {
    const dir = scratch();
    const none = localAvailability(machineHomedInScratch(dir));
    assert.equal(none.usable, false);
    assert.match(none.why, /^no Android SDK with an emulator and adb \(looked in .*Library\/Android\/sdk\)$/);
    assert.match(none.fix ?? '', /ANDROID_HOME/);

    const linux = machineHomedInScratch(dir, { os: 'linux', arch: 'x64' });
    writeFileSync(linux.kvm, '');
    const root = fakeSdk(dir, linux, { image: false });
    const noImage = localAvailability({ ...linux, env: { ANDROID_HOME: root } });
    assert.equal(noImage.why, `the SDK at ${root} has no system image system-images;android-36;google_apis;x86_64`);
    assert.match(noImage.fix ?? '', /^sdkmanager "system-images;android-36;google_apis;x86_64"/);
  });

  it('on Linux needs a /dev/kvm this user can open for reading and writing', () => {
    const dir = scratch();
    const linux = machineHomedInScratch(dir, { os: 'linux', arch: 'x64' });
    const withSdk = { ...linux, env: { ANDROID_HOME: fakeSdk(dir, linux) } };

    const missing = { usable: false, why: `there is no ${linux.kvm}, so this machine has no hardware virtualization for the emulator` };
    assert.deepEqual(localAvailability(withSdk), missing);
    assert.deepEqual(localAvailability(linux), missing, 'with no SDK either, it names the one thing no install fixes, and offers no fix');

    writeFileSync(linux.kvm, '');
    chmodSync(linux.kvm, 0o000);
    const rootOpensAnyFile = process.getuid?.() === 0;
    if (!rootOpensAnyFile) {
      const closed = localAvailability(withSdk);
      assert.equal(closed.usable, false);
      assert.match(closed.why, /^this user cannot open .*kvm for reading and writing/);
      assert.match(closed.fix ?? '', /udev/);
    }

    chmodSync(linux.kvm, 0o666);
    const open = localAvailability(withSdk);
    assert.equal(open.usable, true);
    assert.match(open.why, /kvm opens for reading and writing and the SDK at .* has the system image$/);
  });

  it('says no on an OS the lanes do not run on', () => {
    assert.deepEqual(localAvailability(machineHomedInScratch(scratch(), { os: 'win32' })), { usable: false, why: 'the lane emulator runs on macOS and Linux, and this machine runs win32' });
  });

  it('writes the lane AVD once, on this machine\'s system image, and never touches one that exists', () => {
    const dir = scratch();
    const linux = machineHomedInScratch(dir, { os: 'linux', arch: 'x64' });
    assert.equal(ensureLaneAvd(linux), 'created');
    const config = readFileSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.avd', 'config.ini'), 'utf8');
    for (const line of ['image.sysdir.1=system-images/android-36/google_apis/x86_64/', 'hw.lcd.width=1280', 'hw.lcd.height=2856', 'hw.lcd.density=480', 'abi.type=x86_64']) assert.ok(config.includes(`${line}\n`), line);
    assert.match(readFileSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.ini'), 'utf8'), new RegExp(`^path=${join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.avd')}$`, 'm'));

    writeFileSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.avd', 'config.ini'), 'image.sysdir.1=system-images/android-36/google_apis/arm64-v8a/\nhand=made\n');
    assert.equal(ensureLaneAvd(linux), 'exists');
    assert.match(readFileSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.avd', 'config.ini'), 'utf8'), /hand=made/);
  });

  it('finds an AVD that lives where its pointer file says, and leaves both files alone', () => {
    const dir = scratch();
    const mac = machineHomedInScratch(dir);
    const root = fakeSdk(dir, mac);
    const elsewhere = join(dir, 'other-volume', 'Clerk_Verify_Pixel.avd');
    mkdirSync(elsewhere, { recursive: true });
    mkdirSync(join(dir, '.android', 'avd'), { recursive: true });
    const pointer = `avd.ini.encoding=UTF-8\npath=${elsewhere}\ntarget=android-35\n`;
    writeFileSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.ini'), pointer);
    writeFileSync(join(elsewhere, 'config.ini'), 'image.sysdir.1=system-images/android-35/google_apis/arm64-v8a/\n');
    assert.equal(ensureLaneAvd(mac), 'exists');
    assert.equal(readFileSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.ini'), 'utf8'), pointer);
    assert.equal(existsSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.avd')), false);
    assert.match(localAvailability({ ...mac, env: { ANDROID_HOME: root } }).why, /has no system image system-images;android-35;google_apis;arm64-v8a, which the Clerk_Verify_Pixel AVD names$/);
  });

  it('uses the ARM image on a Mac whose Node reports an Intel CPU, as it does under Rosetta', () => {
    const dir = scratch();
    const root = fakeSdk(dir, machineHomedInScratch(dir));
    const rosetta = machineHomedInScratch(dir, { arch: 'x64', env: { ANDROID_HOME: root } });
    assert.equal(systemImage(rosetta), 'system-images;android-36;google_apis;arm64-v8a');
    assert.equal(localAvailability(rosetta).usable, true);
    ensureLaneAvd(rosetta);
    assert.match(readFileSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.avd', 'config.ini'), 'utf8'), /^abi\.type=arm64-v8a$/m);
  });

  it('checks the system image an existing lane AVD names, not the default one', () => {
    const dir = scratch();
    const mac = machineHomedInScratch(dir);
    const root = fakeSdk(dir, mac);
    mkdirSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.avd'), { recursive: true });
    writeFileSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.ini'), '');
    writeFileSync(join(dir, '.android', 'avd', 'Clerk_Verify_Pixel.avd', 'config.ini'), 'image.sysdir.1=system-images/android-35/google_apis_playstore/arm64-v8a/\n');
    const found = localAvailability({ ...mac, env: { ANDROID_HOME: root } });
    assert.equal(found.usable, false);
    assert.match(found.why, /has no system image system-images;android-35;google_apis_playstore;arm64-v8a, which the Clerk_Verify_Pixel AVD names$/);
    assert.match(found.fix ?? '', /^sdkmanager "system-images;android-35;google_apis_playstore;arm64-v8a"/, 'the fix installs the image that AVD names');
  });

  it('looks for the AVD where the emulator does: ANDROID_AVD_HOME, then ANDROID_USER_HOME, and an empty value is unset', () => {
    const dir = scratch();
    const written = (env: Record<string, string>) => {
      const home = mkdtempSync(join(dir, 'home-'));
      ensureLaneAvd(machineHomedInScratch(home, { env }));
      return { home, at: (root: string) => existsSync(join(root, 'Clerk_Verify_Pixel.ini')) };
    };
    assert.ok(written({ ANDROID_AVD_HOME: join(dir, 'avds') }).at(join(dir, 'avds')));
    assert.ok(written({ ANDROID_USER_HOME: join(dir, 'user') }).at(join(dir, 'user', 'avd')));
    const unset = written({ ANDROID_AVD_HOME: '' });
    assert.ok(unset.at(join(unset.home, '.android', 'avd')));
  });
});
