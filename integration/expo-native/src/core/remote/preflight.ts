import net from 'node:net';
import { arch, platform as osPlatform, release } from 'node:os';
import type { Runner } from '../exec.ts';
import { VerifyFailure, type DoctorCheck, type DoctorCheckId, type DoctorOptions } from '../types.ts';
import { CLOUD_GITHUB_ACCESS, apiMessage, currentBranch, endSession, gitFailure, liveRuns, startRun, viewJobs, waitForStep, waitReporter, type ApiResponse, type GitHub } from './github.ts';
import { STEP } from './protocol.ts';
import { daemonHealthy, firstHealth, sessionHealth, tunnelUrl, type SessionRef } from './session.ts';
import { forgetSession, newSessionRequest, saveToken, savedDriverId, type RemoteDeps, type RemoteSettings } from './settings.ts';
import { TUNNEL } from './tunnel.ts';

const CLOUD_FIX = `add ${TUNNEL.allowedHost} to the allowed domains of the environment this command runs in`;

function check(id: DoctorCheckId, ok: boolean, detail: string, fix: string): DoctorCheck {
  return ok ? { id, ok, detail } : { id, ok, detail, fix };
}

const notRun = (id: DoctorCheckId, why: string): DoctorCheck => ({ id, ok: true, state: 'not-run', detail: `not run: ${why}` });
const blockedBy = (id: DoctorCheckId, failed: DoctorCheckId, why = ''): DoctorCheck => notRun(id, `needs ${failed}${why === '' ? '' : ` (${why})`}`);

const ONLY_LIVE = 'doctor starts no workflow run without --live';

const failureText = (error: unknown): string => {
  const cause = (error as { cause?: { code?: string; message?: string } }).cause;
  return `${(error as Error).message}${cause === undefined ? '' : ` (${cause.code ?? cause.message ?? ''})`}`;
};

