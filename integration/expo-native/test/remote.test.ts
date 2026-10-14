import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';
import { selectBackend } from '../src/core/devices.ts';
import type { ExecResult } from '../src/core/exec.ts';
import { openGitHub, publishedStep, startRun, waitReporter, type GitHub, type JobView } from '../src/core/remote/github.ts';
import { RUN_TITLE, RequestError, STEP, matchesToken, parseRequest, sha256Hex, type SessionRequest } from '../src/core/remote/protocol.ts';
import { tunnelUrl } from '../src/core/remote/session.ts';
import { TUNNEL } from '../src/core/remote/tunnel.ts';
import { VerifyFailure, type DeviceBackend, type HostAdapter } from '../src/core/types.ts';

const token = 'a'.repeat(64);
const request: SessionRequest = {
  v: 1,
  session: 'ios12ab34',
  owner: '0123456789ab',
  platform: 'ios',
  runner: 'blacksmith-6vcpu-macos-27',
  device: 'iPhone Air',
  sha: 'f'.repeat(40),
  idleMinutes: 15,
  capMinutes: 60,
  tokenSha256: sha256Hex(token),
};

describe('session request', () => {
  it('round-trips a valid request and accepts no device and no commit', () => {
    assert.deepEqual(parseRequest(JSON.stringify(request)), request);
    assert.deepEqual(parseRequest(JSON.stringify({ ...request, device: null, sha: null })), { ...request, device: null, sha: null });
  });

  it('refuses anything a shell or a runs-on could misread', () => {
    const bad: Record<string, unknown>[] = [
      { runner: 'ubuntu-latest; curl evil' },
      { runner: '${{ secrets.X }}' },
      { device: 'iPhone"; rm -rf /' },
      { sha: 'main' },
      { session: '../x' },
      { owner: 'someone' },
      { capMinutes: 100000 },
      { idleMinutes: 0 },
      { idleMinutes: 61 },
      { tokenSha256: token.slice(1) },
      { v: 2 },
    ];
    for (const change of bad) assert.throws(() => parseRequest(JSON.stringify({ ...request, ...change })), RequestError, JSON.stringify(change));
    assert.throws(() => parseRequest('docs: an ordinary commit message'), RequestError);
  });

  it('recognizes the bearer by its hash and nothing else', () => {
    assert.equal(matchesToken(request.tokenSha256, token), true);
    assert.equal(matchesToken(request.tokenSha256, `${token}x`), false);
    assert.equal(matchesToken(request.tokenSha256, request.tokenSha256), false);
  });

  it('titles a run so the owner and session can be read back', () => {
    assert.deepEqual(RUN_TITLE.exec(`verify-remote ${request.owner}/${request.session}`)?.slice(1), [request.owner, request.session]);
    assert.equal(RUN_TITLE.exec('verify-remote feature/some-branch'), null);
  });
});

describe('the step-name channel', () => {
  const job = (steps: readonly string[]): JobView => ({ name: 'session', status: 'in_progress', steps: steps.map((name) => ({ name, status: 'completed', conclusion: 'success' })) });

  it('reads the tunnel host, and reads nothing before the step has its value', () => {
    assert.equal(publishedStep([job(['Set up job', 'verify-remote tunnel quick-fox-jumps.trycloudflare.com'])], STEP.tunnelPattern), 'quick-fox-jumps.trycloudflare.com');
    assert.equal(publishedStep([job(['Set up job', 'verify-remote tunnel '])], STEP.tunnelPattern), null);
    assert.equal(publishedStep([job(['verify-remote tunnel ${{ steps.tunnel.outputs.host }}'])], STEP.tunnelPattern), null);
  });

  it('refuses to send the bearer to a host outside the tunnel domain', () => {
    assert.equal(tunnelUrl('quick-fox-jumps.trycloudflare.com'), 'https://quick-fox-jumps.trycloudflare.com');
    for (const host of ['evil.example.com', 'trycloudflare.com.evil.example', 'x.trycloudflare.com:8443', 'x.trycloudflare.com/@evil', TUNNEL.probeHost]) {
      assert.throws(() => tunnelUrl(host), VerifyFailure, host);
    }
  });

  it('does not take the address cloudflared asks for a tunnel as the tunnel', () => {
    const refused = 'ERR failed to request quick Tunnel: Post "https://api.trycloudflare.com/tunnel": context deadline exceeded';
    assert.equal(TUNNEL.hostPattern.exec(refused), null);
    assert.equal(TUNNEL.hostPattern.exec(`${refused}\n|  https://quick-fox-jumps.trycloudflare.com  |`)?.[1], 'quick-fox-jumps.trycloudflare.com');
  });
});

