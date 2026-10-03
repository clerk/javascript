import { spawn } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { defaultClaimsDir, freeSlot, isOrphaned, readClaim, readClaims, takeSlot, type Claim } from '../../core/claims.ts';
import { run, sleep, type Runner } from '../../core/exec.ts';
import {
  LOCAL_POOL,
  VerifyFailure,
  type AcquireRequest,
  type DeviceBackend,
  type DoctorCheck,
  type EvidencePath,
  type LocalLease,
  type Recording,
} from '../../core/types.ts';
import { jdkCheck, sdkTool } from './sdk.ts';

export const AVD_NAME = 'Clerk_Verify_Pixel';
export const LOCALE = 'en-US';
/** The default size fails on this AVD's 1280x2856 panel. */
export const RECORD_SIZE = '720x1608';
/** Logcat tags kept in app.log: host state, the SDK, its network logger (with debugLogs), the React Native console, and crashes. */
export const LOG_FILTER = ['ClerkVerify:V', 'ClerkLog:V', 'OkHttp:V', 'ReactNativeJS:V', 'AndroidRuntime:E', '*:S'];
const BOOT_TIMEOUT_MS = 240_000;

export const lanePort = (slot: number): number => 5558 + 2 * slot;
export const laneSerial = (slot: number): string => `emulator-${lanePort(slot)}`;

export function parseAdbDevices(stdout: string): ReadonlyMap<string, string> {
  return new Map(
    stdout
      .split('\n')
      .slice(1)
      .map((line) => line.trim().split(/\s+/))
      .filter((parts): parts is [string, string, ...string[]] => parts.length >= 2 && parts[0] !== '')
      .map(([serial, state]) => [serial, state]),
  );
}

export function logcatSince(since: Date): string {
  return (since.getTime() / 1000).toFixed(3);
}

export interface LocalAndroidOptions {
  readonly claimsDir?: string;
  readonly runner?: Runner;
  readonly emulatorLogDir?: string;
  readonly env?: Readonly<Record<string, string | undefined>>;
}