function proxyOf(env: RemoteDeps['env']): URL | null {
  const raw = env.HTTPS_PROXY ?? env.https_proxy;
  if (raw === undefined || raw === '') return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function connectThroughProxy(proxy: URL, host: string, timeoutMs = 10_000): Promise<{ readonly status: number; readonly line: string }> {
  return new Promise((resolve) => {
    const socket = net.connect(Number(proxy.port || (proxy.protocol === 'https:' ? 443 : 80)), proxy.hostname);
    const authorization = proxy.username === '' || proxy.password === '' ? '' : `Proxy-Authorization: Basic ${Buffer.from(`${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`).toString('base64')}\r\n`;
    let seen = '';
    const finish = (status: number, line: string) => {
      socket.destroy();
      resolve({ status, line });
    };
    socket.setTimeout(timeoutMs, () => finish(0, 'the proxy did not answer'));
    socket.on('error', (error) => finish(0, `the proxy is unreachable: ${error.message}`));
    socket.on('connect', () => socket.write(`CONNECT ${host}:443 HTTP/1.1\r\nHost: ${host}:443\r\n${authorization}\r\n`));
    socket.on('data', (chunk: Buffer) => {
      seen += chunk.toString('latin1');
      const end = seen.indexOf('\r\n');
      if (end < 0) return;
      const line = seen.slice(0, end);
      finish(Number(/^HTTP\/\d\.\d (\d{3})/.exec(line)?.[1] ?? 0), line);
    });
  });
}

export async function egressCheck(id: DoctorCheckId, host: string, env: RemoteDeps['env'], fix: string, request: typeof fetch = fetch): Promise<DoctorCheck> {
  const proxy = proxyOf(env);
  const usesProxy = proxy !== null && env.NODE_USE_ENV_PROXY === '1';
  if (usesProxy) {
    const connect = await connectThroughProxy(proxy, host);
    if (connect.status !== 200) return check(id, false, `blocked: the proxy at ${proxy.host} answered the CONNECT to ${host} with "${connect.line}"`, fix);
  }
  const via = usesProxy ? ` through the proxy at ${proxy.host}` : '';
  try {
    const response = await request(`https://${host}/`, { redirect: 'manual', signal: AbortSignal.timeout(15_000) });
    const fromCloudflare = response.headers.has('cf-ray') || response.headers.get('server') === 'cloudflare';
    if (fromCloudflare) return check(id, true, `reached ${host}${via}: HTTP ${response.status} from cloudflare`, '');
    return check(id, false, `blocked: ${host} answered HTTP ${response.status}${via} without Cloudflare's headers, so something between this machine and the host answered in its place`, fix);
  } catch (error) {
    return check(id, false, `no response from ${host}${via}: ${failureText(error)}`, fix);
  }
}

async function environmentCheck(github: GitHub, deps: RemoteDeps, worktree: string): Promise<DoctorCheck> {
  const npm = await deps.runner('npm', ['--version']);
  const gh = await deps.runner('gh', ['--version']);
  const remote = (await deps.runner('git', ['remote', 'get-url', 'origin'], { cwd: worktree })).stdout.trim();
  const remoteKind = /^(git@|ssh:)/.test(remote) ? 'ssh' : /^https?:\/\/(127\.0\.0\.1|localhost)/.test(remote) ? 'a local git proxy' : /^https?:/.test(remote) ? 'https' : 'unknown';
  const proxy = proxyOf(deps.env);
  const why = deps.env.VERIFY_EGRESS_WHY === undefined ? '' : ` (${deps.env.VERIFY_EGRESS_WHY})`;
  const egress = proxy === null ? 'direct (no HTTPS_PROXY)' : deps.env.NODE_USE_ENV_PROXY === '1' ? `through the proxy at ${proxy.host}${why}` : `direct, not through the proxy at ${proxy.host}${why}`;
  const detail = [
    `${osPlatform()} ${arch()} ${release()}`,
    `npm ${npm.code === 0 ? npm.stdout.trim() : 'missing'}`,
    `gh ${gh.code === 0 ? 'present' : 'absent'}`,
    `GitHub token from ${github.tokenSource === 'none' ? 'nowhere' : github.tokenSource}`,
    `origin over ${remoteKind}`,
    `egress ${egress}`,
  ].join('; ');
  return check('remote-env', npm.code === 0, detail, 'install npm with Node 24');
}

async function gitChecks(settings: RemoteSettings, runner: Runner, worktree: string): Promise<readonly DoctorCheck[]> {
  const git = (args: readonly string[]) => runner('git', args, { cwd: worktree, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
  let branch: string;
  try {
    branch = await currentBranch(runner, worktree);
  } catch (error) {
    const failure = error as VerifyFailure;
    return [check('git-fetch', false, failure.message, failure.fix), blockedBy('git-push', 'git-fetch')];
  }
  const fetched = await git(['fetch', '--dry-run', '--no-tags', 'origin', branch]);
  const pushOwn = await git(['push', '--dry-run', 'origin', `HEAD:refs/heads/${branch}`]);
  return [
    check('git-fetch', fetched.code === 0, fetched.code === 0 ? `git fetch origin ${branch} works` : `git fetch origin ${branch} failed: ${gitFailure(fetched.stderr)}`, `git push -u origin ${branch}, and check the remote with git remote -v`),
    check(
      'git-push',
      pushOwn.code === 0,
      pushOwn.code === 0 ? `dry-run push of ${branch} is accepted` : `dry-run push of ${branch} failed: ${gitFailure(pushOwn.stderr)}`,
      `verifying a commit you make here needs git push access to ${settings.repo}, because a remote session builds a pushed commit; verifying a commit GitHub already has needs only REST. ${CLOUD_GITHUB_ACCESS}`,
    ),
  ];
}

const withAndWithoutToken = (response: ApiResponse): string => `${apiMessage(response)}${response.firstRefusalWithToken === undefined ? '' : ` without the token (with it: ${response.firstRefusalWithToken})`}`;

async function restCheck(settings: RemoteSettings, github: GitHub): Promise<DoctorCheck> {
  const fix = `check network access to api.github.com. ${CLOUD_GITHUB_ACCESS}`;
  try {
    const repo = await github.api('GET', '');
    const runs = await github.api('GET', '/actions/runs?per_page=1');
    const ok = repo.status === 200 && runs.status === 200;
    const left = repo.headers.get('x-ratelimit-remaining');
    const tokenRefused = repo.firstRefusalWithToken !== undefined || runs.firstRefusalWithToken !== undefined;
    return check(
      'github-rest',
      ok,
      `repository ${withAndWithoutToken(repo)}, workflow runs ${withAndWithoutToken(runs)}${left === null ? '' : `, ${left} requests left this hour`}${ok && tokenRefused ? `; reads of ${settings.repo} work, but GitHub refuses this machine's token, so starting a session will fail` : ''}`,
      fix,
    );
  } catch (error) {
    return check('github-rest', false, `api.github.com did not answer: ${failureText(error)}`, fix);
  }
}

async function commitCheck(github: GitHub, runner: Runner, worktree: string): Promise<DoctorCheck> {
  const sha = (await runner('git', ['rev-parse', 'HEAD'], { cwd: worktree })).stdout.trim();
  const found = await github.api('GET', `/commits/${sha}`).catch(() => null);
  return check('remote-commit', found?.status === 200, found?.status === 200 ? `GitHub has HEAD ${sha.slice(0, 12)}` : `GitHub does not have HEAD ${sha.slice(0, 12)} (${found === null ? 'no answer' : found.status})`, 'git push; a remote session builds the pushed commit');
}

const LIVE_CHECKS = ['live-session', 'live-sim-health', 'live-daemon-health', 'live-device', 'live-stop'] as const satisfies readonly DoctorCheckId[];
const NO_DEVICE = 'this session boots no device; --runner <label> names a runner that has one';

async function liveChecks(settings: RemoteSettings, deps: RemoteDeps, github: GitHub, options: DoctorOptions): Promise<readonly DoctorCheck[]> {
  const withDevice = options.runner !== undefined;
  const { request, token } = newSessionRequest(settings, deps, {
    runner: options.runner ?? settings.plumbingRunner,
    device: withDevice ? settings.device : null,
    sha: null,
    idleMinutes: 3,
    capMinutes: withDevice ? 20 : 10,
  });
  const tokenFile = saveToken(settings, request.session, token);
  const checks: DoctorCheck[] = [];
  const began = Date.now();
  const seconds = () => Math.round((Date.now() - began) / 1000);
  const runUrl = (runId: string) => `https://github.com/${settings.repo}/actions/runs/${runId}`;
  let runId: string | null = null;
  let session: SessionRef | null = null;
  try {
    runId = await startRun(github, request, { ref: await currentBranch(deps.runner, options.worktree) });
    options.progress(`live    session ${request.session} is run ${runId} on ${request.runner}; it stops itself after 3 idle minutes`);
    const host = await waitForStep(github, runId, STEP.tunnelPattern, 15 * 60, waitReporter(options.progress, runId, { plan: settings.plumbingRunner, session: request.runner }));
    session = { baseUrl: tunnelUrl(host), tokenFile };
    checks.push(check('live-session', true, `run ${runId} on ${request.runner} published its tunnel ${seconds()}s after the dispatch`, ''));

    const health = await firstHealth(session, 120);
    checks.push(check('live-sim-health', health !== null, health === null ? '/__sim/health did not answer 200 with the bearer' : `/__sim/health answered through the tunnel ${seconds()}s in`, CLOUD_FIX));

    let daemon = false;
    let deviceReady = !withDevice;
    const deadline = Date.now() + (withDevice ? 12 : 4) * 60_000;
    while (health !== null && Date.now() < deadline && !(daemon && deviceReady)) {
      daemon = daemon || (await daemonHealthy(session));
      deviceReady = deviceReady || (await sessionHealth(session))?.device?.ready === true;
      if (!(daemon && deviceReady)) await new Promise((done) => setTimeout(done, 5000));
    }
    checks.push(check('live-daemon-health', daemon, daemon ? `/agent-device/health answered through the tunnel ${seconds()}s in` : '/agent-device/health never answered ok', `read ${runUrl(runId)}`));
    if (withDevice) checks.push(check('live-device', deviceReady, deviceReady ? `${settings.device} was ready on ${request.runner} ${seconds()}s in` : `${settings.device} was not ready in time`, `read ${runUrl(runId)}; --runner needs a runner image that has a device named ${settings.device}`));
  } catch (error) {
    const failure = error instanceof VerifyFailure ? error : new VerifyFailure('NOT_READY', failureText(error), 'run doctor again');
    const steps = LIVE_CHECKS.filter((id) => id !== 'live-stop' && (withDevice || id !== 'live-device'));
    const failed = steps.find((id) => !checks.some((c) => c.id === id)) ?? 'live-session';
    checks.push(check(failed, false, failure.message, failure.fix));
  } finally {
    if (runId !== null) {
      const stopAt = Date.now();
      const ended = await endSession(github, runId, session);
      const sessionJob = (await viewJobs(github, runId)).find((job) => job.name === 'session');
      checks.push(
        check(
          'live-stop',
          ended.problem === null && !ended.cancelled,
          ended.problem ?? `${ended.cancelled ? 'the stop route did not end the run, so it was cancelled' : 'the stop route ended the run'}: run ${ended.conclusion}, session job ${sessionJob?.status ?? 'not started'} ${Math.round((Date.now() - stopAt) / 1000)}s after the stop`,
          `open ${runUrl(runId)} and cancel it`,
        ),
      );
    }
    forgetSession(settings, request.session);
  }
  const firstFailure = checks.find((c) => !c.ok)?.id ?? 'live-session';
  return LIVE_CHECKS.map((id) => checks.find((c) => c.id === id) ?? (id === 'live-device' && !withDevice ? notRun(id, NO_DEVICE) : blockedBy(id, firstFailure)));
}

export async function remoteDoctorChecks(settings: RemoteSettings, deps: RemoteDeps, openHub: () => Promise<GitHub>, options: DoctorOptions): Promise<{ readonly toolchain: readonly DoctorCheck[]; readonly device: readonly DoctorCheck[] }> {
  const github = await openHub();
  const toolchain = [await environmentCheck(github, deps, options.worktree)];
  const device: DoctorCheck[] = [...(await gitChecks(settings, deps.runner, options.worktree))];
  const rest = await restCheck(settings, github);
  device.push(rest);
  const commit = rest.ok ? await commitCheck(github, deps.runner, options.worktree) : blockedBy('remote-commit', 'github-rest');
  device.push(commit);
  const failed: DoctorCheckId | null = !rest.ok ? 'github-rest' : !commit.ok ? 'remote-commit' : null;
  device.push(await egressCheck('tunnel-egress', TUNNEL.probeHost, deps.env, CLOUD_FIX));
  device.push(await egressCheck('clerk-egress', 'api.clerk.com', deps.env, 'add api.clerk.com and *.clerk.accounts.dev to the allowed domains; the driver creates test instances, test users, and sign-in tickets there'));
  if (rest.ok) {
    const owner = savedDriverId(settings);
    const mine = owner === null ? [] : (await liveRuns(github)).filter((run) => run.owner === owner);
    device.push(check('remote-sessions', true, mine.length === 0 ? 'no session of this checkout is running' : `running for this checkout and billed until ended: ${mine.map((run) => `${run.session} (run ${run.runId})`).join(', ')}; {cli} down ends a leased session and {cli} down --stale ends any other`, ''));
  }
  if (!options.live) {
    options.progress('doctor  git and REST reads only: nothing was started; rerun with --live to start one short session, which proves the rest');
    device.push(...LIVE_CHECKS.map((id) => notRun(id, ONLY_LIVE)));
  } else {
    device.push(...(failed === null ? await liveChecks(settings, deps, github, options) : LIVE_CHECKS.map((id) => blockedBy(id, failed))));
  }
  return { toolchain, device };
}
