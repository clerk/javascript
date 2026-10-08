import { createWriteStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream } from 'node:stream/web';
import { run, sleep } from '../exec.ts';
import { VerifyFailure, type AcquireRequest, type DeviceBackend, type EvidencePath, type Recording, type RemoteLease } from '../types.ts';
import { currentBranch, endSession, liveRuns, openGitHub, startRun, viewRun, waitForStep, waitReporter, type GitHub } from './github.ts';
import { coreVersion } from '../manifest.ts';
import { remoteDoctorChecks } from './preflight.ts';
import { STEP, type SessionHealth } from './protocol.ts';
import { firstHealth, sessionCall, sessionHealth, tunnelUrl, type SessionRef } from './session.ts';
import { forgetSession, newSessionRequest, saveToken, savedDriverId, type RemoteDeps, type RemoteSettings } from './settings.ts';

const READY_DEADLINE_MS = 40 * 60_000;
const EXPIRING_MS = 2 * 60_000;

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
      'commit and push the changes under src/core, then {cli} down and {cli} up',
    );
  }

  function describeBuild(health: SessionHealth): string {
    const build = health.build;
    if (build.state === 'none') return 'no build';
    return `build ${build.sha.slice(0, 12)} ${build.state}${build.state === 'building' ? ` ${build.seconds}s` : ''}`;
  }

  async function waitForBuild(lease: RemoteLease, sha: string, progress: (line: string) => void): Promise<Extract<SessionHealth['build'], { state: 'built' }>> {
    const deadline = Date.now() + READY_DEADLINE_MS;
    let last = '';
    for (;;) {
      const health = await sessionHealth(lease);
      if (health === null) {
        const state = await viewRun(await github(), lease.providerRef);
        if (state.status === 'completed') throw new VerifyFailure('LEASE_LOST', `the session ended (${state.conclusion ?? 'no conclusion'}) while it was building`, `read ${runUrl(lease.providerRef)} for why, then {cli} up`);
      } else {
        if (health.build.state === 'failed' && health.build.sha === sha) {
          throw new VerifyFailure('BUILD_FAILED', `the session could not build ${sha.slice(0, 12)}:\n${health.build.tail}`, 'fix the build error above, commit, push, then rerun {cli} up');
        }
        if (health.build.state === 'built' && health.build.sha === sha && health.device?.ready === true && health.daemon) return health.build;
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
      const status = await deps.runner('git', ['status', '--porcelain', '--', ...input.inputs], { cwd: input.worktree });
      const files = status.stdout.split('\n').filter((line) => line.length > 3).map((line) => line.slice(3));
      if (files.length > 0) {
        throw new VerifyFailure(
          'BUILD_FAILED',
          `a remote session builds a pushed commit, and this tree has uncommitted changes to the app: ${files.slice(0, 5).join(', ')}${files.length > 5 ? `, and ${files.length - 5} more` : ''}`,
          'git commit the changes and git push, then rerun',
        );
      }
      const sha = (await deps.runner('git', ['rev-parse', 'HEAD'], { cwd: input.worktree })).stdout.trim();
      const found = await (await github()).api('GET', `/commits/${sha}`);
      if (found.status !== 200) {
        throw new VerifyFailure('BUILD_FAILED', `a remote session builds a pushed commit, and GitHub does not have ${sha.slice(0, 12)} (${found.status})`, 'git push, then rerun');
      }
      return sha;
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
      return Date.parse(lease.expiresAt) - Date.now() < EXPIRING_MS ? 'expiring' : 'held';
    },

    async install(lease, app, progress) {
      if (app.source === 'local') throw new VerifyFailure('BUILD_FAILED', 'a remote session builds a pushed commit and this build names none', '{cli} down, then {cli} up');
      const sha = app.sourceSha;
      const started = await sessionCall(lease, `/__sim/build?sha=${sha}`, { method: 'POST' });
      if (started.status !== 202) throw new VerifyFailure('BUILD_FAILED', `the session refused to build ${sha.slice(0, 12)}: ${started.status} ${await started.text()}`, '{cli} down, then {cli} up');
      const built = await waitForBuild(lease, sha, progress);
      progress(`build   ${app.key}  github-actions  ${sha.slice(0, 12)} ${built.incremental ? 'rebuilt' : 'built'} in ${built.seconds}s on ${lease.runner}`);
      return { ...lease, builtSha: sha };
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

    describe: (lease) => `${lease.deviceName} on ${lease.runner === '' ? `run ${lease.providerRef}` : lease.runner}`,

    doctorChecks: (options) => remoteDoctorChecks(settings, deps, github, options),
  };
  return backend;
}
