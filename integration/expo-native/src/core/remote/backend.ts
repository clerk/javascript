import { execFileSync } from 'node:child_process';
import { copyFileSync, createWriteStream, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream } from 'node:stream/web';
import { run, sleep } from '../exec.ts';
import { VerifyFailure, everyFile, type AcquireRequest, type DeviceBackend, type EvidenceFile, type EvidencePath, type Recording, type RemoteLease, type TreePatch } from '../types.ts';
import { apiMessage, currentBranch, endSession, liveRuns, openGitHub, startRun, viewRun, waitForStep, waitReporter, type GitHub } from './github.ts';
import { HANDOFF_VERSION, HandoffRefused, describeFile, parseHandoffManifest, pullRequestMismatch, type HandoffManifest } from './handoff.ts';
import { coreVersion } from '../manifest.ts';
import { withEvidenceBlock } from '../publish.ts';
import { remoteDoctorChecks } from './preflight.ts';
import { BUILD_LOG_START, BUILD_TIMEOUT_MINUTES, PATCH_LIMIT_BYTES, STEP, sha256Hex, type SessionHealth } from './protocol.ts';
import { firstHealth, sendEvidence, sessionCall, sessionHealth, tunnelUrl, type SessionRef } from './session.ts';
import { forgetSession, newSessionRequest, saveToken, savedDriverId, type RemoteDeps, type RemoteSettings } from './settings.ts';

const READY_DEADLINE_MS = (BUILD_TIMEOUT_MINUTES + 5) * 60_000;
const EXPIRING_MS = 2 * 60_000;

const COMMITS_PER_PAGE = 100;
const COMMIT_PAGES = 3;

async function pullRequestCommits(hub: GitHub, pr: number): Promise<readonly string[]> {
  const shas: string[] = [];
  for (let page = 1; page <= COMMIT_PAGES; page += 1) {
    const listed = await hub.api('GET', `/pulls/${pr}/commits?per_page=${COMMITS_PER_PAGE}&page=${page}`);
    if (listed.status !== 200 || !Array.isArray(listed.json)) throw new VerifyFailure('NOT_READY', `could not read the commits of PR #${pr}: ${apiMessage(listed)}`, 'retry {cli} attach');
    shas.push(...(listed.json as readonly { readonly sha: string }[]).map((commit) => commit.sha));
    if (listed.json.length < COMMITS_PER_PAGE) break;
  }
  return shas;
}

const COMMIT_THE_CHANGES = 'git commit the changes and git push, then rerun';

