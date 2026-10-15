import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { exitCodeFor } from '../src/core/cli.ts';
import { assertPublishable, readRecord } from '../src/core/evidence.ts';
import type { Runner } from '../src/core/exec.ts';
import { createInstances } from '../src/core/instances/instances.ts';
import { SettingsRefused, settingsFileOf } from '../src/core/instances/settings.ts';
import { summarize } from '../src/core/publish.ts';
import { attach, runVerb, type Deps } from '../src/core/verbs.ts';
import { openWorkspace } from '../src/core/workspace.ts';
import { VerifyFailure, type BuildKey, type BuiltApp, type Command, type DeviceBackend, type EvidencePath, type HostAdapter, type InstanceSettings, type LocalLease, type RemoteLease, type ScratchPath } from '../src/core/types.ts';
import { PLATFORM_KEY, fakeClerk, type FakeClerkOptions } from '../testing/fake-clerk.ts';
import { LEFT_OUT, linesLeftOut, watchDriver } from '../src/core/driver.ts';
import { readAgent } from '../specs/support/agent.ts';

const MFA: InstanceSettings = { config: { auth_multi_factor: { required_for_sign_up: true } }, environment: { 'user_settings.sign_up.mfa.required': true } };
const FORCED_ORG: InstanceSettings = { config: { organization_settings: { force_organization_selection: true } }, environment: { 'organization_settings.force_organization_selection': true } };
const MFA_LABEL = 'auth_multi_factor.required_for_sign_up=true';
const ORG_LABEL = 'organization_settings.force_organization_selection=true';
const AUTH_START = 'specs/features/auth-start/auth-start.e2e.ts';
const CHOOSE_ORG = 'specs/features/session-tasks/choose-organization.e2e.ts';
const COMPLETE_MFA = 'specs/features/session-tasks/complete-setup-mfa.e2e.ts';
const SETUP_MFA = 'specs/features/session-tasks/setup-mfa.e2e.ts';
const SIGN_UP = 'specs/features/sign-up/complete.e2e.ts';
const COMMITTED: Readonly<Record<string, InstanceSettings | null>> = { [AUTH_START]: null, [CHOOSE_ORG]: FORCED_ORG, [COMPLETE_MFA]: MFA, [SETUP_MFA]: MFA, [SIGN_UP]: null };

const FAKE_E2E = `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const output = args[args.indexOf('--output') + 1];
const specs = args.slice(1, args.indexOf('--config'));
const plan = JSON.parse(fs.readFileSync('fake-e2e.json', 'utf8'));
fs.appendFileSync('invocations.jsonl', JSON.stringify({ specs, output, args }) + '\\n');
fs.appendFileSync('order.log', 'e2e opens the app with no arguments\\n');
(async () => {
  const token = fs.readFileSync(process.env.CLERK_E2E_API_TOKEN_FILE, 'utf8');
  const [, runTime, runTag] = process.env.CLERK_E2E_RUN_ID.split('-');
  const emailOf = () => runTime + runTag + require('node:crypto').randomBytes(2).toString('hex') + '+clerk_test@example.com';
  const stateDir = process.env.AGENT_DEVICE_STATE_DIR;
  const driver = plan.driver;
  if (driver) {
    const registration = path.join(stateDir, 'daemon.json');
    const bootFails = (why) => {
      console.log('boot failed: ' + why);
      process.exitCode = 3;
    };
    if (driver.refusesALeftoverRegistration && fs.existsSync(registration)) return bootFails('Daemon replacement could not be confirmed.');
    if ((driver.daemonFailsToStartIn || []).includes(path.basename(output))) {
      fs.mkdirSync(stateDir, { recursive: true });
      fs.writeFileSync(registration, JSON.stringify({ pid: 2147483645, version: '0.21.22' }));
      fs.writeFileSync(path.join(stateDir, 'daemon.log'), 'AGENT_DEVICE_DAEMON_PORT=51000\\nDaemon error: the daemon started for ' + path.basename(output) + ' gave up\\n');
      return bootFails('Failed to start daemon');
    }
    if (driver.rewrites) for (const file of driver.rewrites) fs.writeFileSync(path.join(stateDir, file), '');
    if (driver.writes) {
      const ask = (route, body) => fetch(process.env.CLERK_E2E_API_URL + route, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify(body) }).then((answer) => answer.json());
      const seededPassword = require('node:crypto').randomBytes(12).toString('hex') + 'Aa1!';
      const user = await ask('/users', { email_address: [emailOf()], password: seededPassword, bypass_client_trust: true });
      const ticket = (await ask('/sign_in_tokens', { user_id: user.id, expires_in_seconds: 60 })).token;
      const part = (claims) => Buffer.from(JSON.stringify(claims)).toString('base64url');
      const sessionToken = [part({ alg: 'RS256', typ: 'JWT' }), part({ sid: 'sess_fake', sub: user.id }), require('node:crypto').randomBytes(32).toString('base64url')].join('.');
      const secrets = { ...driver.known, standInToken: token, seededPassword, ticket, sessionToken, runPassword: 'Verify-' + process.env.CLERK_E2E_RUN_ID + '-Pw1!' };
      fs.writeFileSync('secrets-the-driver-saw.json', JSON.stringify(secrets));
      const named = (line) => Object.entries(secrets).reduce((text, [name, value]) => text.split('{' + name + '}').join(value), line);
      const expanded = (line) => {
        const spelled = /\\{(each|pieces) (\\w+)\\}/.exec(line);
        if (spelled === null) return [named(line)];
        const value = secrets[spelled[2]];
        const shown = spelled[1] === 'each' ? [...value] : value.match(/.{1,16}/g);
        return shown.map((some) => named(line.replace(spelled[0], some)));
      };
      for (const [file, lines] of Object.entries(driver.writes)) {
        const target = file.startsWith('RUN/') ? path.join(path.dirname(output), file.slice(4)) : path.join(stateDir, file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.appendFileSync(target, lines.flatMap(expanded).join('\\n') + '\\n');
      }
    }
  }
  const results = [];
  for (const [index, file] of specs.entries()) {
    console.log('fake e2e runs ' + file);
    if ((plan.silent || []).includes(file)) continue;
    let launchRefused = null;
    if (plan.launches) {
      const ready = await fetch(process.env.CLERK_E2E_API_URL + '/about_to_launch', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
      launchRefused = ready.ok ? null : (await ready.json()).errors[0].long_message;
      fs.appendFileSync('order.log', (launchRefused === null ? 'launches for ' : 'does not launch for ') + path.basename(file) + '\\n');
      const marks = process.env.CLERK_E2E_EVIDENCE_MARKS;
      if (marks !== undefined) {
        const at = Date.now();
        fs.appendFileSync(marks, JSON.stringify({ label: 'shows ' + path.basename(file), startedAt: at, endedAt: at + 1500, passed: true }) + '\\n');
        fs.appendFileSync('order.log', 'marks the evidence of ' + path.basename(file) + '\\n');
      }
    }
    if (plan.retriesTheOpen) {
      const again = await fetch(process.env.CLERK_E2E_API_URL + '/about_to_launch', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
      fs.appendFileSync('order.log', 'retries the open for ' + path.basename(file) + ', answered ' + again.status + ' ' + (await again.text()) + '\\n');
    }
    const password = require('node:crypto').randomBytes(12).toString('hex') + 'Aa1!';
    const seeded = await fetch(process.env.CLERK_E2E_API_URL + '/users', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify({ email_address: [emailOf()], ...(plan.password === true ? { password, bypass_client_trust: true } : { skip_password_requirement: true }) }) });
    const body = await seeded.json();
    if (plan.password) {
      fs.writeFileSync('password-the-spec-got', password);
      console.log('the spec typed ' + password);
      fs.mkdirSync(output, { recursive: true });
      fs.writeFileSync(path.join(output, 'trace.txt'), 'fill ' + password);
      body.message = 'the field shows ' + password;
    }
    const passed = seeded.ok && !plan.password && launchRefused === null;
    if (launchRefused !== null) body.message = launchRefused;
    const shot = 'ios/' + index + '/attempt-0/screenshots/001-home.png';
    fs.mkdirSync(path.dirname(path.join(output, 'artifacts', shot)), { recursive: true });
    fs.writeFileSync(path.join(output, 'artifacts', shot), path.basename(output));
    results.push({
      id: path.basename(output) + '-' + index + '-0000', kind: 'test', titlePath: ['a test of ' + path.basename(file)], file, platform: 'ios', tags: [],
      status: passed ? 'passed' : 'failed',
      attempts: [{ status: passed ? 'passed' : 'failed', durationMs: 1000, ...(passed ? {} : { error: { message: body.message } }), artifacts: [{ kind: 'screenshot', path: shot, producer: { kind: 'step', stepId: 's1' } }], steps: [{ id: 's1', api: 'app.screenshot', label: 'home' }] }],
    });
  }
  if (plan.edit && output.endsWith('/e2e')) fs.appendFileSync(plan.edit, '\\n// edited while the run was in progress\\n');
  if (!(plan.noReport || []).includes(path.basename(output))) {
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ schemaVersion: 'report-1', run: { results } }));
  }
  process.exitCode = plan.exitCode || 0;
})();
`;

