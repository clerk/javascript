import { existsSync } from 'node:fs';
import type { Runner } from '../exec.ts';
import { sleep } from '../exec.ts';
import { Secret } from '../../../specs/support/secret.ts';
import { VerifyFailure } from '../types.ts';
import { RUN_TITLE, type SessionRequest } from './protocol.ts';
import { sessionCall, type SessionRef } from './session.ts';

export type TokenSource = 'GH_TOKEN' | 'GITHUB_TOKEN' | 'gh' | 'none';

export interface ApiResponse {
  readonly status: number;
  readonly json: unknown;
  readonly headers: Headers;
  readonly firstRefusalWithToken?: string;
}

export interface GitHub {
  readonly repo: string;
  readonly workflow: string;
  readonly tokenSource: TokenSource;
  api(method: 'GET' | 'POST', path: string, body?: unknown): Promise<ApiResponse>;
}

export interface GitHubOptions {
  readonly repo: string;
  readonly workflow: string;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly runner: Runner;
  readonly retryDelayMs?: number;
}

const TRANSIENT_RETRIES = 3;

export async function openGitHub(options: GitHubOptions): Promise<GitHub> {
  const { env } = options;
  let tokenSource: TokenSource = 'none';
  let token: Secret<'github-token'> | null = null;
  const fromEnv = (['GH_TOKEN', 'GITHUB_TOKEN'] as const).find((name) => (env[name] ?? '') !== '');
  if (fromEnv !== undefined) {
    tokenSource = fromEnv;
    token = new Secret('github-token', env[fromEnv]!);
  } else {
    const gh = await options.runner('gh', ['auth', 'token']);
    if (gh.code === 0 && gh.stdout.trim() !== '') {
      tokenSource = 'gh';
      token = new Secret('github-token', gh.stdout.trim());
    }
  }
  const base = (env.GITHUB_API_URL ?? 'https://api.github.com').replace(/\/$/, '');
  return {
    repo: options.repo,
    workflow: options.workflow,
    tokenSource,
    async api(method, path, body) {
      const send = async (authorized: boolean): Promise<ApiResponse> => {
        const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'verify-remote' };
        if (body !== undefined) headers['Content-Type'] = 'application/json';
        if (authorized) token?.use('github-authorization', (plain) => (headers.Authorization = `Bearer ${plain}`));
        const response = await fetch(`${base}/repos/${options.repo}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual', signal: AbortSignal.timeout(30_000) });
        const text = await response.text();
        let json: unknown = null;
        try {
          json = text === '' ? null : JSON.parse(text);
        } catch {
          json = null;
        }
        return { status: response.status, json, headers: response.headers };
      };
      let first = await send(true);
      for (let attempt = 1; method === 'GET' && first.status >= 500 && attempt <= TRANSIENT_RETRIES; attempt += 1) {
        await sleep(attempt * (options.retryDelayMs ?? 1500));
        first = await send(true);
      }
      if (method !== 'GET' || token === null || (first.status !== 401 && first.status !== 403)) return first;
      return { ...(await send(false)), firstRefusalWithToken: message(first) };
    },
  };
}

export const CLOUD_GITHUB_ACCESS =
  'A 403 on git push means this machine\'s GitHub credential may not push to the repository. In a cloud sandbox that credential belongs to the sandbox\'s GitHub integration, and someone who administers the organization gives the integration access to the repository. REST calls there can use another credential, so they may work while a push is refused';

export function gitFailure(output: string): string {
  const lines = output.trim().split('\n').map((line) => line.trim()).filter((line) => line !== '');
  const remote = lines.filter((line) => line.startsWith('remote:')).map((line) => line.replace(/^remote:\s*/, ''));
  return [...remote, lines.at(-1) ?? 'no output'].filter((line, i, all) => all.indexOf(line) === i).join(' | ');
}

const message = (response: ApiResponse): string => `${response.status}${typeof (response.json as { message?: unknown } | null)?.message === 'string' ? ` ${(response.json as { message: string }).message}` : ''}`;

export interface StartOptions {
  readonly ref: string;
  readonly readableWithinMs?: number;
}

async function untilReadable(github: GitHub, runId: string, withinMs: number): Promise<void> {
  const deadline = Date.now() + withinMs;
  while ((await github.api('GET', `/actions/runs/${runId}`)).status !== 200 && Date.now() < deadline) await sleep(Math.min(1500, withinMs / 4));
}

async function findRun(github: GitHub, query: string, matches: (run: { id: number; display_title: string }) => boolean, seconds: number): Promise<string | null> {
  const deadline = Date.now() + seconds * 1000;
  for (;;) {
    const listed = await github.api('GET', `/actions/workflows/${github.workflow}/runs?per_page=20&${query}`);
    const runs = ((listed.json as { workflow_runs?: { id: number; display_title: string }[] } | null)?.workflow_runs ?? []).filter(matches);
    if (runs[0] !== undefined) return String(runs[0].id);
    if (Date.now() >= deadline) return null;
    await sleep(3000);
  }
}

const isRunOf = (request: Pick<SessionRequest, 'owner' | 'session'>) => (run: { display_title: string }): boolean => {
  const title = RUN_TITLE.exec(run.display_title);
  return title !== null && title[1] === request.owner && title[2] === request.session;
};

export async function startRun(github: GitHub, request: SessionRequest, options: StartOptions): Promise<string> {
  const dispatched = await github.api('POST', `/actions/workflows/${github.workflow}/dispatches`, {
    ref: options.ref,
    inputs: { owner: request.owner, session: request.session, request: JSON.stringify(request) },
    return_run_details: true,
  });
  const byDispatch = async (runId: string): Promise<string> => {
    await untilReadable(github, runId, options.readableWithinMs ?? 60_000);
    return runId;
  };
  const late = `{cli} down --stale ends it once it shows at https://github.com/${github.repo}/actions/workflows/${github.workflow}`;
  if (dispatched.status === 200 || dispatched.status === 204) {
    const direct = (dispatched.json as { workflow_run_id?: number } | null)?.workflow_run_id;
    const runId = direct !== undefined ? String(direct) : await findRun(github, 'event=workflow_dispatch', isRunOf(request), 180);
    if (runId === null) throw new VerifyFailure('NOT_READY', `GitHub accepted the dispatch of ${github.workflow} but no run for session ${request.session} appeared in 3 minutes; if it starts later it bills until it idles out`, late);
    return byDispatch(runId);
  }
  const dispatchRefused = message(dispatched);
  if (dispatched.status >= 500) {
    const runId = await findRun(github, 'event=workflow_dispatch', isRunOf(request), 60);
    if (runId === null) throw new VerifyFailure('NOT_READY', `GitHub answered the dispatch of ${github.workflow} with ${dispatchRefused}, and no run for session ${request.session} appeared in a minute`, `run the command again; if a run for this session starts late, ${late}`);
    return byDispatch(runId);
  }
  throw new VerifyFailure(
    'NOT_READY',
    `could not start a session: GitHub refused the dispatch of ${github.workflow} (${dispatchRefused})`,
    `a session needs permission to dispatch ${github.workflow} on ${github.repo}; push the branch that holds ${github.workflow} first if GitHub has never seen it. ${CLOUD_GITHUB_ACCESS}`,
  );
}

export interface RunView {
  readonly status: string;
  readonly conclusion: string | null;
  readonly url: string;
}

export async function viewRun(github: GitHub, runId: string): Promise<RunView> {
  const response = await github.api('GET', `/actions/runs/${runId}`);
  if (response.status !== 200) throw new VerifyFailure('NOT_READY', `could not read run ${runId}: ${message(response)}`, `open https://github.com/${github.repo}/actions/runs/${runId}`);
  const run = response.json as { status: string; conclusion: string | null; html_url: string };
  return { status: run.status, conclusion: run.conclusion, url: run.html_url };
}

export interface JobView {
  readonly name: string;
  readonly status: string;
  readonly steps: readonly { readonly name: string; readonly status: string; readonly conclusion: string | null }[];
}

export async function viewJobs(github: GitHub, runId: string): Promise<readonly JobView[]> {
  const response = await github.api('GET', `/actions/runs/${runId}/jobs?per_page=30`);
  if (response.status !== 200) return [];
  type Wire = { name: string; status: string; conclusion: string | null; steps?: { name: string; status: string; conclusion: string | null }[] };
  return ((response.json as { jobs?: Wire[] } | null)?.jobs ?? []).map((job) => ({
    name: job.name,
    status: job.status,
    steps: (job.steps ?? []).map((step) => ({ name: step.name, status: step.status, conclusion: step.conclusion })),
  }));
}

export function publishedStep(jobs: readonly JobView[], pattern: RegExp): string | null {
  for (const job of jobs) {
    for (const step of job.steps) {
      const found = pattern.exec(step.name)?.[1];
      if (found !== undefined && found !== '') return found;
    }
  }
  return null;
}

export async function waitForStep(github: GitHub, runId: string, pattern: RegExp, seconds: number, onWait?: (run: RunView, jobs: readonly JobView[]) => void): Promise<string> {
  const deadline = Date.now() + seconds * 1000;
  for (;;) {
    const jobs = await viewJobs(github, runId);
    const found = publishedStep(jobs, pattern);
    if (found !== null) return found;
    const run = await viewRun(github, runId);
    if (run.status === 'completed') {
      const failed = jobs.flatMap((job) => job.steps.filter((step) => step.conclusion === 'failure').map((step) => `${job.name}: ${step.name}`));
      throw new VerifyFailure('NOT_READY', `run ${runId} ended (${run.conclusion ?? 'no conclusion'}) before it published${failed.length > 0 ? `; failed at ${failed.join(', ')}` : ''}`, `read ${run.url}`);
    }
    if (Date.now() >= deadline) throw new VerifyFailure('NOT_READY', `run ${runId} published nothing within ${seconds}s (it is ${run.status})`, `read ${run.url}; a runner label with no free machine stays queued`);
    onWait?.(run, jobs);
    await sleep(4000);
  }
}

export function waitReporter(progress: (line: string) => void, runId: string, labels: { readonly plan: string; readonly session: string }): (run: RunView, jobs: readonly JobView[]) => void {
  const began = Date.now();
  let last = '';
  let lastAt = 0;
  return (_run, jobs) => {
    const session = jobs.find((job) => job.name === 'session');
    const plan = jobs.find((job) => job.name === 'plan');
    const what =
      session === undefined
        ? plan?.status === 'in_progress'
          ? `its request to be read on ${labels.plan}`
          : `a ${labels.plan} runner to read its request`
        : session.status === 'queued'
          ? `a ${labels.session} runner`
          : `the tunnel on ${labels.session}`;
    if (what === last && Date.now() - lastAt < 60_000) return;
    progress(`wait    run ${runId} has waited ${Math.round((Date.now() - began) / 1000)}s, now for ${what}`);
    last = what;
    lastAt = Date.now();
  };
}

async function waitForRunEnd(github: GitHub, runId: string, seconds: number): Promise<RunView> {
  const deadline = Date.now() + seconds * 1000;
  for (;;) {
    const run = await viewRun(github, runId);
    if (run.status === 'completed' || Date.now() >= deadline) return run;
    await sleep(4000);
  }
}

async function cancelRun(github: GitHub, runId: string): Promise<string | null> {
  const response = await github.api('POST', `/actions/runs/${runId}/cancel`);
  return response.status === 202 || response.status === 409 ? null : message(response);
}

export interface LiveRun {
  readonly runId: string;
  readonly owner: string;
  readonly session: string;
  readonly createdAt: string;
}

export async function liveRuns(github: GitHub): Promise<readonly LiveRun[]> {
  const out: LiveRun[] = [];
  for (const status of ['in_progress', 'queued'] as const) {
    const listed = await github.api('GET', `/actions/workflows/${github.workflow}/runs?per_page=50&status=${status}`);
    for (const run of (listed.json as { workflow_runs?: { id: number; display_title: string; created_at: string }[] } | null)?.workflow_runs ?? []) {
      const title = RUN_TITLE.exec(run.display_title);
      if (title !== null) out.push({ runId: String(run.id), owner: title[1]!, session: title[2]!, createdAt: run.created_at });
    }
  }
  return out;
}

export async function currentBranch(runner: Runner, worktree: string): Promise<string> {
  const branch = (await runner('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: worktree })).stdout.trim();
  if (branch === '' || branch === 'HEAD') throw new VerifyFailure('NOT_READY', 'HEAD is detached, so there is no branch to start a session from', 'git switch -c <branch>, then git push -u origin <branch>');
  return branch;
}

// A cancelled job abandons the step that uploads the evidence, so a session that holds evidence gets longer to end by itself.
const ARTIFACT_UPLOAD_SECONDS = 300;

export async function endSession(github: GitHub, runId: string, ref: SessionRef | null): Promise<{ readonly conclusion: string | null; readonly cancelled: boolean; readonly problem: string | null }> {
  const stopped = ref !== null && existsSync(ref.tokenFile) ? await sessionCall(ref, '/__sim/stop', { method: 'POST', timeoutMs: 15_000 }).catch(() => null) : null;
  const holdsEvidence = stopped?.status === 200 && ((await stopped.json().catch(() => null)) as { evidence?: unknown } | null)?.evidence != null;
  let run = await waitForRunEnd(github, runId, ref === null ? 0 : holdsEvidence ? ARTIFACT_UPLOAD_SECONDS : 90);
  if (run.status === 'completed') return { conclusion: run.conclusion, cancelled: false, problem: null };
  const refused = await cancelRun(github, runId);
  run = await waitForRunEnd(github, runId, 60);
  if (run.status === 'completed') return { conclusion: run.conclusion, cancelled: true, problem: null };
  return { conclusion: null, cancelled: refused === null, problem: `run ${runId} is still ${run.status}${refused === null ? '' : ` and the cancel was refused (${refused})`}; it ends itself on idle or at its cap` };
}

export { message as apiMessage };
