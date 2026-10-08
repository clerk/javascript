import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { run } from '../src/core/exec.ts';
import { remoteBackend } from '../src/core/remote/backend.ts';
import type { GitHub } from '../src/core/remote/github.ts';
import { driverId, newSessionRequest, type RemoteSettings } from '../src/core/remote/settings.ts';
import { BUILD_TIMEOUT_MINUTES, type SessionHealth } from '../src/core/remote/protocol.ts';
import { VerifyFailure, type BuildKey, type BuiltApp, type RemoteLease } from '../src/core/types.ts';

function repo(): { dir: string; git: (...args: string[]) => string } {
  const dir = mkdtempSync(join(tmpdir(), 'verify-remote-'));
  const git = (...args: string[]) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: dir, encoding: 'utf8' }).trim();
  git('init', '-q');
  writeFileSync(join(dir, 'App.swift'), 'app');
  writeFileSync(join(dir, 'README.md'), 'docs');
  git('add', '-A');
  git('commit', '-q', '-m', 'one');
  return { dir, git };
}

const settings = (dir: string): RemoteSettings => ({
  platform: 'ios',
  repo: 'clerk/clerk-ios',
  workflow: 'verify-remote.yml',
  sessionsDir: join(dir, '.verify', 'remote'),
  runner: 'paid-mac',
  plumbingRunner: 'ubuntu-latest',
  device: 'iPhone Air',
  idleMinutes: 15,
  capMinutes: 60,
  requirement: 'a pushed branch',
});

function github(routes: (method: string, path: string) => { status: number; json: unknown }): { hub: GitHub; calls: string[] } {
  const calls: string[] = [];
  const hub: GitHub = { repo: 'clerk/clerk-ios', workflow: 'verify-remote.yml', tokenSource: 'none', api: async (method, path) => (calls.push(`${method} ${path}`), { ...routes(method, path), headers: new Headers() }) };
  return { hub, calls };
}

describe('the remote backend owns the build', () => {
  const input = (dir: string) => ({ worktree: dir, inputs: ['App.swift'] });

  it('names the pushed HEAD as the commit to build', async () => {
    const { dir, git } = repo();
    const { hub } = github(() => ({ status: 200, json: {} }));
    assert.equal(await remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!(input(dir)), git('rev-parse', 'HEAD'));
  });

  it('refuses a tree whose app sources are edited, and says to commit and push', async () => {
    const { dir } = repo();
    writeFileSync(join(dir, 'App.swift'), 'edited');
    const { hub } = github(() => ({ status: 200, json: {} }));
    await assert.rejects(
      remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!(input(dir)),
      (error: VerifyFailure) => error.code === 'BUILD_FAILED' && error.message.includes('App.swift') && error.fix.includes('git push'),
    );
  });

  it('ignores edits outside the app sources', async () => {
    const { dir } = repo();
    writeFileSync(join(dir, 'README.md'), 'edited docs');
    const { hub } = github(() => ({ status: 200, json: {} }));
    assert.ok(await remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!(input(dir)));
  });

  it('refuses a commit GitHub does not have', async () => {
    const { dir } = repo();
    const { hub } = github(() => ({ status: 422, json: { message: 'No commit found' } }));
    await assert.rejects(
      remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!(input(dir)),
      (error: VerifyFailure) => error.code === 'BUILD_FAILED' && error.fix.startsWith('git push'),
    );
  });
});

describe('the remote backend waits for the session to build', () => {
  const SHA = 'a'.repeat(40);
  const realFetch = globalThis.fetch;

  async function installOnASessionWhoseBuildIs(build: SessionHealth['build']): Promise<{ failure: VerifyFailure; asked: string[] }> {
    const { dir } = repo();
    const session = join(dir, '.verify', 'remote', 'ios0000cc');
    mkdirSync(session, { recursive: true });
    writeFileSync(join(session, 'token'), 'f'.repeat(64));
    const lease: RemoteLease = { backend: 'remote', provider: 'github-actions', platform: 'ios', session: 'ios0000cc', providerRef: '7', baseUrl: 'https://quick-fox.trycloudflare.com', tokenFile: join(session, 'token'), deviceId: 'UDID-1', deviceName: 'iPhone Air', runner: 'free-mac', expiresAt: '2026-10-13T18:00:00.000Z', builtSha: null, acquiredAt: '2026-10-13T17:00:00.000Z', installedBuild: null };
    const app: BuiltApp = { platform: 'ios', key: 'ios-k1' as BuildKey, appId: 'com.example.app', path: null, source: 'github-actions', sourceSha: SHA };
    const health: SessionHealth = { core: 'unread', device: { id: 'UDID-1', name: 'iPhone Air', ready: true }, daemon: true, build, capAt: '2026-10-13T18:00:00.000Z', ending: null };
    const asked: string[] = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      asked.push(`${init?.method ?? 'GET'} ${url.pathname}${url.search}`);
      return url.pathname === '/__sim/build' ? Response.json(health, { status: 202 }) : Response.json(health);
    }) as typeof fetch;
    try {
      const { hub } = github(() => ({ status: 200, json: {} }));
      const failure = await remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).install(lease, app, () => undefined).then(
        () => assert.fail('the install did not fail'),
        (error: VerifyFailure) => error,
      );
      return { failure, asked };
    } finally {
      globalThis.fetch = realFetch;
    }
  }

  it('says a build that the session stopped at its limit ran out of time, and to run up again', { timeout: 20_000 }, async () => {
    const { failure, asked } = await installOnASessionWhoseBuildIs({ state: 'timed-out', sha: SHA, seconds: BUILD_TIMEOUT_MINUTES * 60, tail: 'build   pnpm install took 412s\nbuild   xcodebuild Release (JS embedded)' });
    assert.deepEqual(asked, [`POST /__sim/build?sha=${SHA}`, 'GET /__sim/health']);
    assert.equal(failure.code, 'NOT_READY');
    assert.equal(
      failure.message,
      'the session stopped the build of aaaaaaaaaaaa after 45 minutes on free-mac, the longest it lets one build run. The build reported no error before that. Its last lines:\nbuild   pnpm install took 412s\nbuild   xcodebuild Release (JS embedded)',
    );
    assert.equal(failure.fix, 'rerun {cli} up, and the same session builds again from what the stopped build left; if that build is stopped too, {cli} down, then {cli} up --runner <a faster runner label>');
  });

  it('says a build that exited with an error failed, and to fix the error', async () => {
    const { failure } = await installOnASessionWhoseBuildIs({ state: 'failed', sha: SHA, seconds: 61, tail: 'error: no such module' });
    assert.deepEqual([failure.code, failure.message, failure.fix], ['BUILD_FAILED', 'the session could not build aaaaaaaaaaaa:\nerror: no such module', 'fix the build error above, commit, push, then rerun {cli} up']);
  });
});

