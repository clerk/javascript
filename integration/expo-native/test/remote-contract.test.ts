import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { composeE2EConfig, engineDevice } from '../specs/support/config.ts';
import { agentDevice } from '../specs/support/device.ts';
import { inputsEnv, readTarget } from '../specs/support/inputs.ts';
import { deviceOf } from '../src/core/devices.ts';
import { chooseEgress } from '../src/core/launch.mjs';
import { usedSecretValues } from '../specs/support/secret.ts';
import type { ApiResponse, GitHub } from '../src/core/remote/github.ts';
import { HANDOFF } from '../src/core/remote/handoff.ts';
import { connectThroughProxy, egressCheck, remoteDoctorChecks } from '../src/core/remote/preflight.ts';
import { RUN_TITLE, STEP } from '../src/core/remote/protocol.ts';
import type { RemoteSettings } from '../src/core/remote/settings.ts';
import type { LocalLease, RemoteLease } from '../src/core/types.ts';
import { IOS_APP, SAMPLE_INPUTS } from '../testing/sample-inputs.ts';

describe('the session workflow and the driver agree', () => {
  const workflow = readFileSync(join(execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: import.meta.dirname, encoding: 'utf8' }).trim(), '.github', 'workflows', 'verify-remote.yml'), 'utf8');
  const names = [...workflow.matchAll(/^\s+- name: (.+)$/gm)].map((m) => m[1]!);
  const evaluated = (template: string, value: string) => template.replace(/\$\{\{[^}]+\}\}/, value);

  it('publishes the tunnel in a step name, which the jobs route returns while the job still runs', () => {
    const tunnel = names.find((name) => name.startsWith('verify-remote tunnel'))!;
    assert.equal(STEP.tunnelPattern.exec(evaluated(tunnel, 'quick-fox.trycloudflare.com'))?.[1], 'quick-fox.trycloudflare.com');
  });

  it('titles runs the way the driver looks for them', () => {
    const request = { owner: '0123456789ab', session: 'iosaaaaaa' };
    assert.match(workflow, /^run-name: verify-remote \$\{\{ inputs\.owner \}\}\/\$\{\{ inputs\.session \}\}$/m);
    assert.deepEqual(RUN_TITLE.exec(`verify-remote ${request.owner}/${request.session}`)?.slice(1), [request.owner, request.session]);
  });

  it('names the job that holds the runner `session`, which is how the driver tells its queue from the plan job\'s', () => {
    assert.match(workflow, /^  session:\n    needs: plan$/m);
  });

  it('lets the plan step ask GitHub whether a requested commit is on the dispatched branch, with the read-only token of the run', () => {
    const planStep = workflow.split(/\n(?= {6}- )/).find((step) => step.includes('session-agent.ts" plan'))!;
    assert.match(planStep, /^ {10}GITHUB_TOKEN: \$\{\{ github\.token \}\}$/m);
    assert.match(workflow, /^permissions:\n {2}contents: read\n\n/m);
  });

  it('lets the session agent ask GitHub the same of every commit it is later asked to build', () => {
    const agentStep = workflow.split(/\n(?= {6}- )/).find((step) => step.includes('session-agent.ts" serve'))!;
    assert.match(agentStep, /^ {10}GITHUB_TOKEN: \$\{\{ github\.token \}\}$/m);
  });

  it('gives the agent the files and variables it waits on', () => {
    for (const needle of ['VERIFY_SESSION_REQUEST', 'VERIFY_SESSION_WORK', 'VERIFY_SESSION_DEVICE_ID', 'VERIFY_SESSION_DEVICE_MODULE', 'VERIFY_SESSION_CLOUDFLARED', '$WORK/tunnel', 'device-ready', '$VERIFY_SESSION_WORK/ended', 'persist-credentials: false']) {
      assert.ok(workflow.includes(needle), needle);
    }
  });

  it('uploads one artifact, the directory that attach filled, and nothing else of the session', () => {
    assert.ok(workflow.includes('$RUNNER_TEMP/verify-remote'), 'the agent works in the directory whose evidence folder is uploaded');
    const uploads = workflow.split(/\n(?= {6}- )/).filter((step) => step.includes('upload-artifact'));
    assert.equal(uploads.length, 1, 'a public artifact is where a sign-in ticket could leak, so the logs and the build of a session are never uploaded');
    const upload = uploads[0]!;
    assert.match(upload, new RegExp(`^ {10}name: ${HANDOFF.artifact}$`, 'm'));
    assert.match(upload, new RegExp(`^ {10}path: \\$\\{\\{ runner\\.temp \\}\\}/verify-remote/${HANDOFF.directory}/$`, 'm'));
    assert.match(upload, /^ {8}if: always\(\)$/m, 'a session that idles out or fails still hands over what attach gave it');
    assert.match(upload, /^ {10}if-no-files-found: ignore$/m);
  });

  it('runs the agent-device the package pins, installed from its lockfile, and no global one', () => {
    assert.ok(workflow.includes('npm ci --prefix "$PACKAGE"'));
    const invocations = workflow.split('\n').map((line) => line.trim()).filter((line) => /agent-device"? (--version|prepare)/.test(line));
    assert.ok(invocations.length > 0);
    for (const line of invocations) assert.ok(line.startsWith('"$PACKAGE/node_modules/.bin/agent-device" '), line);
    assert.doesNotMatch(workflow, /npm (install|i) (-g|--global)/);
  });
});

