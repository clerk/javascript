import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { run } from '../src/core/exec.ts';
import { remoteBackend, workingPatch } from '../src/core/remote/backend.ts';
import type { GitHub } from '../src/core/remote/github.ts';
import { driverId, newSessionRequest, type RemoteSettings } from '../src/core/remote/settings.ts';
import { BUILD_LOG_START, BUILD_TIMEOUT_MINUTES, PATCH_LIMIT_BYTES, sha256Hex, type SessionHealth } from '../src/core/remote/protocol.ts';
import { VerifyFailure, type BuildKey, type BuiltApp, type EvidencePath, type RemoteLease } from '../src/core/types.ts';

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

  it('names the pushed HEAD as the commit to build, with nothing on top of a clean tree', async () => {
    const { dir, git } = repo();
    const { hub } = github(() => ({ status: 200, json: {} }));
    assert.deepEqual(await remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!(input(dir)), { sha: git('rev-parse', 'HEAD'), patch: null });
  });

  it('sends edits to the app sources as a patch on the pushed HEAD, with the sha256 of the whole patch', async () => {
    const { dir, git } = repo();
    writeFileSync(join(dir, 'App.swift'), 'edited');
    const { hub } = github(() => ({ status: 200, json: {} }));
    const source = await remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!(input(dir));
    assert.equal(source.sha, git('rev-parse', 'HEAD'));
    assert.match(source.patch?.bytes.toString() ?? '', /^-app\n\\ No newline at end of file\n\+edited$/m);
    assert.equal(source.patch?.sha256, sha256Hex(source.patch!.bytes));
  });

  it('sends nothing for edits outside the app sources', async () => {
    const { dir } = repo();
    writeFileSync(join(dir, 'README.md'), 'edited docs');
    const { hub } = github(() => ({ status: 200, json: {} }));
    assert.equal((await remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!(input(dir))).patch, null);
  });

  it('refuses uncommitted changes larger than a session takes, however large, with the fix to commit them', async () => {
    const { dir, git } = repo();
    writeFileSync(join(dir, 'App.swift'), 'edited');
    const bin = mkdtempSync(join(tmpdir(), 'verify-remote-bin-'));
    const realGit = execFileSync('which', ['git'], { encoding: 'utf8' }).trim();
    writeFileSync(join(bin, 'git'), `#!/bin/sh\nif [ "$1" = diff ]; then exec head -c "$PATCH_BYTES" /dev/zero; fi\nexec "${realGit}" "$@"\n`, { mode: 0o755 });
    const { hub } = github(() => ({ status: 200, json: {} }));
    const path = process.env.PATH;
    process.env.PATH = `${bin}:${path}`;
    try {
      process.env.PATCH_BYTES = String(PATCH_LIMIT_BYTES);
      const fits = await remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!(input(dir));
      assert.deepEqual([fits.sha, fits.patch?.bytes.length], [git('rev-parse', 'HEAD'), PATCH_LIMIT_BYTES]);
      for (const bytes of [PATCH_LIMIT_BYTES + 1, 4 * PATCH_LIMIT_BYTES + 1]) {
        process.env.PATCH_BYTES = String(bytes);
        await assert.rejects(remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!(input(dir)), {
          code: 'BUILD_FAILED',
          message: 'the uncommitted changes to the app make a patch larger than the 16 MiB a session takes',
          fix: 'git commit the changes and git push, then rerun',
        });
      }
    } finally {
      process.env.PATH = path;
      delete process.env.PATCH_BYTES;
    }
  });

  it('refuses with the fix to commit the changes when git cannot read them', async () => {
    const { dir } = repo();
    const { hub } = github(() => ({ status: 200, json: {} }));
    await assert.rejects(remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).sourceCommit!({ worktree: dir, inputs: ['Missing.swift'] }), {
      code: 'BUILD_FAILED',
      message: "git could not read the uncommitted changes to the app: fatal: pathspec 'Missing.swift' did not match any files",
      fix: 'git commit the changes and git push, then rerun',
    });
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

describe('the patch of a working tree', () => {
  const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0xff, 0x00]);

  function edited(): { dir: string; git: (...args: string[]) => string } {
    const { dir, git } = repo();
    mkdirSync(join(dir, 'Sources', 'Generated'), { recursive: true });
    writeFileSync(join(dir, '.gitignore'), 'Sources/Generated/\n');
    writeFileSync(join(dir, 'Sources', 'Kept.swift'), 'let kept = "one"\n');
    writeFileSync(join(dir, 'Sources', 'Gone.swift'), 'let gone = 1\n');
    writeFileSync(join(dir, 'Sources', 'icon.png'), PNG);
    git('add', '-A');
    git('commit', '-q', '-m', 'sources');
    writeFileSync(join(dir, 'Sources', 'Kept.swift'), 'let kept = "two"\n');
    git('add', 'Sources/Kept.swift');
    writeFileSync(join(dir, 'Sources', 'Kept.swift'), 'let kept = "three"\n');
    rmSync(join(dir, 'Sources', 'Gone.swift'));
    writeFileSync(join(dir, 'Sources', 'New.swift'), 'let made = true\n');
    writeFileSync(join(dir, 'Sources', 'icon.png'), Buffer.concat([PNG, Buffer.from([0x00, 0x01, 0x02])]));
    writeFileSync(join(dir, 'Sources', 'Generated', 'Secrets.swift'), 'let key = "ignored"\n');
    writeFileSync(join(dir, 'README.md'), 'edited docs');
    return { dir, git };
  }

  it('turns a tracked change, a new file, a deleted file and a binary file into one patch that a clean checkout of the commit takes', () => {
    const { dir, git } = edited();
    const patch = workingPatch(dir, ['Sources']);
    assert.ok(patch !== null);
    const clean = mkdtempSync(join(tmpdir(), 'verify-remote-clean-'));
    execFileSync('git', ['clone', '-q', dir, clean]);
    writeFileSync(join(clean, '..', `${patch.sha256}.diff`), patch.bytes);
    execFileSync('git', ['apply', '--binary', join(clean, '..', `${patch.sha256}.diff`)], { cwd: clean });
    assert.equal(readFileSync(join(clean, 'Sources', 'Kept.swift'), 'utf8'), 'let kept = "three"\n', 'the working file, not the staged one');
    assert.equal(existsSync(join(clean, 'Sources', 'Gone.swift')), false);
    assert.equal(readFileSync(join(clean, 'Sources', 'New.swift'), 'utf8'), 'let made = true\n');
    assert.deepEqual(readFileSync(join(clean, 'Sources', 'icon.png')), Buffer.concat([PNG, Buffer.from([0x00, 0x01, 0x02])]));
    assert.equal(existsSync(join(clean, 'Sources', 'Generated')), false, 'a file in an ignored folder is left out');
    assert.equal(readFileSync(join(clean, 'README.md'), 'utf8'), 'docs', 'a file outside the app sources is left out');
    assert.equal(git('diff', '--cached', '--name-only'), 'Sources/Kept.swift', 'the index of the checkout is as it was');
  });

  it('is nothing for a tree that matches its commit', () => {
    const { dir } = repo();
    writeFileSync(join(dir, 'README.md'), 'edited docs');
    assert.equal(workingPatch(dir, ['App.swift']), null);
  });
});

