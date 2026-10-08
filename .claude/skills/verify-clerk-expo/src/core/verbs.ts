import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { isOrphaned, readClaims } from './claims.ts';
import { check, type AppliedInstance, type Instances } from './instances/instances.ts';
import { STANDARD, SettingsRefused, planGroups, readSpecText, settingsFileOf, sourceHash, straySettingsFile, type SettingsGroup } from './instances/settings.ts';
import { agentCheck, type Agent, type AgentSource } from './agent.ts';
import { withoutClerkKeys } from './keys.ts';
import { supportsNode } from './launch.mjs';
import { openApplications } from './instances/throwaway.ts';
import { agentDeviceFor } from './agent-device.ts';
import { backendFor, computeBuildKey, describeChoice, ensureLease, leaseLine, leaseView, readBuiltApp, releaseLease, selectBackend, type BackendChoice, type LeaseOutcome } from './devices.ts';
import { assertSomethingRan, collectScreenshots, contextFile, e2eOutputDir, invokeE2E, parseE2EReport, planE2E, resolveSpecs, writeRunContext } from './e2e.ts';
import { startBroker } from './broker.ts';
import { assertPublishable, loggedUserIds, readRecord, sealEvidence } from './evidence.ts';
import { protectGitHubTokens, reportToGitHub } from './github-report.ts';
import { isRunning, type Runner } from './exec.ts';
import { ledgerAgentDeviceDaemon, processesIn, readDaemonInfo, stopProcesses, type ProcessEntry } from './ledgers.ts';
import { manifestDrift } from './manifest.ts';
import { missingAttach, postToPullRequest } from './publish.ts';
import { redact } from './secret.ts';
import { count } from './state.ts';
import { newEntryId, parseRunId, type Workspace } from './workspace.ts';
import {
  VerifyFailure,
  type ActiveRunContext,
  type AttachResult,
  type BackendKind,
  type Command,
  type DeviceBackend,
  type ProcessRef,
  type Recording,
  type DoctorCheck,
  type DoctorReport,
  type DownResult,
  type EvidencePath,
  type EvidenceRecord,
  type HostAdapter,
  type HostEntry,
  type InstanceView,
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
  type SpecRef,
  type SpecResult,
  type UpResult,
} from './types.ts';

export interface Deps {
  readonly host: HostAdapter;
  readonly workspace: Workspace;
  readonly runner: Runner;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly progress: (line: string) => void;
  readonly instances: Instances;
  readonly agent?: AgentSource;
}

async function leaseWithInstances(deps: Deps, instances: { readonly willChange: boolean }, lease: () => Promise<LeaseOutcome>): Promise<[LeaseOutcome, readonly InstanceView[]]> {
  await deps.instances.access();
  if (instances.willChange) {
    const ensured = await deps.instances.ensure(instances, deps.progress);
    return [await lease(), ensured];
  }
  const [leased, ensured] = await Promise.allSettled([lease(), deps.instances.ensure(instances, deps.progress)]);
  if (leased.status === 'rejected') throw leased.reason;
  if (ensured.status === 'rejected') {
    const failure = ensured.reason instanceof VerifyFailure ? ensured.reason : new VerifyFailure('NOT_READY', (ensured.reason as Error).message, 'run `{cli} doctor`');
    throw new VerifyFailure(failure.code, failure.message, `${failure.fix}; the device stays leased until \`{cli} down\``);
  }
  return [leased.value, ensured.value];
}

const platformOf = (host: HostAdapter, platform: Platform | undefined): Platform => {
  const chosen = platform ?? host.platforms[0];
  if (chosen === undefined || !host.platforms.includes(chosen)) {
    throw new VerifyFailure('USAGE', `${host.repo} does not support ${platform}`, `use --platform ${host.platforms.join(' or ')}`);
  }
  return chosen;
};

function chooseBackend(deps: Deps, platform: Platform, command: { readonly backend?: BackendKind }): BackendChoice {
  return selectBackend(deps.host, platform, command.backend, deps.workspace.readLease(platform));
}

function readJson(file: string): Record<string, unknown> | null {
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>) : null;
}

