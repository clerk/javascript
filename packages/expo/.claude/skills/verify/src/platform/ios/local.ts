import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { defaultClaimsDir, freeSlot, isOrphaned, readClaim, readClaims, takeSlot, type Claim } from '../../core/claims.ts';
import { run, sleep } from '../../core/exec.ts';
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

export const TEMPLATE_NAME = 'Clerk Verify Template iOS';
const LANE_NAME = /^verify-ios-(\d+)$/;
const LOG_PREDICATE = 'subsystem == "com.clerk.verify" OR subsystem == "com.clerk.sdk"';

export interface Simulator {
  readonly udid: string;
  readonly name: string;
  readonly state: string;
  readonly runtime: string;
}

export async function listSimulators(): Promise<readonly Simulator[]> {
  const listed = await run('xcrun', ['simctl', 'list', 'devices', '-j']);
  if (listed.code !== 0) throw new VerifyFailure('NOT_READY', `simctl list failed: ${listed.stderr.trim()}`, 'install Xcode and run `xcode-select -p`');
  const parsed = JSON.parse(listed.stdout) as { devices: Record<string, { udid: string; name: string; state: string }[]> };
  return Object.entries(parsed.devices).flatMap(([runtime, devices]) => devices.map((d) => ({ udid: d.udid, name: d.name, state: d.state, runtime })));
}

async function simctl(args: readonly string[], what: string): Promise<string> {
  const result = await run('xcrun', ['simctl', ...args]);
  if (result.code !== 0) throw new VerifyFailure('NOT_READY', `${what} failed: ${result.stderr.trim() || result.stdout.trim()}`, 'run `bin/verify doctor`');
  return result.stdout;
}

function simulatorDataDir(udid: string): string {
  return join(homedir(), 'Library', 'Developer', 'CoreSimulator', 'Devices', udid, 'data');
}

function localTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function deleteSimulators(match: (device: Simulator) => boolean): Promise<void> {
  for (const device of (await listSimulators()).filter((d) => LANE_NAME.test(d.name) && match(d))) {
    if (device.state !== 'Shutdown') await run('xcrun', ['simctl', 'shutdown', device.udid]);
    await simctl(['delete', device.udid], `simctl delete ${device.name}`);
  }
}

export interface LocalIosOptions {
  readonly claimsDir?: string;
}

