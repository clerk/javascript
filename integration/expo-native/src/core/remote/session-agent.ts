import { spawn, type ChildProcess } from 'node:child_process';
import { Resolver } from 'node:dns/promises';
import { appendFileSync, createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RequestError,
  matchesToken,
  parseRequest,
  type BuildState,
  type EndReason,
  type RecipeAnswers,
  type RecipeRequest,
  type SessionDeviceRef,
  type SessionHealth,
  type SessionRequest,
} from './protocol.ts';
import type { CommandLine, ExecResult } from '../exec.ts';
import { coreVersion } from '../manifest.ts';
import { HANDOFF_LIMITS, HandoffRefused, evidenceReceiver } from './handoff.ts';
import { TUNNEL } from './tunnel.ts';

const AGENT_ROUTES = ['/agent-device', '/health', '/rpc', '/upload', '/artifacts'];
const DAEMON_GRACE_MS = 60_000;
const COMMAND_TIMEOUT_MS = 30_000;
const BUILD_TIMEOUT_MINUTES = 30;
const PUBLIC_RESOLVERS = ['1.1.1.1', '8.8.8.8'];
const RECIPE = fileURLToPath(new URL('./recipe.ts', import.meta.url));
const PINNED_AGENT_DEVICE = fileURLToPath(new URL('../../../node_modules/.bin/agent-device', import.meta.url));

function setOutputs(file: string | undefined, values: Readonly<Record<string, string>>): void {
  const text = Object.entries(values).map(([key, value]) => `${key}=${value}\n`).join('');
  if (file === undefined || file === '') process.stdout.write(text);
  else appendFileSync(file, text);
}

type Env = Readonly<Record<string, string | undefined>>;
type GitHubGet = (path: string) => Promise<unknown>;

const COMMIT = /^[0-9a-f]{40}$/;

function githubOf(env: Env): GitHubGet {
  const base = `${(env.GITHUB_API_URL ?? 'https://api.github.com').replace(/\/$/, '')}/repos/${env.GITHUB_REPOSITORY ?? ''}`;
  const token = env.GITHUB_TOKEN ?? '';
  return async (path) => {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'verify-remote', ...(token === '' ? {} : { Authorization: `Bearer ${token}` }) },
        signal: AbortSignal.timeout(30_000),
      });
      return response.ok ? await response.json() : null;
    } catch {
      return null;
    }
  };
}

function takeGitHub(env: NodeJS.ProcessEnv): GitHubGet {
  const get = githubOf(env);
  delete env.GITHUB_TOKEN;
  return get;
}

async function isALaterCommitOfTheBranch(sha: string, dispatched: string, ref: string, get: GitHubGet): Promise<boolean> {
  const branch = /^refs\/heads\/(.+)$/.exec(ref)?.[1];
  if (branch === undefined || !COMMIT.test(dispatched)) return false;
  const found = (await get(`/git/ref/heads/${branch.split('/').map(encodeURIComponent).join('/')}`)) as { readonly object?: { readonly sha?: unknown } } | null;
  const head = found?.object?.sha;
  if (typeof head !== 'string' || !COMMIT.test(head)) return false;
  const comesAfter = async (later: string, earlier: string): Promise<boolean> => ((await get(`/compare/${earlier}...${later}`)) as { readonly status?: unknown } | null)?.status === 'ahead';
  return (await comesAfter(sha, dispatched)) && (sha === head || (await comesAfter(head, sha)));
}