export async function doctor(deps: Deps, command: Extract<Command, { verb: 'doctor' }>): Promise<DoctorReport> {
  const { host, workspace, runner } = deps;
  const platform = platformOf(host, command.platform);
  const choice = chooseBackend(deps, platform, command);
  const { backend } = choice;
  const skill = workspace.skillDir;
  const checks: DoctorCheck[] = [check('backend', true, describeChoice(choice), '')];

  const node = process.versions.node;
  checks.push(check('node', supportsNode(node), node, 'install Node 24.8.0 or newer on 24 (nvm install 24)'));
  const backendChecks = await backend.doctorChecks({
    live: command.live,
    worktree: workspace.worktree,
    progress: deps.progress,
  });
  checks.push(...backendChecks.toolchain);

  const pkg = readJson(join(skill, 'package.json'));
  const pins = (pkg?.devDependencies ?? {}) as Record<string, string>;
  const installed = (name: string) => readJson(join(skill, 'node_modules', name, 'package.json'))?.version as string | undefined;
  const pinned = ['e2e', '@e2e-dev/mobile', '@e2e-dev/github', 'ai'].map((name) => ({ name, want: pins[name], have: installed(name) }));
  checks.push(
    check(
      'e2e-pins',
      pinned.every((p) => p.want !== undefined && p.want === p.have),
      pinned.map((p) => `${p.name} ${p.have ?? 'missing'}${p.have === p.want ? '' : ` (pinned ${p.want})`}`).join(', '),
      `cd ${skill} && npm ci`,
    ),
  );
  checks.push(...backendChecks.device);

  checks.push(...(await deps.instances.doctorChecks({ live: command.live }, deps.progress)));
  checks.push(agentCheck(deps.agent ?? (() => null)));

  const key = await computeBuildKey(host, platform, backend.kind, workspace.worktree);
  const up = ['{cli} up', ...(host.platforms.length > 1 ? [`--platform ${platform}`] : []), ...(command.backend === undefined ? [] : [`--backend ${command.backend}`])].join(' ');
  const built = readBuiltApp(workspace, key);
  checks.push(check('build', built !== null, built === null ? `no ${host.appId(platform)} build for ${key}` : `${key} at ${built.path}`, up));

  const noAttach = await missingAttach(runner);
  checks.push(
    noAttach === null
      ? check('gh-attach', true, 'gh pr comment supports --attach', '')
      : { id: 'gh-attach', ok: true, state: 'warning', detail: `${noAttach.why}, so \`{cli} attach\` cannot post a run's video and screenshots from this machine`, fix: noAttach.fix },
  );

  const stale = readClaims(workspace.claimsDir, platform).filter(isOrphaned);
  checks.push(check('stale-claims', stale.length === 0, stale.length === 0 ? 'none' : `${stale.map((c) => c.deviceName).join(', ')} belong to deleted worktrees`, '{cli} down --stale'));


  const drift = manifestDrift();
  checks.push(check('core-drift', drift.length === 0, drift.length === 0 ? 'src/core matches MANIFEST' : `changed: ${drift.join(', ')}`, 'node src/core/manifest.ts --write, and copy src/core to clerk-android and clerk/javascript'));

  return { verb: 'doctor', ok: checks.every((c) => c.ok), backend: { [platform]: backend.kind }, checks };
}

type RuntimeOutcome = LeaseOutcome & { readonly entry: HostEntry; readonly instances: readonly InstanceView[] };

async function startRuntime(deps: Deps, lease: Lease): Promise<HostEntry> {
  if (deps.host.runtime === undefined) return deps.host.entry(lease.platform);
  const runtime = await deps.host.runtime(lease, deps.progress);
  const open = deps.workspace.unclosedEntries();
  for (const process of runtime.processes) {
    if (open.some((e) => e.kind === 'process' && e.what === process.what && e.pid === process.pid)) continue;
    deps.workspace.append({ id: newEntryId(), kind: 'process', what: process.what, pid: process.pid, startedAt: new Date(process.startedAt).toISOString(), ...(process.platform === undefined ? {} : { platform: process.platform }) });
  }
  return runtime.entry;
}