export function workingPatch(worktree: string, inputs: readonly string[]): TreePatch | null {
  const scratch = mkdtempSync(join(tmpdir(), 'verify-patch-'));
  try {
    const index = join(scratch, 'index');
    const git = (args: readonly string[]): Buffer => {
      try {
        return execFileSync('git', [...args], { cwd: worktree, env: { ...process.env, GIT_INDEX_FILE: index }, maxBuffer: PATCH_LIMIT_BYTES, stdio: ['ignore', 'pipe', 'pipe'] });
      } catch (error) {
        const failed = error as NodeJS.ErrnoException & { readonly stderr?: Buffer };
        if (failed.code === 'ENOBUFS') throw new VerifyFailure('BUILD_FAILED', `the uncommitted changes to the app make a patch larger than the ${PATCH_LIMIT_BYTES / 1024 / 1024} MiB a session takes`, COMMIT_THE_CHANGES);
        throw new VerifyFailure('BUILD_FAILED', `git could not read the uncommitted changes to the app: ${failed.stderr?.toString().trim() || failed.message}`, COMMIT_THE_CHANGES);
      }
    };
    const own = resolve(worktree, execFileSync('git', ['rev-parse', '--git-path', 'index'], { cwd: worktree, encoding: 'utf8' }).trim());
    if (existsSync(own)) copyFileSync(own, index);
    git(['add', '--all', '--', ...inputs]);
    const bytes = git(['diff', '--cached', '--binary', '--no-color', '--no-ext-diff', '--no-renames', '--no-relative', '--src-prefix=a/', '--dst-prefix=b/', 'HEAD', '--', ...inputs]);
    return bytes.length === 0 ? null : { sha256: sha256Hex(bytes), bytes };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const describeSource = (sha: string, patch: string | null): string => `${sha.slice(0, 12)}${patch === null ? '' : ` with uncommitted changes ${patch.slice(0, 12)}`}`;

async function baseHolds(hub: GitHub, pr: number, base: unknown, commit: string): Promise<boolean | 'unknown'> {
  if (typeof base !== 'string' || !/^[0-9a-f]{40}$/.test(base)) return false;
  const compared = await hub.api('GET', `/compare/${commit}...${base}?per_page=1`);
  if (compared.status === 404) return 'unknown';
  if (compared.status !== 200) throw new VerifyFailure('NOT_READY', `could not compare the commit the session started on with the base branch of PR #${pr}: ${apiMessage(compared)}`, 'retry {cli} attach');
  const status = (compared.json as { readonly status?: unknown } | null)?.status;
  return status === 'ahead' || status === 'identical';
}

export function remoteBackend(settings: RemoteSettings, deps: RemoteDeps = { env: process.env, runner: run }): DeviceBackend<RemoteLease> {
  const { platform } = settings;
  let opened: Promise<GitHub> | undefined;
  const github = () => (opened ??= deps.github?.() ?? openGitHub({ repo: settings.repo, workflow: settings.workflow, env: deps.env, runner: deps.runner }));
  const runUrl = (runId: string) => `https://github.com/${settings.repo}/actions/runs/${runId}`;

  function assertSameCore(health: SessionHealth): void {
    const mine = coreVersion();
    if (health.core === mine) return;
    throw new VerifyFailure(
      'NOT_READY',
      `the session runs verify core ${health.core} and this checkout has ${mine}, so its agent may not have the routes this CLI calls`,
      'commit and push the changes to the files MANIFEST lists, then {cli} down and {cli} up',
    );
  }

  function describeBuild(health: SessionHealth): string {
    const build = health.build;
    if (build.state === 'none') return 'no build';
    return `build ${describeSource(build.sha, build.patch)} ${build.state}${build.state === 'building' ? ` ${build.seconds}s` : ''}`;
  }

  async function waitForBuild(lease: RemoteLease, sha: string, patch: string | null, progress: (line: string) => void): Promise<Extract<SessionHealth['build'], { state: 'built' }>> {
    const deadline = Date.now() + READY_DEADLINE_MS;
    const what = describeSource(sha, patch);
    const fix = patch === null ? 'fix the build error above, commit, push, then rerun {cli} up' : 'fix the build error above, then rerun {cli} up, which sends the uncommitted changes again';
    let last = '';
    let shown = 0;
    const showLog = async (): Promise<void> => {
      const answer = await sessionCall(lease, `/__sim/build/log?from=${shown}`, { timeoutMs: 15_000 }).catch(() => null);
      if (answer?.status !== 200) return;
      const start = Number(answer.headers.get(BUILD_LOG_START) ?? shown);
      const bytes = Buffer.from(await answer.arrayBuffer());
      const whole = bytes.lastIndexOf(0x0a) + 1;
      for (const line of bytes.subarray(0, whole).toString().split('\n')) if (line.trim() !== '') progress(`build   | ${line}`);
      shown = start + whole;
    };
    for (;;) {
      const health = await sessionHealth(lease);
      if (health === null) {
        const state = await viewRun(await github(), lease.providerRef);
        if (state.status === 'completed') throw new VerifyFailure('LEASE_LOST', `the session ended (${state.conclusion ?? 'no conclusion'}) while it was building`, `read ${runUrl(lease.providerRef)} for why, then {cli} up`);
      } else {
        const ours = health.build.state !== 'none' && health.build.sha === sha && health.build.patch === patch;
        if (ours) await showLog();
        if (ours && health.build.state === 'failed') {
          throw new VerifyFailure('BUILD_FAILED', `the session could not build ${what}:\n${health.build.tail}`, fix);
        }
        if (ours && health.build.state === 'timed-out') {
          throw new VerifyFailure(
            'NOT_READY',
            `the session stopped the build of ${what} after ${BUILD_TIMEOUT_MINUTES} minutes on ${lease.runner}, the longest it lets one build run. The build reported no error before that. Its last lines:\n${health.build.tail}`,
            'rerun {cli} up, and the same session builds again from what the stopped build left; if that build is stopped too, {cli} down, then {cli} up --runner <a faster runner label>',
          );
        }
        if (ours && health.build.state === 'built' && health.device?.ready === true && health.daemon) return health.build;
        const line = `wait    ${describeBuild(health)}; device ${health.device?.ready === true ? 'ready' : 'booting'}; agent-device ${health.daemon ? 'up' : 'starting'}`;
        const coarse = line.replace(/ \d+s/, '');
        if (coarse !== last) progress(line);
        last = coarse;
      }
      if (Date.now() >= deadline) {
        await endSession(await github(), lease.providerRef, lease).catch(() => undefined);
        throw new VerifyFailure('NOT_READY', `the session was not ready ${READY_DEADLINE_MS / 60_000} minutes after the build was asked for (${health === null ? 'it does not answer' : describeBuild(health)}), so it was ended`, `read ${runUrl(lease.providerRef)}, then {cli} up`);
      }
      await sleep(8000);
    }
  }

  const backend: DeviceBackend<RemoteLease> = {
    kind: 'remote',
    platform,
    requirement: settings.requirement,
    availability: () => ({ usable: true, why: `the device runs on a CI runner (${settings.runner} unless --runner names another), started through ${settings.workflow} on ${settings.repo}` }),

    async sourceCommit(input) {
      const sha = (await deps.runner('git', ['rev-parse', 'HEAD'], { cwd: input.worktree })).stdout.trim();
      const patch = workingPatch(input.worktree, input.inputs);
      const found = await (await github()).api('GET', `/commits/${sha}`);
      if (found.status !== 200) {
        throw new VerifyFailure('BUILD_FAILED', `a remote session builds a pushed commit, and GitHub does not have ${sha.slice(0, 12)} (${found.status})`, 'git push, then rerun');
      }
      return { sha, patch };
    },

    async acquire(request: AcquireRequest) {
      const hub = await github();
      const ref = await currentBranch(deps.runner, request.worktree);
      const { request: order, token } = newSessionRequest(settings, deps, { ...(request.runner === undefined ? {} : { runner: request.runner }), device: settings.device, sha: request.app.source === 'local' ? null : request.app.sourceSha });
      const tokenFile = saveToken(settings, order.session, token);
      request.progress(`device  remote ${platform}  starting session ${order.session} on ${order.runner} (idle stop ${order.idleMinutes} min, cap ${order.capMinutes} min)`);
      let runId: string | null = null;
      let session: SessionRef | null = null;
      try {
        runId = await startRun(hub, order, { ref });
        request.progress(`device  remote ${platform}  run ${runId}  ${runUrl(runId)}`);
        const host = await waitForStep(hub, runId, STEP.tunnelPattern, 20 * 60, waitReporter(request.progress, runId, { plan: settings.plumbingRunner, session: order.runner }));
        session = { baseUrl: tunnelUrl(host), tokenFile };
        const health = await firstHealth(session, 180);
        if (health === null || health.device === null) throw new VerifyFailure('NOT_READY', `the session's tunnel at ${host} did not answer with a device`, `read ${runUrl(runId)}`);
        assertSameCore(health);
        request.progress(`device  remote ${platform}  tunnel up, ${health.device.name} on ${order.runner}`);
        return {
          backend: 'remote',
          provider: 'github-actions',
          platform,
          session: order.session,
          providerRef: runId,
          baseUrl: session.baseUrl,
          tokenFile,
          deviceId: health.device.id,
          deviceName: health.device.name,
          runner: order.runner,
          expiresAt: health.capAt,
          builtSha: null,
          builtPatch: null,
          acquiredAt: new Date().toISOString(),
          installedBuild: null,
        };
      } catch (error) {
        const ended = runId === null ? null : await endSession(hub, runId, session).catch((failure: Error) => ({ problem: failure.message }));
        forgetSession(settings, order.session);
        if (runId === null || ended === null || ended.problem === null) throw error;
        throw new VerifyFailure('NOT_READY', `${(error as Error).message}; and the run it started could not be ended: ${ended.problem}`, `open ${runUrl(runId)} and cancel it`);
      }
    },

    async check(lease) {
      if (!existsSync(lease.tokenFile)) return 'lost';
      let health = await sessionHealth(lease);
      for (let i = 0; i < 3 && health === null; i += 1) {
        await sleep(3000);
        health = await sessionHealth(lease);
      }
      if (health === null) {
        const state = await viewRun(await github(), lease.providerRef);
        if (state.status === 'completed') return 'lost';
        throw new VerifyFailure('NOT_READY', `the session is still running (${runUrl(lease.providerRef)}) but its tunnel does not answer`, 'retry in a minute; if it stays unreachable, {cli} down, then {cli} up');
      }
      if (health.ending !== null) return 'lost';
      assertSameCore(health);
      if (Date.parse(lease.expiresAt) - Date.now() < EXPIRING_MS) return 'expiring';
      const { build } = health;
      return lease.builtSha === null || (build.state === 'built' && build.sha === lease.builtSha && build.patch === lease.builtPatch) ? 'held' : 'other-app';
    },

    async install(lease, app, progress) {
      if (app.source === 'local') throw new VerifyFailure('BUILD_FAILED', 'a remote session builds a pushed commit and this build names none', '{cli} down, then {cli} up');
      const { sourceSha: sha, patch } = app;
      const builtPatch = patch?.sha256 ?? null;
      const started = await sessionCall(lease, `/__sim/build?sha=${sha}${patch === null ? '' : `&patch=${patch.sha256}`}`, {
        method: 'POST',
        ...(patch === null ? {} : { json: { patch: patch.bytes.toString('base64') }, timeoutMs: 120_000 }),
      });
      if (started.status !== 202) throw new VerifyFailure('BUILD_FAILED', `the session refused to build ${describeSource(sha, builtPatch)}: ${started.status} ${await started.text()}`, '{cli} down, then {cli} up');
      const built = await waitForBuild(lease, sha, builtPatch, progress);
      progress(`build   ${app.key}  github-actions  ${describeSource(sha, builtPatch)} ${built.incremental ? 'rebuilt' : 'built'} in ${built.seconds}s on ${lease.runner}`);
      return { ...lease, builtSha: sha, builtPatch };
    },

    async release(lease) {
      const ended = await endSession(await github(), lease.providerRef, lease.baseUrl === '' ? null : lease);
      if (ended.problem !== null) throw new VerifyFailure('NOT_READY', ended.problem, `open ${runUrl(lease.providerRef)} and cancel it, then {cli} down`);
      forgetSession(settings, lease.session);
    },

    async reapable(owner) {
      const mine = savedDriverId(settings);
      if (owner === undefined || mine === null) return [];
      const running = await github().then(liveRuns).catch(() => []);
      return running
        .filter((live) => live.owner === mine && live.session.startsWith(platform))
        .map((live) => ({
          backend: 'remote' as const,
          provider: 'github-actions' as const,
          platform,
          session: live.session,
          providerRef: live.runId,
          baseUrl: '',
          tokenFile: join(settings.sessionsDir, live.session, 'token'),
          deviceId: '',
          deviceName: settings.device,
          runner: '',
          expiresAt: live.createdAt,
          builtSha: null,
          builtPatch: null,
          acquiredAt: live.createdAt,
          installedBuild: null,
        }));
    },

    async startRecording(lease, into) {
      const started = await sessionCall(lease, '/__sim/record/start', { method: 'POST' });
      if (started.status !== 200) throw new VerifyFailure('NOT_READY', `the session did not start recording: ${started.status} ${await started.text()}`, 'rerun with --no-video');
      const file = join(into, 'video.mp4') as EvidencePath;
      const recording: Recording = {
        process: null,
        async stop() {
          const stopped = await sessionCall(lease, '/__sim/record/stop', { method: 'POST', timeoutMs: 90_000 });
          if (stopped.status !== 200) return file;
          const download = await sessionCall(lease, '/__sim/record/file', { timeoutMs: 300_000 });
          if (download.status === 200 && download.body !== null) await pipeline(Readable.fromWeb(download.body as ReadableStream), createWriteStream(file));
          return file;
        },
      };
      return recording;
    },

    async logs(lease, since, extraPredicate) {
      const params = new URLSearchParams({ since: since.toISOString() });
      if (extraPredicate !== undefined) params.set('predicate', extraPredicate);
      const response = await sessionCall(lease, `/__sim/logs?${params}`, { timeoutMs: 120_000 });
      return response.status === 200 ? response.text() : `the session returned no logs (${response.status})`;
    },

    async handOffEvidence(lease, bundle, progress) {
      const { run } = bundle.summary;
      const wouldNot = (why: string, fix: string): VerifyFailure => new VerifyFailure('NOT_READY', `the verify-attach workflow would not put the evidence of run ${run} on PR #${bundle.pr}: ${why}`, fix);
      if (bundle.files.length === 0) throw wouldNot('the run has no video and no screenshot, and the workflow publishes nothing without a file', '{cli} run again without --no-video, then attach');
      const health = await sessionHealth(lease);
      if (health === null || health.ending !== null) {
        throw new VerifyFailure('LEASE_LOST', `the session (${runUrl(lease.providerRef)}) ${health === null ? 'does not answer' : 'is ending'}, so it cannot take the evidence of run ${run}`, '{cli} up, run again, and attach before {cli} down');
      }
      const hub = await github();
      const [session, pull] = await Promise.all([hub.api('GET', `/actions/runs/${lease.providerRef}`), hub.api('GET', `/pulls/${bundle.pr}`)]);
      if (session.status !== 200) throw new VerifyFailure('NOT_READY', `could not read run ${lease.providerRef}: ${apiMessage(session)}`, `open ${runUrl(lease.providerRef)}`);
      if (pull.status !== 200) throw new VerifyFailure('NOT_READY', `could not read PR #${bundle.pr} of ${settings.repo}: ${apiMessage(pull)}`, 'pass the number of an open pull request of this branch as --pr');
      const started = session.json as { readonly head_branch: string; readonly head_sha: string };
      const pr = pull.json as { readonly state: string; readonly body: string | null; readonly commits: number; readonly base?: { readonly sha?: unknown }; readonly head: { readonly ref: string; readonly sha: string; readonly repo: { readonly full_name: string } | null } };
      const mismatch = await pullRequestMismatch(
        { state: pr.state, headRepo: pr.head.repo?.full_name ?? null, headRef: pr.head.ref, commits: await pullRequestCommits(hub, bundle.pr), commitCount: pr.commits },
        { repo: settings.repo, headBranch: started.head_branch, startedOn: started.head_sha, runCommit: bundle.summary.commit },
        () => baseHolds(hub, bundle.pr, pr.base?.sha, started.head_sha),
      );
      if (mismatch !== null) throw wouldNot(mismatch.why, mismatch.fix);
      if (bundle.before !== null) {
        const was = bundle.before.summary;
        const compared = await hub.api('GET', `/compare/${was.commit}...${bundle.summary.commit}?per_page=1`);
        if (compared.status !== 200 && compared.status !== 404) throw new VerifyFailure('NOT_READY', `could not compare the commit of run ${was.run} with the commit of run ${run}: ${apiMessage(compared)}`, 'retry {cli} attach');
        const status = (compared.json as { readonly status?: string } | null)?.status;
        if (status !== 'ahead' && status !== 'identical') {
          throw wouldNot(
            `the before run ${was.run} was made at ${was.commit.slice(0, 12)}, which is not the commit of the run or a commit before it in its history`,
            `{cli} run the spec at a commit that ${bundle.summary.commit.slice(0, 12)} still has in its history and does not hold the change, and pass that run as --before, or attach without --before and name the before run in the PR`,
          );
        }
      }
      const place = withEvidenceBlock(pr.body ?? '', bundle.summary.platform, '');
      if (!place.ok) throw wouldNot(`its description ${place.why}, so the evidence has no one place to go`, `${place.fix}, then rerun {cli} attach`);
      let manifest: HandoffManifest;
      try {
        const described = (files: readonly EvidenceFile[]) => files.map((file) => describeFile(file.name, file.path));
        const was = bundle.before === null ? null : { run: bundle.before.summary.run, commit: bundle.before.summary.commit, passed: bundle.before.summary.passed, flaky: bundle.before.summary.flaky, total: bundle.before.summary.total, files: described(bundle.before.files) };
        manifest = parseHandoffManifest(JSON.stringify({ v: HANDOFF_VERSION, pr: bundle.pr, ...bundle.summary, files: described(bundle.files), before: was }));
      } catch (error) {
        if (!(error instanceof HandoffRefused)) throw error;
        throw new VerifyFailure('NOT_READY', `the evidence of run ${run} cannot be handed to the runner: ${error.message}`, 'attach fewer or smaller files: fewer --screenshot labels, or no --video');
      }
      try {
        await sendEvidence(lease, manifest, new Map(everyFile(bundle).map((file) => [file.name, file.path])), progress);
      } catch (error) {
        if (error instanceof VerifyFailure) throw error;
        throw new VerifyFailure('NOT_READY', `the hand-off of run ${run} failed: ${(error as Error).message}`, 'run {cli} attach again while the session is up');
      }
      return { sessionRun: lease.providerRef, sessionRunUrl: runUrl(lease.providerRef) };
    },

    describe: (lease) => `${lease.deviceName} on ${lease.runner === '' ? `run ${lease.providerRef}` : lease.runner}`,

    doctorChecks: (options) => remoteDoctorChecks(settings, deps, github, options),
  };
  return backend;
}