describe('starting a run', () => {
  function fakeGitHub(dispatchStatus: number, runs: readonly { id: number; display_title: string }[]): { github: GitHub; calls: string[]; dispatched: unknown[] } {
    const calls: string[] = [];
    const dispatched: unknown[] = [];
    const github: GitHub = {
      repo: 'clerk/clerk-ios',
      workflow: 'verify-remote.yml',
      tokenSource: 'none',
      async api(method, path, body) {
        calls.push(`${method} ${path}`);
        if (path.endsWith('/dispatches')) dispatched.push(body);
        if (path.endsWith('/dispatches')) return { status: dispatchStatus, json: dispatchStatus === 200 ? { workflow_run_id: 41 } : dispatchStatus === 204 ? null : { message: 'Resource not accessible by integration' }, headers: new Headers() };
        return { status: 200, json: { workflow_runs: runs }, headers: new Headers() };
      },
    };
    return { github, calls, dispatched };
  }
  const ok = (): ExecResult => ({ code: 0, stdout: '', stderr: '' });

  it('uses the run id a dispatch returns', async () => {
    const { github, dispatched } = fakeGitHub(200, []);
    assert.equal(await startRun(github, request, { ref: 'feature/branch' }), '41');
    assert.deepEqual(dispatched[0], { ref: 'feature/branch', inputs: { owner: request.owner, session: request.session, request: JSON.stringify(request) }, return_run_details: true });
  });

  it('finds its own run by title when a dispatch answers 204 with no run id', async () => {
    const { github, calls } = fakeGitHub(204, [
      { id: 51, display_title: `verify-remote ${request.owner}/iosother11` },
      { id: 52, display_title: `verify-remote ${request.owner}/${request.session}` },
    ]);
    assert.equal(await startRun(github, request, { ref: 'feature/branch' }), '52');
    assert.ok(calls.some((call) => call.includes('event=workflow_dispatch')), 'it lists dispatched runs to find the one titled with its owner and session');
  });

  it('says which queue a run waits in and for how long, once per change', () => {
    const lines: string[] = [];
    const report = waitReporter((line) => lines.push(line.replace(/\d+s/, 'Ns')), '41', { plan: 'paid-small', session: 'paid-mac' });
    const jobs = (...list: [string, string][]): JobView[] => list.map(([name, status]) => ({ name, status, steps: [] }));
    const view = { status: 'queued', conclusion: null, url: '' };
    report(view, []);
    report(view, jobs(['plan', 'queued']));
    report(view, jobs(['plan', 'in_progress']));
    report(view, jobs(['plan', 'completed'], ['session', 'queued']));
    report(view, jobs(['plan', 'completed'], ['session', 'in_progress']));
    assert.deepEqual(lines, [
      'wait    run 41 has waited Ns, now for a paid-small runner to read its request',
      'wait    run 41 has waited Ns, now for its request to be read on paid-small',
      'wait    run 41 has waited Ns, now for a paid-mac runner',
      'wait    run 41 has waited Ns, now for the tunnel on paid-mac',
    ]);
  });

  it('hands out a dispatched run only once GitHub can read it, because the first reads are 404', async () => {
    let reads = 0;
    const github: GitHub = {
      repo: 'clerk/clerk-ios',
      workflow: 'verify-remote.yml',
      tokenSource: 'none',
      api: async (_method, path) => (path.endsWith('/dispatches') ? { status: 200, json: { workflow_run_id: 41 }, headers: new Headers() } : { status: (reads += 1) < 3 ? 404 : 200, json: {}, headers: new Headers() }),
    };
    assert.equal(await startRun(github, request, { ref: 'b', readableWithinMs: 400 }), '41');
    assert.equal(reads, 3);
  });

  it('asks with plain REST and a token from the environment, runs no gh, and hands back a redirect instead of following it to a host a cloud sandbox may not reach', async () => {
    const server = http.createServer((_req, res) => res.writeHead(302, { location: 'https://elsewhere.invalid/artifact.zip' }).end());
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    try {
      const hub = await openGitHub({ repo: 'clerk/clerk-ios', workflow: 'verify-remote.yml', env: { GITHUB_TOKEN: 'x', GITHUB_API_URL: `http://127.0.0.1:${(server.address() as AddressInfo).port}` }, runner: async (command) => assert.fail(`ran ${command}`) });
      assert.equal(hub.tokenSource, 'GITHUB_TOKEN');
      const answer = await hub.api('GET', '/actions/artifacts/1/zip');
      assert.equal(answer.status, 302);
      assert.equal(answer.headers.get('location'), 'https://elsewhere.invalid/artifact.zip');
    } finally {
      server.close();
    }
  });

  it('retries a read that GitHub answers with a 5xx, and never a write', async () => {
    const seen: string[] = [];
    const server = http.createServer((req, res) => {
      seen.push(`${req.method} ${req.url}`);
      res.writeHead(req.method === 'GET' && seen.filter((line) => line.startsWith('GET')).length >= 3 ? 200 : 502, { 'content-type': 'application/json' }).end('{}');
    });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    try {
      const hub = await openGitHub({ repo: 'clerk/clerk-ios', workflow: 'verify-remote.yml', env: { GH_TOKEN: 'x', GITHUB_API_URL: `http://127.0.0.1:${(server.address() as AddressInfo).port}` }, runner: async () => ok(), retryDelayMs: 1 });
      assert.equal((await hub.api('GET', '/actions/runs/1')).status, 200);
      assert.equal(seen.length, 3);
      assert.equal((await hub.api('POST', '/actions/runs/1/cancel')).status, 502);
      assert.equal(seen.length, 4, 'a refused cancel is reported, not sent again');
    } finally {
      server.close();
    }
  });

  it('takes the run a dispatch started although GitHub answered it with a 5xx', async () => {
    const { github, calls } = fakeGitHub(502, [{ id: 61, display_title: `verify-remote ${request.owner}/${request.session}` }]);
    assert.equal(await startRun(github, request, { ref: 'feature/branch' }), '61');
    assert.ok(calls.some((call) => call.includes('event=workflow_dispatch')));
  });

  it('says to run again when a dispatch answered with a 5xx starts no run within a minute', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    const { github } = fakeGitHub(503, []);
    let settled = false;
    const outcome = startRun(github, request, { ref: 'feature/branch' })
      .then(() => assert.fail('it handed out a run'), (error: VerifyFailure) => error)
      .finally(() => (settled = true));
    while (!settled) {
      await new Promise((flushed) => setImmediate(flushed));
      t.mock.timers.tick(3000);
    }
    const failure = await outcome;
    assert.equal(failure.code, 'NOT_READY');
    assert.equal(failure.message, `GitHub answered the dispatch of verify-remote.yml with 503 Resource not accessible by integration, and no run for session ${request.session} appeared in a minute`);
    assert.match(failure.fix, /^run the command again; .*\{cli\} down --stale ends it/);
  });

  it('names the refusal when GitHub refuses the dispatch', async () => {
    const { github } = fakeGitHub(403, []);
    await assert.rejects(startRun(github, request, { ref: 'b' }), (error: VerifyFailure) => error.code === 'NOT_READY' && error.message.includes('403 Resource not accessible by integration') && error.fix.includes('permission to dispatch verify-remote.yml on clerk/clerk-ios'));
  });
});