export function localIosBackend(options: LocalIosOptions = {}): DeviceBackend<LocalLease> {
  const claimsDir = options.claimsDir ?? defaultClaimsDir();

  async function claimSlot(request: AcquireRequest): Promise<Claim> {
    const deadline = Date.now() + request.waitSeconds * 1000;
    let lastWait = '';
    for (;;) {
      const devices = await listSimulators();
      const claims = readClaims(claimsDir, 'ios');
      const orphans = new Set(claims.filter(isOrphaned).map((c) => c.deviceName as string));
      const bootedLanes = devices.filter((d) => d.runtime.includes('iOS') && d.state === 'Booted' && d.name.startsWith('verify-')).map((d) => d.name);
      const inUse = new Set([...bootedLanes, ...claims.map((c) => c.deviceName as string)].filter((name) => !orphans.has(name)));
      if (inUse.size < LOCAL_POOL.ios) {
        for (let slot = 1; slot <= LOCAL_POOL.ios; slot += 1) {
          const { gen, claim: holder } = readClaim(claimsDir, 'ios', slot);
          if (holder !== null && !isOrphaned(holder)) continue;
          const claim = takeSlot(claimsDir, 'ios', slot, gen, request.worktree);
          if (claim !== null) return claim;
        }
      }
      if (Date.now() >= deadline) {
        throw new VerifyFailure(
          'POOL_FULL',
          `${inUse.size} of ${LOCAL_POOL.ios} iOS lanes are in use on this Mac (${[...inUse].sort().join(', ')})`,
          `rerun with a longer --wait than ${request.waitSeconds}s, for example ${request.retryWith.replace('<seconds>', String(Math.max(600, request.waitSeconds * 2)))}, or run bin/verify down in a worktree that no longer needs its lane`,
        );
      }
      const changing = LOCAL_POOL.ios - inUse.size;
      const names = `${[...inUse].sort().join(', ')}${changing > 0 ? `, and ${changing} changing hands` : ''}`;
      const waiting = `wait    no free iOS lane of ${LOCAL_POOL.ios} (${names}); waiting up to ${request.waitSeconds}s for one`;
      if (waiting !== lastWait) request.progress(waiting);
      lastWait = waiting;
      await sleep(5000);
    }
  }

  async function clearSlot(claim: Claim, worktree: string): Promise<void> {
    const reaper = takeSlot(claimsDir, 'ios', claim.slot, claim.gen, worktree, true);
    if (reaper === null) return;
    await deleteSimulators((d) => d.name === claim.deviceName);
    freeSlot(claimsDir, reaper);
  }

  const backend: DeviceBackend<LocalLease> = {
    kind: 'local',
    platform: 'ios',
    supports: (os) => os === 'darwin',
    requirement: 'a Mac with Xcode',

    async acquire(request) {
      const template = (await listSimulators()).find((d) => d.name === TEMPLATE_NAME);
      if (template === undefined) {
        throw new VerifyFailure('NOT_READY', `no simulator named ${TEMPLATE_NAME}`, `xcrun simctl clone "iPhone Air" "${TEMPLATE_NAME}"`);
      }
      if (template.state !== 'Shutdown') {
        throw new VerifyFailure('NOT_READY', `${TEMPLATE_NAME} is ${template.state}; it can only be cloned while shut down`, `xcrun simctl shutdown "${TEMPLATE_NAME}"`);
      }
      const claim = await claimSlot(request);
      let udid = '';
      try {
        await deleteSimulators((d) => d.name === claim.deviceName);
        request.progress(`device  ${claim.deviceName}  cloning ${TEMPLATE_NAME}`);
        udid = (await simctl(['clone', template.udid, claim.deviceName], `simctl clone ${claim.deviceName}`)).trim();
        await simctl(['boot', udid], `simctl boot ${claim.deviceName}`);
        await simctl(['bootstatus', udid, '-b'], `simctl bootstatus ${claim.deviceName}`);
      } catch (error) {
        await clearSlot(claim, request.worktree).catch(() => undefined);
        throw error;
      }
      return {
        backend: 'local',
        platform: 'ios',
        slot: claim.slot,
        deviceName: claim.deviceName,
        deviceId: udid,
        claimNonce: claim.nonce,
        acquiredAt: new Date().toISOString(),
        installedBuild: null,
      };
    },

    async check(lease) {
      if (readClaim(claimsDir, 'ios', lease.slot).claim?.nonce !== lease.claimNonce) return 'lost';
      const device = (await listSimulators()).find((d) => d.udid === lease.deviceId);
      if (device === undefined || device.name !== lease.deviceName) return 'lost';
      if (device.state !== 'Booted') {
        await simctl(['boot', lease.deviceId], `simctl boot ${lease.deviceName}`).catch(() => undefined);
        await simctl(['bootstatus', lease.deviceId, '-b'], `simctl bootstatus ${lease.deviceName}`);
      }
      return 'held';
    },

    async install(lease, app) {
      await simctl(['install', lease.deviceId, app.path], `simctl install on ${lease.deviceName}`);
    },

    async release(lease) {
      const { claim } = readClaim(claimsDir, 'ios', lease.slot);
      if (claim !== null && claim.nonce === lease.claimNonce) {
        await clearSlot(claim, claim.worktree);
        return;
      }
      if (lease.deviceId !== '') await deleteSimulators((d) => d.udid === lease.deviceId);
    },

    async reapable(owner) {
      return readClaims(claimsDir, 'ios')
        .filter((claim) => isOrphaned(claim) || (owner !== undefined && claim.worktree === owner))
        .map((claim) => ({
          backend: 'local' as const,
          platform: 'ios' as const,
          slot: claim.slot,
          deviceName: claim.deviceName,
          deviceId: '',
          claimNonce: claim.nonce,
          acquiredAt: claim.createdAt,
          installedBuild: null,
        }));
    },

    async startRecording(lease, into) {
      const file = join(into, 'video.mp4') as EvidencePath;
      const child = spawn('xcrun', ['simctl', 'io', lease.deviceId, 'recordVideo', '--codec=h264', '--force', file], { stdio: ['ignore', 'pipe', 'pipe'] });
      const spawnedAt = Date.now();
      const exited = new Promise<number>((resolve) => child.on('close', (code) => resolve(code ?? 1)));
      await new Promise<void>((resolve, reject) => {
        let seen = '';
        const timer = setTimeout(resolve, 10_000);
        const onData = (chunk: Buffer) => {
          seen += chunk.toString();
          if (/recording started/i.test(seen)) {
            clearTimeout(timer);
            resolve();
          }
        };
        child.stdout.on('data', onData);
        child.stderr.on('data', onData);
        child.on('close', (code) => {
          clearTimeout(timer);
          reject(new VerifyFailure('NOT_READY', `simctl recordVideo exited ${code}: ${seen.trim()}`, 'rerun with --no-video, or `bin/verify down` and `bin/verify up`'));
        });
      });
      const recording: Recording = {
        process: { pid: child.pid ?? 0, startedAt: spawnedAt },
        async stop() {
          child.kill('SIGINT');
          let timer: NodeJS.Timeout | undefined;
          const code = await Promise.race([exited, new Promise<null>((resolve) => (timer = setTimeout(() => resolve(null), 30_000)))]);
          clearTimeout(timer);
          if (code === null) {
            child.kill('SIGKILL');
            await exited;
          }
          return file;
        },
      };
      return recording;
    },

    async logs(lease, since, extraPredicate) {
      const predicate = extraPredicate === undefined ? LOG_PREDICATE : `${LOG_PREDICATE} OR (${extraPredicate})`;
      const result = await run('xcrun', ['simctl', 'spawn', lease.deviceId, 'log', 'show', '--style', 'compact', '--start', localTime(since), '--predicate', predicate]);
      return result.stdout;
    },

    agentDeviceTarget: (lease) => ({ daemon: 'local', deviceId: lease.deviceId }),
    describe: (lease) => lease.deviceName,

    async doctorChecks() {
      const xcode = await run('xcodebuild', ['-version']);
      const toolchain: DoctorCheck[] = [
        xcode.code === 0
          ? { id: 'xcode', ok: true, detail: xcode.stdout.split('\n')[0]?.replace('Xcode ', '') ?? '' }
          : { id: 'xcode', ok: false, detail: 'xcodebuild is not available', fix: 'install Xcode and run `sudo xcode-select -s /Applications/Xcode.app`' },
      ];
      const template = xcode.code === 0 ? (await listSimulators()).find((d) => d.name === TEMPLATE_NAME) : undefined;
      const device: DoctorCheck[] = [
        template === undefined
          ? { id: 'template', ok: false, detail: `no simulator named ${TEMPLATE_NAME}`, fix: `xcrun simctl clone "iPhone Air" "${TEMPLATE_NAME}", then boot it once, trust your proxy CA, and shut it down` }
          : template.state === 'Shutdown'
            ? { id: 'template', ok: true, detail: `${TEMPLATE_NAME} (${template.runtime.replace(/^.*SimRuntime\./, '')})` }
            : { id: 'template', ok: false, detail: `${TEMPLATE_NAME} is ${template.state}; lanes clone it only while it is shut down`, fix: `xcrun simctl shutdown "${TEMPLATE_NAME}"` },
        await proxyTrustCheck(template),
        await lanePortsCheck(),
      ];
      return { toolchain, device };
    },
  };
  return backend;
}