interface FakeE2EPlan {
  readonly silent?: readonly string[];
  readonly noReport?: readonly string[];
  readonly edit?: string;
  readonly exitCode?: number;
  readonly password?: boolean;
  readonly launches?: boolean;
  readonly retriesTheOpen?: boolean;
  readonly driver?: {
    readonly refusesALeftoverRegistration?: boolean;
    readonly daemonFailsToStartIn?: readonly string[];
    readonly rewrites?: readonly string[];
    readonly known?: Readonly<Record<string, string>>;
    readonly writes?: Readonly<Record<string, readonly string[]>>;
  };
}

const SPEC_SOURCE = "import { test } from '../../fixtures.ts';\n\ntest('x', async ({ host }) => {\n  await host.seedUser();\n});\n";
const settingsText = (declared: InstanceSettings): string => `${JSON.stringify(declared, null, 2)}\n`;

const SESSION_COMMIT = 'a'.repeat(40);

function world(options: { readonly specs?: Readonly<Record<string, InstanceSettings | null>>; readonly plan?: FakeE2EPlan; readonly env?: Record<string, string>; readonly clerk?: FakeClerkOptions; readonly logs?: () => Promise<string>; readonly session?: { readonly patch: string | null } } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'verify-run-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  writeFileSync(join(dir, 'app.swift'), 'app');
  for (const [path, declared] of Object.entries(options.specs ?? COMMITTED)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), SPEC_SOURCE);
    if (declared !== null) writeFileSync(join(dir, settingsFileOf(path)), settingsText(declared));
  }
  mkdirSync(join(dir, 'node_modules', '.bin'), { recursive: true });
  writeFileSync(join(dir, 'node_modules', '.bin', 'e2e'), FAKE_E2E);
  chmodSync(join(dir, 'node_modules', '.bin', 'e2e'), 0o755);
  writeFileSync(join(dir, 'fake-e2e.json'), JSON.stringify(options.plan ?? {}));

  const clerk = fakeClerk(options.clerk);
  const frontendApi = { answers: null as number | null };
  const request = (async (input: string | URL, init?: RequestInit) => (frontendApi.answers !== null && String(input).endsWith('/v1/environment') ? new Response('', { status: frontendApi.answers }) : clerk.fetch(input, init))) as typeof fetch;
  const lines: string[] = [];
  const hooks: ((line: string) => void)[] = [];
  const progress = (line: string) => {
    lines.push(line);
    for (const hook of hooks) hook(line);
  };
  let leases = 0;
  const backend = {
    kind: 'local',
    platform: 'ios',
    availability: () => ({ usable: true, why: 'test' }),
    reapable: async () => [],
    check: async () => 'held',
    async acquire(): Promise<LocalLease> {
      leases += 1;
      lines.push('device leased');
      return { backend: 'local', platform: 'ios', slot: leases, deviceName: `verify-ios-${leases}`, deviceId: `UDID-${leases}`, claimNonce: `c${leases}`, acquiredAt: '', installedBuild: null };
    },
    install: async (lease: LocalLease) => lease,
    release: async () => undefined,
    logs: options.logs ?? (async () => ''),
    describe: (lease: LocalLease) => lease.deviceName,
  } as unknown as DeviceBackend;
  const patch = options.session?.patch ?? null;
  const session = {
    kind: 'remote',
    platform: 'ios',
    availability: () => ({ usable: true, why: 'test' }),
    reapable: async () => [],
    check: async () => 'held',
    sourceCommit: async () => ({ sha: SESSION_COMMIT, patch: patch === null ? null : { sha256: patch, bytes: Buffer.from('uncommitted') } }),
    acquire: async (): Promise<RemoteLease> => ({ backend: 'remote', provider: 'github-actions', platform: 'ios', session: 'ios0000aa', providerRef: '1', baseUrl: 'https://quick-fox.trycloudflare.com', tokenFile: join(dir, 'token'), deviceId: 'UDID-1', deviceName: 'iPhone Air', runner: 'xcode-27', expiresAt: '2099-01-01T00:00:00Z', builtSha: null, builtPatch: null, acquiredAt: '', installedBuild: null }),
    install: async (lease: RemoteLease, app: BuiltApp) => ({ ...lease, builtSha: app.source === 'local' ? null : app.sourceSha, builtPatch: app.source === 'local' ? null : (app.patch?.sha256 ?? null) }),
    release: async () => undefined,
    logs: async () => '',
    describe: (lease: RemoteLease) => lease.deviceName,
  } as unknown as DeviceBackend;
  const host = {
    repo: 'clerk-ios',
    platforms: ['ios'],
    backends: [options.session === undefined ? backend : session],
    appId: () => 'com.clerk.E2EHost',
    buildInputs: () => ['app.swift'],
    async build(platform: 'ios', key: BuildKey, into: ScratchPath) {
      mkdirSync(into, { recursive: true });
      writeFileSync(join(into, 'E2EHost.app'), '');
      return { platform, key, appId: 'com.clerk.E2EHost', path: join(into, 'E2EHost.app') as ScratchPath, source: 'local' };
    },
  } as unknown as HostAdapter;
  const workspace = openWorkspace({ packageDir: dir, worktree: dir, home: join(dir, 'home') });
  const env = options.env ?? { CLERK_PLATFORM_API_KEY: PLATFORM_KEY };
  const deps = (instanceEnv: Record<string, string> = env): Deps => ({
    host,
    workspace,
    runner: async () => ({ code: 0, stdout: '', stderr: '' }),
    env: {},
    progress,
    instances: createInstances({ workspace, env: instanceEnv, runner: async () => ({ code: 127, stdout: '', stderr: '' }), progress, fetch: request }),
    fetch: request,
  });
  const invocations = () => readFileSync(join(dir, 'invocations.jsonl'), 'utf8').trim().split('\n').map((line) => JSON.parse(line) as { specs: string[]; output: string; args: string[] });
  const lastRecord = () => readRecord(workspace.runDir(workspace.runs().at(-1)!));
  const writes = () => clerk.platformRequests().filter((request) => request.method !== 'GET').map((request) => `${request.method} ${request.url.replace('api.clerk.com/v1/platform', '').replace(/\/app_\w+\/instances\/ins_\w+/, '/{app}')}`);
  return { dir, clerk, frontendApi, workspace, lines, hooks, deps, invocations, lastRecord, writes };
}