export function localAndroidBackend(options: LocalAndroidOptions = {}): DeviceBackend<LocalLease> {
  const claimsDir = options.claimsDir ?? defaultClaimsDir();
  const exec = options.runner ?? run;
  const env = options.env ?? process.env;
  const emulatorLogDir = options.emulatorLogDir ?? join(homedir(), '.verify', 'emulators');
  const adbBin = sdkTool('adb', env);
  const emulatorBin = sdkTool('emulator', env);

  const adb = (serial: string, args: readonly string[]) => exec(adbBin, ['-s', serial, ...args]);
  const shell = async (serial: string, command: string) => (await adb(serial, ['shell', command])).stdout.trim();

  async function devices(): Promise<ReadonlyMap<string, string>> {
    const listed = await exec(adbBin, ['devices']);
    if (listed.code !== 0) throw new VerifyFailure('NOT_READY', `adb devices failed: ${listed.stderr.trim()}`, 'install the Android SDK platform-tools, or set ANDROID_HOME');
    return parseAdbDevices(listed.stdout);
  }

  async function avdName(serial: string): Promise<string | null> {
    const result = await adb(serial, ['emu', 'avd', 'name']);
    return result.code === 0 ? (result.stdout.split('\n')[0]?.trim() ?? null) : null;
  }

  async function killEmulator(serial: string): Promise<void> {
    if (!(await devices()).has(serial)) return;
    await adb(serial, ['emu', 'kill']);
    const deadline = Date.now() + 30_000;
    while ((await devices()).has(serial)) {
      if (Date.now() >= deadline) {
        throw new VerifyFailure('NOT_READY', `${serial} did not exit after \`adb emu kill\``, `adb -s ${serial} emu kill, then rerun the verb`);
      }
      await sleep(1000);
    }
  }

  async function waitForBoot(serial: string, exited: () => string | null): Promise<void> {
    const deadline = Date.now() + BOOT_TIMEOUT_MS;
    for (;;) {
      const failure = exited();
      if (failure !== null) throw new VerifyFailure('NOT_READY', `the ${AVD_NAME} emulator exited before it booted: ${failure}`, 'run `bin/verify doctor`, then `bin/verify up` again');
      if ((await shell(serial, 'getprop sys.boot_completed')) === '1' && (await shell(serial, 'getprop init.svc.bootanim')) !== 'running') return;
      if (Date.now() >= deadline) throw new VerifyFailure('NOT_READY', `${serial} did not finish booting in ${BOOT_TIMEOUT_MS / 1000}s`, 'bin/verify down, then bin/verify up');
      await sleep(2000);
    }
  }

  async function pinLocale(serial: string, progress: (line: string) => void): Promise<void> {
    const locale = (await shell(serial, 'getprop persist.sys.locale')) || (await shell(serial, 'getprop ro.product.locale'));
    if (locale === LOCALE) return;
    progress(`device  ${serial}  setting locale ${LOCALE}`);
    await shell(serial, `setprop persist.sys.locale ${LOCALE}; setprop ctl.restart zygote`);
    await sleep(3000);
    const deadline = Date.now() + 120_000;
    while ((await shell(serial, 'getprop init.svc.zygote')) !== 'running' || !(await shell(serial, 'pm path android')).startsWith('package:')) {
      if (Date.now() >= deadline) throw new VerifyFailure('NOT_READY', `${serial} did not come back after the locale change`, 'bin/verify down, then bin/verify up');
      await sleep(2000);
    }
  }

  async function claimSlot(request: AcquireRequest): Promise<Claim> {
    const deadline = Date.now() + request.waitSeconds * 1000;
    let lastWait = '';
    for (;;) {
      const running = await devices();
      const claims = readClaims(claimsDir, 'android');
      const live = claims.filter((c) => !isOrphaned(c));
      const foreign = [...Array(LOCAL_POOL.android).keys()]
        .map((i) => i + 1)
        .filter((slot) => running.has(laneSerial(slot)) && !claims.some((c) => c.slot === slot));
      const inUse = [...new Set([...live.map((c) => c.deviceName as string), ...foreign.map((slot) => `${laneSerial(slot)} (unclaimed)`)])].sort();
      if (inUse.length < LOCAL_POOL.android) {
        for (let slot = 1; slot <= LOCAL_POOL.android; slot += 1) {
          if (foreign.includes(slot)) continue;
          const { gen, claim: holder } = readClaim(claimsDir, 'android', slot);
          if (holder !== null && !isOrphaned(holder)) continue;
          const claim = takeSlot(claimsDir, 'android', slot, gen, request.worktree);
          if (claim !== null) return claim;
        }
      }
      if (Date.now() >= deadline) {
        throw new VerifyFailure(
          'POOL_FULL',
          `${inUse.length} of ${LOCAL_POOL.android} Android lanes are in use on this Mac (${inUse.join(', ')})`,
          'wait and retry with `--wait 300`, or run `bin/verify down` in a worktree that no longer needs its lane',
        );
      }
      const waiting = `wait    all ${LOCAL_POOL.android} Android lanes are in use (${inUse.join(', ')}); waiting up to ${request.waitSeconds}s for one to free`;
      if (waiting !== lastWait) request.progress(waiting);
      lastWait = waiting;
      await sleep(5000);
    }
  }

  async function clearSlot(claim: Claim, worktree: string): Promise<void> {
    const reaper = takeSlot(claimsDir, 'android', claim.slot, claim.gen, worktree, true);
    if (reaper === null) return;
    await killEmulator(laneSerial(claim.slot));
    freeSlot(claimsDir, reaper);
  }

  function bootEmulator(slot: number): { readonly exited: () => string | null } {
    mkdirSync(emulatorLogDir, { recursive: true });
    const logFile = join(emulatorLogDir, `android-${slot}.log`);
    const out = openSync(logFile, 'w');
    const child = spawn(
      emulatorBin,
      ['-avd', AVD_NAME, '-read-only', '-no-window', '-no-audio', '-no-boot-anim', '-port', String(lanePort(slot))],
      { detached: true, stdio: ['ignore', out, out] },
    );
    closeSync(out);
    let exit: string | null = null;
    child.on('error', (error) => (exit = error.message));
    child.on('exit', (code) => {
      const tail = existsSync(logFile) ? readFileSync(logFile, 'utf8').trim().split('\n').slice(-5).join(' | ') : '';
      exit = `exit ${code}${tail ? `: ${tail}` : ''}`;
    });
    child.unref();
    return { exited: () => exit };
  }

  const backend: DeviceBackend<LocalLease> = {
    kind: 'local',
    platform: 'android',
    supports: (os) => os === 'darwin' || os === 'linux',

    async acquire(request) {
      const avds = await exec(emulatorBin, ['-list-avds']);
      if (!avds.stdout.split('\n').map((l) => l.trim()).includes(AVD_NAME)) {
        throw new VerifyFailure('NOT_READY', `no Android Virtual Device named ${AVD_NAME}`, `create ${AVD_NAME} in Android Studio's Device Manager (Pixel 9 Pro, API 36, Google APIs), boot it once without a PIN, and set the locale to ${LOCALE}`);
      }
      const claim = await claimSlot(request);
      const serial = laneSerial(claim.slot);
      try {
        await killEmulator(serial);
        request.progress(`device  ${claim.deviceName}  booting ${AVD_NAME} -read-only on port ${lanePort(claim.slot)}`);
        const boot = bootEmulator(claim.slot);
        await waitForBoot(serial, boot.exited);
        if ((await avdName(serial)) !== AVD_NAME) {
          throw new VerifyFailure('NOT_READY', `${serial} is not running ${AVD_NAME}`, `adb -s ${serial} emu kill, then bin/verify up`);
        }
        await pinLocale(serial, request.progress);
      } catch (error) {
        await clearSlot(claim, request.worktree).catch(() => undefined);
        throw error;
      }
      return {
        backend: 'local',
        platform: 'android',
        slot: claim.slot,
        deviceName: claim.deviceName,
        deviceId: serial,
        claimNonce: claim.nonce,
        acquiredAt: new Date().toISOString(),
        installedBuild: null,
      };
    },

    async check(lease) {
      if (readClaim(claimsDir, 'android', lease.slot).claim?.nonce !== lease.claimNonce) return 'lost';
      if ((await devices()).get(lease.deviceId) !== 'device') return 'lost';
      if ((await avdName(lease.deviceId)) !== AVD_NAME) return 'lost';
      return (await shell(lease.deviceId, 'getprop sys.boot_completed')) === '1' ? 'held' : 'lost';
    },

    async install(lease, app) {
      const result = await adb(lease.deviceId, ['install', '-r', '-t', app.path]);
      if (result.code !== 0 || !/Success/.test(result.stdout)) {
        throw new VerifyFailure('NOT_READY', `adb install on ${lease.deviceName} failed: ${(result.stderr || result.stdout).trim()}`, 'bin/verify down, then bin/verify up');
      }
    },

    async release(lease) {
      const { claim } = readClaim(claimsDir, 'android', lease.slot);
      if (claim !== null && claim.nonce === lease.claimNonce) {
        await clearSlot(claim, claim.worktree);
      }
    },

    async reapable(owner) {
      return readClaims(claimsDir, 'android')
        .filter((claim) => isOrphaned(claim) || (owner !== undefined && claim.worktree === owner))
        .map((claim) => ({
          backend: 'local' as const,
          platform: 'android' as const,
          slot: claim.slot,
          deviceName: claim.deviceName,
          deviceId: laneSerial(claim.slot),
          claimNonce: claim.nonce,
          acquiredAt: claim.createdAt,
          installedBuild: null,
        }));
    },

    async startRecording(lease, into) {
      return startScreenrecord({ adbBin, serial: lease.deviceId, into, exec });
    },

    async logs(lease, since) {
      const result = await adb(lease.deviceId, ['logcat', '-d', '-v', 'threadtime', '-T', logcatSince(since), ...LOG_FILTER]);
      return result.stdout;
    },

    agentDeviceTarget: (lease) => ({ daemon: 'local', deviceId: lease.deviceId }),
    describe: (lease) => lease.deviceName,

    async doctorChecks() {
      const checks: DoctorCheck[] = [jdkCheck(env)];
      const avds = await exec(emulatorBin, ['-list-avds']);
      const adbVersion = await exec(adbBin, ['version']);
      if (avds.code !== 0 || adbVersion.code !== 0) {
        checks.push({ id: 'template', ok: false, detail: 'the Android SDK emulator or adb is not installed', fix: 'install the Android SDK (Android Studio) and set ANDROID_HOME' });
      } else if (!avds.stdout.split('\n').map((l) => l.trim()).includes(AVD_NAME)) {
        checks.push({ id: 'template', ok: false, detail: `no Android Virtual Device named ${AVD_NAME}`, fix: `create ${AVD_NAME} in Android Studio's Device Manager (Pixel 9 Pro, API 36, Google APIs), boot it once without a PIN, and set the locale to ${LOCALE}` });
      } else {
        checks.push({ id: 'template', ok: true, detail: `${AVD_NAME}; lanes boot it -read-only on ports ${lanePort(1)} to ${lanePort(LOCAL_POOL.android)}` });
      }
      return checks;
    },
  };
  return backend;
}

