import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { isOrphaned, readClaims } from './claims.ts';
import { INSTANCE_REQUIREMENTS, createClerkBackend, type ClerkBackend } from './clerk.ts';
import { instancesWithKeys, loadInstanceKeys } from './keys.ts';
import { backendFor, computeBuildKey, ensureLease, leaseLine, leaseView, readBuiltApp, releaseLease, selectBackend, type LeaseOutcome } from './devices.ts';
import { assertSomethingRan, collectScreenshots, contextFile, excludedTagNames, invokeE2E, parseE2EReport, planE2E, resolveSpecs, writeRunContext } from './e2e.ts';
import { startBroker } from './broker.ts';
import { assertPublishable, readRecord, readStates, sealEvidence } from './evidence.ts';
import { isRunning, type Runner } from './exec.ts';
import { deleteIdentities, ledgerAgentDeviceDaemon, pendingIdentities, readDaemonInfo, stopProcesses } from './ledgers.ts';
import { manifestDrift } from './manifest.ts';
import { postToPullRequest } from './publish.ts';
import { redact } from './secret.ts';
import { parseVerifyState } from './state.ts';
import { newEntryId, parseRunId, type Workspace } from './workspace.ts';
import {
  INSTANCE_NAMES,
  STATE_ELEMENT_ID,
  VerifyFailure,
  type ActiveRunContext,
  type AttachResult,
  type Command,
  type DeletionTarget,
  type DeviceBackend,
  type ProcessRef,
  type Recording,
  type DoctorCheck,
  type DoctorReport,
  type DownResult,
  type EvidencePath,
  type HostAdapter,
  type HostEntry,
  type InstanceName,
  type Lease,
  type LeaseView,
  type LedgerEntry,
  type Platform,
  type RunContext,
  type RunId,
  type RunResult,
  type ScratchPath,
  type ScreenNode,
  type ScreenResult,
  type SpecResult,
  type TestEmail,
  type UpResult,
  type VerifyState,
} from './types.ts';

export interface Deps {
  readonly host: HostAdapter;
  readonly workspace: Workspace;
  readonly runner: Runner;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly progress: (line: string) => void;
  readonly clerk: () => ClerkBackend;
}

export function defaultClerk(host: HostAdapter, worktree: string, env: Readonly<Record<string, string | undefined>>): () => ClerkBackend {
  let backend: ClerkBackend | undefined;
  return () => (backend ??= createClerkBackend((instance) => loadInstanceKeys(host, instance, worktree, env)));
}

const platformOf = (host: HostAdapter, platform: Platform | undefined): Platform => {
  const chosen = platform ?? host.platforms[0];
  if (chosen === undefined || !host.platforms.includes(chosen)) {
    throw new VerifyFailure('USAGE', `${host.repo} does not support ${platform}`, `use --platform ${host.platforms.join(' or ')}`);
  }
  return chosen;
};

function check(id: DoctorCheck['id'], ok: boolean, detail: string, fix: string): DoctorCheck {
  return ok ? { id, ok, detail } : { id, ok, detail, fix };
}

function readJson(file: string): Record<string, unknown> | null {
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>) : null;
}