const RUN_ALL: Extract<Command, { verb: 'run' }> = { verb: 'run', selection: { all: true }, video: false, retries: 0, githubReport: false, waitSeconds: 0 };
const statuses = (results: readonly { readonly spec: { readonly path: string }; readonly title: string; readonly status: string }[]) => results.map((result) => `${result.status} ${result.spec.path.split('/').at(-1)}${result.title === 'not run' ? ' (not run)' : ''}`);

describe('a run whose spec files declare different settings', () => {
  it('reports to GitHub only when the command asks for it', async () => {
    const actions = process.env.GITHUB_ACTIONS;
    delete process.env.GITHUB_ACTIONS;
    try {
      const w = world();
      await runVerb(w.deps(), RUN_ALL);
      assert.deepEqual(w.lines.filter((line) => line.startsWith('github')), []);
      await runVerb(w.deps(), { ...RUN_ALL, githubReport: true });
      assert.deepEqual(w.lines.filter((line) => line.startsWith('github')), ['github    not posted: not running on GitHub Actions']);
    } finally {
      if (actions !== undefined) process.env.GITHUB_ACTIONS = actions;
    }
  });

  describe('with video', () => {
    function recorded(plan: FakeE2EPlan, specs: Readonly<Record<string, InstanceSettings | null>> = { [AUTH_START]: null }) {
      const w = world({ specs, plan });
      const note = (line: string) => appendFileSync(join(w.dir, 'order.log'), `${line}\n`);
      const deps = w.deps();
      const backend = deps.host.backends[0] as { startRecording: DeviceBackend['startRecording'] };
      backend.startRecording = async (_lease, into) => {
        note('recorder starts');
        return { process: null, stop: async () => (writeFileSync(join(into, 'video.mp4'), 'frames'), join(into, 'video.mp4') as EvidencePath) };
      };
      const runner: Runner = async (command, args) => {
        if (command === join(w.dir, 'node_modules', '.bin', 'agent-device')) note(`agent-device ${args.join(' ')}`);
        return { code: 0, stdout: '', stderr: '' };
      };
      const close = `agent-device close com.clerk.E2EHost --platform ios --udid UDID-1 --session verify-ios-${w.workspace.worktreeId}`;
      const order = () => readFileSync(join(w.dir, 'order.log'), 'utf8').trim().split('\n');
      const videoLines = () => w.lines.filter((line) => line.startsWith('video'));
      return { w, deps: { ...deps, runner }, backend, close, order, videoLines };
    }

    it('records from the first time a test launches the app, after it closes the app that e2e opened, and once for all the groups of the run', async () => {
      const r = recorded({ launches: true }, { [AUTH_START]: null, [CHOOSE_ORG]: FORCED_ORG });
      const { record, dir } = await runVerb(r.deps, { ...RUN_ALL, video: true });
      assert.deepEqual(r.order(), [
        'e2e opens the app with no arguments',
        r.close,
        'recorder starts',
        'launches for auth-start.e2e.ts',
        'e2e opens the app with no arguments',
        'launches for choose-organization.e2e.ts',
      ]);
      assert.deepEqual(record.videos, [join(dir, 'video.mp4')]);
      assert.deepEqual(r.videoLines(), []);
    });

    it('keeps the one recording when a test opens the app a second time after a failed open: it closes nothing and starts no second recorder', async () => {
      const r = recorded({ launches: true, retriesTheOpen: true });
      const { record, dir } = await runVerb(r.deps, { ...RUN_ALL, video: true });
      assert.deepEqual(r.order(), ['e2e opens the app with no arguments', r.close, 'recorder starts', 'launches for auth-start.e2e.ts', 'retries the open for auth-start.e2e.ts, answered 200 {}']);
      assert.deepEqual(record.videos, [join(dir, 'video.mp4')]);
      assert.deepEqual(r.videoLines(), []);
    });

    it('records nothing and says so in one line when no test launches the app', async () => {
      const r = recorded({});
      const { record } = await runVerb(r.deps, { ...RUN_ALL, video: true });
      assert.deepEqual(r.order(), ['e2e opens the app with no arguments']);
      assert.deepEqual(record.videos, []);
      assert.deepEqual(r.videoLines(), ['video   no test launched the app, so this run has no video']);
    });

    it('lets the app launch at once, as it was left, in a run with --no-video', async () => {
      const r = recorded({ launches: true });
      const { record } = await runVerb(r.deps, RUN_ALL);
      assert.deepEqual(r.order(), ['e2e opens the app with no arguments', 'launches for auth-start.e2e.ts']);
      assert.deepEqual(record.videos, []);
      assert.deepEqual(r.videoLines(), []);
    });

    it('records all the same when the app could not be closed, and says what the video may open on', async () => {
      const r = recorded({ launches: true });
      const refusing: Runner = async (command, args) => (command.endsWith('agent-device') ? { code: 1, stdout: '', stderr: 'DEVICE_IN_USE\n' } : r.deps.runner(command, args));
      await runVerb({ ...r.deps, runner: refusing }, { ...RUN_ALL, video: true });
      assert.deepEqual(r.order(), ['e2e opens the app with no arguments', 'recorder starts', 'launches for auth-start.e2e.ts']);
      assert.deepEqual(r.videoLines(), ['video   the app could not be closed before the recording, so the video may open on the screen it was showing: DEVICE_IN_USE']);
    });

    it('paces a run that names its specs and records a video, and keeps what host.evidence marked in seconds of that video', async () => {
      const r = recorded({ launches: true });
      const { record, next } = await runVerb(r.deps, { ...RUN_ALL, selection: { selectors: ['auth-start'] }, video: true });
      assert.deepEqual(r.order(), ['e2e opens the app with no arguments', r.close, 'recorder starts', 'launches for auth-start.e2e.ts', 'marks the evidence of auth-start.e2e.ts']);
      assert.deepEqual(r.videoLines(), ['video   paced for a reviewer to follow; a run with --no-video, or with --all, keeps full speed']);
      const [span, ...others] = record.evidenceSpans ?? [];
      assert.deepEqual(others, []);
      assert.equal(span?.label, 'shows auth-start.e2e.ts');
      assert.ok(span !== undefined && span.from >= 0 && span.from < 5 && Math.abs(span.to - span.from - 1.5) < 0.01, JSON.stringify(span));
      assert.equal(next, `{cli} attach ${record.run} --pr <n> --video, and add --before <run-id> when the change is to something that exists`);
    });

    it('keeps full speed and marks nothing in a run of --all, as the nightly suite runs, or with --no-video', async () => {
      for (const command of [{ ...RUN_ALL, video: true }, { ...RUN_ALL, selection: { selectors: ['auth-start'] } }]) {
        const r = recorded({ launches: true });
        const { record, next } = await runVerb(r.deps, command);
        assert.equal(r.order().some((line) => line.startsWith('marks')), false);
        assert.deepEqual(r.videoLines(), []);
        assert.deepEqual(record.evidenceSpans, []);
        assert.match(next, /--screenshot <label> for a still change, .*; for behavior or a flow, put the steps that show it in host\.evidence, run that spec on its own, and attach that run with --video$/);
      }
    });

    it('runs agent-device in its state folder, so a file it writes to its working folder stays out of the checkout', async () => {
      const r = recorded({ launches: true });
      const folders: (string | undefined)[] = [];
      const watching: Runner = async (command, args, options) => (command.endsWith('agent-device') && folders.push(options?.cwd), r.deps.runner(command, args, options));
      await runVerb({ ...r.deps, runner: watching }, { ...RUN_ALL, video: true });
      assert.deepEqual(folders, [r.w.workspace.agentDeviceDir]);
    });

    it('gives the close before the recording 30 seconds, and records all the same when it runs out', async () => {
      const r = recorded({ launches: true });
      const limits: (number | undefined)[] = [];
      const hanging: Runner = async (command, args, options) => {
        if (!command.endsWith('agent-device')) return r.deps.runner(command, args, options);
        limits.push(options?.timeoutMs);
        return { code: 124, stdout: '', stderr: 'timed out after 30000ms\n' };
      };
      await runVerb({ ...r.deps, runner: hanging }, { ...RUN_ALL, video: true });
      assert.deepEqual(limits, [30_000]);
      assert.deepEqual(r.order(), ['e2e opens the app with no arguments', 'recorder starts', 'launches for auth-start.e2e.ts']);
      assert.deepEqual(r.videoLines(), ['video   the app could not be closed before the recording, so the video may open on the screen it was showing: timed out after 30000ms']);
    });

    it('launches nothing when the recorder cannot start: each test that would launch fails with the reason and the fix, and the recorder is tried once', async () => {
      const r = recorded({ launches: true }, { [AUTH_START]: null, [SIGN_UP]: null });
      let tries = 0;
      r.backend.startRecording = async () => {
        tries += 1;
        throw new VerifyFailure('NOT_READY', 'simctl recordVideo exited 1: no such device', 'rerun with --no-video');
      };
      const { record } = await runVerb(r.deps, { ...RUN_ALL, video: true });
      assert.deepEqual(r.order(), ['e2e opens the app with no arguments', r.close, 'does not launch for auth-start.e2e.ts', 'does not launch for complete.e2e.ts']);
      assert.deepEqual(record.results.map((result) => [result.status, result.error]), [
        ['failed', 'simctl recordVideo exited 1: no such device (fix: rerun with --no-video)'],
        ['failed', 'simctl recordVideo exited 1: no such device (fix: rerun with --no-video)'],
      ]);
      assert.equal(tries, 1);
      assert.deepEqual(record.videos, []);
      assert.deepEqual(r.videoLines(), []);
    });
  });

  it('drives each group on one application, in one e2e invocation each, and records what it did', async () => {
    const w = world();
    const result = await runVerb(w.deps(), RUN_ALL);
    const { record, dir } = result;
    const application = w.clerk.live()[0]!;

    assert.ok(w.lines.includes(`settings 3 groups in this run: standard (2 spec files), ${ORG_LABEL} (1), ${MFA_LABEL} (2)`), w.lines.join('\n'));
    assert.deepEqual(w.invocations().map((invocation) => [invocation.output.split('/').at(-1), invocation.specs]), [['e2e', [AUTH_START, SIGN_UP]], ['e2e-2', [CHOOSE_ORG]], ['e2e-3', [COMPLETE_MFA, SETUP_MFA]]]);
    assert.ok(w.invocations().every((invocation) => invocation.args.includes('--pass-with-no-tests')), 'a group whose tests are all left out must not fail the run');
    assert.deepEqual(w.writes(), ['POST /applications', 'PATCH /applications/{app}/config', 'PATCH /applications/{app}/config', 'PATCH /applications/{app}/config'], 'one create, and one PATCH for the standard file and for each of the two changes');
    assert.equal(w.clerk.applications.length, 1);

    assert.deepEqual(record.settings, [
      { label: 'standard', askedBy: null, specs: [AUTH_START, SIGN_UP], application: application.id, changed: false, held: true, e2eReport: join(dir, 'e2e', 'report.json') },
      { label: ORG_LABEL, askedBy: CHOOSE_ORG, specs: [CHOOSE_ORG], application: application.id, changed: true, held: true, e2eReport: join(dir, 'e2e-2', 'report.json') },
      { label: MFA_LABEL, askedBy: COMPLETE_MFA, specs: [COMPLETE_MFA, SETUP_MFA], application: application.id, changed: true, held: true, e2eReport: join(dir, 'e2e-3', 'report.json') },
    ]);
    assert.equal(record.e2eReport, join(dir, 'e2e', 'report.json'), 'the first group\'s, so a run with one group reads as it always did');
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'passed choose-organization.e2e.ts', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.equal(JSON.stringify(record.results).includes('sourceHash'), false);

    assert.equal(application.users, 5, 'every spec seeded its user in the one application, with that application\'s key');
    assert.equal(record.identities.length, 5);
    assert.ok(record.identities.every((identity) => identity.userId?.startsWith(`user_${application.id}_`)));
    assert.equal(w.workspace.unclosedEntries().filter((entry) => entry.kind === 'user' && entry.run === record.run).length, 5, 'each spec made one user, and the run ledgered it');
    assert.deepEqual(record.identities.map((identity) => identity.email.startsWith(record.run.split('-').slice(1).join(''))), [true, true, true, true, true]);

    const log = readFileSync(join(dir, 'e2e.log'), 'utf8').split('\n');
    assert.deepEqual(log.filter((line) => line.startsWith('settings ')), [`settings ${ORG_LABEL}: 1 spec file`, `settings ${MFA_LABEL}: 2 spec files`]);
    assert.ok(log.indexOf(`fake e2e runs ${SIGN_UP}`) < log.indexOf(`settings ${ORG_LABEL}: 1 spec file`) && log.indexOf(`settings ${ORG_LABEL}: 1 spec file`) < log.indexOf(`fake e2e runs ${CHOOSE_ORG}`), 'one log for the whole run, in the order the groups ran');
    assert.deepEqual(record.screenshots, [{ label: 'home', path: join(dir, 'screenshots', 'home.png'), test: { spec: SETUP_MFA, title: 'a test of setup-mfa.e2e.ts' } }], 'one screenshot per label across the groups, with the test that took it');
    assert.equal(readFileSync(join(dir, 'screenshots', 'home.png'), 'utf8'), 'e2e-3', 'the last group to take a label keeps it');

    assert.match(result.next, /^\{cli\} attach /);
    assert.equal(exitCodeFor(result), 0);
    assert.deepEqual(summarize(assertPublishable(record, [])), { run: record.run, platform: 'ios', device: record.device, commit: record.gitHead, passed: 5, flaky: 0, total: 5 });

    w.lines.length = 0;
    await runVerb(w.deps(), RUN_ALL);
    assert.ok(w.lines.includes(`settings 3 groups in this run: ${MFA_LABEL} (2 spec files), ${ORG_LABEL} (1), standard (2)`), 'the next run starts with the settings the last one left');
    assert.ok(w.lines.includes(`settings ${MFA_LABEL}  already on ${application.id}`));
    assert.equal(w.writes().length, 6, 'two more changes, and no create');
  });

  it('runs one group in the directory a run always used, with nothing about settings to say', async () => {
    const w = world({ specs: { [AUTH_START]: null, [SIGN_UP]: null } });
    const { record, dir } = await runVerb(w.deps(), RUN_ALL);
    assert.deepEqual(w.invocations().map((invocation) => invocation.output.split('/').at(-1)), ['e2e']);
    assert.equal(w.lines.some((line) => /groups in this run/.test(line)), false);
    assert.deepEqual(record.settings.map((group) => [group.label, group.changed, group.e2eReport]), [['standard', false, join(dir, 'e2e', 'report.json')]], 'the application was put on the standard file before the run drove, so the group changed nothing');
  });

  it('opens the Platform credential before it leases a device when the run will change settings', async () => {
    const w = world();
    await w.deps().instances.ensure({ willChange: false }, () => undefined);
    await assert.rejects(runVerb(w.deps({}), RUN_ALL), (error: VerifyFailure) => error.code === 'KEYS_MISSING');
    assert.equal(w.workspace.readLease('ios'), null, 'a credential that is gone stops the run before a device is leased, not between two groups');
    assert.equal(w.lines.includes('device leased'), false);
  });

});

