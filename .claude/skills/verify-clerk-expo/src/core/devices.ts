import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Instances } from './instances/instances.ts';
import { run } from './exec.ts';
import { finishOrphanLedgers } from './ledgers.ts';
import { newEntryId, type Workspace } from './workspace.ts';
import {
  VerifyFailure,
  type AcquireLock,
  type BackendKind,
  type BuildKey,
  type BuildView,
  type BuiltApp,
  type DeviceBackend,
  type HostAdapter,
  type Lease,
  type LeaseView,
  type ProcessRef,
  type Platform,
  type ScratchPath,
} from './types.ts';

export interface LeaseOutcome {
  readonly lease: Lease;
  readonly backend: DeviceBackend;
  readonly app: BuiltApp;
  readonly view: LeaseView;
  readonly build: BuildView;
}

export function backendFor(host: HostAdapter, platform: Platform, kind: BackendKind): DeviceBackend {
  const backend = host.backends.find((b) => b.platform === platform && b.kind === kind);
  if (backend === undefined) throw new VerifyFailure('UNSUPPORTED', `${host.repo} has no ${kind} backend for ${platform}`, `${host.repo} has no ${platform} backend`);
  return backend;
}

export function selectBackend(host: HostAdapter, platform: Platform): DeviceBackend {
  const candidates = host.backends.filter((b) => b.platform === platform).map((backend) => ({ backend, availability: backend.availability() }));
  const chosen = candidates.find((c) => c.availability.usable);
  if (chosen === undefined) {
    const out = candidates.map((c) => `${c.backend.kind}: ${c.availability.why}`).join('; ');
    throw new VerifyFailure('UNSUPPORTED', `no ${platform} backend runs on this machine${out === '' ? '' : ` (${out})`}`, candidates.length === 0 ? `${host.repo} has no ${platform} backend` : `run on ${candidates.map((c) => c.backend.requirement).join(' or ')}`);
  }
  return chosen.backend;
}

export function leaseView(backend: DeviceBackend, lease: Lease, renewed: boolean): LeaseView {
  return {
    platform: lease.platform,
    backend: lease.backend,
    device: backend.describe(lease),
    installedBuild: lease.installedBuild,
    renewed,
  };
}

export function leaseLine(view: LeaseView): string {
  return `device  ${view.device}  ${view.backend}  ${view.renewed ? 'renewed' : 'leased by this worktree'}  installed ${view.installedBuild ?? 'nothing'}`;
}

