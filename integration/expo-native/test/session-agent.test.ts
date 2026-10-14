import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { coreVersion } from '../src/core/manifest.ts';
import { HANDOFF_LIMITS, parseHandoffManifest, type HandoffManifest } from '../src/core/remote/handoff.ts';
import { workingPatch } from '../src/core/remote/backend.ts';
import { sendEvidence } from '../src/core/remote/session.ts';
import { plan } from '../src/core/remote/session-agent.ts';
import { BUILD_LOG_START, sha256Hex, type SessionHealth, type SessionRequest } from '../src/core/remote/protocol.ts';
import type { TreePatch } from '../src/core/types.ts';

const here = import.meta.dirname;
const token = 'b'.repeat(64);
const base: SessionRequest = { v: 1, session: 'ios0000aa', owner: '0123456789ab', platform: 'ios', runner: 'test-runner', device: 'Test Phone', sha: null, idleMinutes: 5, capMinutes: 10, tokenSha256: sha256Hex(token) };
const children: ChildProcess[] = [];
after(() => children.forEach((child) => child.kill('SIGKILL')));

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
async function until<T>(read: () => Promise<T | null> | T | null, what: string, ms = 60_000): Promise<T> {
  const deadline = Date.now() + ms;
  for (;;) {
    const value = await read();
    if (value !== null) return value;
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${what}`);
    await sleep(100);
  }
}

let nextPort = 21000 + Math.floor(Math.random() * 4000);
async function freePort(): Promise<number> {
  for (let tries = 0; tries < 200; tries += 1) {
    const candidate = (nextPort += 1);
    const free = await new Promise<boolean>((done) => {
      const probe = net.createServer();
      probe.once('error', () => done(false));
      probe.listen(candidate, '127.0.0.1', () => probe.close(() => done(true)));
    });
    if (free) return candidate;
  }
  throw new Error('no free port for a session agent in 200 tries');
}

function repoWithCommit(): { dir: string; sha: string; commit(text: string): string; git(...args: string[]): string; comesBefore(earlier: string, later: string): boolean; knownOnlyToGitHub(sha: string): string } {
  const dir = mkdtempSync(join(tmpdir(), 'verify-agent-repo-'));
  const git = (...args: string[]) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: dir, encoding: 'utf8' }).trim();
  git('init', '-q');
  const parents = new Map<string, string | null>();
  const headOrNone = (): string | null => {
    try {
      return git('rev-parse', '-q', '--verify', 'HEAD');
    } catch {
      return null;
    }
  };
  const commit = (text: string) => {
    const parent = headOrNone();
    writeFileSync(join(dir, 'app.txt'), text);
    git('add', '-A');
    git('commit', '-q', '-m', text);
    const made = git('rev-parse', 'HEAD');
    parents.set(made, parent);
    return made;
  };
  const sha = commit('one');
  git('remote', 'add', 'origin', dir);
  const comesBefore = (earlier: string, later: string): boolean => {
    for (let at = parents.get(later) ?? null; at !== null; at = parents.get(at) ?? null) if (at === earlier) return true;
    return false;
  };
  const knownOnlyToGitHub = (made: string): string => (parents.set(made, headOrNone()), made);
  return { dir, sha, commit, git, comesBefore, knownOnlyToGitHub };
}

const GITHUB_TOKEN = 'ghs_unitTestOnly';
const servers: http.Server[] = [];
after(() => servers.forEach((server) => server.close()));

async function gitHubWith(repo: { readonly sha: string; comesBefore(earlier: string, later: string): boolean }) {
  let branchHead = repo.sha;
  const { comesBefore } = repo;
  const authorizations = new Set<string | undefined>();
  const server = http.createServer((req, res) => {
    authorizations.add(req.headers.authorization);
    const path = (req.url ?? '').replace(/^\/repos\/clerk\/sample/, '');
    const [, base, head] = /^\/compare\/([0-9a-f]{40})\.\.\.([0-9a-f]{40})$/.exec(path) ?? [];
    const found =
      path === ''
        ? { default_branch: 'main' }
        : path === '/git/ref/heads/feature/change'
        ? { object: { sha: branchHead } }
        : base !== undefined && head !== undefined
          ? { status: base === head ? 'identical' : comesBefore(base, head) ? 'ahead' : comesBefore(head, base) ? 'behind' : 'diverged' }
          : null;
    res.writeHead(found === null ? 404 : 200, { 'content-type': 'application/json' }).end(JSON.stringify(found ?? { message: 'Not Found' }));
  });
  servers.push(server);
  await new Promise<void>((listening) => server.listen(0, '127.0.0.1', listening));
  const { port } = server.address() as { port: number };
  return {
    authorizations,
    push: (sha: string) => (branchHead = sha),
    stop: () => new Promise((stopped) => server.close(stopped)),
    env: { GITHUB_API_URL: `http://127.0.0.1:${port}`, GITHUB_REPOSITORY: 'clerk/sample', GITHUB_SHA: repo.sha, GITHUB_REF: 'refs/heads/feature/change', GITHUB_TOKEN, VERIFY_SESSION_DEFAULT_BRANCH: 'main' },
  };
}