describe('the remote backend starts a recording', () => {
  it('times the video from when the recorder started when the session never heard it say it records, and says so', async () => {
    const realFetch = globalThis.fetch;
    const { dir } = repo();
    const session = join(dir, '.verify', 'remote', 'ios0000cc');
    mkdirSync(session, { recursive: true });
    writeFileSync(join(session, 'token'), 'f'.repeat(64));
    const lease: RemoteLease = { backend: 'remote', provider: 'github-actions', platform: 'ios', session: 'ios0000cc', providerRef: '7', baseUrl: 'https://quick-fox.trycloudflare.com', tokenFile: join(session, 'token'), deviceId: 'UDID-1', deviceName: 'iPhone Air', runner: 'free-mac', expiresAt: '2026-10-13T18:00:00.000Z', builtSha: null, builtPatch: null, acquiredAt: '2026-10-13T17:00:00.000Z', installedBuild: null };
    globalThis.fetch = (async () => Response.json({ ok: true, recordingForMs: 10_000 })) as typeof fetch;
    try {
      const { hub } = github(() => ({ status: 200, json: {} }));
      const asked = Date.now();
      const recording = await remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).startRecording(lease, join(dir, 'run') as EvidencePath);
      const answered = Date.now();
      assert.ok(recording.videoStartsAt !== undefined && recording.videoStartsAt >= asked - 10_000 && recording.videoStartsAt <= answered - 10_000, `the video starts ${recording.videoStartsAt === undefined ? 'unknown' : answered - recording.videoStartsAt} ms before the answer`);
      assert.equal(recording.videoStartGuess, 'the session never heard its recorder say it was recording, so this run times the video from when the recorder started, and its tap pulses can land up to a second or two late');
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});

describe('the remote backend waits for the session to build', () => {
  const SHA = 'a'.repeat(40);
  const realFetch = globalThis.fetch;

  async function installOnASessionWhoseBuildIs(build: SessionHealth['build'] | readonly SessionHealth['build'][], log: readonly string[] = ['']): Promise<{ failure: VerifyFailure; asked: string[]; progress: string[] }> {
    const { dir } = repo();
    const session = join(dir, '.verify', 'remote', 'ios0000cc');
    mkdirSync(session, { recursive: true });
    writeFileSync(join(session, 'token'), 'f'.repeat(64));
    const lease: RemoteLease = { backend: 'remote', provider: 'github-actions', platform: 'ios', session: 'ios0000cc', providerRef: '7', baseUrl: 'https://quick-fox.trycloudflare.com', tokenFile: join(session, 'token'), deviceId: 'UDID-1', deviceName: 'iPhone Air', runner: 'free-mac', expiresAt: '2026-10-13T18:00:00.000Z', builtSha: null, builtPatch: null, acquiredAt: '2026-10-13T17:00:00.000Z', installedBuild: null };
    const app: BuiltApp = { platform: 'ios', key: 'ios-k1' as BuildKey, appId: 'com.example.app', path: null, source: 'github-actions', sourceSha: SHA, patch: null };
    const builds = Array.isArray(build) ? build : [build];
    const health = (polled: number): SessionHealth => ({ core: 'unread', device: { id: 'UDID-1', name: 'iPhone Air', ready: true }, daemon: true, build: builds[Math.min(polled, builds.length - 1)]!, capAt: '2026-10-13T18:00:00.000Z', ending: null });
    const asked: string[] = [];
    let polled = 0;
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      asked.push(`${init?.method ?? 'GET'} ${url.pathname}${url.search}`);
      if (url.pathname === '/__sim/build') return Response.json(health(0), { status: 202 });
      if (url.pathname === '/__sim/health') return Response.json(health(polled++));
      const written = Buffer.from(log[Math.min(polled - 1, log.length - 1)]!);
      const from = Number(url.searchParams.get('from'));
      return new Response(written.subarray(from), { headers: { [BUILD_LOG_START]: String(from) } });
    }) as typeof fetch;
    try {
      const { hub } = github(() => ({ status: 200, json: {} }));
      const progress: string[] = [];
      const failure = await remoteBackend(settings(dir), { env: {}, runner: run, github: async () => hub }).install(lease, app, (line) => progress.push(line)).then(
        () => assert.fail('the install did not fail'),
        (error: VerifyFailure) => error,
      );
      return { failure, asked, progress };
    } finally {
      globalThis.fetch = realFetch;
    }
  }

  it('says a build that the session stopped at its limit ran out of time, and to run up again', { timeout: 20_000 }, async () => {
    const { failure, asked } = await installOnASessionWhoseBuildIs({ state: 'timed-out', sha: SHA, patch: null, seconds: BUILD_TIMEOUT_MINUTES * 60, tail: 'build   pnpm install took 412s\nbuild   xcodebuild Release (JS embedded)' });
    assert.deepEqual(asked, [`POST /__sim/build?sha=${SHA}`, 'GET /__sim/health', 'GET /__sim/build/log?from=0']);
    assert.equal(failure.code, 'NOT_READY');
    assert.equal(
      failure.message,
      'the session stopped the build of aaaaaaaaaaaa after 45 minutes on free-mac, the longest it lets one build run. The build reported no error before that. Its last lines:\nbuild   pnpm install took 412s\nbuild   xcodebuild Release (JS embedded)',
    );
    assert.equal(failure.fix, 'rerun {cli} up, and the same session builds again from what the stopped build left; if that build is stopped too, {cli} down, then {cli} up --runner <a faster runner label>');
  });

  it('says a build that exited with an error failed, and to fix the error', async () => {
    const { failure } = await installOnASessionWhoseBuildIs({ state: 'failed', sha: SHA, patch: null, seconds: 61, tail: 'error: no such module' });
    assert.deepEqual([failure.code, failure.message, failure.fix], ['BUILD_FAILED', 'the session could not build aaaaaaaaaaaa:\nerror: no such module', 'fix the build error above, commit, push, then rerun {cli} up']);
  });

  it('shows each line of the build output once, as the session writes it, and holds back a line that is not finished', { timeout: 20_000 }, async () => {
    const building = { state: 'building', sha: SHA, patch: null, seconds: 5 } as const;
    const failed = { state: 'failed', sha: SHA, patch: null, seconds: 9, tail: 'error: no such module' } as const;
    const { asked, progress } = await installOnASessionWhoseBuildIs([building, failed], ['$ xcodebuild build\ncompil', '$ xcodebuild build\ncompiling ClerkKit\nerror: no such module\n']);
    assert.deepEqual(asked.filter((line) => line.includes('/log')), ['GET /__sim/build/log?from=0', 'GET /__sim/build/log?from=19']);
    assert.deepEqual(progress.filter((line) => line.startsWith('build   |')), ['build   | $ xcodebuild build', 'build   | compiling ClerkKit', 'build   | error: no such module']);
  });

  it('waits out a build other than the one it asked for, and shows none of its output', { timeout: 20_000 }, async () => {
    const another = { state: 'failed', sha: SHA, patch: 'c'.repeat(64), seconds: 9, tail: 'error: of another build' } as const;
    const ours = { state: 'failed', sha: SHA, patch: null, seconds: 9, tail: 'error: no such module' } as const;
    const { asked, failure } = await installOnASessionWhoseBuildIs([another, ours], ['output of another build\n', 'error: no such module\n']);
    assert.deepEqual(asked, [`POST /__sim/build?sha=${SHA}`, 'GET /__sim/health', 'GET /__sim/health', 'GET /__sim/build/log?from=0']);
    assert.equal(failure.message, 'the session could not build aaaaaaaaaaaa:\nerror: no such module');
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