/** ps joins argv with spaces, so every '/' after a space is a possible start of the script path. */
export function daemonScriptCandidates(command: string): readonly string[] {
  const end = command.lastIndexOf('daemon.js');
  if (end < 0) return [];
  const stop = end + 'daemon.js'.length;
  const starts = [...command.matchAll(/(?:^| )\//g)].map((m) => (m.index ?? 0) + (m[0].startsWith(' ') ? 1 : 0)).filter((i) => i < end);
  return starts.map((i) => command.slice(i, stop));
}

export function agentDeviceDaemonCheck(stateDirs: readonly { readonly label: string; readonly dir: string }[]): DoctorCheck {
  const broken: { readonly pid: number; readonly text: string }[] = [];
  const details: string[] = [];
  for (const { label, dir } of stateDirs) {
    const daemon = readDaemonInfo(dir);
    if (daemon === null || !isRunning(daemon)) {
      details.push(`${label}: no daemon running`);
      continue;
    }
    let command = '';
    try {
      command = execFileSync('ps', ['-o', 'command=', '-p', String(daemon.pid)], { encoding: 'utf8' }).trim();
    } catch {
      details.push(`${label}: no daemon running`);
      continue;
    }
    const candidates = daemonScriptCandidates(command);
    const script = candidates.find((path) => existsSync(path));
    if (candidates.length > 0 && script === undefined) {
      broken.push({ pid: daemon.pid, text: `${label}: pid ${daemon.pid} runs ${candidates[0]}, which no longer exists` });
    } else {
      details.push(`${label}: pid ${daemon.pid} from ${script ?? command}`);
    }
  }
  if (broken.length > 0) {
    return check('agent-device-daemon', false, [...broken.map((b) => b.text), ...details].join('; '), `kill ${broken.map((b) => b.pid).join(' ')}; agent-device starts a new daemon on the next command`);
  }
  return check('agent-device-daemon', true, details.join('; '), '');
}

export function featureMapCheck(skillDir: string, features: readonly string[]): DoctorCheck {
  const missing = features.flatMap((feature) => {
    const gaps: string[] = [];
    if (!existsSync(join(skillDir, 'features', `${feature}.md`))) gaps.push(`features/${feature}.md`);
    const golden = join(skillDir, 'specs', 'golden', feature);
    if (!existsSync(golden) || !readdirSync(golden).some((f) => f.endsWith('.e2e.ts'))) gaps.push(`specs/golden/${feature}/*.e2e.ts`);
    return gaps;
  });
  return check(
    'feature-map',
    missing.length === 0,
    missing.length === 0 ? `${features.length} features, each with a feature file and golden specs` : `missing ${missing.join(', ')}`,
    'add the missing feature file or golden spec, or drop the feature from features in src/host.ts',
  );
}

export async function doctor(deps: Deps, command: Extract<Command, { verb: 'doctor' }>): Promise<DoctorReport> {
  const { host, workspace, runner } = deps;
  const platform = platformOf(host, command.platform);
  const backend = selectBackend(host, platform, command.backend, workspace.readLease(platform));
  const skill = workspace.skillDir;
  const checks: DoctorCheck[] = [];

  const node = process.versions.node;
  checks.push(check('node', node.startsWith('24.'), node, 'install Node 24 (nvm install 24)'));
  const backendChecks = await backend.doctorChecks();
  checks.push(...backendChecks.toolchain);

  const pkg = readJson(join(skill, 'package.json'));
  const pins = (pkg?.devDependencies ?? {}) as Record<string, string>;
  const installed = (name: string) => readJson(join(skill, 'node_modules', name, 'package.json'))?.version as string | undefined;
  const pinned = ['e2e', '@e2e-dev/mobile'].map((name) => ({ name, want: pins[name], have: installed(name) }));
  const mobile = readJson(join(skill, 'node_modules', '@e2e-dev', 'mobile', 'package.json'));
  const wantAgentDevice = (mobile?.dependencies as Record<string, string> | undefined)?.['agent-device'];
  checks.push(
    check(
      'e2e-pins',
      pinned.every((p) => p.want !== undefined && p.want === p.have),
      pinned.map((p) => `${p.name} ${p.have ?? 'missing'}${p.have === p.want ? '' : ` (pinned ${p.want})`}`).join(', '),
      `cd ${skill} && npm ci`,
    ),
  );
  const globalAgentDevice = await runner('agent-device', ['--version']);
  const haveAgentDevice = globalAgentDevice.code === 0 ? globalAgentDevice.stdout.trim() : 'missing';
  checks.push(
    check(
      'agent-device-global',
      wantAgentDevice !== undefined && haveAgentDevice === wantAgentDevice,
      `global ${haveAgentDevice}, @e2e-dev/mobile wants ${wantAgentDevice ?? 'unknown'}`,
      `npm i -g agent-device@${wantAgentDevice ?? '<version>'}`,
    ),
  );
  checks.push(...backendChecks.device);

  let keyed: readonly InstanceName[] = [];
  try {
    const keys = instancesWithKeys(host, workspace.worktree, deps.env);
    keyed = keys.present;
    checks.push(
      check(
        'keys',
        keys.missing.length === 0,
        keys.missing.length === 0 ? `${keys.present.join(', ')} (pk and sk present)` : `missing pk or sk for ${keys.missing.join(', ')}`,
        `add ${keys.missing.join(', ')} to ${host.keysFile} in the main worktree`,
      ),
    );
  } catch (error) {
    checks.push(check('keys', false, (error as Error).message, error instanceof VerifyFailure ? error.fix : `add ${host.keysFile} to the main worktree`));
  }
  for (const instance of INSTANCE_NAMES) {
    const id = `instance:${instance}` as const;
    if (!keyed.includes(instance)) {
      checks.push(check(id, false, 'no keys', 'see the keys check'));
      continue;
    }
    try {
      const found = await deps.clerk().settings(instance);
      const want = INSTANCE_REQUIREMENTS[instance];
      const missing = [...want.strategies.filter((s) => !found.strategies.includes(s)), ...(want.organizations && !found.organizations ? ['organizations'] : [])];
      const wanted = [...want.strategies, ...(want.organizations ? ['organizations'] : [])];
      checks.push(
        check(
          id,
          missing.length === 0,
          missing.length === 0 ? `${wanted.join(', ')} enabled` : `${missing.join(', ')} not enabled`,
          `enable ${missing.join(', ')} on the ${instance} instance in the Clerk dashboard`,
        ),
      );
    } catch (error) {
      checks.push(check(id, false, `FAPI environment failed: ${(error as Error).message}`, 'check the network and the instance pk'));
    }
  }

  const key = await computeBuildKey(host, platform, workspace.worktree);
  const built = readBuiltApp(workspace, key);
  checks.push(check('build', built !== null, built === null ? `no ${host.appId(platform)} build for ${key}` : `${key} at ${built.path}`, '{cli} up'));

  const gh = await runner('gh', ['pr', 'comment', '--help']);
  checks.push(check('gh-attach', gh.code === 0 && gh.stdout.includes('--attach'), gh.code === 0 ? (gh.stdout.includes('--attach') ? 'gh pr comment supports --attach' : 'gh pr comment has no --attach') : 'gh is not installed', 'install a gh build with `gh pr comment --attach`'));

  const stale = readClaims(workspace.claimsDir, platform).filter(isOrphaned);
  checks.push(check('stale-claims', stale.length === 0, stale.length === 0 ? 'none' : `${stale.map((c) => c.deviceName).join(', ')} belong to deleted worktrees`, '{cli} down --stale'));

  checks.push(
    agentDeviceDaemonCheck([
      { label: 'machine-wide ~/.agent-device', dir: join(homedir(), '.agent-device') },
      { label: 'this worktree .verify/agent-device', dir: workspace.agentDeviceDir },
    ]),
  );
  checks.push(featureMapCheck(skill, host.features));

  const drift = manifestDrift();
  checks.push(check('core-drift', drift.length === 0, drift.length === 0 ? 'src/core matches MANIFEST' : `changed: ${drift.join(', ')}`, 'node src/core/manifest.ts --write, and copy src/core to clerk-android and clerk/javascript'));

  return { verb: 'doctor', ok: checks.every((c) => c.ok), backend: { [platform]: backend.kind }, checks };
}

type RuntimeOutcome = LeaseOutcome & { readonly entry: HostEntry };

async function startRuntime(deps: Deps, lease: Lease): Promise<HostEntry> {
  if (deps.host.runtime === undefined) return deps.host.entry(lease.platform);
  const runtime = await deps.host.runtime(lease);
  const open = deps.workspace.unclosedEntries();
  for (const process of runtime.processes) {
    if (open.some((e) => e.kind === 'process' && e.what === process.what && e.pid === process.pid)) continue;
    deps.workspace.append({ id: newEntryId(), kind: 'process', what: process.what, pid: process.pid, startedAt: new Date(process.startedAt).toISOString() });
  }
  return runtime.entry;
}

function writeStandingContext(deps: Deps, outcome: RuntimeOutcome): void {
  const context: RunContext = {
    v: 1,
    run: null,
    workspace: deps.workspace.root,
    broker: null,
    agentDeviceSession: agentDeviceSession(deps.workspace, outcome.lease.platform),
    targets: [targetOf(deps, outcome)],
    e2eVideo: false,
  };
  writeRunContext(join(deps.workspace.root, 'context.json'), context);
}

const agentDeviceSession = (workspace: Workspace, platform: Platform) => `verify-${platform}-${workspace.worktreeId}`;

function targetOf(deps: Deps, outcome: RuntimeOutcome): RunContext['targets'][number] {
  const platform = outcome.lease.platform;
  return {
    platform,
    appId: deps.host.appId(platform),
    appPath: outcome.app.path,
    buildKey: outcome.app.key,
    leaseFile: deps.workspace.leaseFile(platform),
    entry: outcome.entry,
  };
}

export async function up(deps: Deps, command: Extract<Command, { verb: 'up' }>): Promise<UpResult> {
  const platform = platformOf(deps.host, command.platform);
  return deps.workspace.withAcquireLock(platform, async (lock) => {
    const leased = await ensureLease(lock, command.backend, deps.workspace, deps.host, { waitSeconds: command.waitSeconds, progress: deps.progress, clerk: deps.clerk, retryWith: '{cli} up --wait <seconds>' });
    const outcome = { ...leased, entry: await startRuntime(deps, leased.lease) };
    writeStandingContext(deps, outcome);
    return { verb: 'up', leases: [outcome.view], builds: [outcome.build] };
  }, (owner) => deps.progress(`wait    another {cli} in this worktree (pid ${owner.pid}) is leasing the device; waiting for it, with no time limit`));
}

async function gitFacts(runner: Runner, worktree: string): Promise<{ head: string; dirty: boolean }> {
  const head = await runner('git', ['rev-parse', 'HEAD'], { cwd: worktree });
  const status = await runner('git', ['status', '--porcelain'], { cwd: worktree });
  return { head: head.stdout.trim(), dirty: status.stdout.trim().length > 0 };
}

async function runIdentities(deps: Deps, run: RunId): Promise<{ email: TestEmail; userId: string | null }[]> {
  const entries = deps.workspace.entries();
  const reserved = entries.flatMap((e) => (e.kind === 'identity' && e.run === run ? [e] : []));
  const out: { email: TestEmail; userId: string | null }[] = [];
  for (const identity of reserved) {
    let userId = entries.find((e): e is Extract<LedgerEntry, { kind: 'user' }> => e.kind === 'user' && e.email === identity.email)?.userId ?? null;
    if (userId === null) userId = await deps.clerk().findUserId(identity.instance, identity.email).catch(() => null);
    out.push({ email: identity.email, userId });
  }
  return out;
}

function lastState(dir: EvidencePath): VerifyState | null {
  try {
    return readStates(dir).at(-1) ?? null;
  } catch {
    return null;
  }
}

export async function endRun(
  workspace: Workspace,
  run: {
    readonly recording: Recording | 'e2e-records' | null;
    readonly recorderEntry: string | null;
    readonly broker: { stop(): Promise<void> };
    readonly scratch: ScratchPath;
  },
): Promise<void> {
  const steps: (() => unknown)[] = [
    async () => {
      if (run.recording !== null && run.recording !== 'e2e-records') await run.recording.stop();
    },
    () => {
      if (run.recorderEntry !== null) workspace.append({ id: newEntryId(), kind: 'done', ref: run.recorderEntry });
    },
    () => run.broker.stop(),
    () => workspace.removeScratch(run.scratch),
  ];
  const errors: unknown[] = [];
  for (const step of steps) {
    try {
      await step();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length > 0) throw errors[0];
}

export function nextStep(run: RunId, dir: EvidencePath, results: readonly SpecResult[], selection: string): string {
  const ran = assertSomethingRan(results, selection);
  const failed = results.filter((r) => r.status === 'failed' || r.status === 'interrupted');
  if (failed.length > 0) return failed[0]?.failurePage ?? join(dir, 'e2e.log');
  if (ran === 'all-left-out') return 'nothing ran: every selected spec was left out by tag or platform, so the run proves nothing to post';
  return `{cli} attach ${run} --pr <n>`;
}

export async function leaseForRun<T>(deps: Deps, platform: Platform, command: Extract<Command, { verb: 'run' }>, drive: (outcome: RuntimeOutcome) => Promise<T>): Promise<T> {
  const key = await computeBuildKey(deps.host, platform, deps.workspace.worktree);
  const retryWith = `{cli} run ${'all' in command.selection ? '--all' : command.selection.selectors.join(' ')} --wait <seconds>`;
  const deviceWait = {
    seconds: command.waitSeconds,
    busyFix: `let the other run in this worktree finish, or rerun with a wait: ${retryWith}`,
    onWait: (owner: ProcessRef) => deps.progress(`wait    another {cli} run in this worktree (pid ${owner.pid}) is driving the device; waiting up to ${command.waitSeconds}s`),
  };
  return deps.workspace.withAcquireThenDevice(
    platform,
    deviceWait,
    async (lock) => {
      const leased = await ensureLease(lock, command.backend, deps.workspace, deps.host, { waitSeconds: command.waitSeconds, progress: deps.progress, clerk: deps.clerk, retryWith });
      const outcome: RuntimeOutcome = { ...leased, entry: await startRuntime(deps, leased.lease) };
      writeStandingContext(deps, outcome);
      deps.progress(leaseLine(outcome.view));
      return outcome;
    },
    drive,
    (owner) => deps.progress(`wait    another {cli} in this worktree (pid ${owner.pid}) is building ${key} or leasing the device; waiting for it, with no time limit`),
  );
}

export async function runVerb(deps: Deps, command: Extract<Command, { verb: 'run' }>): Promise<RunResult> {
  const { host, workspace } = deps;
  const platform = platformOf(host, command.platform);
  const specs = resolveSpecs(workspace.skillDir, command.selection);
  return leaseForRun(deps, platform, command, async (outcome) => {
    try {
      const { lease, backend } = outcome;
      const { run, dir, scratch } = workspace.newRun();
      const startedAt = new Date();
      deps.progress(`run ${run}  ${platform}  ${outcome.view.backend} ${outcome.view.device}  build ${outcome.app.key}`);
      for (const spec of specs) {
        mkdirSync(dirname(join(dir, spec.path)), { recursive: true });
        cpSync(join(workspace.skillDir, spec.path), join(dir, spec.path));
      }

      const broker = await startBroker(run, workspace, scratch, {
        clerk: deps.clerk(),
        publishableKey: (instance) => loadInstanceKeys(host, instance, workspace.worktree, deps.env).pk,
        screens: host.screens,
        platforms: [platform],
      });
      const context: ActiveRunContext = {
        v: 1,
        run,
        workspace: workspace.root,
        broker: { url: broker.url, tokenFile: broker.tokenFile },
        agentDeviceSession: agentDeviceSession(workspace, platform),
        targets: [targetOf(deps, outcome)],
        e2eVideo: false,
      };
      writeRunContext(contextFile(context), context);

      let recording: Awaited<ReturnType<DeviceBackend['startRecording']>> | null = null;
      let recorderEntry: string | null = null;
      let exitCode = 1;
      try {
        if (command.video) {
          recording = await backend.startRecording(lease, dir);
          if (recording !== 'e2e-records') {
            recorderEntry = newEntryId();
            workspace.append({ id: recorderEntry, kind: 'process', what: 'recorder', pid: recording.process.pid, startedAt: new Date(recording.process.startedAt).toISOString() });
          }
        }
        const invocation = planE2E(context, specs, command, platform, workspace.skillDir);
        ({ exitCode } = await invokeE2E(invocation, join(dir, 'e2e.log') as EvidencePath, workspace.skillDir, deps.progress));
      } finally {
        await endRun(workspace, { recording, recorderEntry, broker, scratch });
      }

      const appLog = join(dir, 'app.log') as EvidencePath;
      writeFileSync(appLog, redact(await backend.logs(lease, startedAt, host.logPredicates?.[platform])));
      const state = lastState(dir);
      if (state !== null) writeFileSync(join(dir, 'state.json'), `${JSON.stringify(state, null, 2)}\n`);

      const reportFile = join(dir, 'e2e', 'report.json') as EvidencePath;
      let report: unknown = null;
      let results: ReturnType<typeof parseE2EReport> = [];
      let screenshots: ReturnType<typeof collectScreenshots> = [];
      let unreadable: VerifyFailure | null = null;
      try {
        report = existsSync(reportFile) ? JSON.parse(readFileSync(reportFile, 'utf8')) : null;
        results = report === null ? [] : parseE2EReport(report, specs, dir, excludedTagNames(command));
        screenshots = report === null ? [] : collectScreenshots(report, dir);
      } catch (error) {
        unreadable = error instanceof VerifyFailure ? error : new VerifyFailure('E2E_CRASHED', `e2e's report could not be read: ${(error as Error).message}`, `read ${reportFile}`);
        results = [];
        screenshots = [];
      }
      const git = await gitFacts(deps.runner, workspace.worktree);
      const record = sealEvidence(dir, {
        run,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        repo: host.repo,
        gitHead: git.head,
        dirty: git.dirty,
        platform,
        backend: lease.backend,
        device: outcome.view.device,
        build: outcome.app.key,
        results,
        videos: existsSync(join(dir, 'video.mp4')) ? [join(dir, 'video.mp4') as EvidencePath] : [],
        screenshots,
        lastState: state,
        appLog,
        e2eReport: reportFile,
        identities: await runIdentities(deps, run),
      });
      if (unreadable !== null) throw unreadable;
      if (report === null) {
        throw new VerifyFailure('E2E_CRASHED', `e2e exited ${exitCode} before writing a report`, `read ${join(dir, 'e2e.log')}`);
      }
      const next = nextStep(run, dir, results, 'all' in command.selection ? '--all' : command.selection.selectors.join(' '));
      return { verb: 'run', dir, record, next };
    } finally {
      ledgerAgentDeviceDaemon(workspace);
    }
  });
}

interface SnapshotNode {
  readonly kind?: string;
  readonly type?: string;
  readonly label?: string;
  readonly value?: string;
  readonly identifier?: string;
  readonly depth?: number;
}

function heldLease(deps: Deps, platform: Platform): { lease: Lease; backend: DeviceBackend } {
  const lease = deps.workspace.readLease(platform);
  if (lease === null) throw new VerifyFailure('NOT_READY', `this worktree holds no ${platform} device`, '{cli} up');
  return { lease, backend: backendFor(deps.host, platform, lease.backend) };
}

export function screenNodes(snapshot: readonly SnapshotNode[]): readonly ScreenNode[] {
  const counts = new Map<string, number>();
  for (const node of snapshot) if (node.identifier) counts.set(node.identifier, (counts.get(node.identifier) ?? 0) + 1);
  return snapshot.map((node) => {
    const testId = node.identifier || null;
    const text = node.value || null;
    return {
      role: (node.kind ?? node.type ?? 'node').toLowerCase(),
      name: node.label || null,
      testId,
      text,
      depth: node.depth ?? 0,
      locator: testId !== null && counts.get(testId) === 1 ? `screen.getByTestId('${testId}')` : null,
    };
  });
}

export async function screen(deps: Deps, command: Extract<Command, { verb: 'screen' }>): Promise<ScreenResult> {
  const platform = platformOf(deps.host, command.platform);
  const { lease, backend } = heldLease(deps, platform);
  if ((await backend.check(lease)) !== 'held') throw new VerifyFailure('LEASE_LOST', `${backend.describe(lease)} is gone`, '{cli} up');
  const { CLERK_TEST_KEYS_JSON: _keys, ...env } = deps.env;
  const agentDevice = (args: readonly string[]) =>
    deps.runner(join(deps.workspace.skillDir, 'node_modules', '.bin', 'agent-device'), args, { env: { ...env, AGENT_DEVICE_STATE_DIR: deps.workspace.agentDeviceDir } });
  const screenWait = { seconds: 10, busyFix: 'let the run in this worktree finish, then rerun {cli} screen' };
  return deps.workspace.withDevice(platform, screenWait, async () => {
    const target = backend.agentDeviceTarget(lease);
    const selector = platform === 'ios' ? ['--platform', 'ios', '--udid', target.deviceId] : ['--platform', 'android', '--serial', target.deviceId];
    const session = ['--session', `${agentDeviceSession(deps.workspace, platform)}-screen`];
    // Without --relaunch, open attaches the session to the running app process instead of restarting it.
    const opened = await agentDevice(['open', deps.host.appId(platform), '--json', ...selector, ...session]);
    if (opened.code !== 0) throw new VerifyFailure('NOT_READY', `agent-device open failed: ${redact(opened.stdout.trim() || opened.stderr.trim())}`, '{cli} up, then retry');
    const snap = await agentDevice(['snapshot', '--json', ...selector, ...session]);
    if (snap.code !== 0) throw new VerifyFailure('NOT_READY', `agent-device snapshot failed: ${redact(snap.stderr.trim() || snap.stdout.trim())}`, 'run a spec first so the app is open, then retry');
    const parsed = JSON.parse(snap.stdout) as { data?: { nodes?: SnapshotNode[] } };
    const nodes = screenNodes(parsed.data?.nodes ?? []);
    const stateNode = nodes.find((n) => n.testId === STATE_ELEMENT_ID);
    const stateText = stateNode?.text ?? stateNode?.name ?? null;
    let state: VerifyState | null = null;
    if (stateText !== null) {
      try {
        state = parseVerifyState(stateText);
      } catch {
        state = null;
      }
    }
    let png: ScratchPath | null = null;
    if (command.png) {
      const dir = join(deps.workspace.root, 'scratch', 'screens');
      mkdirSync(dir, { recursive: true });
      png = join(dir, `${new Date().toISOString().replace(/[:.]/g, '-')}.png`) as ScratchPath;
      const shot = await agentDevice(['screenshot', png, ...selector, ...session]);
      if (shot.code !== 0) throw new VerifyFailure('NOT_READY', `agent-device screenshot failed: ${redact(shot.stderr.trim())}`, 'retry, or check `{cli} doctor`');
    }
    await agentDevice(['close', ...selector, ...session]);
    ledgerAgentDeviceDaemon(deps.workspace);
    return { verb: 'screen', platform, device: backend.describe(lease), nodes, state, png };
  });
}

export async function attach(deps: Deps, command: Extract<Command, { verb: 'attach' }>): Promise<AttachResult> {
  const run = parseRunId(command.run);
  const dir = deps.workspace.runDir(run);
  if (!existsSync(dir)) throw new VerifyFailure('USAGE', `no run ${run} in ${deps.workspace.root}/runs`, 'pass a run id that `{cli} run` printed');
  const record = readRecord(dir);
  const publishable = assertPublishable(record, readStates(dir));
  return postToPullRequest(publishable, dir, deps.host, command.pr, command.screenshots, deps.runner);
}

interface DownPlan {
  readonly leases: readonly { readonly lease: Lease; readonly backend: DeviceBackend; readonly view: LeaseView; readonly origin: 'lease-file' | 'stale-claim' }[];
  readonly identities: readonly { readonly instance: InstanceName; readonly email: TestEmail; readonly entries: readonly string[] }[];
  readonly processes: readonly Extract<LedgerEntry, { kind: 'process' }>[];
  readonly staleIntents: readonly string[];
}

async function planDown(deps: Deps, command: Extract<Command, { verb: 'down' }>): Promise<DownPlan> {
  const { host, workspace } = deps;
  const platforms = command.platform === undefined ? host.platforms : [platformOf(host, command.platform)];
  const leases: DownPlan['leases'][number][] = [];
  for (const platform of platforms) {
    const lease = workspace.readLease(platform);
    if (lease !== null) {
      const backend = backendFor(host, platform, lease.backend);
      leases.push({ lease, backend, view: leaseView(backend, lease, false), origin: 'lease-file' });
    }
    if (command.stale) {
      for (const backend of host.backends.filter((b) => b.platform === platform && b.supports(process.platform))) {
        for (const orphan of await backend.reapable(workspace.worktree)) {
          if (leases.some((l) => l.lease.backend === 'local' && orphan.backend === 'local' && l.lease.claimNonce === orphan.claimNonce)) continue;
          leases.push({ lease: orphan, backend, view: leaseView(backend, orphan, false), origin: 'stale-claim' });
        }
      }
    }
  }
  const pending = workspace.unclosedEntries();
  return {
    leases,
    identities: pendingIdentities(pending),
    processes: pending.filter((e): e is Extract<LedgerEntry, { kind: 'process' }> => e.kind === 'process'),
    staleIntents: command.stale ? pending.filter((e) => e.kind === 'lease-intent' || e.kind === 'eas-session-created').map((e) => e.id) : [],
  };
}

export function down(deps: Deps, command: Extract<Command, { verb: 'down' }>): Promise<DownResult> {
  if (command.dryRun) return downUnlocked(deps, command);
  const platforms = command.platform === undefined ? deps.host.platforms : [platformOf(deps.host, command.platform)];
  const locked = platforms.reduce<() => Promise<DownResult>>(
    (inner, platform) => () =>
      deps.workspace.withAcquireLock(
        platform,
        () =>
          deps.workspace.withDevice(
            platform,
            {
              seconds: Number.POSITIVE_INFINITY,
              busyFix: '',
              onWait: (owner) => deps.progress(`wait    another {cli} run in this worktree (pid ${owner.pid}) is driving the device; down waits for it, with no time limit`),
            },
            inner,
          ),
        (owner) => deps.progress(`wait    another {cli} in this worktree (pid ${owner.pid}) is building or leasing the device; down waits for it, with no time limit`),
      ),
    () => downUnlocked(deps, command),
  );
  return locked();
}

function runningDaemon(workspace: Workspace): readonly string[] {
  const daemon = readDaemonInfo(workspace.agentDeviceDir);
  return daemon !== null && isRunning(daemon) ? [`agent-device ${daemon.pid}`] : [];
}

async function downUnlocked(deps: Deps, command: Extract<Command, { verb: 'down' }>): Promise<DownResult> {
  const { workspace } = deps;
  if (!command.dryRun) ledgerAgentDeviceDaemon(workspace);
  const plan = await planDown(deps, command);
  if (command.dryRun) {
    const wouldDelete: DeletionTarget[] = [];
    for (const identity of plan.identities) wouldDelete.push(...(await deps.clerk().previewDeleteByEmail(identity.instance, identity.email)));
    return {
      verb: 'down',
      dryRun: true,
      wouldRelease: plan.leases.map((l) => l.view),
      wouldDelete,
      wouldStop: [...new Set([...plan.processes.filter((p) => isRunning({ pid: p.pid, startedAt: Date.parse(p.startedAt) })).map((p) => `${p.what} ${p.pid}`), ...runningDaemon(workspace)])],
      keptRuns: workspace.runs(),
    };
  }
  const stoppedProcesses = stopProcesses(workspace);
  for (const { lease, backend, origin } of plan.leases) {
    if (origin === 'lease-file') await releaseLease(workspace, backend, lease);
    else await backend.release(lease);
  }
  const deleted = await deleteIdentities(workspace, deps.clerk());
  for (const ref of plan.staleIntents) workspace.append({ id: newEntryId(), kind: 'done', ref });
  if (plan.leases.some((l) => l.origin === 'lease-file')) rmSync(join(workspace.root, 'context.json'), { force: true });
  return {
    verb: 'down',
    dryRun: false,
    released: plan.leases.map((l) => l.view),
    deletedUsers: deleted.users,
    deletedOrganizations: deleted.organizations,
    stoppedProcesses,
    keptRuns: workspace.runs(),
  };
}

export const verbs = { doctor, up, run: runVerb, screen, attach, down } as const;
