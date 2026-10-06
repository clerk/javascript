import { execFileSync, spawn } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { defaultClaimsDir, freeSlot, isOrphaned, readClaim, readClaims, takeSlot, type Claim } from '../../core/claims.ts';
import { isRunning, run, sleep, type ProcessRef, type Runner } from '../../core/exec.ts';
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
import { emulatorArgs, installArgs, logcatArgs, recordingOnDevice, screenrecordArgs } from './emulator.ts';
import { AVD_NAME, ensureLaneAvd, jdkCheck, localAvailability, sdkTool, thisMachine, type Machine } from './sdk.ts';

const LOCALE = 'en-US';
const BOOT_TIMEOUT_MS = 240_000;
const STILL_WAITING_MS = 60_000;
const LANE_PROPERTY = 'debug.verify.lane';

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

const listsAvd = (stdout: string) => stdout.split('\n').some((line) => line.trim() === AVD_NAME);

export interface LocalAndroidOptions {
  readonly claimsDir?: string;
  readonly adbBin?: string;
  readonly emulatorBin?: string;
  readonly emulatorsDir?: string;
  readonly machine?: Machine;
}

interface SpawnedEmulator extends ProcessRef {
  readonly nonce: string;
}

function commandOf(pid: number): string {
  try {
    return execFileSync('ps', ['-o', 'command=', '-p', String(pid)], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const hasArgument = (command: string, flag: string, value: string) => new RegExp(`(^|\\s)${flag} ${value}(\\s|$)`).test(command);

function retryFix(request: AcquireRequest): string {
  return request.retryWith.replace('<seconds>', String(Math.max(600, request.waitSeconds * 2)));
}

export function localAndroidBackend(options: LocalAndroidOptions = {}): DeviceBackend<LocalLease> {
  const claimsDir = options.claimsDir ?? defaultClaimsDir();
  const exec = run;
  const machine = options.machine ?? thisMachine();
  const emulatorLogDir = options.emulatorsDir ?? join(machine.home, '.verify', 'emulators');
  const adbBin = options.adbBin ?? sdkTool('adb', machine);
  const emulatorBin = options.emulatorBin ?? sdkTool('emulator', machine);

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

  async function isOwnLane(serial: string, nonce: string): Promise<boolean> {
    return (await avdName(serial)) === AVD_NAME && (await shell(serial, `getprop ${LANE_PROPERTY}`)) === nonce;
  }

  async function describeForeign(serial: string): Promise<string> {
    return `${serial} (${(await avdName(serial)) ?? 'unknown AVD'}, not a verify lane)`;
  }

  const pidFile = (slot: number) => join(emulatorLogDir, `android-${slot}.pid`);

  function ownedProcess(slot: number, nonce: string): SpawnedEmulator | null {
    let recorded: SpawnedEmulator;
    try {
      recorded = JSON.parse(readFileSync(pidFile(slot), 'utf8')) as SpawnedEmulator;
    } catch {
      return null;
    }
    if (recorded.nonce !== nonce || !isRunning(recorded)) return null;
    const command = commandOf(recorded.pid);
    return hasArgument(command, '-avd', AVD_NAME) && hasArgument(command, '-port', String(lanePort(slot))) ? recorded : null;
  }

  function forgetProcess(slot: number, nonce: string): void {
    try {
      if ((JSON.parse(readFileSync(pidFile(slot), 'utf8')) as SpawnedEmulator).nonce === nonce) rmSync(pidFile(slot), { force: true });
    } catch {
      return;
    }
  }

  async function killEmulator(slot: number, nonce: string): Promise<void> {
    const serial = laneSerial(slot);
    const marked = (await devices()).has(serial) && (await isOwnLane(serial, nonce));
    const owned = ownedProcess(slot, nonce);
    if (marked) await adb(serial, ['emu', 'kill']);
    else if (owned !== null) process.kill(-owned.pid, 'SIGTERM');
    else {
      forgetProcess(slot, nonce);
      return;
    }
    const deadline = Date.now() + 30_000;
    while ((await devices()).has(serial) || (owned !== null && isRunning(owned))) {
      if (Date.now() >= deadline) {
        if (owned === null) throw new VerifyFailure('NOT_READY', `${serial} did not exit after \`adb emu kill\``, `adb -s ${serial} emu kill, then rerun the verb`);
        process.kill(-owned.pid, 'SIGKILL');
      }
      await sleep(1000);
    }
    forgetProcess(slot, nonce);
  }

  async function waitForBoot(serial: string, exited: () => string | null): Promise<void> {
    const deadline = Date.now() + BOOT_TIMEOUT_MS;
    for (;;) {
      const failure = exited();
      if (failure !== null) throw new VerifyFailure('NOT_READY', `the ${AVD_NAME} emulator exited before it booted: ${failure}`, 'run `{cli} doctor`, then `{cli} up` again');
      if ((await shell(serial, 'getprop sys.boot_completed')) === '1' && (await shell(serial, 'getprop init.svc.bootanim')) !== 'running') return;
      if (Date.now() >= deadline) throw new VerifyFailure('NOT_READY', `${serial} did not finish booting in ${BOOT_TIMEOUT_MS / 1000}s`, '{cli} down, then {cli} up');
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
      if (Date.now() >= deadline) throw new VerifyFailure('NOT_READY', `${serial} did not come back after the locale change`, '{cli} down, then {cli} up');
      await sleep(2000);
    }
  }

  async function lanePortsCheck(): Promise<DoctorCheck> {
    const running = await devices();
    const live = readClaims(claimsDir, 'android').filter((c) => !isOrphaned(c));
    const foreign: string[] = [];
    for (let slot = 1; slot <= LOCAL_POOL.android; slot += 1) {
      const serial = laneSerial(slot);
      if (!running.has(serial)) continue;
      const claim = live.find((c) => c.slot === slot);
      const booting = claim !== undefined && ownedProcess(slot, claim.nonce) !== null;
      if (claim === undefined || (!booting && !(await isOwnLane(serial, claim.nonce)))) foreign.push(serial);
    }
    if (foreign.length === 0) return { id: 'lane-ports', ok: true, detail: `ports ${lanePort(1)} to ${lanePort(LOCAL_POOL.android)} hold only verify lanes` };
    return {
      id: 'lane-ports',
      ok: false,
      detail: `${(await Promise.all(foreign.map(describeForeign))).join(', ')} sits on a lane port and takes a lane from every worktree`,
      fix: `${foreign.map((serial) => `adb -s ${serial} emu kill`).join('; ')}, but only if that emulator is yours; verify never kills it`,
    };
  }

  async function claimSlot(request: AcquireRequest): Promise<Claim> {
    const startedWaiting = Date.now();
    const deadline = startedWaiting + request.waitSeconds * 1000;
    let lastWait = '';
    let lastPrinted = 0;
    for (;;) {
      const running = await devices();
      const live = readClaims(claimsDir, 'android').filter((c) => !isOrphaned(c));
      const foreign = Array.from({ length: LOCAL_POOL.android }, (_, i) => i + 1).filter(
        (slot) => running.has(laneSerial(slot)) && !live.some((c) => c.slot === slot),
      );
      const inUse = [
        ...live.map((c) => `${c.deviceName} (held by ${c.worktree})`),
        ...(await Promise.all(foreign.map((slot) => describeForeign(laneSerial(slot))))),
      ].sort();
      const foreignFix = foreign.length === 0 ? '' : `; ${foreign.map((slot) => `\`adb -s ${laneSerial(slot)} emu kill\``).join(' or ')} frees a lane, but only if that emulator is yours`;
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
          `${inUse.length} of ${LOCAL_POOL.android} Android lanes are in use on this machine (${inUse.join(', ')})`,
          `rerun with a longer --wait than ${request.waitSeconds}s, for example ${retryFix(request)}, or run {cli} down in a worktree that no longer needs its lane${foreignFix}`,
        );
      }
      const waiting = `wait    all ${LOCAL_POOL.android} Android lanes are in use (${inUse.join(', ')}); waiting up to ${request.waitSeconds}s for one to free`;
      if (waiting !== lastWait || Date.now() - lastPrinted >= STILL_WAITING_MS) {
        request.progress(waiting === lastWait ? `wait    still waiting after ${Math.round((Date.now() - startedWaiting) / 1000)}s (${inUse.join(', ')})` : waiting);
        lastPrinted = Date.now();
      }
      lastWait = waiting;
      await sleep(5000);
    }
  }

  async function clearSlot(claim: Claim, worktree: string): Promise<void> {
    const reaper = takeSlot(claimsDir, 'android', claim.slot, claim.gen, worktree, true);
    if (reaper === null) return;
    await killEmulator(claim.slot, claim.nonce);
    freeSlot(claimsDir, reaper);
  }

  function bootEmulator(slot: number, nonce: string): { readonly pid: number | undefined; readonly exited: () => string | null; readonly stop: () => void } {
    mkdirSync(emulatorLogDir, { recursive: true });
    const logFile = join(emulatorLogDir, `android-${slot}.log`);
    const out = openSync(logFile, 'w');
    const child = spawn(emulatorBin, [...emulatorArgs(lanePort(slot), machine.os)], { detached: true, stdio: ['ignore', out, out] });
    closeSync(out);
    if (child.pid !== undefined) {
      const spawned: SpawnedEmulator = { nonce, pid: child.pid, startedAt: Date.now() };
      writeFileSync(pidFile(slot), JSON.stringify(spawned));
    }
    let exit: string | null = null;
    child.on('error', (error) => (exit = error.message));
    child.on('exit', (code) => {
      const tail = existsSync(logFile) ? readFileSync(logFile, 'utf8').trim().split('\n').slice(-5).join(' | ') : '';
      exit = `exit ${code}${tail ? `: ${tail}` : ''}`;
    });
    child.unref();
    return {
      pid: child.pid,
      exited: () => exit,
      stop: () => {
        if (exit === null && child.pid !== undefined) process.kill(-child.pid, 'SIGTERM');
      },
    };
  }

  const backend: DeviceBackend<LocalLease> = {
    kind: 'local',
    platform: 'android',
    availability: () => localAvailability(machine),
    requirement: 'a machine with the Android SDK emulator, adb, and an Android 36 Google APIs system image, and on Linux a /dev/kvm this user can open',

    async acquire(request) {
      if (ensureLaneAvd(machine) === 'created') request.progress(`device  wrote the ${AVD_NAME} AVD, which this machine did not have`);
      const listed = await exec(emulatorBin, ['-list-avds']);
      if (!listsAvd(listed.stdout)) {
        throw new VerifyFailure('NOT_READY', `the emulator does not list ${AVD_NAME}: ${(listed.stderr || listed.stdout).trim() || `exit ${listed.code}`}`, 'run `{cli} doctor`; if ANDROID_AVD_HOME is set, the AVD must be under it');
      }
      const claim = await claimSlot(request);
      const serial = laneSerial(claim.slot);
      let boot: ReturnType<typeof bootEmulator> | null = null;
      const interrupted = (signal: NodeJS.Signals) => {
        if (boot !== null) {
          boot.stop();
          request.progress(`device  boot cancelled; stopped emulator ${boot.pid} on ${serial}`);
        }
        process.removeListener('SIGINT', interrupted);
        process.removeListener('SIGTERM', interrupted);
        process.kill(process.pid, signal);
      };
      process.once('SIGINT', interrupted);
      process.once('SIGTERM', interrupted);
      try {
        if ((await devices()).has(serial)) {
          throw new VerifyFailure('POOL_FULL', `${await describeForeign(serial)} took the lane port while it was being claimed`, retryFix(request));
        }
        request.progress(`device  ${claim.deviceName}  booting ${AVD_NAME} -read-only on port ${lanePort(claim.slot)}`);
        boot = bootEmulator(claim.slot, claim.nonce);
        await waitForBoot(serial, boot.exited);
        const died = boot.exited();
        if (died !== null) {
          throw new VerifyFailure('NOT_READY', `the ${AVD_NAME} emulator verify started exited (${died}), so ${serial} is someone else's`, retryFix(request));
        }
        await shell(serial, `setprop ${LANE_PROPERTY} ${claim.nonce}`);
        if (!(await isOwnLane(serial, claim.nonce))) {
          const marker = (await shell(serial, 'getprop')).split('\n').filter((line) => line.includes('verify.lane')).join(' ') || 'no verify.lane property';
          throw new VerifyFailure('NOT_READY', `${serial} is not the ${AVD_NAME} lane this claim booted (${marker})`, retryFix(request));
        }
        await pinLocale(serial, request.progress);
      } catch (error) {
        boot?.stop();
        await clearSlot(claim, request.worktree).catch(() => undefined);
        throw error;
      } finally {
        process.removeListener('SIGINT', interrupted);
        process.removeListener('SIGTERM', interrupted);
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
      if (!(await isOwnLane(lease.deviceId, lease.claimNonce))) return 'lost';
      return (await shell(lease.deviceId, 'getprop sys.boot_completed')) === '1' ? 'held' : 'lost';
    },

    async install(lease, app) {
      const result = await adb(lease.deviceId, installArgs(app.path));
      if (result.code !== 0 || !/Success/.test(result.stdout)) {
        throw new VerifyFailure('NOT_READY', `adb install on ${lease.deviceName} failed: ${(result.stderr || result.stdout).trim()}`, '{cli} down, then {cli} up');
      }
      return lease;
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

    async logs(lease, since, extraPredicate) {
      const result = await adb(lease.deviceId, logcatArgs(since, extraPredicate));
      return result.stdout;
    },

    describe: (lease) => `${lease.deviceName} (${lease.deviceId})`,

    async doctorChecks() {
      const device: DoctorCheck[] = [];
      const avds = await exec(emulatorBin, ['-list-avds']);
      const adbVersion = await exec(adbBin, ['version']);
      const ports = `lanes boot it -read-only on ports ${lanePort(1)} to ${lanePort(LOCAL_POOL.android)}`;
      if (avds.code !== 0 || adbVersion.code !== 0) {
        device.push({ id: 'template', ok: false, detail: 'the Android SDK emulator or adb does not run', fix: 'install the Android SDK (Android Studio) and set ANDROID_HOME' });
      } else {
        device.push({ id: 'template', ok: true, detail: listsAvd(avds.stdout) ? `${AVD_NAME}; ${ports}` : `no ${AVD_NAME} AVD yet; the first up writes it, and ${ports}` });
      }
      device.push(await lanePortsCheck());
      return { toolchain: [jdkCheck(machine.env)], device };
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

export async function startScreenrecord(options: ScreenrecordOptions): Promise<Recording> {
  const { adbBin, serial, into, exec } = options;
  const shell = async (command: string) => (await exec(adbBin, ['-s', serial, 'shell', command])).stdout.trim();
  const remote = recordingOnDevice(basename(into));
  const child = spawn(adbBin, ['-s', serial, ...screenrecordArgs(remote)], { stdio: ['ignore', 'pipe', 'pipe'] });
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
      throw new VerifyFailure('NOT_READY', `screenrecord did not start on ${serial}: ${output.trim() || `exit ${exited}`}`, 'rerun with --no-video, or `{cli} down` and `{cli} up`');
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
      const pulled = await exec(adbBin, ['-s', serial, 'pull', remote, video]);
      await shell(`rm -f ${remote}`);
      if (pulled.code !== 0 || !existsSync(video)) {
        throw new VerifyFailure('NOT_READY', `adb pull of the recording from ${serial} failed: ${(pulled.stderr || pulled.stdout).trim()}`, 'rerun the spec, or rerun with --no-video');
      }
      return video;
    },
  };
}