async function proxyTrustCheck(template: Simulator | undefined): Promise<DoctorCheck> {
  const proxy = await run('scutil', ['--proxy']);
  const httpsEnabled = /HTTPSEnable\s*:\s*1/.test(proxy.stdout);
  if (!httpsEnabled) return { id: 'proxy-trust', ok: true, detail: 'no system HTTPS proxy' };
  const where = /HTTPSProxy\s*:\s*(\S+)/.exec(proxy.stdout)?.[1] ?? 'unknown';
  const port = /HTTPSPort\s*:\s*(\d+)/.exec(proxy.stdout)?.[1] ?? '';
  const proxyName = `${where}${port ? `:${port}` : ''}`;
  if (template === undefined) return { id: 'proxy-trust', ok: false, detail: `HTTPS proxy ${proxyName} is on and there is no template to check`, fix: 'create the template first (see the template check)' };
  const store = join(simulatorDataDir(template.udid), 'Library', 'Keychains', 'TrustStore.sqlite3');
  if (!existsSync(store)) {
    return { id: 'proxy-trust', ok: false, detail: `HTTPS proxy ${proxyName} is on and ${TEMPLATE_NAME} has no trust store`, fix: `boot ${TEMPLATE_NAME}, install and trust the proxy CA, then shut it down` };
  }
  const rows = await run('sqlite3', [store, 'select count(*) from tsettings']);
  const count = Number(rows.stdout.trim());
  return rows.code === 0 && count >= 1
    ? { id: 'proxy-trust', ok: true, detail: `${TEMPLATE_NAME} trusts ${count} custom CA${count === 1 ? '' : 's'} (proxy ${proxyName})` }
    : { id: 'proxy-trust', ok: false, detail: `HTTPS proxy ${proxyName} is on and ${TEMPLATE_NAME} trusts no custom CA`, fix: `boot ${TEMPLATE_NAME}, install and trust the proxy CA, then shut it down` };
}

async function lanePortsCheck(): Promise<DoctorCheck> {
  const claimed = new Set(
    readClaims(defaultClaimsDir(), 'ios')
      .filter((c) => !isOrphaned(c))
      .map((c) => c.deviceName as string),
  );
  const foreign = (await listSimulators()).filter((d) => d.state === 'Booted' && LANE_NAME.test(d.name) && !claimed.has(d.name));
  if (foreign.length === 0) return { id: 'lane-ports', ok: true, detail: 'every booted verify-ios-<n> lane has a live claim' };
  return {
    id: 'lane-ports',
    ok: false,
    detail: `booted with no live claim: ${foreign.map((d) => `${d.name} (${d.udid})`).join(', ')}`,
    fix: `if it is yours, ${foreign.map((d) => `xcrun simctl shutdown ${d.udid} && xcrun simctl delete ${d.udid}`).join('; ')}`,
  };
}