describe('session settings', () => {
  const dir = () => mkdtempSync(join(tmpdir(), 'verify-remote-settings-'));

  it('takes the runner label from the flag, then the default', () => {
    const s = settings(dir());
    const ask = (env: Record<string, string>, runner?: string) => newSessionRequest(s, { env, runner: run }, { ...(runner === undefined ? {} : { runner }), device: 'iPhone Air', sha: null }).request;
    assert.equal(ask({}).runner, 'paid-mac');
    assert.equal(ask({}, 'other').runner, 'other');
    assert.equal(ask({ VERIFY_REMOTE_IDLE_MINUTES: '5', VERIFY_REMOTE_CAP_MINUTES: '30' }).idleMinutes, 5);
    assert.equal(ask({ VERIFY_REMOTE_IDLE_MINUTES: '5', VERIFY_REMOTE_CAP_MINUTES: '30' }).capMinutes, 30);
    assert.throws(() => ask({ VERIFY_REMOTE_CAP_MINUTES: '100000' }), VerifyFailure);
  });

  it('refuses a runner label the workflow would reject, before anything is started', () => {
    assert.throws(
      () => newSessionRequest(settings(dir()), { env: {}, runner: run }, { runner: 'mac; curl evil', device: null, sha: null }),
      (error: VerifyFailure) => error.code === 'USAGE' && error.fix.includes('--runner'),
    );
  });

  it('never puts the bearer in the request', () => {
    const { request, token } = newSessionRequest(settings(dir()), { env: {}, runner: run }, { device: null, sha: null });
    assert.equal(JSON.stringify(request).includes(token), false);
  });

  it('gives each checkout its own id, even at the same path, and keeps it', () => {
    const first = settings(dir());
    assert.match(driverId(first), /^[a-f0-9]{12}$/);
    assert.equal(driverId(first), driverId(first));
    assert.notEqual(driverId(first), driverId(settings(dir())));
  });
});

describe('reaping', () => {
  it('lists only the live session runs of this checkout and this platform', async () => {
    const { dir } = repo();
    const s = settings(dir);
    const mine = driverId(s);
    const { hub } = github((_method, path) => ({
      status: 200,
      json: {
        workflow_runs: path.includes('status=in_progress')
          ? [
              { id: 1, display_title: `verify-remote ${mine}/iosaaaaaa`, created_at: '2026-10-05T00:00:00Z' },
              { id: 2, display_title: 'verify-remote 0123456789ab/iosbbbbbb', created_at: '2026-10-05T00:00:00Z' },
              { id: 4, display_title: `verify-remote ${mine}/androiddddd`, created_at: '2026-10-05T00:00:00Z' },
              { id: 5, display_title: `verify-remote ${mine}/probeeeeee`, created_at: '2026-10-05T00:00:00Z' },
            ]
          : [{ id: 3, display_title: `verify-remote verify-remote/${mine}/ioscccccc`, created_at: '2026-10-05T00:00:00Z' }],
      },
    }));
    const backend = remoteBackend(s, { env: {}, runner: run, github: async () => hub });
    assert.deepEqual((await backend.reapable(dir)).map((lease) => [lease.providerRef, lease.session]), [['1', 'iosaaaaaa'], ['3', 'ioscccccc']]);
    assert.deepEqual(await backend.reapable(), []);
  });

  it('reaps nothing, and does not fail, when GitHub cannot be reached', async () => {
    const { dir } = repo();
    const backend = remoteBackend(settings(dir), { env: {}, runner: run, github: async () => { throw new Error('offline'); } });
    assert.deepEqual(await backend.reapable(dir), []);
  });
});