export async function plan(env: Env, get: GitHubGet = githubOf(env)): Promise<number> {
  let request: SessionRequest;
  try {
    request = parseRequest((env.VERIFY_REQUEST ?? '').trim());
  } catch (error) {
    if (!(error instanceof RequestError)) throw error;
    console.log(`::notice title=verify-remote::no session started: ${error.message}`);
    setOutputs(env.GITHUB_OUTPUT, { mode: 'none' });
    return 0;
  }
  const dispatched = env.GITHUB_SHA ?? '';
  const ref = env.GITHUB_REF ?? '';
  if (request.sha !== null && request.sha !== dispatched && !(await isALaterCommitOfTheBranch(request.sha, dispatched, ref, get))) {
    console.log(
      `::error title=verify-remote::no session started: the request asks for commit ${request.sha}. This run was dispatched on ${dispatched}, and GitHub does not show the requested commit as a later commit of ${ref}. Push that commit to the branch, or pull the branch, then start the session again.`,
    );
    return 1;
  }
  setOutputs(env.GITHUB_OUTPUT, {
    mode: 'session',
    runner: request.runner,
    device: request.device ?? '',
    sha: request.sha ?? '',
    timeout: String(request.capMinutes + 10),
    request: JSON.stringify(request),
  });
  return 0;
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function bearer(req: IncomingMessage): string | null {
  return /^Bearer\s+(.+)$/i.exec((req.headers.authorization ?? '').trim())?.[1] ?? null;
}

const isAgentRoute = (pathname: string): boolean => AGENT_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

function exitOf(child: ChildProcess): Promise<number> {
  return new Promise((done) => {
    child.on('error', () => done(127));
    child.on('close', (code) => done(code ?? 1));
  });
}

function stopGroup(child: ChildProcess | null): void {
  if (child?.pid === undefined || child.exitCode !== null) return;
  const signal = (name: NodeJS.Signals) => {
    try {
      process.kill(-child.pid!, name);
    } catch {
      child.kill(name);
    }
  };
  signal('SIGTERM');
  setTimeout(() => child.exitCode === null && signal('SIGKILL'), 10_000).unref();
}

async function runBriefly(commands: readonly CommandLine[]): Promise<void> {
  for (const step of commands) {
    const child = spawn(step.command, [...step.args], { cwd: step.cwd, stdio: 'ignore' });
    const timer = setTimeout(() => child.kill('SIGKILL'), COMMAND_TIMEOUT_MS);
    await exitOf(child);
    clearTimeout(timer);
  }
}

async function capture(command: CommandLine, options: { readonly timeoutMs: number; readonly limit: number }): Promise<ExecResult> {
  const child = spawn(command.command, [...command.args], { cwd: command.cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  const kept = { stdout: '', stderr: '' };
  const keep = (stream: 'stdout' | 'stderr') => (chunk: Buffer) => (kept[stream] = (kept[stream] + chunk.toString()).slice(-options.limit));
  child.stdout.on('data', keep('stdout'));
  child.stderr.on('data', keep('stderr'));
  const timer = setTimeout(() => child.kill('SIGKILL'), options.timeoutMs);
  const code = await exitOf(child);
  clearTimeout(timer);
  return { code, ...kept };
}

async function recipe<Op extends RecipeRequest['op']>(device: SessionDeviceRef, request: Extract<RecipeRequest, { op: Op }>): Promise<RecipeAnswers[Op]> {
  const asked = await capture({ command: process.execPath, args: [RECIPE, JSON.stringify({ device, request })] }, { timeoutMs: COMMAND_TIMEOUT_MS, limit: 1_000_000 });
  if (asked.code !== 0) {
    const lines = asked.stderr.split('\n').map((line) => line.trim()).filter((line) => line !== '');
    throw new Error(`the device module of the checked-out commit could not answer ${request.op}: ${lines.find((line) => /^\w*Error\b/.test(line)) ?? lines.slice(-3).join(' | ')}`);
  }
  return JSON.parse(asked.stdout) as RecipeAnswers[Op];
}

function readBody(req: IncomingMessage, limit: number): Promise<string | null> {
  return new Promise((done) => {
    let text = '';
    let over = false;
    req.on('data', (chunk: Buffer) => {
      over ||= text.length + chunk.length > limit;
      if (!over) text += chunk.toString();
    });
    req.on('end', () => done(over ? null : text));
    req.on('error', () => done(null));
  });
}

async function serve(env: NodeJS.ProcessEnv): Promise<void> {
  const request = parseRequest(env.VERIFY_SESSION_REQUEST ?? '');
  const dispatched = env.GITHUB_SHA ?? '';
  const dispatchedRef = env.GITHUB_REF ?? '';
  const github = takeGitHub(env);
  const work = resolve(env.VERIFY_SESSION_WORK ?? 'verify-remote-work');
  const port = Number(env.VERIFY_SESSION_PORT ?? 3199);
  const agentPort = Number(env.VERIFY_SESSION_AGENT_PORT ?? 4310);
  const deviceId = env.VERIFY_SESSION_DEVICE_ID ?? '';
  const deviceName = env.VERIFY_SESSION_DEVICE_NAME ?? deviceId;
  mkdirSync(work, { recursive: true });

  const device: SessionDeviceRef | null = deviceId === '' ? null : { id: deviceId, platform: request.platform };
  const core = coreVersion();
  const evidence = evidenceReceiver(work);

  const minuteMs = Number(env.VERIFY_SESSION_MINUTE_MS ?? 60_000);
  const tickMs = Math.min(5000, minuteMs / 6);
  const startedAt = Date.now();
  const capAt = startedAt + request.capMinutes * minuteMs;
  const idleMs = request.idleMinutes * minuteMs;
  let lastDriverAt = startedAt;
  let token: string | null = null;
  let ending: EndReason | null = null;
  let daemonOkAt = 0;
  let proxy: ChildProcess | null = null;
  let proxyStartedAt = 0;
  let recorder: ({ readonly child: ChildProcess; readonly exited: Promise<number>; readonly file: string } & Pick<RecipeAnswers['record'], 'stop' | 'collect'>) | null = null;
  let build: BuildState = { state: 'none' };
  let buildChild: ChildProcess | null = null;
  let buildGeneration = 0;
  let buildSettled: Promise<unknown> = Promise.resolve();
  let buildBegan = 0;
  let builtOnce = false;

  const logFile = (name: 'agent-device-proxy' | 'build' | 'tunnel') => join(work, `${name}.log`);
  const scrub = (text: string): string => (token === null ? text : text.split(token).join('<token>'));
  const log = (name: Parameters<typeof logFile>[0], chunk: Buffer | string): void => appendFileSync(logFile(name), scrub(chunk.toString()));

  const tunnel = spawn(env.VERIFY_SESSION_CLOUDFLARED ?? TUNNEL.binary, [...TUNNEL.command(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
  let tunnelSeen = '';
  let tunnelHost: string | null = null;
  async function publishTunnelOncePublicDnsHasIt(host: string): Promise<void> {
    const pastThisMachinesDnsCache = new Resolver({ timeout: 2000, tries: 1 });
    pastThisMachinesDnsCache.setServers(PUBLIC_RESOLVERS);
    const deadline = Date.now() + (env.VERIFY_SESSION_SKIP_DNS === '1' ? 0 : 90_000);
    while (Date.now() < deadline) {
      if (await pastThisMachinesDnsCache.resolve4(host).then((found) => found.length > 0, () => false)) break;
      await new Promise((done) => setTimeout(done, 1000));
    }
    writeFileSync(join(work, 'tunnel'), host);
  }
  const onTunnel = (chunk: Buffer) => {
    log('tunnel', chunk);
    if (tunnelHost !== null) return;
    tunnelSeen += chunk.toString();
    tunnelHost = TUNNEL.hostPattern.exec(tunnelSeen)?.[1] ?? null;
    if (tunnelHost !== null) void publishTunnelOncePublicDnsHasIt(tunnelHost);
  };
  tunnel.stdout.on('data', onTunnel);
  tunnel.stderr.on('data', onTunnel);
  void exitOf(tunnel).then(() => end('tunnel-lost'));

  function ensureProxy(): void {
    if (token === null || proxy !== null || ending !== null) return;
    const child = spawn(env.VERIFY_SESSION_AGENT_DEVICE ?? PINNED_AGENT_DEVICE, ['proxy', '--host', '127.0.0.1', '--port', String(agentPort)], {
      env: { ...process.env, AGENT_DEVICE_DAEMON_AUTH_TOKEN: token },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    proxy = child;
    proxyStartedAt = Date.now();
    child.stdout.on('data', (chunk: Buffer) => log('agent-device-proxy', chunk));
    child.stderr.on('data', (chunk: Buffer) => log('agent-device-proxy', chunk));
    void exitOf(child).then(() => {
      if (proxy === child) proxy = null;
    });
  }

  async function checkDaemon(): Promise<void> {
    if (proxy === null) return;
    const healthy = await fetch(`http://127.0.0.1:${agentPort}/health`, { signal: AbortSignal.timeout(4000) })
      .then(async (response) => response.ok && /"ok":\s*true/.test(await response.text()))
      .catch(() => false);
    if (healthy) daemonOkAt = Date.now();
    if (Date.now() - Math.max(daemonOkAt, proxyStartedAt) > DAEMON_GRACE_MS) proxy?.kill('SIGTERM');
  }

  function runCommands(commands: readonly CommandLine[], generation: number, tail: string[]): Promise<number> {
    return commands.reduce<Promise<number>>(async (previous, step) => {
      const code = await previous;
      if (code !== 0 || generation !== buildGeneration) return code === 0 ? 1 : code;
      log('build', `\n$ ${step.command} ${step.args.join(' ')}\n`);
      const child = spawn(step.command, [...step.args], { cwd: step.cwd, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
      buildChild = child;
      const collect = (chunk: Buffer) => {
        log('build', chunk);
        for (const line of chunk.toString().split('\n')) if (line.trim() !== '') tail.push(line);
        tail.splice(0, Math.max(0, tail.length - 30));
      };
      child.stdout.on('data', collect);
      child.stderr.on('data', collect);
      return exitOf(child);
    }, Promise.resolve(0));
  }

  function startBuild(sha: string): void {
    if (device === null) return;
    if (build.state !== 'none' && build.sha === sha && build.state !== 'failed') return;
    buildGeneration += 1;
    stopGroup(buildChild);
    const generation = buildGeneration;
    buildBegan = Date.now();
    const began = buildBegan;
    const incremental = builtOnce;
    const tail: string[] = [];
    const timeout = setTimeout(() => {
      if (generation !== buildGeneration) return;
      tail.push(`the build did not finish in ${BUILD_TIMEOUT_MINUTES} minutes and was stopped`);
      stopGroup(buildChild);
    }, BUILD_TIMEOUT_MINUTES * minuteMs);
    build = { state: 'building', sha, seconds: 0 };
    rmSync(logFile('build'), { force: true });
    const checkout: CommandLine[] = [
      { command: 'git', args: ['fetch', '--no-tags', '--depth=1', 'origin', sha] },
      { command: 'git', args: ['checkout', '--force', '--detach', sha] },
    ];
    const target = device;
    const checkoutThenBuild = async (): Promise<number> => {
      if (sha !== dispatched && !(await isALaterCommitOfTheBranch(sha, dispatched, dispatchedRef, github))) {
        tail.push(`this session builds ${dispatched}, the commit it was started on, and later commits of ${dispatchedRef}. GitHub does not show ${sha} as one. Push it to that branch, or run down and then up to start a session on it.`);
        return 1;
      }
      const checkedOut = await runCommands(checkout, generation, tail);
      if (checkedOut !== 0) return checkedOut;
      try {
        return await runCommands(await recipe(target, { op: 'build', work }), generation, tail);
      } catch (error) {
        tail.push((error as Error).message);
        return 1;
      }
    };
    buildSettled = buildSettled.then(checkoutThenBuild).then((code) => {
      clearTimeout(timeout);
      if (generation !== buildGeneration) return;
      const seconds = Math.round((Date.now() - began) / 1000);
      if (code === 0) {
        builtOnce = true;
        build = { state: 'built', sha, seconds, incremental };
      } else {
        build = { state: 'failed', sha, seconds, tail: scrub(tail.join('\n')) };
      }
    });
  }

  function health(): SessionHealth {
    const now = Date.now();
    return {
      core,
      device: device === null ? null : { id: deviceId, name: deviceName, ready: existsSync(join(work, 'device-ready')) },
      daemon: proxy !== null && now - daemonOkAt < 3 * tickMs,
      build: build.state === 'building' ? { ...build, seconds: Math.round((now - buildBegan) / 1000) } : build,
      capAt: new Date(capAt).toISOString(),
      ending,
    };
  }

  async function stopRecording(): Promise<number> {
    if (recorder === null) return 0;
    const current = recorder;
    recorder = null;
    if (current.stop === null) current.child.kill('SIGINT');
    else await runBriefly(current.stop);
    const code = await Promise.race([current.exited, new Promise<null>((done) => setTimeout(() => done(null), COMMAND_TIMEOUT_MS))]);
    if (code === null) {
      current.child.kill('SIGKILL');
      await current.exited;
    }
    await runBriefly(current.collect);
    return existsSync(current.file) ? statSync(current.file).size : 0;
  }

  function end(reason: EndReason): void {
    if (ending !== null) return;
    ending = reason;
    void (async () => {
      await stopRecording().catch(() => 0);
      buildGeneration += 1;
      stopGroup(buildChild);
      proxy?.kill('SIGTERM');
      await new Promise((done) => setTimeout(done, 500));
      tunnel.kill('SIGTERM');
      server.close();
      writeFileSync(join(work, 'ended'), `${JSON.stringify({ reason, at: new Date().toISOString(), minutes: Math.round((Date.now() - startedAt) / 6000) / 10 })}\n`);
      process.exit(0);
    })();
  }

  async function handleSim(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
    const route = `${req.method} ${url.pathname.slice('/__sim'.length)}`;
    switch (route) {
      case 'GET /health':
        return json(res, 200, health());
      case 'POST /build': {
        const sha = url.searchParams.get('sha') ?? '';
        if (!/^[0-9a-f]{40}$/.test(sha)) return json(res, 400, { error: 'sha must be a full commit id' });
        if (device === null) return json(res, 409, { error: 'this session has no device to build for' });
        startBuild(sha);
        return json(res, 202, health());
      }
      case 'POST /record/start': {
        if (device === null) return json(res, 409, { error: 'this session has no device to record' });
        await stopRecording();
        const file = join(work, 'recording.mp4');
        rmSync(file, { force: true });
        const { start, stop, collect } = await recipe(device, { op: 'record', file });
        const child = spawn(start.command, [...start.args], { cwd: start.cwd, stdio: 'ignore' });
        recorder = { child, exited: exitOf(child), file, stop, collect };
        return json(res, 200, { ok: true });
      }
      case 'POST /record/stop':
        if (recorder === null) return json(res, 409, { error: 'not recording' });
        return json(res, 200, { ok: true, bytes: await stopRecording() });
      case 'GET /record/file': {
        const file = join(work, 'recording.mp4');
        if (!existsSync(file)) return json(res, 404, { error: 'no recording' });
        res.writeHead(200, { 'content-type': 'video/mp4', 'content-length': String(statSync(file).size) });
        createReadStream(file).pipe(res);
        return;
      }
      case 'GET /logs': {
        if (device === null) return json(res, 409, { error: 'this session has no device' });
        const asked = new Date(url.searchParams.get('since') ?? Date.now() - 600_000);
        const since = Number.isNaN(asked.getTime()) ? new Date(Date.now() - 600_000) : asked;
        const command = await recipe(device, { op: 'logs', since: since.toISOString(), predicate: url.searchParams.get('predicate') });
        const child = spawn(command.command, [...command.args], { cwd: command.cwd, stdio: ['ignore', 'pipe', 'ignore'] });
        res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
        child.stdout.pipe(res);
        child.on('error', () => res.end());
        return;
      }
      case 'POST /evidence/begin':
        return json(res, 200, evidence.begin(await readBody(req, HANDOFF_LIMITS.manifestBytes)));
      case 'POST /evidence/chunk':
        return json(res, 200, evidence.chunk(await readBody(req, HANDOFF_LIMITS.chunkBodyBytes)));
      case 'POST /evidence/commit':
        return json(res, 200, evidence.commit());
      case 'POST /stop':
        json(res, 200, { ok: true, evidence: evidence.held() });
        end('stop');
        return;
      default:
        return json(res, 404, { error: `no route ${route}` });
    }
  }

  function authorized(req: IncomingMessage): boolean {
    const presented = bearer(req);
    if (presented === null || !matchesToken(request.tokenSha256, presented)) return false;
    token ??= presented;
    lastDriverAt = Date.now();
    return true;
  }

  const forwarded = (req: IncomingMessage) => ({ ...req.headers, 'x-forwarded-proto': 'https' });

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (!authorized(req)) return json(res, 403, { error: 'session token required' });
    if (url.pathname.startsWith('/__sim/')) {
      handleSim(req, res, url).catch((error: Error) => (error instanceof HandoffRefused ? json(res, error.status, { error: error.message, have: error.have }) : json(res, 500, { error: error.message })));
      return;
    }
    if (!isAgentRoute(url.pathname)) return json(res, 404, { error: `no route ${url.pathname}` });
    if (proxy === null) return json(res, 503, { error: 'agent-device is not up yet' });
    const upstream = http.request({ host: '127.0.0.1', port: agentPort, method: req.method, path: req.url, headers: forwarded(req) }, (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    });
    upstream.on('error', (error) => {
      if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: `agent-device is unreachable: ${error.message}` }));
    });
    req.pipe(upstream);
  });

  setInterval(() => {
    if (ending !== null) return;
    const now = Date.now();
    if (now >= capAt) return end('cap');
    if (now - lastDriverAt >= idleMs) return end('idle');
    ensureProxy();
    void checkDaemon();
  }, tickMs);
  process.on('SIGTERM', () => end('signal'));
  process.on('SIGINT', () => end('signal'));

  server.listen(port, '127.0.0.1', () => {
    console.log(`verify-remote session ${request.session} on :${port}, idle stop ${request.idleMinutes} min, cap ${request.capMinutes} min`);
    if (request.sha !== null) startBuild(request.sha);
  });
}

if (import.meta.main) {
  const [command] = process.argv.slice(2);
  if (command === 'plan') process.exitCode = await plan(process.env);
  else if (command === 'serve') await serve(process.env);
  else {
    console.error('usage: session-agent.ts plan | serve');
    process.exit(2);
  }
}