describe('a run whose spec seeds a user with a password', () => {
  it('keeps the password out of everything the run writes, and marks a file that e2e wrote it into', async () => {
    const gotFile = (dir: string) => join(dir, 'password-the-spec-got');
    const w = world({ specs: { [AUTH_START]: null }, plan: { password: true, exitCode: 1 }, logs: async () => `the app logged ${readFileSync(gotFile(w.dir), 'utf8')}` });
    const { record, dir } = await runVerb(w.deps(), RUN_ALL);
    const password = readFileSync(gotFile(w.dir), 'utf8');
    assert.match(password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/, 'the spec was handed a password to type');

    assert.equal(record.results[0]!.error, 'the field shows <redacted>');
    assert.ok(readFileSync(join(dir, 'e2e.log'), 'utf8').includes('the spec typed <redacted>'));
    assert.equal(readFileSync(record.appLog!, 'utf8'), 'the app logged <redacted>');

    const byE2E = [join(dir, 'e2e', 'report.json'), join(dir, 'e2e', 'trace.txt')];
    assert.deepEqual(record.tainted, byE2E, 'the two files e2e itself wrote the password into');
    assert.throws(() => assertPublishable(record, []), (error: VerifyFailure) => error.code === 'EVIDENCE_UNSAFE' && /has secret values in/.test(error.message));

    const written = (at: string): string[] => readdirSync(at, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? written(join(at, entry.name)) : entry.isFile() ? [join(at, entry.name)] : []));
    const holding = written(w.dir).filter((file) => readFileSync(file).includes(password));
    assert.deepEqual(holding.sort(), [...byE2E, gotFile(w.dir)].sort(), 'no ledger, record, log, or scratch file holds it');
  });
});