function writeLeaseContext(deps: Deps, outcome: RuntimeOutcome): void {
  const context: RunContext = {
    v: 1,
    run: null,
    workspace: deps.workspace.root,
    broker: null,
    agentDeviceSession: agentDeviceSession(deps.workspace, outcome.lease.platform),
    targets: [targetOf(deps, outcome)],
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
    leaseFile: deps.workspace.leaseFile(platform),
    entry: outcome.entry,
  };
}

export async function up(deps: Deps, command: Extract<Command, { verb: 'up' }>): Promise<UpResult> {
  const platform = platformOf(deps.host, command.platform);
  chooseBackend(deps, platform, command);
  return deps.workspace.withAcquireLock(platform, async (lock) => {
    const [leased, instances] = await leaseWithInstances(deps, { willChange: false }, () =>
      ensureLease(lock, command.backend, deps.workspace, deps.host, { waitSeconds: command.waitSeconds, progress: deps.progress, instances: deps.instances, retryWith: '{cli} up --wait <seconds>' }),
    );
    const outcome = { ...leased, entry: await startRuntime(deps, leased.lease), instances };
    writeLeaseContext(deps, outcome);
    return { verb: 'up', leases: [outcome.view], builds: [outcome.build], instances: outcome.instances };
  }, (owner) => deps.progress(`wait    another {cli} in this worktree (pid ${owner.pid}) is leasing the device; waiting for it, with no time limit`));
}

async function gitFacts(runner: Runner, worktree: string): Promise<{ head: string; dirty: boolean }> {
  const head = await runner('git', ['rev-parse', 'HEAD'], { cwd: worktree });
  const status = await runner('git', ['status', '--porcelain'], { cwd: worktree });
  return { head: head.stdout.trim(), dirty: status.stdout.trim().length > 0 };
}

type Identity = EvidenceRecord['identities'][number];

async function newIdentities(deps: Deps, run: RunId, known: readonly Identity[]): Promise<readonly Identity[]> {
  const entries = deps.workspace.entries();
  const reserved = entries.flatMap((e) => (e.kind === 'identity' && e.run === run && !known.some((identity) => identity.email === e.email) ? [e] : []));
  const out: Identity[] = [];
  for (const identity of reserved) {
    let userId = entries.find((e): e is Extract<LedgerEntry, { kind: 'user' }> => e.kind === 'user' && e.email === identity.email)?.userId ?? null;
    if (userId === null) userId = await deps.instances.clerk().findUserId(identity.email).catch(() => null);
    out.push({ email: identity.email, userId });
  }
  return out;
}

export async function endRun(
  workspace: Workspace,
  run: {
    readonly recording: Recording | null;
    readonly recorderEntry: string | null;
    readonly broker: { stop(): Promise<void> };
    readonly scratch: ScratchPath;
  },
): Promise<void> {
  const steps: (() => unknown)[] = [
    () => run.recording?.stop(),
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
  if (ran === 'all-left-out') return 'nothing ran: every selected spec was left out by platform, so the run proves nothing to post';
  return `{cli} attach ${run} --pr <n>`;
}

export async function leaseForRun<T>(deps: Deps, platform: Platform, command: Extract<Command, { verb: 'run' }>, instances: { readonly willChange: boolean }, drive: (outcome: RuntimeOutcome) => Promise<T>): Promise<T> {
  const key = await computeBuildKey(deps.host, platform, chooseBackend(deps, platform, command).backend.kind, deps.workspace.worktree);
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
      const [leased, up] = await leaseWithInstances(deps, instances, () =>
        ensureLease(lock, command.backend, deps.workspace, deps.host, { waitSeconds: command.waitSeconds, progress: deps.progress, instances: deps.instances, retryWith }),
      );
      const outcome: RuntimeOutcome = { ...leased, entry: await startRuntime(deps, leased.lease), instances: up };
      writeLeaseContext(deps, outcome);
      deps.progress(leaseLine(outcome.view));
      return outcome;
    },
    drive,
    (owner) => deps.progress(`wait    another {cli} in this worktree (pid ${owner.pid}) is building ${key} or leasing the device; waiting for it, with no time limit`),
  );
}

