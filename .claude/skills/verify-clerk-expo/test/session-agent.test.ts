import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { coreVersion } from '../src/core/manifest.ts';
import { plan } from '../src/core/remote/session-agent.ts';
import { sha256Hex, type SessionHealth, type SessionRequest } from '../src/core/remote/protocol.ts';

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

let nextPort = 43190 + Math.floor(Math.random() * 400);

function repoWithCommit(): { dir: string; sha: string; commit(text: string): string } {
  const dir = mkdtempSync(join(tmpdir(), 'verify-agent-repo-'));
  const git = (...args: string[]) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: dir, encoding: 'utf8' }).trim();
  git('init', '-q');
  const commit = (text: string) => {
    writeFileSync(join(dir, 'app.txt'), text);
    git('add', '-A');
    git('commit', '-q', '-m', text);
    return git('rev-parse', 'HEAD');
  };
  const sha = commit('one');
  git('remote', 'add', 'origin', dir);
  return { dir, sha, commit };
}

async function startAgent(request: SessionRequest, options: { readonly cwd?: string; readonly device?: boolean; readonly deviceModule?: string; readonly minuteMs?: number; readonly agentDevice?: boolean; readonly env?: Readonly<Record<string, string>> } = {}) {
  const work = mkdtempSync(join(tmpdir(), 'verify-agent-'));
  const port = (nextPort += 2);
  const bin = join(work, 'bin');
  mkdirSync(bin);
  const script = (name: string, file: string) => writeFileSync(join(bin, name), `#!/bin/sh\nexec "${process.execPath}" "${join(here, '..', 'testing', file)}" "$@"\n`, { mode: 0o755 });
  script('cloudflared', 'fake-tunnel.ts');
  script('adb', 'fake-adb.ts');
  if (options.agentDevice === true) script('agent-device', 'fake-agent-device.ts');
  const child = spawn(process.execPath, [join(here, '..', 'src', 'core', 'remote', 'session-agent.ts'), 'serve'], {
    cwd: options.cwd ?? work,
    env: {
      PATH: `${bin}:/usr/bin:/bin`,
      VERIFY_SESSION_REQUEST: JSON.stringify(request),
      VERIFY_SESSION_WORK: work,
      VERIFY_SESSION_PORT: String(port),
      VERIFY_SESSION_AGENT_PORT: String(port + 1),
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
  return { work, call, health, exited };
}

describe('plan', () => {
  it('turns a request into job outputs and anything else into mode=none', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-plan-'));
    const out = join(dir, 'out');
    writeFileSync(out, '');
    plan({ GITHUB_OUTPUT: out, VERIFY_REQUEST: `${JSON.stringify(base)}\n` });
    const outputs = Object.fromEntries(readFileSync(out, 'utf8').trim().split('\n').map((line) => line.split(/=(.*)/s, 2) as [string, string]));
    assert.equal(outputs.mode, 'session');
    assert.equal(outputs.runner, 'test-runner');
    assert.equal(outputs.timeout, '20');
    assert.deepEqual(JSON.parse(outputs.request!), base);
    writeFileSync(out, '');
    plan({ GITHUB_OUTPUT: out, VERIFY_REQUEST: 'feat: an ordinary commit' });
    assert.equal(readFileSync(out, 'utf8'), 'mode=none\n');
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
    assert.equal((await agent.call('/__sim/stop', { method: 'POST' })).status, 200);
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
    const agent = await startAgent({ ...base, sha: repo.sha }, { cwd: repo.dir });
    const built = (sha: string) => until(async () => { const b = (await agent.health()).build; return b.state !== 'building' && b.state !== 'none' && b.sha === sha ? b : null; }, `build of ${sha}`);
    const first = await built(repo.sha);
    assert.equal(first.state, 'built');
    assert.equal(first.state === 'built' && first.incremental, false);
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'one');

    const second = repo.commit('two');
    assert.equal((await agent.call(`/__sim/build?sha=${second}`, { method: 'POST' })).status, 202);
    const rebuilt = await built(second);
    assert.equal(rebuilt.state === 'built' && rebuilt.incremental, true);
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'two');

    assert.equal((await agent.call('/__sim/build?sha=main', { method: 'POST' })).status, 400);
    const missing = '0'.repeat(40);
    await agent.call(`/__sim/build?sha=${missing}`, { method: 'POST' });
    const failed = await built(missing);
    assert.equal(failed.state, 'failed');
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });

  it('builds each commit with the recipe that commit holds, not the one the session started on', async () => {
    const repo = repoWithCommit();
    const recipeOf = (label: string) =>
      `export default () => ({ build: (work) => [{ command: process.execPath, args: ['-e', "require('fs').writeFileSync(require('path').join(process.argv[1], 'built'), '${label} recipe built ' + require('fs').readFileSync('app.txt', 'utf8'))", work] }] });\n`;
    writeFileSync(join(repo.dir, 'device.ts'), recipeOf('first'));
    const first = repo.commit('one');
    const agent = await startAgent({ ...base, sha: first }, { cwd: repo.dir, deviceModule: 'device.ts' });
    const built = (sha: string) => until(async () => { const b = (await agent.health()).build; return b.state !== 'building' && b.state !== 'none' && b.sha === sha ? b : null; }, `build of ${sha}`);
    assert.equal((await built(first)).state, 'built');
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'first recipe built one');

    writeFileSync(join(repo.dir, 'device.ts'), recipeOf('second'));
    const second = repo.commit('two');
    await agent.call(`/__sim/build?sha=${second}`, { method: 'POST' });
    assert.equal((await built(second)).state, 'built');
    assert.equal(readFileSync(join(agent.work, 'built'), 'utf8'), 'second recipe built two');

    writeFileSync(join(repo.dir, 'device.ts'), 'export default () => { throw new Error("this module is broken"); };\n');
    const third = repo.commit('three');
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

  it('runs adb shell and reverse against its own device, and nothing else', async () => {
    const agent = await startAgent({ ...base, platform: 'android' });
    const command = (body: unknown) => agent.call('/__sim/device-command', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) });
    const ran = await command({ args: ['shell', 'ls'] });
    assert.equal(ran.status, 200);
    const result = (await ran.json()) as { code: number; stdout: string };
    assert.equal(result.code, 0);
    assert.deepEqual(JSON.parse(result.stdout), { args: ['-s', 'UDID-1', 'shell', 'ls'] });
    assert.equal(((await (await command({ args: ['shell', 'fails'] })).json()) as { code: number }).code, 3, 'a failing command is a result, not an error');
    assert.equal((await command({ args: ['reverse', 'tcp:8081', 'tcp:8081'] })).status, 200);
    for (const refused of [['pull', '/etc/passwd', '/tmp/x'], ['push', 'a', 'b'], ['-s', 'other', 'shell', 'id'], ['emu', 'kill'], ['reverse', 'tcp:9000', 'localfilesystem:/var/run/docker.sock']]) {
      const response = await command({ args: refused });
      assert.equal(response.status, 403, refused.join(' '));
    }
    for (const malformed of ['not json', { args: [] }, { args: 'shell' }, { args: ['shell', 1] }]) assert.equal((await command(malformed)).status, 400);
    assert.equal((await agent.call('/__sim/device-command', { method: 'POST', bearer: null, body: '{"args":["shell","id"]}' })).status, 403);
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;

    const ios = await startAgent(base);
    assert.equal((await ios.call('/__sim/device-command', { method: 'POST', body: '{"args":["shell","id"]}' })).status, 403, 'iOS has no device tool');
    await ios.call('/__sim/stop', { method: 'POST' });
    await ios.exited;
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

  it('has no device routes when the session was started without a device', async () => {
    const agent = await startAgent({ ...base, device: null }, { device: false });
    assert.equal((await agent.health()).device, null);
    assert.equal((await agent.call('/__sim/record/start', { method: 'POST' })).status, 409);
    assert.equal((await agent.call(`/__sim/build?sha=${'a'.repeat(40)}`, { method: 'POST' })).status, 409);
    assert.equal((await agent.call('/__sim/device-command', { method: 'POST', body: '{"args":["shell","id"]}' })).status, 409);
    await agent.call('/__sim/stop', { method: 'POST' });
    await agent.exited;
  });
});