describe('a group that did not run in full', () => {
  const notPublishable = (w: ReturnType<typeof world>) => assert.throws(() => assertPublishable(w.lastRecord(), []), { code: 'EVIDENCE_UNSAFE' });

  it('fails every file of a group whose e2e wrote no report, seals the run, and exits non-zero', async () => {
    const w = world({ plan: { noReport: ['e2e-2'] } });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'E2E_CRASHED' && error.message === `e2e exited 0 before writing a report for ${ORG_LABEL}` && /e2e\.log$/.test(error.fix));
    const record = w.lastRecord();
    assert.equal(record.sealed, true);
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'failed choose-organization.e2e.ts (not run)', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.equal(record.results[2]!.error, `e2e exited 0 before writing a report for ${ORG_LABEL}`);
    assert.deepEqual(record.settings.map((group) => group.held), [true, true, true]);
    notPublishable(w);
    assert.ok(w.lines.some((line) => /^evidence  .* sealed; 1 group of 3 did not run in full/.test(line)));
  });

  it('seals the run with every group\'s result when the device logs cannot be read, and says so in app.log', async () => {
    const sessionEnded = async (): Promise<string> => {
      throw new Error('the session has ended');
    };
    const w = world({ plan: { noReport: ['e2e-2'] }, logs: sessionEnded });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'E2E_CRASHED' && error.message === `e2e exited 0 before writing a report for ${ORG_LABEL}`);
    const record = w.lastRecord();
    assert.equal(record.sealed, true);
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'failed choose-organization.e2e.ts (not run)', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.equal(readFileSync(record.appLog!, 'utf8'), 'the device logs could not be read: the session has ended');

    const passing = world({ specs: { [AUTH_START]: null }, logs: sessionEnded });
    const result = await runVerb(passing.deps(), RUN_ALL);
    assert.equal(exitCodeFor(result), 0, 'a failed log read alone does not fail the run');
    assert.equal(readFileSync(result.record.appLog!, 'utf8'), 'the device logs could not be read: the session has ended');
  });

  it('fails a selected file that has no result in its group\'s report', async () => {
    const w = world({ plan: { silent: [SETUP_MFA] } });
    const result = await runVerb(w.deps(), RUN_ALL);
    assert.deepEqual(statuses(result.record.results).slice(3), ['passed complete-setup-mfa.e2e.ts', 'failed setup-mfa.e2e.ts (not run)']);
    assert.equal(result.record.results[4]!.error, 'e2e reported no result for this file: it registers no test');
    assert.equal(exitCodeFor(result), 1);
    assert.doesNotMatch(result.next, /attach/);
    notPublishable(w);
  });

  it('says that e2e exited non-zero when a selected file has no result, and where to read why', async () => {
    const w = world({ plan: { silent: [SETUP_MFA], exitCode: 1 } });
    const result = await runVerb(w.deps(), RUN_ALL);
    assert.equal(result.record.results[4]!.error, 'e2e exited 1 and reported no result for this file: it failed to load or registers no test; e2e.log in the run directory says which');
  });

  it('fails the group of a spec file edited after the run was planned, and still runs the others', async () => {
    const w = world();
    writeFileSync(join(w.dir, 'fake-e2e.json'), JSON.stringify({ edit: join(w.dir, SETUP_MFA) }));
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'USAGE' && error.message === `${SETUP_MFA} or its settings file changed while the run was in progress` && error.fix.startsWith('rerun'));
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'passed choose-organization.e2e.ts', 'failed complete-setup-mfa.e2e.ts (not run)', 'failed setup-mfa.e2e.ts (not run)']);
    assert.deepEqual(record.settings[2], { label: MFA_LABEL, askedBy: COMPLETE_MFA, specs: [COMPLETE_MFA, SETUP_MFA], application: null, changed: false, held: false, e2eReport: null });
    assert.equal(w.invocations().length, 2);
    assert.equal(w.clerk.live()[0]!.environment['user_settings.sign_up.mfa.required'], false, 'the settings of a plan that no longer matches the file were never applied');
  });

  it('fails the group of a spec whose settings file was edited while its settings were being applied, before e2e runs it, and still runs the next', async () => {
    const w = world();
    w.hooks.push((line) => {
      if (line.startsWith('settings changing ') && line.endsWith(`to ${ORG_LABEL}, which ${CHOOSE_ORG} declares`)) writeFileSync(join(w.dir, settingsFileOf(CHOOSE_ORG)), settingsText(MFA));
    });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'USAGE' && error.message === `${CHOOSE_ORG} or its settings file changed while the run was in progress` && error.fix.startsWith('rerun'));
    const record = w.lastRecord();
    assert.deepEqual(w.invocations().map((invocation) => invocation.specs), [[AUTH_START, SIGN_UP], [COMPLETE_MFA, SETUP_MFA]], 'e2e never ran the file under the settings of its old declaration');
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'failed choose-organization.e2e.ts (not run)', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.deepEqual(record.settings.map((group) => [group.application !== null, group.changed, group.held, group.e2eReport !== null]), [[true, false, true, true], [true, true, false, false], [true, true, true, true]]);
    assert.deepEqual(w.workspace.unclosedEntries().filter((entry) => entry.kind === 'application').length, 1);
    const state = JSON.parse(readFileSync(join(w.workspace.root, 'instances', `${w.clerk.live()[0]!.name}.state.json`), 'utf8')) as { drivers: unknown[] };
    assert.deepEqual(state.drivers, [], 'the run records itself as driving for all its groups and no longer once it has ended');
  });

  it('fails the group of a spec file edited while e2e was running it, though e2e reported a pass, and still runs the next', async () => {
    const w = world();
    writeFileSync(join(w.dir, 'fake-e2e.json'), JSON.stringify({ edit: join(w.dir, AUTH_START) }));
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'USAGE' && error.message === `${AUTH_START} or its settings file changed while the run was in progress` && error.fix.startsWith('rerun'));
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results), ['failed auth-start.e2e.ts (not run)', 'failed complete.e2e.ts (not run)', 'passed choose-organization.e2e.ts', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.deepEqual(record.settings.map((group) => [group.application !== null, group.held, group.e2eReport !== null]), [[true, true, true], [true, true, true], [true, true, true]]);
    assert.equal(w.invocations().length, 3);
    notPublishable(w);
  });

  it('keeps in the run directory the spec and the settings each group was planned from, not what the files hold later', async () => {
    const w = world();
    w.hooks.push((line) => {
      if (line.startsWith('instances ')) writeFileSync(join(w.dir, settingsFileOf(CHOOSE_ORG)), settingsText(MFA));
    });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.message === `${CHOOSE_ORG} or its settings file changed while the run was in progress`);
    const run = w.workspace.runDir(w.workspace.runs().at(-1)!);
    assert.equal(readFileSync(join(run, settingsFileOf(CHOOSE_ORG)), 'utf8'), settingsText(FORCED_ORG));
    assert.equal(readFileSync(join(run, CHOOSE_ORG), 'utf8'), SPEC_SOURCE);
    assert.equal(existsSync(join(run, settingsFileOf(AUTH_START))), false, 'a spec on the standard settings has no settings file to keep');
  });

  it('refuses to run while a JSON file under specs is not the settings file of a spec, before it leases anything', async () => {
    const w = world();
    writeFileSync(join(w.dir, 'specs/features/session-tasks/setup-mfa.e2e.settings.json'), settingsText(MFA));
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'USAGE' && error.message === 'specs/features/session-tasks/setup-mfa.e2e.settings.json is not the settings file of a spec, so no run reads it' && error.fix.includes('.settings.json in place of .e2e.ts'));
    assert.equal(w.lines.includes('device leased'), false);
  });

  it('stops at a failure that comes after the settings were applied, and fails every later group with it', async () => {
    const w = world();
    w.hooks.push((line) => {
      if (line.startsWith('settings changing ') && line.includes(` to ${ORG_LABEL}, `)) rmSync(join(w.dir, 'node_modules', '.bin', 'e2e'));
    });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'NOT_READY' && error.message === 'the pinned e2e is not installed');
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'failed choose-organization.e2e.ts (not run)', 'failed complete-setup-mfa.e2e.ts (not run)', 'failed setup-mfa.e2e.ts (not run)']);
    assert.equal(record.results[4]!.error, 'an earlier group of this run failed, so this one did not run: the pinned e2e is not installed');
    assert.deepEqual(record.settings.map((group) => [group.application !== null, group.changed, group.held, group.e2eReport !== null]), [[true, false, true, true], [true, true, false, false], [false, false, false, false]]);
    assert.equal(w.writes().filter((call) => call.startsWith('PATCH')).length, 2, 'the standard file and the one change; the last group\'s settings were never sent');
  });

  it('fails only its own group when Clerk refuses the declaration, and goes on to the next', async () => {
    const w = world();
    w.clerk.state.refusals.push({ path: 'organization_settings.force_organization_selection', value: true, status: 400, code: 'unknown_config_key', param: 'organization_settings.force_organization_selection', message: 'is not a config key' });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error instanceof SettingsRefused && error.message.startsWith(`${CHOOSE_ORG} declares ${ORG_LABEL}, and Clerk's Platform API refused it`));
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'failed choose-organization.e2e.ts (not run)', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.match(record.results[2]!.error ?? '', /refused it: organization_settings\.force_organization_selection \(400 unknown_config_key\)/);
    assert.deepEqual(record.settings.map((group) => [group.application !== null, group.changed, group.held, group.e2eReport !== null]), [[true, false, true, true], [false, false, false, false], [true, true, true, true]]);
    assert.deepEqual(w.invocations().map((invocation) => invocation.specs), [[AUTH_START, SIGN_UP], [COMPLETE_MFA, SETUP_MFA]]);
    notPublishable(w);
  });

  it('stops at a failure that is not about a declaration, and fails every later group with it', async () => {
    const w = world();
    const deps = w.deps();
    await deps.instances.ensure({ willChange: false }, () => undefined);
    w.clerk.state.failConfigure = 1;
    await assert.rejects(runVerb(deps, RUN_ALL), (error: VerifyFailure) => !(error instanceof SettingsRefused) && error.code === 'NOT_READY' && /answered 500/.test(error.message));
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'failed choose-organization.e2e.ts (not run)', 'failed complete-setup-mfa.e2e.ts (not run)', 'failed setup-mfa.e2e.ts (not run)']);
    assert.match(record.results[4]!.error ?? '', /^an earlier group of this run failed, so this one did not run: Clerk's Platform API answered 500/);
    assert.equal(w.invocations().length, 1, 'the next group would have met the same outage');
    assert.deepEqual(w.writes().filter((call) => call.startsWith('PATCH')).length, 2, 'the standard file, and the one change that failed');
    assert.ok(w.lines.some((line) => /sealed; 2 groups of 3 did not run in full/.test(line)));
  });

  it('fails a group whose settings no longer held when its specs ended, on top of what e2e reported', async () => {
    const w = world();
    w.hooks.push((line) => {
      if (line === `fake e2e runs ${SETUP_MFA}`) w.clerk.live()[0]!.environment['user_settings.sign_up.mfa.required'] = false;
    });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'INSTANCE_MISCONFIGURED' && error.message === `the instance no longer showed ${MFA_LABEL} when its specs ended, so what they saw is unknown`);
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results).slice(3), ['passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts', 'failed complete-setup-mfa.e2e.ts (not run)', 'failed setup-mfa.e2e.ts (not run)']);
    assert.deepEqual(record.settings.map((group) => group.held), [true, true, false]);
    notPublishable(w);
  });

  it('says the environment could not be read, and what answered, when that is why it cannot tell whether the settings held', async () => {
    const w = world();
    w.hooks.push((line) => {
      if (line === `fake e2e runs ${SETUP_MFA}`) w.frontendApi.answers = 502;
    });
    const application = () => w.clerk.live()[0]!;
    await assert.rejects(
      runVerb(w.deps(), RUN_ALL),
      (error: VerifyFailure) => error.code === 'NOT_READY' && error.message === `the instance's environment could not be read after the specs on ${MFA_LABEL} ended, so what they saw is unknown: the Frontend API of ${application().id} (${application().name}) answered 502`,
    );
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results).slice(3), ['passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts', 'failed complete-setup-mfa.e2e.ts (not run)', 'failed setup-mfa.e2e.ts (not run)']);
    assert.deepEqual(record.settings.map((group) => group.held), [true, true, false]);
  });
});

