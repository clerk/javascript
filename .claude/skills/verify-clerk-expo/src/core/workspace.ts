import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { currentProcess, isRunning, sleep, type ProcessRef } from './exec.ts';
import { compareAndSwapSlot, readSlot } from './slot.ts';
import {
  VerifyFailure,
  type AcquireLock,
  type DeviceWait,
  type EvidencePath,
  type Lease,
  type LedgerEntry,
  type Platform,
  type RunId,
  type ScratchPath,
} from './types.ts';

export interface WorkspaceOptions {
  readonly skillDir: string;
  readonly worktree: string;
  readonly home?: string;
}

export interface Workspace {
  readonly root: string;
  readonly skillDir: string;
  readonly worktree: string;
  readonly worktreeId: string;
  readonly home: string;
  readonly ledgerFile: string;
  readonly claimsDir: string;
  readonly agentDeviceDir: string;
  newRun(): { readonly run: RunId; readonly dir: EvidencePath; readonly scratch: ScratchPath };
  runDir(run: RunId): EvidencePath;
  runs(): readonly RunId[];
  buildsDir(): ScratchPath;
  leaseFile(platform: Platform): string;
  readLease(platform: Platform): Lease | null;
  writeLease(lease: Lease): void;
  clearLease(platform: Platform): void;
  append(entry: LedgerEntry): void;
  entries(): readonly LedgerEntry[];
  unclosedEntries(): readonly LedgerEntry[];
  withAcquireLock<T>(platform: Platform, fn: (lock: AcquireLock) => Promise<T>, onWait?: (owner: ProcessRef) => void): Promise<T>;
  withDevice<T>(platform: Platform, wait: DeviceWait, fn: () => Promise<T>): Promise<T>;
  withAcquireThenDevice<A, T>(
    platform: Platform,
    deviceWait: DeviceWait,
    prepare: (lock: AcquireLock) => Promise<A>,
    drive: (prepared: A) => Promise<T>,
    onAcquireWait?: (owner: ProcessRef) => void,
  ): Promise<T>;
  removeScratch(path: ScratchPath): void;
}

export const newEntryId = (): string => randomUUID();

export const agentDeviceStateDir = (workspaceRoot: string): string => join(workspaceRoot, 'agent-device');

function worktreeIdOf(worktree: string): string {
  return createHash('sha256').update(resolve(worktree)).digest('hex').slice(0, 12);
}

export function newRunId(): RunId {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `r${date}-${time}-${randomBytes(2).toString('hex')}` as RunId;
}

const RUN_ID = /^r\d{8}-\d{6}-[0-9a-f]{4}$/;
export function parseRunId(value: string): RunId {
  if (!RUN_ID.test(value)) throw new VerifyFailure('USAGE', `${value} is not a run id`, 'pass an id like r20261002-141210-7c1e from `{cli} run`');
  return value as RunId;
}

function isPlatform(value: unknown): value is Platform {
  return value === 'ios' || value === 'android';
}

function parseLease(text: string, file: string): Lease {
  const raw: unknown = JSON.parse(text);
  const bad = () => new VerifyFailure('LEASE_LOST', `${file} is not a lease`, '{cli} down, then {cli} up');
  if (typeof raw !== 'object' || raw === null) throw bad();
  const r = raw as Record<string, unknown>;
  if (!isPlatform(r.platform) || typeof r.acquiredAt !== 'string') throw bad();
  const installedBuild = typeof r.installedBuild === 'string' ? r.installedBuild : null;
  if (r.backend === 'local') {
    if (typeof r.slot !== 'number' || typeof r.deviceName !== 'string' || typeof r.deviceId !== 'string' || typeof r.claimNonce !== 'string') throw bad();
    if (r.deviceName !== `verify-${r.platform}-${r.slot}`) throw bad();
    return { ...(r as object), installedBuild } as Lease;
  }
  if (r.backend === 'remote') {
    const strings = ['provider', 'session', 'providerRef', 'baseUrl', 'tokenFile', 'deviceId', 'deviceName', 'runner', 'expiresAt'];
    if (strings.some((name) => typeof r[name] !== 'string')) throw bad();
    return { ...(r as object), installedBuild, builtSha: typeof r.builtSha === 'string' ? r.builtSha : null } as Lease;
  }
  throw bad();
}

function writePrivate(file: string, text: string): void {
  writeFileSync(file, text, { mode: 0o600 });
}

function lockOwner(value: string | null): ProcessRef | null {
  if (value === null) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { pid, startedAt } = parsed as Partial<ProcessRef>;
    return typeof pid === 'number' && typeof startedAt === 'number' ? { pid, startedAt } : null;
  } catch {
    return null;
  }
}

export async function takeSlotLock(dir: string, timeoutMs: number, onTimeout: () => VerifyFailure, onWait?: (owner: ProcessRef) => void): Promise<() => void> {
  const deadline = Date.now() + timeoutMs;
  const me = currentProcess();
  let announced = false;
  for (;;) {
    const state = readSlot(dir);
    const owner = lockOwner(state.value);
    const running = owner !== null && isRunning(owner);
    if (!running && compareAndSwapSlot(dir, state.gen, JSON.stringify(me))) {
      const held = state.gen + 1;
      return () => void compareAndSwapSlot(dir, held, null);
    }
    if (owner !== null && running) {
      if (Date.now() >= deadline) throw onTimeout();
      if (!announced && onWait !== undefined) onWait(owner);
      announced = true;
      await sleep(250);
    }
  }
}

