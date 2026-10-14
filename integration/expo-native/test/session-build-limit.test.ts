import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { sha256Hex, type SessionHealth, type SessionRequest } from '../src/core/remote/protocol.ts';

const here = import.meta.dirname;
const token = 'c'.repeat(64);
const children: ChildProcess[] = [];
after(() => children.forEach((child) => child.kill('SIGKILL')));

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

let nextPort = 26000 + Math.floor(Math.random() * 4000);
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

const SLOW_UNTIL_STARTED_ONCE = `const fs = require('fs'); const mark = require('path').join(process.argv[1], 'started'); if (fs.existsSync(mark)) { console.log('finished what the stopped build left'); } else { fs.writeFileSync(mark, ''); console.log('build   xcodebuild Release'); setInterval(() => {}, 1000); }`;
const NEVER_ENDS_THE_FIRST_TIME = `export default () => ({ build: (work) => [{ command: process.execPath, args: ['-e', ${JSON.stringify(SLOW_UNTIL_STARTED_ONCE)}, work] }] });\n`;

const LEAVE_A_FILE = `require('fs').writeFileSync(require('path').join(process.argv[1], 'ran-after-the-limit'), '');`;
const ANSWERS_AFTER_THE_LIMIT = `await new Promise((done) => setTimeout(done, 6000));\nexport default () => ({ build: (work) => [{ command: process.execPath, args: ['-e', ${JSON.stringify(LEAVE_A_FILE)}, work] }] });\n`;

const EXIT_ZERO_WHEN_STOPPED = `process.on('SIGTERM', () => process.exit(0)); console.log('build   gradle assembleDebug'); setInterval(() => {}, 1000);`;
const EXITS_ZERO_WHEN_STOPPED = `export default () => ({ build: () => [{ command: process.execPath, args: ['-e', ${JSON.stringify(EXIT_ZERO_WHEN_STOPPED)}] }] });\n`;

function repoWithDevice(deviceModule: string): { dir: string; sha: string } {
  const dir = mkdtempSync(join(tmpdir(), 'verify-build-limit-'));
  const git = (...args: string[]) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: dir, encoding: 'utf8' }).trim();
  git('init', '-q');
  writeFileSync(join(dir, 'device.ts'), deviceModule);
  git('add', '-A');
  git('commit', '-q', '-m', 'one');
  git('remote', 'add', 'origin', dir);
  return { dir, sha: git('rev-parse', 'HEAD') };
}

async function startAgent(repo: { readonly dir: string; readonly sha: string }, minuteMs: number) {
  const work = mkdtempSync(join(tmpdir(), 'verify-build-limit-work-'));
  const port = await freePort();
  const bin = join(work, 'bin');
  mkdirSync(bin);
  writeFileSync(join(bin, 'cloudflared'), `#!/bin/sh\nexec "${process.execPath}" "${join(here, '..', 'testing', 'fake-tunnel.ts')}" "$@"\n`, { mode: 0o755 });
  const request: SessionRequest = { v: 1, session: 'ios0000bb', owner: '0123456789ab', platform: 'ios', runner: 'test-runner', device: 'Test Phone', sha: repo.sha, idleMinutes: 120, capMinutes: 360, tokenSha256: sha256Hex(token) };
  const child = spawn(process.execPath, [join(here, '..', 'src', 'core', 'remote', 'session-agent.ts'), 'serve'], {
    cwd: repo.dir,
    env: {
      PATH: `${bin}:/usr/bin:/bin`,
      VERIFY_SESSION_REQUEST: JSON.stringify(request),
      VERIFY_SESSION_WORK: work,
      VERIFY_SESSION_PORT: String(port),
      VERIFY_SESSION_AGENT_PORT: String(await freePort()),
      VERIFY_SESSION_CLOUDFLARED: join(bin, 'cloudflared'),
      VERIFY_SESSION_AGENT_DEVICE: join(bin, 'agent-device'),
      VERIFY_SESSION_SKIP_DNS: '1',
      VERIFY_SESSION_MINUTE_MS: String(minuteMs),
      VERIFY_SESSION_DEVICE_ID: 'UDID-1',
      VERIFY_SESSION_DEVICE_NAME: 'Test Phone',
      VERIFY_SESSION_DEVICE_MODULE: 'device.ts',
      GITHUB_SHA: repo.sha,
      GITHUB_REF: 'refs/heads/feature/change',
    },
    stdio: 'ignore',
  });
  children.push(child);
  const exited = new Promise<number>((done) => child.on('close', (code) => done(code ?? 1)));
  const call = (path: string, method: 'GET' | 'POST' = 'GET') => fetch(`http://127.0.0.1:${port}${path}`, { method, headers: { Authorization: `Bearer ${token}` } });
  const settledBuild = async (): Promise<SessionHealth['build']> => {
    for (const deadline = Date.now() + 60_000; Date.now() < deadline; await sleep(100)) {
      if (!existsSync(join(work, 'tunnel'))) continue;
      const { build } = (await (await call('/__sim/health')).json()) as SessionHealth;
      if (build.state !== 'building' && build.state !== 'none') return build;
    }
    throw new Error('the build did not settle in 60 seconds');
  };
  return { call, settledBuild, exited, work };
}

describe('the longest a session lets one build run', () => {
  it('stops a build at the limit, reports that as its own state with the last lines, and builds again when asked', async () => {
    const repo = repoWithDevice(NEVER_ENDS_THE_FIRST_TIME);
    const agent = await startAgent(repo, 100);

    const stopped = await agent.settledBuild();
    assert.equal(stopped.state, 'timed-out');
    assert.equal(stopped.state === 'timed-out' && stopped.sha, repo.sha);
    assert.equal(stopped.state === 'timed-out' && stopped.tail.split('\n').at(-1), 'build   xcodebuild Release');

    assert.equal((await agent.call(`/__sim/build?sha=${repo.sha}`, 'POST')).status, 202);
    const again = await agent.settledBuild();
    assert.deepEqual([again.state, again.state === 'built' && again.sha], ['built', repo.sha]);

    await agent.call('/__sim/stop', 'POST');
    assert.equal(await agent.exited, 0);
  });

  it('starts no further command once the limit has passed while none was running', async () => {
    const agent = await startAgent(repoWithDevice(ANSWERS_AFTER_THE_LIMIT), 100);

    const stopped = await agent.settledBuild();
    assert.equal(stopped.state, 'timed-out');
    assert.equal(existsSync(join(agent.work, 'ran-after-the-limit')), false);

    await agent.call('/__sim/stop', 'POST');
    assert.equal(await agent.exited, 0);
  });

  it('reports the limit, not a finished build, when the stopped command exits 0', async () => {
    const agent = await startAgent(repoWithDevice(EXITS_ZERO_WHEN_STOPPED), 100);

    const stopped = await agent.settledBuild();
    assert.equal(stopped.state, 'timed-out');
    assert.equal(stopped.state === 'timed-out' && stopped.tail.split('\n').at(-1), 'build   gradle assembleDebug');

    await agent.call('/__sim/stop', 'POST');
    assert.equal(await agent.exited, 0);
  });
});