describe('a run that finds what a daemon that failed to start left behind', () => {
  const GONE = 2147483646;
  const leftover = (w: ReturnType<typeof world>): string => join(w.workspace.agentDeviceDir, 'daemon.json');
  const plant = (w: ReturnType<typeof world>): void => {
    mkdirSync(w.workspace.agentDeviceDir, { recursive: true });
    writeFileSync(leftover(w), JSON.stringify({ pid: GONE, version: '0.21.22' }));
    writeFileSync(join(w.workspace.agentDeviceDir, 'daemon.log'), 'AGENT_DEVICE_DAEMON_PORT=50999\nDaemon error: the daemon of the warm-up gave up\n');
  };
  const driverLines = (w: ReturnType<typeof world>): string[] => w.lines.filter((line) => line.startsWith('driver'));
  const REMOVED = `driver  removed the agent-device registration of pid ${GONE}, which is not running and has no start time; a daemon failed to start, and agent-device would refuse every command until the file was gone`;

  it('removes the registration before e2e starts, so the tests run, and keeps the log of that daemon', async () => {
    const w = world({ specs: { [AUTH_START]: null }, plan: { driver: { refusesALeftoverRegistration: true } } });
    plant(w);
    const { record, dir } = await runVerb(w.deps(), RUN_ALL);
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts']);
    assert.deepEqual(driverLines(w), [REMOVED]);
    assert.equal(readFileSync(join(dir, 'driver', 'daemon-that-did-not-start.log'), 'utf8'), `AGENT_DEVICE_DAEMON_PORT=50999\nDaemon error: ${LEFT_OUT}\n`);
    assert.match(readFileSync(join(dir, 'driver', 'summary.txt'), 'utf8'), new RegExp(`^At the start of the run daemon.json named pid ${GONE}, which was not running, and it carried no start time`));
    assert.deepEqual(record.tainted, []);
  });

  it('removes it once: when the daemon the run then starts fails too, the run fails and says what was tried', async () => {
    const w = world({ plan: { driver: { refusesALeftoverRegistration: true, daemonFailsToStartIn: ['e2e'] } } });
    plant(w);
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => {
      assert.equal(error.code, 'E2E_CRASHED');
      assert.equal(
        error.message,
        `e2e exited 3 before writing a report for standard; agent-device's daemon did not start: it left a registration for pid 2147483645, which is not running, as the daemon before it had (pid ${GONE}), whose registration the CLI removed once in this run and does not remove a second time`,
      );
      assert.match(error.fix, /e2e\.log, and driver\/summary\.txt beside it$/);
      return true;
    });
    assert.deepEqual(driverLines(w), [REMOVED]);
    assert.deepEqual(JSON.parse(readFileSync(leftover(w), 'utf8')), { pid: 2147483645, version: '0.21.22' }, 'the second leftover is still there');
    const record = w.lastRecord();
    assert.ok(record.results.every((result) => result.status === 'failed' && result.title === 'not run'));
    assert.match(record.results.at(-1)!.error!, /^e2e exited 3 before writing a report for auth_multi_factor.required_for_sign_up=true; agent-device's daemon did not start/);
  });

  it('gives the next group a clean start when the daemon fails to start during the run', async () => {
    const w = world({ plan: { driver: { refusesALeftoverRegistration: true, daemonFailsToStartIn: ['e2e'] } } });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), {
      code: 'E2E_CRASHED',
      message: "e2e exited 3 before writing a report for standard; agent-device's daemon did not start: it left a registration for pid 2147483645, which is not running",
    });
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results), ['failed auth-start.e2e.ts (not run)', 'failed complete.e2e.ts (not run)', 'passed choose-organization.e2e.ts', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.equal(driverLines(w).length, 1);
    assert.equal(readFileSync(join(w.workspace.runDir(record.run), 'driver', 'daemon-that-did-not-start.log'), 'utf8'), `AGENT_DEVICE_DAEMON_PORT=51000\nDaemon error: ${LEFT_OUT}\n`);
  });

  it('says nothing about a daemon when e2e wrote no report for another reason', async () => {
    const w = world({ specs: { [AUTH_START]: null }, plan: { noReport: ['e2e'], exitCode: 1 } });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.message === 'e2e exited 1 before writing a report for standard' && /e2e\.log$/.test(error.fix));
    assert.deepEqual(driverLines(w), []);
  });
});