async function withSlotLock<T>(dir: string, timeoutMs: number, onTimeout: () => VerifyFailure, fn: () => Promise<T>, onWait?: (owner: ProcessRef) => void): Promise<T> {
  const release = await takeSlotLock(dir, timeoutMs, onTimeout, onWait);
  try {
    return await fn();
  } finally {
    release();
  }
}

const deviceBusy = (platform: Platform, fix: string) =>
  new VerifyFailure('DEVICE_BUSY', `another {cli} process in this worktree is driving the ${platform} device`, fix);

export function openWorkspace(options: WorkspaceOptions): Workspace {
  const root = join(options.skillDir, '.verify');
  const home = options.home ?? join(homedir(), '.verify');
  const worktreeId = worktreeIdOf(options.worktree);
  const ledgerFile = join(home, 'ledgers', `${worktreeId}.jsonl`);
  const claimsDir = join(home, 'claims');
  const dir = (...parts: string[]) => {
    const path = join(root, ...parts);
    mkdirSync(path, { recursive: true });
    return path;
  };
  const readEntries = (): LedgerEntry[] => {
    if (!existsSync(ledgerFile)) return [];
    return readFileSync(ledgerFile, 'utf8')
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as LedgerEntry);
  };

  const acquireDir = (platform: Platform) => join(dir('locks'), `acquire-${platform}`);
  const unreachable = () => new VerifyFailure('DEVICE_BUSY', 'unreachable', '');

  return {
    root,
    skillDir: options.skillDir,
    worktree: options.worktree,
    worktreeId,
    home,
    ledgerFile,
    claimsDir,
    agentDeviceDir: agentDeviceStateDir(root),
    newRun() {
      const run = newRunId();
      return { run, dir: dir('runs', run) as EvidencePath, scratch: dir('scratch', run) as ScratchPath };
    },
    runDir: (run) => join(root, 'runs', run) as EvidencePath,
    runs: () => (existsSync(join(root, 'runs')) ? readdirSync(join(root, 'runs')).filter((name) => RUN_ID.test(name)).sort() as RunId[] : []),
    buildsDir: () => join(root, 'builds') as ScratchPath,
    leaseFile: (platform) => join(root, 'leases', `${platform}.json`),
    readLease(platform) {
      const file = join(root, 'leases', `${platform}.json`);
      return existsSync(file) ? parseLease(readFileSync(file, 'utf8'), file) : null;
    },
    writeLease(lease) {
      writePrivate(join(dir('leases'), `${lease.platform}.json`), `${JSON.stringify(lease, null, 2)}\n`);
    },
    clearLease(platform) {
      rmSync(join(root, 'leases', `${platform}.json`), { force: true });
    },
    append(entry) {
      mkdirSync(join(home, 'ledgers'), { recursive: true });
      const owner = join(home, 'ledgers', `${worktreeId}.owner`);
      if (!existsSync(owner)) writePrivate(owner, `${resolve(options.worktree)}\n${resolve(options.skillDir)}\n`);
      appendFileSync(ledgerFile, `${JSON.stringify(entry)}\n`, { mode: 0o600, flag: 'a' });
    },
    entries: readEntries,
    unclosedEntries() {
      const entries = readEntries();
      const closed = new Set(entries.flatMap((e) => (e.kind === 'done' ? [e.ref] : [])));
      return entries.filter((e) => e.kind !== 'done' && !closed.has(e.id));
    },
    withAcquireLock(platform, fn, onWait) {
      return withSlotLock(acquireDir(platform), Number.POSITIVE_INFINITY, unreachable, () => fn({ platform } as AcquireLock), onWait);
    },
    withDevice(platform, wait, fn) {
      return withSlotLock(join(dir('locks'), `device-${platform}`), wait.seconds * 1000, () => deviceBusy(platform, wait.busyFix), fn, wait.onWait);
    },
    async withAcquireThenDevice(platform, deviceWait, prepare, drive, onAcquireWait) {
      const releaseAcquire = await takeSlotLock(acquireDir(platform), Number.POSITIVE_INFINITY, unreachable, onAcquireWait);
      let prepared;
      let releaseDevice;
      try {
        prepared = await prepare({ platform } as AcquireLock);
        releaseDevice = await takeSlotLock(join(dir('locks'), `device-${platform}`), deviceWait.seconds * 1000, () => deviceBusy(platform, deviceWait.busyFix), deviceWait.onWait);
      } finally {
        releaseAcquire();
      }
      try {
        return await drive(prepared);
      } finally {
        releaseDevice();
      }
    },
    removeScratch(path) {
      const rel = relative(root, path);
      if (!(rel.startsWith('scratch') || rel.startsWith('builds')) || rel.includes('..')) {
        throw new VerifyFailure('EVIDENCE_UNSAFE', `${path} is not scratch`, 'only .verify/scratch and .verify/builds are deletable');
      }
      rmSync(path, { recursive: true, force: true });
    },
  };
}