interface GroupRun {
  readonly run: RunId;
  readonly dir: EvidencePath;
  readonly log: EvidencePath;
  readonly context: ActiveRunContext;
  readonly command: Extract<Command, { verb: 'run' }>;
  readonly platform: Platform;
  readonly agent: Agent | null;
}

interface GroupOutcome {
  readonly record: EvidenceRecord['settings'][number];
  readonly results: readonly SpecResult[];
  readonly screenshots: EvidenceRecord['screenshots'];
  readonly identities: readonly Identity[];
  readonly failure: VerifyFailure | null;
  readonly stopsTheRun: boolean;
}

const notRun = (spec: SpecRef, platform: Platform, why: string): SpecResult => ({
  spec,
  title: 'not run',
  platform,
  status: 'failed',
  seconds: 0,
  attempts: 0,
  error: redact(why),
  skipReason: null,
  skippedBy: null,
  tags: [],
  failurePage: null,
  failureScreen: null,
  failureScreenshot: null,
});

class SpecEdited extends VerifyFailure {}

const asFailure = (error: unknown): VerifyFailure => (error instanceof VerifyFailure ? error : new VerifyFailure('NOT_READY', (error as Error).message ?? String(error), 'run `{cli} doctor`, then rerun'));

async function runGroup(deps: Deps, the: GroupRun, group: SettingsGroup, index: number, known: readonly Identity[], stopped: VerifyFailure | null): Promise<GroupOutcome> {
  const { workspace } = deps;
  const { settings } = group;
  const specs = group.specs.map((spec): SpecRef => ({ kind: spec.kind, path: spec.path, feature: spec.feature }));
  const outputDir = e2eOutputDir(the.dir, index);
  const reportFile = join(outputDir, 'report.json') as EvidencePath;
  let applied: AppliedInstance | null = null;
  let invoked: { readonly exitCode: number } | null = null;
  let held = false;
  let unread: string | null = null;
  let identities: readonly Identity[] = [];
  let failure: VerifyFailure | null = null;
  let stopsTheRun = false;
  let lostItsSettings = false;
  const refuseEdited = (): void => {
    const edited = group.specs.find((spec) => sourceHash(readSpecText(workspace.skillDir, spec.path)) !== spec.sourceHash);
    if (edited !== undefined) throw new SpecEdited('USAGE', `${edited.path} or its settings file changed while the run was in progress`, 'rerun; a run plans its groups from the spec files and their settings files as they are when it starts');
  };
  try {
    if (stopped !== null) throw new VerifyFailure(stopped.code, `an earlier group of this run failed, so this one did not run: ${stopped.message}`, stopped.fix);
    refuseEdited();
    try {
      applied = await deps.instances.apply(group, deps.progress);
    } catch (error) {
      stopsTheRun = !(error instanceof SettingsRefused);
      throw error;
    }
    try {
      refuseEdited();
      if (index > 0) appendFileSync(the.log, `settings ${settings.label}: ${count(specs.length, 'spec file')}\n`);
      invoked = await invokeE2E(planE2E(the.context, specs, the.command, the.platform, workspace.skillDir, outputDir), the.log, workspace.skillDir, deps.progress, the.agent);
      identities = await newIdentities(deps, the.run, known);
      try {
        held = await applied.stillApplied();
      } catch (error) {
        unread = (error as Error).message ?? String(error);
      }
      refuseEdited();
    } finally {
      await applied.release();
    }
  } catch (error) {
    failure = asFailure(error);
    stopsTheRun ||= stopped === null && applied !== null && !(error instanceof SpecEdited);
  }

  let results: readonly SpecResult[] = [];
  let screenshots: EvidenceRecord['screenshots'] = [];
  if (invoked !== null && failure === null) {
    try {
      const report: unknown = existsSync(reportFile) ? JSON.parse(readFileSync(reportFile, 'utf8')) : null;
      if (report === null) throw new VerifyFailure('E2E_CRASHED', `e2e exited ${invoked.exitCode} before writing a report for ${settings.label}`, `read ${the.log}`);
      results = parseE2EReport(report, specs, outputDir);
      screenshots = collectScreenshots(report, the.dir, outputDir);
    } catch (error) {
      failure = error instanceof VerifyFailure ? error : new VerifyFailure('E2E_CRASHED', `e2e's report could not be read: ${(error as Error).message}`, `read ${reportFile}`);
      results = [];
      screenshots = [];
    }
    if (failure === null && !held) {
      lostItsSettings = true;
      failure =
        unread === null
          ? new VerifyFailure('INSTANCE_MISCONFIGURED', `the instance no longer showed ${settings.label} when its specs ended, so what they saw is unknown`, 'rerun; if another command in this worktree changed the instance, let one finish before the other starts')
          : new VerifyFailure('NOT_READY', `the instance's environment could not be read after the specs on ${settings.label} ended, so what they saw is unknown: ${unread}`, 'rerun; a cloud environment needs *.clerk.accounts.dev in its allowed domains');
    }
  }
  const unreported = invoked === null || invoked.exitCode === 0 ? 'e2e reported no result for this file: it registers no test' : `e2e exited ${invoked.exitCode} and reported no result for this file: it failed to load or registers no test; e2e.log in the run directory says which`;
  const why = failure?.message ?? unreported;
  const missing = specs.filter((spec) => !results.some((result) => result.spec.path === spec.path));
  const reported = lostItsSettings ? specs.filter((spec) => !missing.includes(spec)) : [];
  return {
    record: {
      label: settings.label,
      askedBy: settings.askedBy,
      specs: specs.map((spec) => spec.path),
      application: applied?.instance.id ?? null,
      changed: applied !== null && applied.changed,
      held,
      e2eReport: invoked === null ? null : reportFile,
    },
    results: [...results, ...[...missing, ...reported].map((spec) => notRun(spec, the.platform, why))],
    screenshots,
    identities,
    failure,
    stopsTheRun,
  };
}