const BUILD_DENYLIST = [/\.md$/i, /(^|\/)\.claude\//, /(^|\/)docs\//, /(^|\/)\.verify\//];

export async function computeBuildKey(host: HostAdapter, platform: Platform, worktree: string): Promise<BuildKey> {
  const listed = await run('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...host.buildInputs(platform)], { cwd: worktree });
  if (listed.code !== 0) throw new VerifyFailure('NOT_READY', `git ls-files failed: ${listed.stderr.trim()}`, 'run {cli} from inside a git worktree');
  const files = [...new Set(listed.stdout.split('\0').filter((f) => f.length > 0 && !BUILD_DENYLIST.some((re) => re.test(f))))].sort();
  const hash = createHash('sha256');
  for (const file of files) {
    const path = join(worktree, file);
    hash.update(file).update('\0');
    hash.update(existsSync(path) ? readFileSync(path) : 'deleted').update('\0');
  }
  return `${platform}-${hash.digest('hex').slice(0, 12)}` as BuildKey;
}

function buildDir(workspace: Workspace, key: BuildKey): ScratchPath {
  return join(workspace.buildsDir(), key) as ScratchPath;
}

export function readBuiltApp(workspace: Workspace, key: BuildKey): BuiltApp | null {
  const file = join(buildDir(workspace, key), 'build.json');
  if (!existsSync(file)) return null;
  const app = JSON.parse(readFileSync(file, 'utf8')) as BuiltApp;
  return existsSync(app.path) ? app : null;
}

async function ensureBuild(host: HostAdapter, platform: Platform, workspace: Workspace, progress: (line: string) => void): Promise<{ app: BuiltApp; view: BuildView }> {
  const key = await computeBuildKey(host, platform, workspace.worktree);
  const existing = readBuiltApp(workspace, key);
  if (existing !== null) return { app: existing, view: { platform, key, source: existing.source, reused: true, seconds: 0 } };
  const started = Date.now();
  progress(`build   ${key}  local  building...`);
  const into = buildDir(workspace, key);
  mkdirSync(into, { recursive: true });
  const app = await host.build(platform, key, into, progress);
  writeFileSync(join(into, 'build.json'), `${JSON.stringify(app, null, 2)}\n`);
  return { app, view: { platform, key, source: 'local', reused: false, seconds: Math.round((Date.now() - started) / 1000) } };
}

function closePending(workspace: Workspace, platform: Platform): void {
  for (const entry of workspace.unclosedEntries()) {
    if ((entry.kind === 'lease-intent' || entry.kind === 'lease-held') && entry.platform === platform) {
      workspace.append({ id: newEntryId(), kind: 'done', ref: entry.id });
    }
  }
}

export async function releaseLease(workspace: Workspace, backend: DeviceBackend, lease: Lease): Promise<void> {
  await backend.release(lease);
  workspace.clearLease(lease.platform);
  closePending(workspace, lease.platform);
}

export async function ensureLease(
  lock: AcquireLock,
  workspace: Workspace,
  host: HostAdapter,
  options: { readonly waitSeconds: number; readonly progress: (line: string) => void; readonly instances: Instances; readonly retryWith: string },
): Promise<LeaseOutcome> {
  const { platform } = lock;
  const held = workspace.readLease(platform);
  const backend = selectBackend(host, platform);
  for (const stale of await backend.reapable()) {
    options.progress(`reap    ${backend.describe(stale)}  (owner process and worktree are gone)`);
    await backend.release(stale);
  }
  await finishOrphanLedgers(workspace.home, resolve(workspace.worktree), options.instances, options.progress);

  const { app, view: build } = await ensureBuild(host, platform, workspace, options.progress);
  const builtBy = build.reused ? 'reused' : `built in ${build.seconds}s`;
  options.progress(`build   ${build.key}  ${build.source}  ${builtBy}`);

  let lease: Lease | null = held;
  let renewed = false;
  const state = lease === null ? 'held' : await backend.check(lease);
  if (lease !== null && state !== 'held') {
    options.progress(`lost    ${backend.describe(lease)}  renewing`);
    await releaseLease(workspace, backend, lease);
    lease = null;
    renewed = true;
  }
  if (lease === null) {
    for (const orphan of await backend.reapable(workspace.worktree)) {
      options.progress(`reap    ${backend.describe(orphan)}  (claimed by this worktree with no lease file)`);
      await backend.release(orphan);
    }
    const intent = { id: newEntryId(), kind: 'lease-intent' as const, platform, backend: backend.kind, worktree: workspace.worktree };
    workspace.append(intent);
    const acquired = await backend.acquire({ platform, worktree: workspace.worktree, waitSeconds: options.waitSeconds, retryWith: options.retryWith, progress: options.progress });
    workspace.writeLease(acquired);
    workspace.append({
      id: newEntryId(),
      kind: 'lease-held',
      platform,
      backend: backend.kind,
      deviceId: acquired.deviceId,
    });
    workspace.append({ id: newEntryId(), kind: 'done', ref: intent.id });
    lease = acquired;
  }

  if (lease.installedBuild !== app.key) {
    const target = lease;
    options.progress(`install ${app.key}  on ${backend.describe(target)}`);
    const wait = {
      seconds: options.waitSeconds,
      busyFix: `let the run in this worktree finish, or rerun with a wait: ${options.retryWith}`,
      onWait: (owner: ProcessRef) =>
        options.progress(`wait    another {cli} run in this worktree (pid ${owner.pid}) is driving the device; waiting up to ${options.waitSeconds}s to install`),
    };
    lease = { ...(await workspace.withDevice(platform, wait, () => backend.install(target, app))), installedBuild: app.key };
    workspace.writeLease(lease);
  }
  return { lease, backend, app, build, view: leaseView(backend, lease, renewed) };
}