async function startAgent(request: SessionRequest, options: { readonly cwd?: string; readonly device?: boolean; readonly deviceModule?: string; readonly minuteMs?: number; readonly agentDevice?: boolean; readonly env?: Readonly<Record<string, string>> } = {}) {
  const work = mkdtempSync(join(tmpdir(), 'verify-agent-'));
  const port = await freePort();
  const agentPort = await freePort();
  const bin = join(work, 'bin');
  mkdirSync(bin);
  const script = (name: string, file: string) => writeFileSync(join(bin, name), `#!/bin/sh\nexec "${process.execPath}" "${join(here, '..', 'testing', file)}" "$@"\n`, { mode: 0o755 });
  script('cloudflared', 'fake-tunnel.ts');
  if (options.agentDevice === true) script('agent-device', 'fake-agent-device.ts');
  const child = spawn(process.execPath, [join(here, '..', 'src', 'core', 'remote', 'session-agent.ts'), 'serve'], {
    cwd: options.cwd ?? work,
    env: {
      PATH: `${bin}:/usr/bin:/bin`,
      VERIFY_SESSION_REQUEST: JSON.stringify(request),
      VERIFY_SESSION_WORK: work,
      VERIFY_SESSION_PORT: String(port),
      VERIFY_SESSION_AGENT_PORT: String(agentPort),
      VERIFY_SESSION_CLOUDFLARED: join(bin, 'cloudflared'),
      VERIFY_SESSION_AGENT_DEVICE: join(bin, 'agent-device'),
      VERIFY_SESSION_SKIP_DNS: '1',
      ...(options.minuteMs === undefined ? {} : { VERIFY_SESSION_MINUTE_MS: String(options.minuteMs) }),
      ...(options.device === false ? {} : { VERIFY_SESSION_DEVICE_ID: 'UDID-1', VERIFY_SESSION_DEVICE_NAME: 'Test Phone', VERIFY_SESSION_DEVICE_MODULE: options.deviceModule ?? join(here, '..', 'testing', 'fake-session-device.ts') }),
      ...options.env,
    },
    stdio: 'ignore',
  });
  children.push(child);
  const exited = new Promise<number>((done) => child.on('close', (code) => done(code ?? 1)));
  const call = (path: string, init: { method?: string; bearer?: string | null; body?: string } = {}) =>
    fetch(`http://127.0.0.1:${port}${path}`, { method: init.method ?? 'GET', headers: init.bearer === null ? {} : { Authorization: `Bearer ${init.bearer ?? token}` }, ...(init.body === undefined ? {} : { body: init.body }) });
  await until(() => (existsSync(join(work, 'tunnel')) ? true : null), 'the tunnel file');
  await until(() => call('/__sim/health', { bearer: null }).then((r) => r.status).catch(() => null), 'the agent to listen');
  const health = async () => (await (await call('/__sim/health')).json()) as SessionHealth;
  return { work, port, call, health, exited };
}