export async function runVerb(deps: Deps, command: Extract<Command, { verb: 'run' }>): Promise<RunResult> {
  const { host, workspace } = deps;
  const platform = platformOf(host, command.platform);
  const specs = resolveSpecs(workspace.skillDir, command.selection);
  protectGitHubTokens(deps.env);
  const agent = deps.agent?.() ?? null;
  const recorded = deps.instances.recordedKey();
  const stray = straySettingsFile(workspace.skillDir);
  if (stray !== null) throw stray;
  const sources = specs.map((spec) => ({ spec, ...readSpecText(workspace.skillDir, spec.path) }));
  const groups = planGroups(sources, recorded ?? STANDARD.key);
  if (groups.length > 1) deps.progress(`settings ${groups.length} groups in this run: ${groups.map((group, index) => `${group.settings.label} (${index === 0 ? count(group.specs.length, 'spec file') : group.specs.length})`).join(', ')}`);
  return leaseForRun(deps, platform, command, { willChange: groups.some((group) => group.settings.key !== recorded) }, async (outcome) => {
    try {
      const { lease, backend } = outcome;
      const { run, dir, scratch } = workspace.newRun();
      const startedAt = new Date();
      deps.progress(`run ${run}  ${platform}  ${outcome.view.backend} ${outcome.view.device}  build ${outcome.app.key}`);
      for (const { spec, source, declaration } of sources) {
        mkdirSync(dirname(join(dir, spec.path)), { recursive: true });
        writeFileSync(join(dir, spec.path), source);
        if (declaration !== null) writeFileSync(join(dir, settingsFileOf(spec.path)), declaration);
      }

      const broker = await startBroker(run, workspace, scratch, {
        clerk: () => deps.instances.clerk(),
        publishableKey: () => deps.instances.keys().pk,
        platforms: [platform],
      });
      const context: ActiveRunContext = {
        v: 1,
        run,
        workspace: workspace.root,
        broker: { url: broker.url, tokenFile: broker.tokenFile },
        agentDeviceSession: agentDeviceSession(workspace, platform),
        targets: [targetOf(deps, outcome)],
      };
      writeRunContext(contextFile(context), context);

      let recording: Recording | null = null;
      let recorderEntry: string | null = null;
      const outcomes: GroupOutcome[] = [];
      let endFailure: unknown = null;
      try {
        if (command.video) {
          recording = await backend.startRecording(lease, dir);
          if (recording.process !== null) {
            recorderEntry = newEntryId();
            workspace.append({ id: recorderEntry, kind: 'process', what: 'recorder', pid: recording.process.pid, startedAt: new Date(recording.process.startedAt).toISOString(), platform });
          }
        }
        const the: GroupRun = { run, dir, log: join(dir, 'e2e.log') as EvidencePath, context, command, platform, agent };
        for (const [index, group] of groups.entries()) {
          const stopped = outcomes.find((done) => done.stopsTheRun)?.failure ?? null;
          outcomes.push(await runGroup(deps, the, group, index, outcomes.flatMap((done) => done.identities), stopped));
        }
      } finally {
        await endRun(workspace, { recording, recorderEntry, broker, scratch })
          .catch((error: unknown) => void (endFailure = error))
          .finally(() => deps.instances.stopDriving());
      }

      const appLog = join(dir, 'app.log') as EvidencePath;
      const logs = await backend.logs(lease, startedAt, host.logPredicates?.[platform]).catch((error: unknown) => `the device logs could not be read: ${(error as Error).message ?? String(error)}`);
      writeFileSync(appLog, redact(logs));

      const results = outcomes.flatMap((done) => done.results);
      const screenshots = new Map(outcomes.flatMap((done) => done.screenshots.map((shot) => [shot.label, shot] as const)));
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
        screenshots: [...screenshots.values()],
        appLog,
        e2eReport: join(e2eOutputDir(dir, 0), 'report.json') as EvidencePath,
        identities: outcomes.flatMap((done) => done.identities),
        settings: outcomes.map((done) => done.record),
      });
      const failed = outcomes.flatMap((done) => (done.failure === null ? [] : [{ label: done.record.label, failure: done.failure }]));
      if (command.githubReport) {
        for (const line of await reportToGitHub({ record, failures: failed, skillDir: workspace.skillDir })) deps.progress(`github    ${line}`);
      }
      if (failed[0] !== undefined) {
        deps.progress(`evidence  ${dir}  sealed; ${count(failed.length, 'group')} of ${groups.length} did not run in full, and run.json has a failed result for each of their spec files`);
        throw failed[0].failure;
      }
      if (endFailure !== null) {
        deps.progress(`evidence  ${dir}  sealed; the specs ran, and the run still fails because it did not end cleanly`);
        throw endFailure;
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

function screenNodes(snapshot: readonly SnapshotNode[]): readonly ScreenNode[] {
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

async function screen(deps: Deps, command: Extract<Command, { verb: 'screen' }>): Promise<ScreenResult> {
  const platform = platformOf(deps.host, command.platform);
  const { lease, backend } = heldLease(deps, platform);
  if ((await backend.check(lease)) === 'lost') throw new VerifyFailure('LEASE_LOST', `${backend.describe(lease)} is gone`, '{cli} up');
  const env = withoutClerkKeys(deps.env);
  const target = agentDeviceFor(lease);
  const agentDevice = (args: readonly string[]) =>
    deps.runner(join(deps.workspace.skillDir, 'node_modules', '.bin', 'agent-device'), args, { env: { ...env, AGENT_DEVICE_STATE_DIR: deps.workspace.agentDeviceDir, ...target.env } });
  const screenWait = { seconds: 10, busyFix: 'let the run in this worktree finish, then rerun {cli} screen' };
  return deps.workspace.withDevice(platform, screenWait, async () => {
    const selector = target.selector;
    const session = ['--session', `${agentDeviceSession(deps.workspace, platform)}-screen`];
    const attachedWithoutRelaunch = await agentDevice(['open', deps.host.appId(platform), '--json', ...selector, ...session]);
    if (attachedWithoutRelaunch.code !== 0) throw new VerifyFailure('NOT_READY', `agent-device open failed: ${redact(attachedWithoutRelaunch.stdout.trim() || attachedWithoutRelaunch.stderr.trim())}`, '{cli} up, then retry');
    const snap = await agentDevice(['snapshot', '--json', ...selector, ...session]);
    if (snap.code !== 0) throw new VerifyFailure('NOT_READY', `agent-device snapshot failed: ${redact(snap.stderr.trim() || snap.stdout.trim())}`, 'run a spec first so the app is open, then retry');
    const parsed = JSON.parse(snap.stdout) as { data?: { nodes?: SnapshotNode[] } };
    const nodes = screenNodes(parsed.data?.nodes ?? []);
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
    return { verb: 'screen', platform, device: backend.describe(lease), nodes, png };
  });
}

export async function attach(deps: Deps, command: Extract<Command, { verb: 'attach' }>): Promise<AttachResult> {
  const run = parseRunId(command.run);
  const dir = deps.workspace.runDir(run);
  if (!existsSync(dir)) throw new VerifyFailure('USAGE', `no run ${run} in ${deps.workspace.root}/runs`, 'pass a run id that `{cli} run` printed');
  const record = readRecord(dir);
  const publishable = assertPublishable(record, loggedUserIds(dir));
  return postToPullRequest(publishable, dir, deps.host, command.pr, command.screenshots, deps.runner);
}

interface DownPlan {
  readonly leases: readonly { readonly lease: Lease; readonly backend: DeviceBackend; readonly view: LeaseView; readonly origin: 'lease-file' | 'stale-claim' }[];
  readonly stillLeased: readonly Platform[];
  readonly processes: readonly ProcessEntry[];
  readonly staleIntents: readonly string[];
}

const leaseIdentity = (lease: Lease): string => `local:${lease.claimNonce}`;

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
      for (const backend of host.backends.filter((b) => b.platform === platform)) {
        for (const orphan of await backend.reapable(workspace.worktree)) {
          if (leases.some((l) => leaseIdentity(l.lease) === leaseIdentity(orphan))) continue;
          leases.push({ lease: orphan, backend, view: leaseView(backend, orphan, false), origin: 'stale-claim' });
        }
      }
    }
  }
  const stillLeased = host.platforms.filter((platform) => !platforms.includes(platform) && workspace.readLease(platform) !== null);
  return {
    leases,
    stillLeased,
    processes: processesIn(workspace, { platforms, sharedByEveryLease: stillLeased.length === 0 }),
    staleIntents: command.stale ? workspace.unclosedEntries().filter((e) => e.kind === 'lease-intent').map((e) => e.id) : [],
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
  const sharedStays = plan.stillLeased.length > 0;
  if (command.dryRun) {
    return {
      verb: 'down',
      dryRun: true,
      wouldRelease: plan.leases.map((l) => l.view),
      wouldDelete: sharedStays ? [] : openApplications(workspace).map((entry) => ({ kind: 'application', name: entry.name })),
      wouldStop: [...new Set([...plan.processes.filter((p) => isRunning({ pid: p.pid, startedAt: Date.parse(p.startedAt) })).map((p) => `${p.what} ${p.pid}`), ...(sharedStays ? [] : runningDaemon(workspace))])],
      keptRuns: workspace.runs(),
    };
  }
  const stoppedProcesses = stopProcesses(workspace, plan.processes);
  const unreleased: unknown[] = [];
  for (const { lease, backend, origin } of plan.leases) {
    await (origin === 'lease-file' ? releaseLease(workspace, backend, lease) : backend.release(lease)).catch((error: unknown) => unreleased.push(error));
  }
  if (sharedStays && openApplications(workspace).length > 0) deps.progress(`kept    this worktree's throwaway instances, which its ${plan.stillLeased.join(' and ')} lease still uses`);
  const deleted = await deps.instances.finish(workspace, { keepApplications: sharedStays }, deps.progress).catch((error: unknown) => {
    unreleased.push(error);
    return [];
  });
  for (const ref of plan.staleIntents) workspace.append({ id: newEntryId(), kind: 'done', ref });
  if (plan.leases.some((l) => l.origin === 'lease-file')) rmSync(join(workspace.root, 'context.json'), { force: true });
  if (unreleased.length > 0) throw unreleased[0];
  return {
    verb: 'down',
    dryRun: false,
    released: plan.leases.map((l) => l.view),
    deletedApplications: deleted,
    stoppedProcesses,
    keptRuns: workspace.runs(),
  };
}

export const verbs = { doctor, up, run: runVerb, screen, attach, down } as const;