describe('agent-device calls', () => {
  it('points at the local device with no secret', () => {
    const lease = { backend: 'local', platform: 'ios', deviceId: 'UDID-1' } as LocalLease;
    assert.deepEqual(agentDevice(deviceOf(lease), 'ios'), { selector: ['--platform', 'ios', '--udid', 'UDID-1'], env: {} });
  });

  it('points at a remote daemon and passes the bearer in the environment, registered for redaction', () => {
    const tokenFile = join(mkdtempSync(join(tmpdir(), 'verify-token-')), 'token');
    writeFileSync(tokenFile, 'e'.repeat(64));
    const lease = { backend: 'remote', platform: 'ios', deviceId: 'UDID-2', baseUrl: 'https://x.trycloudflare.com', tokenFile } as RemoteLease;
    const call = agentDevice(deviceOf(lease), 'ios');
    assert.deepEqual(call.selector, ['--platform', 'ios', '--udid', 'UDID-2', '--daemon-base-url', 'https://x.trycloudflare.com/agent-device']);
    assert.deepEqual(call.env, { AGENT_DEVICE_DAEMON_AUTH_TOKEN: 'e'.repeat(64) });
    assert.ok(usedSecretValues().includes('e'.repeat(64)));
  });
});

describe('a borrowed device as the tests are told of it', () => {
  const tokenFile = join(mkdtempSync(join(tmpdir(), 'verify-token-')), 'token');
  writeFileSync(tokenFile, `${'f'.repeat(64)}\n`);
  const lease = { backend: 'remote', platform: 'ios', deviceId: 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE', baseUrl: 'https://x.trycloudflare.com', tokenFile } as RemoteLease;
  const target = { platform: 'ios' as const, device: deviceOf(lease), session: 'verify-ios-abc', build: { path: null, devServer: null } };

  it('is its id, the address of its daemon, and the file that holds the daemon token, and reads back the same', () => {
    assert.deepEqual(target.device, { kind: 'borrowed', id: 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE', daemonUrl: 'https://x.trycloudflare.com/agent-device', tokenFile });
    const env = inputsEnv({ ...SAMPLE_INPUTS, target });
    assert.deepEqual([env.CLERK_E2E_DEVICE_DAEMON_URL, env.CLERK_E2E_DEVICE_DAEMON_TOKEN_FILE], ['https://x.trycloudflare.com/agent-device', tokenFile]);
    assert.equal(JSON.stringify(env).includes('f'.repeat(64)), false, 'the token itself is not in the environment the CLI writes');
    assert.deepEqual(readTarget(IOS_APP, env), target);
  });

  it('needs the token file with the daemon address, and an address that is one', () => {
    const env = inputsEnv({ ...SAMPLE_INPUTS, target });
    assert.throws(() => readTarget(IOS_APP, { ...env, CLERK_E2E_DEVICE_DAEMON_TOKEN_FILE: undefined }), /CLERK_E2E_DEVICE_DAEMON_TOKEN_FILE is not/);
    assert.throws(() => readTarget(IOS_APP, { ...env, CLERK_E2E_DEVICE_DAEMON_URL: 'x.trycloudflare.com' }), /is not the http or https address of an agent-device daemon/);
  });

  it('reaches e2e as a device that is already there, with the daemon token read from its file when e2e asks', async () => {
    const config = composeE2EConfig(IOS_APP, target, {});
    assert.equal(JSON.stringify(config).includes('f'.repeat(64)), false, 'the token is not in the composed config');
    const provider = engineDevice(target.device);
    assert.ok(!Array.isArray(provider) && 'acquire' in provider);
    assert.deepEqual(await provider.acquire({} as unknown as Parameters<typeof provider.acquire>[0]), {
      id: 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE',
      deviceId: 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE',
      device: 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE',
      daemon: { baseUrl: 'https://x.trycloudflare.com/agent-device', authToken: 'f'.repeat(64) },
    });
    assert.ok(usedSecretValues().includes('f'.repeat(64)));
  });
});

describe('choosing between a direct connection and HTTPS_PROXY', () => {
  it('happens in plain JavaScript that imports only Node built-ins, so a Node too old to load TypeScript can still run it and hand over to Node 24', () => {
    const source = readFileSync(join(import.meta.dirname, '..', 'src', 'core', 'launch.mjs'), 'utf8');
    const imported = [...source.matchAll(/\bfrom\s+'([^']+)'/g)].map((match) => match[1]!);
    assert.ok(imported.length > 0);
    assert.deepEqual(imported.filter((specifier) => !specifier.startsWith('node:')), []);
    assert.doesNotMatch(source, /\bimport\s*\(/);
  });

  it('keeps a Mac with a debugging proxy exported on its direct connection', () => {
    assert.equal(chooseEgress({ proxyListens: true, directConnects: true, tokenStatusDirect: null }).proxy, false);
    assert.equal(chooseEgress({ proxyListens: true, directConnects: true, tokenStatusDirect: 200 }).proxy, false);
    assert.equal(chooseEgress({ proxyListens: false, directConnects: true, tokenStatusDirect: null }).proxy, false);
  });

  it('uses the proxy in a sandbox whose token only works through it, although a direct connection opens', () => {
    const choice = chooseEgress({ proxyListens: true, directConnects: true, tokenStatusDirect: 401 });
    assert.equal(choice.proxy, true);
    assert.match(choice.why, /rejects this machine's token on a direct connection/);
  });

  it('uses the proxy when it is the only way out', () => {
    assert.equal(chooseEgress({ proxyListens: true, directConnects: false, tokenStatusDirect: null }).proxy, true);
    assert.equal(chooseEgress({ proxyListens: true, directConnects: true, tokenStatusDirect: 0 }).proxy, true);
  });
});

describe('egress checks', () => {
  async function proxyAnswering(line: string): Promise<{ url: URL; close: () => void }> {
    const server = net.createServer((socket) => socket.once('data', () => socket.end(`${line}\r\n\r\n`)));
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    return { url: new URL(`http://127.0.0.1:${(server.address() as net.AddressInfo).port}`), close: () => server.close() };
  }

  it('reports a refused CONNECT as blocked, with the proxy status line and the fix', async () => {
    const proxy = await proxyAnswering('HTTP/1.1 403 Forbidden');
    try {
      assert.deepEqual(await connectThroughProxy(proxy.url, 'x.trycloudflare.com'), { status: 403, line: 'HTTP/1.1 403 Forbidden' });
      const check = await egressCheck('tunnel-egress', 'x.trycloudflare.com', { HTTPS_PROXY: proxy.url.href, NODE_USE_ENV_PROXY: '1' }, 'allow the host');
      assert.equal(check.ok, false);
      assert.match(check.detail, /^blocked: the proxy at 127\.0\.0\.1:\d+ answered the CONNECT to x\.trycloudflare\.com with "HTTP\/1\.1 403 Forbidden"$/);
      assert.equal(check.fix, 'allow the host');
    } finally {
      proxy.close();
    }
  });

  it('sends the credentials of the proxy URL with the CONNECT, percent-decoded, and sends none when the URL has no password, as Node does', async () => {
    const heads: string[] = [];
    const expected = `Proxy-Authorization: Basic ${Buffer.from('us@er:p:ss').toString('base64')}`;
    const server = net.createServer((socket) =>
      socket.once('data', (head: Buffer) => {
        heads.push(head.toString('latin1'));
        socket.end(`HTTP/1.1 ${heads.at(-1)!.split('\r\n').includes(expected) ? '200 Connection established' : '407 Proxy Authentication Required'}\r\n\r\n`);
      }),
    );
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const at = `127.0.0.1:${(server.address() as net.AddressInfo).port}`;
    try {
      assert.deepEqual(await connectThroughProxy(new URL(`http://us%40er:p%3Ass@${at}`), 'x.trycloudflare.com'), { status: 200, line: 'HTTP/1.1 200 Connection established' });
      assert.equal((await connectThroughProxy(new URL(`http://${at}`), 'x.trycloudflare.com')).status, 407);
      assert.equal(heads[1], 'CONNECT x.trycloudflare.com:443 HTTP/1.1\r\nHost: x.trycloudflare.com:443\r\n\r\n');
      await connectThroughProxy(new URL(`http://useronly@${at}`), 'x.trycloudflare.com');
      assert.equal(heads[2], heads[1]);
    } finally {
      server.close();
    }
  });

  it('counts only an answer with Cloudflare headers as reached, because a sandbox can answer in the host\'s place', async () => {
    const answering = (status: number, headers: Record<string, string>) => (async () => new Response('', { status, headers })) as typeof fetch;
    const reached = await egressCheck('clerk-egress', 'api.clerk.com', {}, 'allow the host', answering(404, { server: 'cloudflare', 'cf-ray': 'abc' }));
    assert.deepEqual(reached, { id: 'clerk-egress', ok: true, detail: 'reached api.clerk.com: HTTP 404 from cloudflare' });
    const intercepted = await egressCheck('clerk-egress', 'api.clerk.com', {}, 'allow the host', answering(403, {}));
    assert.equal(intercepted.ok, false);
    assert.match(intercepted.detail, /^blocked: api\.clerk\.com answered HTTP 403 without Cloudflare's headers/);
    assert.equal(intercepted.fix, 'allow the host');
  });

  it('says so when the proxy itself is unreachable', async () => {
    assert.equal((await connectThroughProxy(new URL('http://127.0.0.1:9'), 'x.trycloudflare.com')).status, 0);
  });
});

describe('doctor for the remote backend', () => {
  const settings = (): RemoteSettings => ({ platform: 'ios', repo: 'clerk/clerk-ios', workflow: 'verify-remote.yml', sessionsDir: join(mkdtempSync(join(tmpdir(), 'verify-doctor-')), 'remote'), runner: 'paid-mac', plumbingRunner: 'ubuntu-latest', device: 'iPhone Air', idleMinutes: 15, capMinutes: 60, requirement: '' });
  const answer = (status: number, json: unknown = {}, firstRefusalWithToken?: string): ApiResponse => ({ status, json, headers: new Headers(), ...(firstRefusalWithToken === undefined ? {} : { firstRefusalWithToken }) });
  const offline = { HTTPS_PROXY: 'http://127.0.0.1:9', NODE_USE_ENV_PROXY: '1' };
  const git = (pushFails: boolean) => async (command: string, args: readonly string[]) => {
    if (command === 'git' && args[0] === 'push' && pushFails) {
      return { code: 128, stdout: '', stderr: "remote: the app has no access to this repository\nfatal: unable to access 'https://github.com/clerk/clerk-ios/': The requested URL returned error: 403\n" };
    }
    return { code: 0, stdout: args.includes('--abbrev-ref') ? 'my-branch\n' : 'f'.repeat(40), stderr: '' };
  };

  it('prints every check even when GitHub refuses everything, and says what each skipped check needed', async () => {
    const github: GitHub = { repo: 'clerk/clerk-ios', workflow: 'verify-remote.yml', tokenSource: 'GH_TOKEN', api: async () => answer(401, { message: 'Bad credentials' }) };
    const { device } = await remoteDoctorChecks(settings(), { env: offline, runner: git(true) }, async () => github, { live: true, worktree: '/w', progress: () => undefined });
    const byId = Object.fromEntries(device.map((c) => [c.id, c]));
    for (const id of ['git-fetch', 'git-push', 'github-rest', 'remote-commit', 'tunnel-egress', 'clerk-egress', 'live-session', 'live-sim-health', 'live-daemon-health', 'live-device', 'live-stop']) {
      assert.ok(byId[id] !== undefined, `${id} is printed`);
    }
    assert.match(byId['git-push']!.detail, /the app has no access to this repository \| fatal: unable to access .* 403/);
    assert.match(byId['git-push']!.fix!, /A 403 on git push means this machine's GitHub credential may not push to the repository/);
    assert.equal(byId['github-rest']!.ok, false);
    assert.equal(byId['live-session']!.detail, 'not run: needs github-rest');
    assert.equal(byId['live-stop']!.detail, 'not run: needs github-rest');
    assert.equal(byId['live-stop']!.state, 'not-run');
  });

  it('with --live, prints live-device as not run when the session never starts, with or without --runner', async () => {
    const neverStarts = (): GitHub => ({
      repo: 'clerk/clerk-ios',
      workflow: 'verify-remote.yml',
      tokenSource: 'gh',
      api: async (method) => (method === 'POST' ? answer(401, { message: 'Bad credentials' }) : answer(200, { workflow_runs: [] })),
    });
    const live = async (runner?: string) => {
      const { device } = await remoteDoctorChecks(settings(), { env: offline, runner: git(true) }, async () => neverStarts(), { live: true, ...(runner === undefined ? {} : { runner }), worktree: '/w', progress: () => undefined });
      return Object.fromEntries(device.map((c) => [c.id, c]));
    };
    const plain = await live();
    assert.equal(plain['live-session']!.ok, false);
    assert.equal(plain['live-device']!.detail, 'not run: this session boots no device; --runner <label> names a runner that has one');
    assert.equal(plain['live-stop']!.detail, 'not run: needs live-session');
    assert.equal((await live('some-mac'))['live-device']!.detail, 'not run: needs live-session');
  });

  it('without --live reads only: starts no run, writes nothing, and says what --live would prove', async () => {
    const calls: string[] = [];
    const github: GitHub = { repo: 'clerk/clerk-ios', workflow: 'verify-remote.yml', tokenSource: 'gh', api: async (method, path) => (calls.push(`${method} ${path}`), answer(200, { workflow_runs: [] })) };
    const reads = git(false);
    const runner: typeof reads = (command, args) => (calls.push(`${command} ${args.join(' ')}`), reads(command, args));
    const progress: string[] = [];
    const s = settings();
    const { device } = await remoteDoctorChecks(s, { env: offline, runner }, async () => github, { live: false, worktree: '/w', progress: (line) => void progress.push(line) });
    assert.deepEqual(calls.filter((call) => call.startsWith('POST') || (call.startsWith('git push') && !call.includes('--dry-run'))), []);
    assert.equal(existsSync(s.sessionsDir), false, 'no owner id is made for a doctor that starts nothing');
    const unrun = ['live-session', 'live-sim-health', 'live-daemon-health', 'live-device', 'live-stop'];
    assert.deepEqual(device.filter((c) => c.state === 'not-run').map((c) => c.id), unrun);
    for (const c of device.filter((c) => unrun.includes(c.id))) assert.deepEqual([c.ok, c.detail], [true, 'not run: doctor starts no workflow run without --live'], c.id);
    assert.equal(device.find((c) => c.id === 'remote-commit')!.ok, true);
    assert.deepEqual(progress, ['doctor  git and REST reads only: nothing was started; rerun with --live to start one short session, which proves the rest']);
  });

  it('keeps reading a public repository when the token is refused, and says the token is the problem', async () => {
    const github: GitHub = {
      repo: 'clerk/clerk-ios',
      workflow: 'verify-remote.yml',
      tokenSource: 'GH_TOKEN',
      api: async (method, path) => (method === 'POST' ? answer(401, { message: 'Bad credentials' }) : path.includes('/workflows/') ? answer(200, { workflow_runs: [] }) : answer(200, {}, '401 Bad credentials')),
    };
    const { device } = await remoteDoctorChecks(settings(), { env: offline, runner: git(true) }, async () => github, { live: true, worktree: '/w', progress: () => undefined });
    const byId = Object.fromEntries(device.map((c) => [c.id, c]));
    assert.equal(byId['github-rest']!.ok, true);
    assert.match(byId['github-rest']!.detail, /repository 200 without the token \(with it: 401 Bad credentials\).*GitHub refuses this machine's token/);
    assert.equal(byId['remote-commit']!.ok, true);
    assert.equal(byId['live-session']!.ok, false);
    assert.match(byId['live-session']!.detail, /GitHub refused the dispatch of verify-remote\.yml \(401 Bad credentials\)/);
    assert.match(byId['live-session']!.fix!, /the sandbox's GitHub integration/);
  });

  it('with --live, starts no session for a HEAD that GitHub does not have', async () => {
    const calls: string[] = [];
    const github: GitHub = { repo: 'clerk/clerk-ios', workflow: 'verify-remote.yml', tokenSource: 'gh', api: async (method, path) => (calls.push(`${method} ${path}`), path.startsWith('/commits/') ? answer(422) : answer(200, { workflow_runs: [] })) };
    const { device } = await remoteDoctorChecks(settings(), { env: offline, runner: git(false) }, async () => github, { live: true, worktree: '/w', progress: () => undefined });
    assert.equal(device.find((c) => c.id === 'live-session')!.detail, 'not run: needs remote-commit');
    assert.equal(calls.some((call) => call.startsWith('POST')), false);
  });
});