interface ScreenrecordOptions {
  readonly adbBin: string;
  readonly serial: string;
  readonly into: EvidencePath;
  readonly exec: Runner;
}

/**
 * Stops screenrecord on the device with SIGINT and waits for `pidof` to come back empty before pulling: killing the
 * host-side adb instead leaves an mp4 with no moov atom that no player opens. `--time-limit 0` lifts the 180 second cap.
 */
export async function startScreenrecord(options: ScreenrecordOptions): Promise<Recording> {
  const { adbBin, serial, into, exec } = options;
  const shell = async (command: string) => (await exec(adbBin, ['-s', serial, 'shell', command])).stdout.trim();
  const remote = `/sdcard/verify-${basename(into)}.mp4`;
  const child = spawn(adbBin, ['-s', serial, 'shell', 'screenrecord', '--size', RECORD_SIZE, '--time-limit', '0', remote], { stdio: ['ignore', 'pipe', 'pipe'] });
  const startedAt = Date.now();
  let output = '';
  child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()));
  child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()));
  const done = new Promise<number>((resolve) => child.on('close', (code) => resolve(code ?? 1)));
  const deadline = Date.now() + 10_000;
  while ((await shell('pidof screenrecord')) === '') {
    const exited = await Promise.race([done, sleep(500).then(() => null)]);
    if (exited !== null || Date.now() >= deadline) {
      child.kill();
      throw new VerifyFailure('NOT_READY', `screenrecord did not start on ${serial}: ${output.trim() || `exit ${exited}`}`, 'rerun with --no-video, or `bin/verify down` and `bin/verify up`');
    }
  }
  return {
    process: { pid: child.pid ?? 0, startedAt },
    async stop() {
      await shell('pkill -INT screenrecord');
      const stopDeadline = Date.now() + 30_000;
      while ((await shell('pidof screenrecord')) !== '' && Date.now() < stopDeadline) await sleep(500);
      await Promise.race([done, sleep(5000)]);
      const video = join(into, 'video.mp4') as EvidencePath;
      await exec(adbBin, ['-s', serial, 'pull', remote, video]);
      await shell(`rm -f ${remote}`);
      return video;
    },
  };
}