describe('backend selection', () => {
  const backend = (kind: 'local' | 'remote', usable: boolean, why: string, fix?: string) =>
    ({ kind, platform: 'ios', requirement: `${kind} needs`, availability: () => ({ usable, why, ...(fix === undefined ? {} : { fix }) }) }) as unknown as DeviceBackend;
  const host = (backends: DeviceBackend[]) => ({ repo: 'clerk-ios', backends }) as unknown as HostAdapter;

  it('takes local where the machine can run the device and says why', () => {
    const choice = selectBackend(host([backend('local', true, 'this Mac runs the simulator itself'), backend('remote', true, 'a runner')]), 'ios', undefined, null);
    assert.equal(choice.backend.kind, 'local');
    assert.equal(choice.why, 'this Mac runs the simulator itself');
  });

  it('falls through to remote and names why local is out', () => {
    const choice = selectBackend(host([backend('local', false, 'the iOS simulator needs macOS and this machine runs linux'), backend('remote', true, 'a runner')]), 'ios', undefined, null);
    assert.equal(choice.backend.kind, 'remote');
    assert.equal(choice.why, 'local is out: the iOS simulator needs macOS and this machine runs linux; a runner');
  });

  it('prints what would make an unusable backend usable, and gives it as the fix when that backend is forced', () => {
    const noKvm = backend('local', false, 'no kvm', 'add the udev rule');
    const hosted = host([noKvm, backend('remote', true, 'a runner')]);
    assert.equal(selectBackend(hosted, 'ios', undefined, null).why, 'local is out: no kvm (to run it here: add the udev rule); a runner');
    assert.throws(() => selectBackend(hosted, 'ios', 'local', null), (error: VerifyFailure) => error.code === 'UNSUPPORTED' && error.message === '--backend local cannot run here: no kvm' && error.fix === 'add the udev rule');
    assert.throws(() => selectBackend(host([noKvm]), 'ios', undefined, null), (error: VerifyFailure) => error.message === 'no ios backend runs on this machine (local: no kvm (to run it here: add the udev rule))' && error.fix === 'run on local needs');
  });

  it('lets --backend force either way, and keeps the backend of a held lease', () => {
    const both = host([backend('local', true, 'x'), backend('remote', true, 'y')]);
    assert.equal(selectBackend(both, 'ios', 'remote', null).backend.kind, 'remote');
    assert.equal(selectBackend(both, 'ios', undefined, { backend: 'remote' } as never).backend.kind, 'remote');
    const linux = host([backend('local', false, 'the iOS simulator needs macOS and this machine runs linux'), backend('remote', true, 'y')]);
    assert.throws(() => selectBackend(linux, 'ios', 'local', null), (error: VerifyFailure) => error.code === 'UNSUPPORTED' && error.message.includes('needs macOS'));
    assert.match(selectBackend(both, 'ios', undefined, { backend: 'remote' } as never).why, /already holds a remote lease/);
  });
});