describe('plan', () => {
  const outputsOf = (text: string) => Object.fromEntries(text.trim().split('\n').map((line) => line.split(/=(.*)/s, 2) as [string, string]));
  const noGitHub = async (path: string): Promise<never> => assert.fail(`asked GitHub for ${path}`);

  it('turns a request into job outputs and anything else into mode=none', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-plan-'));
    const out = join(dir, 'out');
    writeFileSync(out, '');
    assert.equal(await plan({ GITHUB_OUTPUT: out, VERIFY_REQUEST: `${JSON.stringify(base)}\n` }, noGitHub), 0);
    const outputs = outputsOf(readFileSync(out, 'utf8'));
    assert.equal(outputs.mode, 'session');
    assert.equal(outputs.runner, 'test-runner');
    assert.equal(outputs.timeout, '20');
    assert.deepEqual(JSON.parse(outputs.request!), base);
    writeFileSync(out, '');
    assert.equal(await plan({ GITHUB_OUTPUT: out, VERIFY_REQUEST: 'feat: an ordinary commit' }, noGitHub), 0);
    assert.equal(readFileSync(out, 'utf8'), 'mode=none\n');
  });

  describe('when the request names a commit to build', () => {
    const DISPATCHED = 'd'.repeat(40);
    const LATER = 'e'.repeat(40);
    const HEAD = 'f'.repeat(40);
    const ELSEWHERE = 'a'.repeat(40);

    async function planned(sha: string, github: Readonly<Record<string, unknown>> = {}, ref = 'refs/heads/feature/change') {
      const out = join(mkdtempSync(join(tmpdir(), 'verify-plan-')), 'out');
      writeFileSync(out, '');
      const asked: string[] = [];
      const code = await plan({ GITHUB_OUTPUT: out, GITHUB_SHA: DISPATCHED, GITHUB_REF: ref, VERIFY_REQUEST: JSON.stringify({ ...base, sha }) }, async (path) => (asked.push(path), github[path] ?? null));
      const written = readFileSync(out, 'utf8');
      return { code, written, outputs: outputsOf(written), asked };
    }
    const branchAt = (head: string) => ({ '/git/ref/heads/feature/change': { object: { sha: head } } });

    it('starts a session at the commit the run was dispatched on, and asks GitHub nothing', async () => {
      const same = await planned(DISPATCHED);
      assert.deepEqual([same.code, same.outputs.mode, same.outputs.sha, same.asked], [0, 'session', DISPATCHED, []]);
    });

    it('starts a session at a later commit of the branch the run was dispatched on', async () => {
      const atHead = await planned(LATER, { ...branchAt(LATER), [`/compare/${DISPATCHED}...${LATER}`]: { status: 'ahead' } });
      assert.deepEqual([atHead.code, atHead.outputs.sha], [0, LATER]);
      const beforeHead = await planned(LATER, { ...branchAt(HEAD), [`/compare/${DISPATCHED}...${LATER}`]: { status: 'ahead' }, [`/compare/${LATER}...${HEAD}`]: { status: 'ahead' } });
      assert.deepEqual([beforeHead.code, beforeHead.outputs.sha], [0, LATER]);
    });

    it('starts no session, and fails the step, for a commit that is not on the branch the run was dispatched on', async () => {
      const refused = [
        ['a commit of another branch that was cut from this one', { ...branchAt(HEAD), [`/compare/${DISPATCHED}...${ELSEWHERE}`]: { status: 'ahead' }, [`/compare/${ELSEWHERE}...${HEAD}`]: { status: 'diverged' } }],
        ['a commit that shares no later history with the dispatch commit', { ...branchAt(HEAD), [`/compare/${DISPATCHED}...${ELSEWHERE}`]: { status: 'diverged' }, [`/compare/${ELSEWHERE}...${HEAD}`]: { status: 'ahead' } }],
        ['an earlier commit of the branch', { ...branchAt(HEAD), [`/compare/${DISPATCHED}...${ELSEWHERE}`]: { status: 'behind' }, [`/compare/${ELSEWHERE}...${HEAD}`]: { status: 'ahead' } }],
        ['any commit when GitHub does not answer', {}],
      ] as const;
      for (const [what, github] of refused) {
        const { code, written } = await planned(ELSEWHERE, github);
        assert.deepEqual([code, written], [1, ''], what);
      }
      const onATag = await planned(LATER, { '/git/ref/heads/v1': { object: { sha: LATER } }, [`/compare/${DISPATCHED}...${LATER}`]: { status: 'ahead' } }, 'refs/tags/v1');
      assert.deepEqual([onATag.code, onATag.written, onATag.asked], [1, '', []], 'a tag has no later commits');
    });
  });
});