describe('the driver logs in the evidence of a run', () => {
  const SESSION = 'verify-ios-unit-0';
  const RUNNER = `sessions/${SESSION}/runner.log`;
  const GATEWAY_KEY = `gw_${'k'.repeat(20)}UnitTestOnly${'z'.repeat(20)}`;
  const GITHUB_TOKEN = `ghs_${'unitTestOnly'.repeat(3)}`;
  const FIRST_SECRET_KEY = `sk_test_fakeSecret1${'x'.repeat(16)}`;
  const typed = (seconds: string, text: string, field: string): string => `    t = ${seconds.padStart(8)}s Type '${text}' into "${field}" SecureTextField`;
  const DAEMON_LINES = [
    'Daemon error: the Backend API refused Authorization: Bearer {secretKey}',
    '{"phase":"exec_command","data":{"command":"curl","args":["-H","Authorization: Bearer {platformKey}"]}}',
    '{"phase":"agent","data":{"gateway":"{gatewayKey}"}}',
    '{"phase":"report","data":{"github":"{githubToken}"}}',
    '{"phase":"stand_in","data":{"header":"Bearer {standInToken}"}}',
    '{"phase":"exec_command","command":"open","data":{"command":"xcrun","args":["simctl","launch","--terminate-running-process","UDID-1","com.clerk.E2EHost","-verifyRunId","r1","-verifySignInTicket","{ticket}"]}}',
    '{"phase":"exec_command","command":"open","data":{"command":"adb","args":["-s","emulator-5554","shell","am","start","-W","--es","verifySignInTicket","{ticket}"]}}',
    '{"phase":"request_failed","data":{"message":"the app answered with a session: __session={sessionToken}"}}',
    '{"phase":"request_failed","data":{"message":"text entry verification failed: expected \\"{seededPassword}\\", observed \\"\\""}}',
    '{"phase":"request_failed","data":{"message":"text entry verification failed: expected \\"{runPassword}\\", observed \\"\\""}}',
    '{"phase":"request_failed","data":{"message":"adb -s emulator-5554 shell input text {pieces seededPassword} exited with code 1"}}',
    '{"phase":"request_failed","data":{"message":"adb -s emulator-5554 shell input text {pieces runPassword} exited with code 1"}}',
  ];
  const RUNNER_LINES = [
    '    t =     1.00s Find the "clerk.auth.signUp.password" SecureTextField',
    typed('2.00', '{each runPassword}', 'clerk.auth.signUp.password'),
    typed('3.00', '{each seededPassword}', 'clerk.auth.signIn.password'),
    typed('4.00', '{pieces runPassword}', 'clerk.auth.signUp.password'),
    typed('5.00', '{pieces seededPassword}', 'clerk.auth.signIn.password'),
    '    t =     6.00s Find the "{sessionToken}" StaticText',
    'TextField, 0x1, {{0.0, 0.0}, {100.0, 44.0}}, identifier: \'ticket\', value: {ticket}',
    '    t =     7.00s Synthesize event',
  ];
  const KINDS = ['secretKey', 'platformKey', 'gatewayKey', 'githubToken', 'standInToken', 'ticket', 'sessionToken', 'seededPassword', 'runPassword'] as const;
  const TYPED = ['seededPassword', 'runPassword'] as const;
  type Kind = (typeof KINDS)[number];

  const piecesOf = (password: string): string[] => password.match(/.{1,16}/g)!.filter((piece) => piece.length >= 8);
  const quotedAlone = (text: string): string => [...text.matchAll(/(['"])(.)\1/g)].map((match) => match[2]).join('');
  const runWith = async (writes: Readonly<Record<string, readonly string[]>>) => {
    const w = world({ specs: { [AUTH_START]: null }, plan: { driver: { known: { secretKey: FIRST_SECRET_KEY, platformKey: PLATFORM_KEY, gatewayKey: GATEWAY_KEY, githubToken: GITHUB_TOKEN }, writes } } });
    const { record, dir } = await runVerb({ ...w.deps(), env: { GITHUB_TOKEN }, agent: () => readAgent({ AI_GATEWAY_API_KEY: GATEWAY_KEY }) }, RUN_ALL);
    const secrets = JSON.parse(readFileSync(join(w.dir, 'secrets-the-driver-saw.json'), 'utf8')) as Record<Kind, string>;
    assert.equal(secrets.secretKey, w.clerk.live()[0]!.sk, 'the key planted is the key of the application the run used');
    assert.equal(secrets.runPassword, `Verify-${record.run}-Pw1!`);
    return { w, record, dir, secrets };
  };

  it('holds no secret of any kind, whole, in the pieces a test types it in, or spelled a character at a time', async () => {
    const { record, dir, secrets } = await runWith({ 'daemon.log': DAEMON_LINES, [RUNNER]: RUNNER_LINES });
    const copies = { daemon: readFileSync(join(dir, 'driver', 'daemon.log'), 'utf8'), runner: readFileSync(join(dir, 'driver', `runner-${SESSION}.log`), 'utf8'), summary: readFileSync(join(dir, 'driver', 'summary.txt'), 'utf8') };
    for (const [name, copy] of Object.entries(copies)) {
      for (const kind of KINDS) assert.equal(copy.includes(secrets[kind]), false, `the ${name} holds the ${kind}`);
      for (const kind of TYPED) {
        for (const piece of piecesOf(secrets[kind])) assert.equal(copy.includes(piece), false, `the ${name} holds a typed piece of the ${kind}`);
        assert.equal(quotedAlone(copy).includes(secrets[kind].slice(0, 8)), false, `the ${name} spells the ${kind}`);
      }
    }
    const typedLines = [secrets.runPassword.length, secrets.seededPassword.length, 3, 2];
    assert.deepEqual(copies.daemon.trim().split('\n'), [`Daemon error: ${LEFT_OUT}`, linesLeftOut(9 + 3 + 2)]);
    assert.deepEqual(copies.runner.trimEnd().split('\n'), [
      `    t =     1.00s Find the "${LEFT_OUT}" SecureTextField`,
      ...['2.00', '3.00', '4.00', '5.00'].flatMap((seconds, at) => Array.from({ length: typedLines[at]! }, () => `    t = ${seconds.padStart(8)}s Type ${LEFT_OUT}`)),
      `    t =     6.00s Find the "${LEFT_OUT}" StaticText`,
      linesLeftOut(1),
      '    t =     7.00s Synthesize event',
    ]);
    assert.deepEqual(record.tainted, [], 'nothing the run kept holds a secret, so the workflow uploads it');
    assert.doesNotThrow(() => assertPublishable(record, []));
  });

  it('is tainted by a log that reached the run directory with a secret of any kind in it, so nothing of the run is uploaded or attached', async () => {
    const unredacted: Readonly<Record<string, readonly string[]>> = {
      'whole-secretKey': ['Bearer {secretKey}'],
      'whole-platformKey': ['Bearer {platformKey}'],
      'whole-gatewayKey': ['{gatewayKey}'],
      'whole-githubToken': ['{githubToken}'],
      'whole-standInToken': ['Bearer {standInToken}'],
      'whole-ticket': ['"-verifySignInTicket","{ticket}"'],
      'whole-sessionToken': ['__session={sessionToken}'],
      'whole-seededPassword': ['expected "{seededPassword}"'],
      'whole-runPassword': ['expected "{runPassword}"'],
      'pieces-seededPassword': ['input text {pieces seededPassword}'],
      'pieces-runPassword': ['input text {pieces runPassword}'],
      'spelled-seededPassword': [typed('1.00', '{each seededPassword}', 'clerk.auth.signIn.password')],
      'spelled-runPassword': [typed('1.00', '{each runPassword}', 'clerk.auth.signUp.password')],
    };
    const { record, dir } = await runWith({
      ...Object.fromEntries(Object.entries(unredacted).map(([name, lines]) => [`RUN/driver/${name}.log`, lines])),
      'RUN/driver/nothing-secret.log': ['    t =     1.00s Find the "clerk.auth.signUp.password" SecureTextField', "Type 'a' into a field that is not a secret"],
    });
    assert.deepEqual(record.tainted, Object.keys(unredacted).map((name) => join(dir, 'driver', `${name}.log`)).sort());
    assert.throws(() => assertPublishable(record, []), (error: VerifyFailure) => error.code === 'EVIDENCE_UNSAFE' && /has secret values in/.test(error.message));
  });

  it('is sealed after the driver logs are copied, so a copy that held a secret would taint the run', async () => {
    const w = world({ specs: { [AUTH_START]: null } });
    const copiesASecret: Deps['watchDriver'] = (stateDir, runDir, ...rest) => {
      const watch = watchDriver(stateDir, runDir, ...rest);
      return {
        ...watch,
        collect: () => {
          watch.collect();
          writeFileSync(join(runDir, 'driver', 'runner-that-kept-a-secret.log'), `Verify-${runDir.split('/').at(-1)}-Pw1!\n`);
        },
      };
    };
    const { record, dir } = await runVerb({ ...w.deps(), watchDriver: copiesASecret }, RUN_ALL);
    assert.deepEqual(record.tainted, [join(dir, 'driver', 'runner-that-kept-a-secret.log')]);
    assert.throws(() => assertPublishable(record, []), (error: VerifyFailure) => error.code === 'EVIDENCE_UNSAFE');
  });

  it('keeps only what the logs gained during the run, and the whole of a log a new daemon rewrote', async () => {
    const before = (w: ReturnType<typeof world>): void => {
      mkdirSync(join(w.workspace.agentDeviceDir, 'sessions', SESSION), { recursive: true });
      writeFileSync(join(w.workspace.agentDeviceDir, 'daemon.log'), 'AGENT_DEVICE_DAEMON_PORT=50999\n');
      writeFileSync(join(w.workspace.agentDeviceDir, RUNNER), '    t =     1.00s Set Up\n');
    };
    const w = world({ specs: { [AUTH_START]: null }, plan: { driver: { rewrites: ['daemon.log'], writes: { 'daemon.log': ['AGENT_DEVICE_DAEMON_PORT=51000'], [RUNNER]: ['    t =     2.00s Tear Down'] } } } });
    before(w);
    const { dir } = await runVerb(w.deps(), RUN_ALL);
    assert.equal(readFileSync(join(dir, 'driver', 'daemon.log'), 'utf8'), 'AGENT_DEVICE_DAEMON_PORT=51000\n');
    assert.equal(readFileSync(join(dir, 'driver', `runner-${SESSION}.log`), 'utf8'), '    t =     2.00s Tear Down\n');
  });

  it('says in the evidence that no daemon wrote a log, when none did', async () => {
    const w = world({ specs: { [AUTH_START]: null } });
    const { record, dir } = await runVerb(w.deps(), RUN_ALL);
    assert.deepEqual(readdirSync(join(dir, 'driver')), ['summary.txt']);
    assert.match(readFileSync(join(dir, 'driver', 'summary.txt'), 'utf8'), /\nThere is no daemon\.log, so no agent-device daemon on this machine wrote one\.\n/);
    assert.deepEqual(record.tainted, []);
  });
});

describe('a run on a session that built uncommitted changes', () => {
  const PATCH = 'c'.repeat(64);

  it('names the changes the session built in the run.json it writes, and names none for a session that built the commit', async () => {
    const remoteOf = async (patch: string | null) => {
      const { dir } = await runVerb(world({ specs: { [AUTH_START]: null }, session: { patch } }).deps(), RUN_ALL);
      return (JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')) as { remote: unknown }).remote;
    };
    assert.deepEqual(await remoteOf(PATCH), { provider: 'github-actions', runner: 'xcode-27', builtSha: SESSION_COMMIT, builtPatch: PATCH });
    assert.deepEqual(await remoteOf(null), { provider: 'github-actions', runner: 'xcode-27', builtSha: SESSION_COMMIT, builtPatch: null });
  });

  it('is refused by attach from what run.json says, before attach runs anything', async () => {
    const w = world({ specs: { [AUTH_START]: null }, session: { patch: PATCH } });
    const { record } = await runVerb(w.deps(), RUN_ALL);
    const ran: string[] = [];
    const deps = { ...w.deps(), runner: async (command: string) => (ran.push(command), { code: 0, stdout: '', stderr: '' }) };
    await assert.rejects(attach(deps, { verb: 'attach', run: record.run, pr: 9, media: { screenshots: ['home'], video: false }, before: null }), {
      code: 'EVIDENCE_UNSAFE',
      message: `run ${record.run} ran on a session build of ${SESSION_COMMIT.slice(0, 12)} with uncommitted changes (${PATCH.slice(0, 12)}), so no commit holds the app it shows`,
    });
    assert.deepEqual(ran, []);
  });
});