describe('session agent', () => {
  it('publishes the tunnel host, refuses every route without the bearer, and stops on request', async () => {
    const agent = await startAgent(base);
    assert.equal(readFileSync(join(agent.work, 'tunnel'), 'utf8'), 'fake-session-host.trycloudflare.com');
    for (const path of ['/__sim/health', '/agent-device/health', '/health', '/rpc', '/anything']) {
      const refused = await agent.call(path, { bearer: null });
      assert.equal(refused.status, 403, path);
      assert.deepEqual(await refused.json(), { error: 'session token required' });
    }
    assert.equal((await agent.call('/__sim/health', { bearer: 'c'.repeat(64) })).status, 403);
    const health = await agent.health();
    assert.deepEqual(health.device, { id: 'UDID-1', name: 'Test Phone', ready: false });
    assert.equal(health.core, coreVersion(), 'a driver compares this with its own core before it drives the session');
    writeFileSync(join(agent.work, 'device-ready'), '');
    assert.equal((await agent.health()).device?.ready, true);
    const stopped = await agent.call('/__sim/stop', { method: 'POST' });
    assert.equal(stopped.status, 200);
    assert.deepEqual(await stopped.json(), { ok: true, evidence: null });
    assert.equal(await agent.exited, 0);
    assert.equal((JSON.parse(readFileSync(join(agent.work, 'ended'), 'utf8')) as { reason: string }).reason, 'stop');
  });

  it('ends itself when the driver goes silent', async () => {
    const agent = await startAgent({ ...base, idleMinutes: 1, capMinutes: 100 }, { minuteMs: 1500 });
    assert.equal(await agent.exited, 0);
    assert.equal((JSON.parse(readFileSync(join(agent.work, 'ended'), 'utf8')) as { reason: string }).reason, 'idle');
  });

  it('does not let a caller without the bearer keep it alive', async () => {
    const agent = await startAgent({ ...base, idleMinutes: 1, capMinutes: 100 }, { minuteMs: 1500 });
    const stranger = setInterval(() => void agent.call('/__sim/health', { bearer: null }).catch(() => undefined), 100);
    try {
      assert.equal(await agent.exited, 0);
    } finally {
      clearInterval(stranger);
    }
    assert.equal((JSON.parse(readFileSync(join(agent.work, 'ended'), 'utf8')) as { reason: string }).reason, 'idle');
  });

  it('starts agent-device only once it knows the bearer, forwards to it, and keeps the bearer out of its log', async () => {
    const agent = await startAgent(base, { agentDevice: true, minuteMs: 600 });
    assert.equal((await agent.call('/agent-device/health')).status, 503, 'the first authorized call is what teaches the agent the bearer');
    const forwarded = await until(async () => { const r = await agent.call('/agent-device/health'); return r.status === 200 ? ((await r.json()) as { path: string; authorized: boolean }) : null; }, 'agent-device to come up');
    assert.deepEqual(forwarded, { ok: true, path: '/agent-device/health', authorized: true });
    assert.equal((await agent.call('/agent-device/health', { bearer: null })).status, 403);
    assert.equal((await until(async () => { const h = await agent.health(); return h.daemon ? h : null; }, 'the daemon to report healthy')).daemon, true);
    const log = readFileSync(join(agent.work, 'agent-device-proxy.log'), 'utf8');
    assert.match(log, /Daemon auth token: <token>/);
    assert.equal(log.includes(token), false);
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('ends itself at the cap even while the driver keeps calling', async () => {
    const agent = await startAgent({ ...base, idleMinutes: 2, capMinutes: 2 }, { minuteMs: 1500 });
    const poll = setInterval(() => void agent.call('/__sim/health').catch(() => undefined), 200);
    try {
      assert.equal(await agent.exited, 0);
    } finally {
      clearInterval(poll);
    }
    assert.equal((JSON.parse(readFileSync(join(agent.work, 'ended'), 'utf8')) as { reason: string }).reason, 'cap');
  });

  it('builds the commit it is asked for, rebuilds a newer one, and reports a failed build', async () => {
    const repo = repoWithCommit();
    const github = await gitHubWith(repo);
    const agent = await startAgent({ ...base, sha: repo.sha }, { cwd: repo.dir, env: github.env });
    const built = (sha: string) => until(async () => { const b = (await agent.health()).build; return b.state !== 'building' && b.state !== 'none' && b.sha === sha ? b : null; }, `build of ${sha}`);
    const first = await built(repo.sha);
    assert.equal(first.state, 'built');
    assert.equal(first.state === 'built' && first.incremental, false);
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'one');

    const second = github.push(repo.commit('two'));
    assert.equal((await agent.call(`/__sim/build?sha=${second}`, { method: 'POST' })).status, 202);
    const rebuilt = await built(second);
    assert.equal(rebuilt.state === 'built' && rebuilt.incremental, true);
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'two');

    assert.equal((await agent.call('/__sim/build?sha=main', { method: 'POST' })).status, 400);
    const missing = github.push(repo.knownOnlyToGitHub('0'.repeat(40)));
    await agent.call(`/__sim/build?sha=${missing}`, { method: 'POST' });
    const failed = await built(missing);
    assert.equal(failed.state, 'failed');
    assert.doesNotMatch(failed.state === 'failed' ? failed.tail : '', /GitHub does not show/, 'the fetch failed, not the question to GitHub');
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('builds the changes it is sent on a clean checkout of the commit, never on changes it was sent before, and refuses changes that do not apply', async () => {
    const repo = repoWithCommit();
    const github = await gitHubWith(repo);
    const agent = await startAgent({ ...base, sha: repo.sha }, { cwd: repo.dir, env: github.env });
    const settled = (patch: string | null) => until(async () => { const b = (await agent.health()).build; return b.state !== 'building' && b.state !== 'none' && b.patch === patch ? b : null; }, `the build with ${patch ?? 'no changes'}`);
    const send = (patch: TreePatch | null, sha256 = patch?.sha256) =>
      agent.call(`/__sim/build?sha=${repo.sha}${patch === null ? '' : `&patch=${sha256}`}`, { method: 'POST', ...(patch === null ? {} : { body: JSON.stringify({ patch: patch.bytes.toString('base64') }) }) });
    const checkout = (file: string) => (existsSync(join(repo.dir, file)) ? readFileSync(join(repo.dir, file), 'utf8') : null);
    assert.equal((await settled(null)).state, 'built');

    const client = mkdtempSync(join(tmpdir(), 'verify-agent-client-'));
    execFileSync('git', ['clone', '-q', repo.dir, client]);
    writeFileSync(join(client, 'app.txt'), 'edited');
    writeFileSync(join(client, 'extra.txt'), 'added');
    const first = workingPatch(client, ['.'])!;
    assert.equal(existsSync(join(agent.work, 'patched')), false, 'a build of the commit leaves no mark');
    assert.equal((await send(first)).status, 202);
    assert.equal((await settled(first.sha256)).state, 'built');
    assert.deepEqual([readFileSync(join(agent.work, 'built'), 'utf8'), checkout('extra.txt')], ['edited', 'added']);
    assert.equal(readFileSync(join(agent.work, 'patched'), 'utf8'), `${first.sha256}\n`, 'the mark that keeps the job from storing what it built');

    rmSync(join(client, 'extra.txt'));
    writeFileSync(join(client, 'app.txt'), 'edited again');
    const second = workingPatch(client, ['.'])!;
    assert.equal((await send(second, 'd'.repeat(64))).status, 400, 'a patch that does not hash to what was sent with it');
    assert.equal((await send(second)).status, 202);
    const rebuilt = await settled(second.sha256);
    assert.equal(rebuilt.state === 'built' && rebuilt.incremental, true);
    assert.deepEqual([readFileSync(join(agent.work, 'built'), 'utf8'), checkout('extra.txt')], ['edited again', null], 'the file the first changes added is gone');

    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '-am', 'not pushed'], { cwd: client });
    writeFileSync(join(client, 'app.txt'), 'edited on a commit the session does not have');
    const elsewhere = workingPatch(client, ['.'])!;
    await send(elsewhere);
    const refused = await settled(elsewhere.sha256);
    assert.equal(refused.state, 'failed');
    assert.match(refused.state === 'failed' ? refused.tail : '', new RegExp(`the uncommitted changes ${elsewhere.sha256.slice(0, 12)} do not apply to ${repo.sha.slice(0, 12)}\\. Commit and push them, then run again\\.$`));
    assert.deepEqual([repo.git('status', '--porcelain'), checkout('app.txt')], ['', 'one'], 'the checkout is the commit, with nothing half applied');

    await send(null);
    assert.equal((await settled(null)).state, 'built');
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'one');
    assert.ok(existsSync(join(agent.work, 'patched')), 'a later build of the commit does not take the mark away');
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('marks the job as soon as it accepts changes, before any of the work that can fail', async () => {
    const repo = repoWithCommit();
    const github = await gitHubWith(repo);
    const agent = await startAgent({ ...base, sha: repo.sha }, { cwd: repo.dir, env: github.env });
    await until(async () => ((await agent.health()).build.state === 'built' ? true : null), 'the build of the commit');
    const client = mkdtempSync(join(tmpdir(), 'verify-agent-client-'));
    execFileSync('git', ['clone', '-q', repo.dir, client]);
    writeFileSync(join(client, 'app.txt'), 'edited');
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '-am', 'not pushed'], { cwd: client });
    writeFileSync(join(client, 'app.txt'), 'edited on a commit the session does not have');
    const changes = workingPatch(client, ['.'])!;
    const sent = await agent.call(`/__sim/build?sha=${repo.sha}&patch=${changes.sha256}`, { method: 'POST', body: JSON.stringify({ patch: changes.bytes.toString('base64') }) });
    assert.equal(sent.status, 202);
    assert.equal(readFileSync(join(agent.work, 'patched'), 'utf8'), `${changes.sha256}\n`, 'marked when the agent answered, before the checkout');
    const failed = await until(async () => { const b = (await agent.health()).build; return b.state === 'failed' && b.patch === changes.sha256 ? b : null; }, 'the changes to fail');
    assert.match(failed.state === 'failed' ? failed.tail : '', /do not apply/);
    assert.equal(readFileSync(join(agent.work, 'patched'), 'utf8'), `${changes.sha256}\n`, 'changes that did not apply keep the mark');
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('builds no uncommitted changes in a session on the default branch, or in one that does not know its branch or the default branch', async () => {
    const repo = repoWithCommit();
    const github = await gitHubWith(repo);
    const client = mkdtempSync(join(tmpdir(), 'verify-agent-client-'));
    execFileSync('git', ['clone', '-q', repo.dir, client]);
    writeFileSync(join(client, 'app.txt'), 'edited');
    const changes = workingPatch(client, ['.'])!;
    const onMain = 'this session runs on main, the default branch, so it builds no uncommitted changes. Work on a branch: commit to a new branch and push it, then run down and up from that branch.';
    const refusals = [
      [{ GITHUB_REF: 'refs/heads/main' }, onMain],
      [{ GITHUB_REF: 'refs/heads/main', VERIFY_SESSION_DEFAULT_BRANCH: '' }, onMain],
      [{ VERIFY_SESSION_DEFAULT_BRANCH: '', GITHUB_REPOSITORY: 'clerk/unknown' }, 'this session could not learn the default branch of the repository, so it builds no uncommitted changes. Commit and push them to a branch, then run again.'],
      [{ GITHUB_REF: '' }, 'this session does not know the branch it was started on, so it builds no uncommitted changes. Commit and push them to a branch, then run again.'],
      [{ GITHUB_REF: 'refs/tags/v1' }, 'this session was started on refs/tags/v1, which is not a branch, so it builds no uncommitted changes. Commit and push them to a branch, then run again.'],
    ] as const;
    for (const [env, error] of refusals) {
      const agent = await startAgent({ ...base, sha: repo.sha }, { cwd: repo.dir, env: { ...github.env, ...env } });
      await until(async () => ((await agent.health()).build.state === 'built' ? true : null), 'the build of the commit');
      const sent = await agent.call(`/__sim/build?sha=${repo.sha}&patch=${changes.sha256}`, { method: 'POST', body: JSON.stringify({ patch: changes.bytes.toString('base64') }) });
      assert.deepEqual([sent.status, await sent.json()], [409, { error }]);
      const build = (await agent.health()).build;
      assert.deepEqual([build.state, build.state === 'built' && build.patch, readdirSync(agent.work).filter((name) => name.startsWith('patch-'))], ['built', null, []], 'the changes were not kept or built');
      assert.equal((await agent.call(`/__sim/build?sha=${repo.sha}`, { method: 'POST' })).status, 202, 'the commit itself still builds');
      await agent.call('/__sim/stop', { method: 'POST' });
      await agent.exited;
    }
  });

  it('refuses changes to anything but the app sources, by what git would write, before it applies any of them', async () => {
    const repo = repoWithCommit();
    writeFileSync(join(repo.dir, 'outside.txt'), 'kept');
    const started = repo.commit('two');
    const github = await gitHubWith({ ...repo, sha: started });
    const agent = await startAgent({ ...base, sha: started }, { cwd: repo.dir, env: github.env });
    const settled = (patch: string | null) => until(async () => { const b = (await agent.health()).build; return b.state !== 'building' && b.state !== 'none' && b.patch === patch ? b : null; }, `the build with ${patch ?? 'no changes'}`);
    const send = (patch: TreePatch) => agent.call(`/__sim/build?sha=${started}&patch=${patch.sha256}`, { method: 'POST', body: JSON.stringify({ patch: patch.bytes.toString('base64') }) });
    assert.equal((await settled(null)).state, 'built');

    const client = mkdtempSync(join(tmpdir(), 'verify-agent-client-'));
    execFileSync('git', ['clone', '-q', repo.dir, client]);
    writeFileSync(join(client, 'app.txt'), 'edited');
    mkdirSync(join(client, 'e2e-tests'));
    writeFileSync(join(client, 'e2e-tests', 'recipe.ts'), 'a new file outside the app sources');
    const added = workingPatch(client, ['.'])!;
    rmSync(join(client, 'e2e-tests'), { recursive: true });
    execFileSync('git', ['checkout', '-q', '--', 'app.txt'], { cwd: client });
    execFileSync('git', ['mv', 'outside.txt', 'extra.txt'], { cwd: client });
    const renamedBytes = execFileSync('git', ['diff', '--cached', '--binary', '-M', 'HEAD'], { cwd: client });
    const renamed: TreePatch = { sha256: createHash('sha256').update(renamedBytes).digest('hex'), bytes: renamedBytes };
    assert.match(renamedBytes.toString(), /^rename from outside\.txt$/m, 'git writes the rename source without the patch naming it as a file');

    for (const [patch, path] of [[added, 'e2e-tests/recipe.ts'], [renamed, 'outside.txt']] as const) {
      assert.equal((await send(patch)).status, 202);
      const refused = await settled(patch.sha256);
      assert.equal(refused.state, 'failed', path);
      assert.equal(refused.state === 'failed' ? refused.tail.split('\n').at(-1) : '', `the uncommitted changes ${patch.sha256.slice(0, 12)} change ${path}, and a session builds changes only to app.txt, extra.txt, Sources. Commit and push that change, then run again.`);
      assert.deepEqual([repo.git('status', '--porcelain', '--ignored'), readFileSync(join(repo.dir, 'app.txt'), 'utf8'), readFileSync(join(agent.work, 'built'), 'utf8')], ['', 'two', 'two'], `nothing of the changes to ${path} was applied or built`);
    }
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('returns the build log from the byte it is asked for, and all of it when that byte is past the end', async () => {
    const repo = repoWithCommit();
    const github = await gitHubWith(repo);
    const agent = await startAgent({ ...base, sha: repo.sha }, { cwd: repo.dir, env: github.env });
    await until(async () => ((await agent.health()).build.state === 'built' ? true : null), 'the build');
    const log = readFileSync(join(agent.work, 'build.log'));
    assert.match(log.toString(), /^\n\$ git fetch --no-tags --depth=1 origin /);
    const read = async (from: number) => {
      const answer = await agent.call(`/__sim/build/log?from=${from}`);
      return [answer.status, answer.headers.get(BUILD_LOG_START), Buffer.from(await answer.arrayBuffer()).toString()];
    };
    assert.deepEqual(await read(0), [200, '0', log.toString()]);
    assert.deepEqual(await read(10), [200, '10', log.subarray(10).toString()]);
    assert.deepEqual(await read(log.length), [200, String(log.length), '']);
    assert.deepEqual(await read(log.length + 5), [200, '0', log.toString()], 'a log that was started again since the last read');
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('keeps serving when the build log cannot be read', async () => {
    const repo = repoWithCommit();
    const github = await gitHubWith(repo);
    const agent = await startAgent({ ...base, sha: repo.sha }, { cwd: repo.dir, env: github.env });
    await until(async () => ((await agent.health()).build.state === 'built' ? true : null), 'the build');
    rmSync(join(agent.work, 'build.log'));
    mkdirSync(join(agent.work, 'build.log'));
    await agent.call('/__sim/build/log?from=0').then((answer) => answer.arrayBuffer()).catch(() => null);
    assert.equal((await agent.call('/__sim/health')).status, 200, 'the agent still answers after a failed read of the log');
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('builds only the commit it was started on and later commits of that branch, whoever asks with the session token', async () => {
    const repo = repoWithCommit();
    const earlier = repo.sha;
    const started = repo.commit('two');
    const github = await gitHubWith({ ...repo, sha: started });
    const agent = await startAgent({ ...base, sha: started }, { cwd: repo.dir, env: github.env });
    const built = (sha: string) => until(async () => { const b = (await agent.health()).build; return b.state !== 'building' && b.state !== 'none' && b.sha === sha ? b : null; }, `build of ${sha}`);
    assert.equal((await built(started)).state, 'built');
    assert.deepEqual([...github.authorizations], [], 'the commit it was started on needs no question');

    repo.git('checkout', '-q', '-b', 'another-branch');
    const elsewhere = repo.commit('code of another branch');
    repo.git('checkout', '-q', '-');
    for (const [what, sha] of [['a commit of another branch that was cut from this one', elsewhere], ['an earlier commit of the branch', earlier]] as const) {
      assert.equal((await agent.call(`/__sim/build?sha=${sha}`, { method: 'POST' })).status, 202, what);
      const refused = await built(sha);
      assert.equal(refused.state, 'failed', what);
      assert.match(refused.state === 'failed' ? refused.tail : '', new RegExp(`^this session builds ${started}, the commit it was started on, and later commits of refs/heads/feature/change\\. GitHub does not show ${sha} as one\\.`), what);
      assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'two', `${what} was not built`);
      assert.equal(repo.git('rev-parse', 'HEAD'), started, `${what} was not checked out`);
    }
    assert.deepEqual([...github.authorizations], [`Bearer ${GITHUB_TOKEN}`], 'it asks GitHub with the token of the run');

    const later = repo.commit('three');
    const latest = github.push(repo.commit('four'));
    for (const sha of [later, latest]) {
      await agent.call(`/__sim/build?sha=${sha}`, { method: 'POST' });
      assert.equal((await built(sha)).state, 'built');
    }

    await github.stop();
    const unanswered = repo.commit('five');
    await agent.call(`/__sim/build?sha=${unanswered}`, { method: 'POST' });
    assert.equal((await built(unanswered)).state, 'failed', 'a commit GitHub does not vouch for is not built');
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'four');
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('gives the commands that build a commit an environment without the token it asks GitHub with', async () => {
    const repo = repoWithCommit();
    writeFileSync(join(repo.dir, 'device.ts'), `export default () => ({ build: (work) => [{ command: process.execPath, args: ['-e', "require('fs').writeFileSync(require('path').join(process.argv[1], 'built'), 'token ' + process.env.GITHUB_TOKEN)", work] }] });\n`);
    const started = repo.commit('one');
    const agent = await startAgent({ ...base, sha: started }, { cwd: repo.dir, deviceModule: 'device.ts', env: (await gitHubWith({ ...repo, sha: started })).env });
    await until(async () => ((await agent.health()).build.state === 'built' ? true : null), 'the build');
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'token undefined');
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('builds each commit with the recipe that commit holds, not the one the session started on', async () => {
    const repo = repoWithCommit();
    const recipeOf = (label: string) =>
      `export default () => ({ build: (work) => [{ command: process.execPath, args: ['-e', "require('fs').writeFileSync(require('path').join(process.argv[1], 'built'), '${label} recipe built ' + require('fs').readFileSync('app.txt', 'utf8'))", work] }] });\n`;
    writeFileSync(join(repo.dir, 'device.ts'), recipeOf('first'));
    const first = repo.commit('one');
    const github = await gitHubWith({ ...repo, sha: first });
    const agent = await startAgent({ ...base, sha: first }, { cwd: repo.dir, deviceModule: 'device.ts', env: github.env });
    const built = (sha: string) => until(async () => { const b = (await agent.health()).build; return b.state !== 'building' && b.state !== 'none' && b.sha === sha ? b : null; }, `build of ${sha}`);
    assert.equal((await built(first)).state, 'built');
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'first recipe built one');

    writeFileSync(join(repo.dir, 'device.ts'), recipeOf('second'));
    const second = github.push(repo.commit('two'));
    await agent.call(`/__sim/build?sha=${second}`, { method: 'POST' });
    assert.equal((await built(second)).state, 'built');
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'second recipe built two');

    writeFileSync(join(repo.dir, 'device.ts'), 'export default () => { throw new Error("this module is broken"); };\n');
    const third = github.push(repo.commit('three'));
    await agent.call(`/__sim/build?sha=${third}`, { method: 'POST' });
    const failed = await built(third);
    assert.equal(failed.state, 'failed');
    assert.match(failed.state === 'failed' ? failed.tail : '', /could not answer build: .*this module is broken/);
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('stops and collects a recording with the commands its own start named', async () => {
    const agent = await startAgent({ ...base, platform: 'android' }, { env: { FAKE_DEVICE_RECORDER: 'on-device' } });
    assert.equal((await agent.call('/__sim/record/start', { method: 'POST' })).status, 200);
    await sleep(300);
    const stopped = (await (await agent.call('/__sim/record/stop', { method: 'POST' })).json()) as { bytes: number };
    assert.ok(stopped.bytes > 0);
    assert.equal(await (await agent.call('/__sim/record/file')).text(), 'pulled from android UDID-1');
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('records, serves the file, and reads device logs', async () => {
    const agent = await startAgent(base);
    assert.equal((await agent.call('/__sim/record/start', { method: 'POST' })).status, 200);
    await sleep(500);
    assert.equal((await agent.call('/__sim/record/start', { method: 'POST' })).status, 200, 'a recorder left by a run that died is replaced, not an error');
    await sleep(500);
    const stopped = (await (await agent.call('/__sim/record/stop', { method: 'POST' })).json()) as { bytes: number };
    assert.ok(stopped.bytes > 0);
    assert.equal(await (await agent.call('/__sim/record/file')).text(), 'video of UDID-1');
    assert.match(await (await agent.call('/__sim/logs?predicate=extra')).text(), /log line for UDID-1 extra/);
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('takes evidence from the CLI over the tunnel routes, keeps it in one directory, and says so when it stops', async () => {
    const agent = await startAgent(base);
    const dir = mkdtempSync(join(tmpdir(), 'verify-agent-run-'));
    const video = Buffer.alloc(HANDOFF_LIMITS.chunkBytes + 4096, 'v');
    const shot = Buffer.from('png bytes');
    writeFileSync(join(dir, 'video.mp4'), video);
    writeFileSync(join(dir, 'profile.png'), shot);
    writeFileSync(join(dir, 'token'), token);
    const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');
    const manifest = parseHandoffManifest(
      JSON.stringify({ v: 2, before: null, pr: 669, run: 'r20261008-052713-253e', platform: 'ios', device: 'Test Phone on test-runner', commit: 'a'.repeat(40), passed: 1, flaky: 0, total: 1, files: [{ name: 'video.mp4', bytes: video.length, sha256: sha256(video) }, { name: 'profile.png', bytes: shot.length, sha256: sha256(shot) }] }),
    );
    for (const step of ['begin', 'chunk', 'commit']) assert.equal((await agent.call(`/__sim/evidence/${step}`, { method: 'POST', bearer: null, body: '{}' })).status, 403, step);
    assert.equal((await agent.call('/__sim/evidence/begin', { method: 'POST', body: JSON.stringify({ ...manifest, run: 'nope' }) })).status, 400);
    assert.equal((await agent.call('/__sim/evidence/begin', { method: 'POST', body: JSON.stringify(manifest).padEnd(HANDOFF_LIMITS.manifestBytes + 1, ' ') })).status, 413);

    const realFetch = globalThis.fetch;
    const lines: string[] = [];
    let lostOneAnswer = false;
    globalThis.fetch = async (input, init) => {
      const url = new URL(String(input));
      assert.equal(url.host, 'fake-session-host.trycloudflare.com');
      const response = await realFetch(`http://127.0.0.1:${agent.port}${url.pathname}${url.search}`, init);
      if (url.pathname === '/__sim/evidence/chunk' && !lostOneAnswer && (JSON.parse(String(init?.body)) as { offset: number }).offset > 0) {
        lostOneAnswer = true;
        throw new TypeError('fetch failed');
      }
      return response;
    };
    try {
      const session = { baseUrl: 'https://fake-session-host.trycloudflare.com', tokenFile: join(dir, 'token') };
      const paths = new Map([['video.mp4', join(dir, 'video.mp4')], ['profile.png', join(dir, 'profile.png')]]);
      const { before: _, ...versionOne } = { ...manifest, v: 1 };
      await assert.rejects(sendEvidence(session, versionOne as unknown as HandoffManifest, paths, (line) => void lines.push(line), 10), {
        code: 'NOT_READY',
        message: 'the session refused the manifest of run r20261008-052713-253e: the manifest is version 1, and this session takes only version 2',
        fix: '{cli} down, then {cli} up, so that the session runs the verify code of this checkout, then {cli} run again and attach',
      });
      assert.equal(lines.length, 0, 'no file was sent');
      assert.equal(existsSync(join(agent.work, 'evidence.partial')), false, 'a refused manifest starts no hand-off');
      await sendEvidence(session, manifest, paths, (line) => void lines.push(line), 10);
    } finally {
      globalThis.fetch = realFetch;
    }
    assert.equal(lostOneAnswer, true, 'the sender went on after an answer it never got, because the agent said it had the bytes');
    assert.deepEqual(lines, [`handoff video.mp4  ${video.length} bytes`, `handoff profile.png  ${shot.length} bytes`]);
    assert.deepEqual(readdirSync(join(agent.work, 'evidence')).sort(), ['manifest.json', 'profile.png', 'video.mp4']);
    assert.deepEqual(readFileSync(join(agent.work, 'evidence', 'video.mp4')), video);
    assert.deepEqual(JSON.parse(readFileSync(join(agent.work, 'evidence', 'manifest.json'), 'utf8')), manifest);
    assert.equal(existsSync(join(agent.work, 'evidence.partial')), false);

    assert.equal((await agent.call('/__sim/evidence/chunk', { method: 'POST', body: 'x'.repeat(HANDOFF_LIMITS.chunkBodyBytes + 1) })).status, 409, 'nothing is being received after a commit');
    assert.deepEqual(await (await agent.call('/__sim/stop', { method: 'POST' })).json(), { ok: true, evidence: 'r20261008-052713-253e' });
    await agent.exited;
    assert.deepEqual(readdirSync(join(agent.work, 'evidence')).sort(), ['manifest.json', 'profile.png', 'video.mp4'], 'the evidence outlives the agent, for the step that uploads it');
  });

  it('has no device routes when the session was started without a device', async () => {
    const agent = await startAgent({ ...base, device: null }, { device: false });
    assert.equal((await agent.health()).device, null);
    assert.equal((await agent.call('/__sim/record/start', { method: 'POST' })).status, 409);
    assert.equal((await agent.call(`/__sim/build?sha=${'a'.repeat(40)}`, { method: 'POST' })).status, 409);
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });
});
