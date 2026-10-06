import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { exitCodeFor } from '../src/core/cli.ts';
import { assertPublishable, readRecord } from '../src/core/evidence.ts';
import { createInstances } from '../src/core/instances/instances.ts';
import { SettingsRefused } from '../src/core/instances/settings.ts';
import { commentBody } from '../src/core/publish.ts';
import { runVerb, type Deps } from '../src/core/verbs.ts';
import { openWorkspace } from '../src/core/workspace.ts';
import { VerifyFailure, type BuildKey, type Command, type DeviceBackend, type HostAdapter, type InstanceSettings, type LocalLease, type ScratchPath } from '../src/core/types.ts';
import { PLATFORM_KEY, fakeClerk, type FakeClerkOptions } from '../testing/fake-clerk.ts';

const MFA: InstanceSettings = { config: { auth_multi_factor: { required_for_sign_up: true } }, environment: { 'user_settings.sign_up.mfa.required': true } };
const FORCED_ORG: InstanceSettings = { config: { organization_settings: { force_organization_selection: true } }, environment: { 'organization_settings.force_organization_selection': true } };
const MFA_LABEL = 'auth_multi_factor.required_for_sign_up=true';
const ORG_LABEL = 'organization_settings.force_organization_selection=true';
const AUTH_START = 'specs/golden/auth-start/auth-start.e2e.ts';
const CHOOSE_ORG = 'specs/golden/session-tasks/choose-organization.e2e.ts';
const COMPLETE_MFA = 'specs/golden/session-tasks/complete-setup-mfa.e2e.ts';
const SETUP_MFA = 'specs/golden/session-tasks/setup-mfa.e2e.ts';
const SIGN_UP = 'specs/golden/sign-up/complete.e2e.ts';
const GOLDEN: Readonly<Record<string, InstanceSettings | null>> = { [AUTH_START]: null, [CHOOSE_ORG]: FORCED_ORG, [COMPLETE_MFA]: MFA, [SETUP_MFA]: MFA, [SIGN_UP]: null };

const FAKE_E2E = `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const output = args[args.indexOf('--output') + 1];
const specs = args.slice(1, args.indexOf('--config'));
const plan = JSON.parse(fs.readFileSync('fake-e2e.json', 'utf8'));
fs.appendFileSync('invocations.jsonl', JSON.stringify({ specs, output, args }) + '\\n');
(async () => {
  const context = JSON.parse(fs.readFileSync(process.env.VERIFY_CONTEXT, 'utf8'));
  const token = fs.readFileSync(context.broker.tokenFile, 'utf8');
  const results = [];
  for (const [index, file] of specs.entries()) {
    console.log('fake e2e runs ' + file);
    if ((plan.silent || []).includes(file)) continue;
    const seeded = await fetch(context.broker.url + '/seedUser', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: '{}' });
    const body = await seeded.json();
    const shot = 'ios/' + index + '/attempt-0/screenshots/001-home.png';
    fs.mkdirSync(path.dirname(path.join(output, 'artifacts', shot)), { recursive: true });
    fs.writeFileSync(path.join(output, 'artifacts', shot), path.basename(output));
    results.push({
      id: path.basename(output) + '-' + index + '-0000', kind: 'test', titlePath: ['a test of ' + path.basename(file)], file, platform: 'ios', tags: [],
      status: seeded.ok ? 'passed' : 'failed',
      attempts: [{ status: seeded.ok ? 'passed' : 'failed', durationMs: 1000, ...(seeded.ok ? {} : { error: { message: body.message } }), artifacts: [{ kind: 'screenshot', path: shot, producer: { kind: 'step', stepId: 's1' } }], steps: [{ id: 's1', api: 'app.screenshot', label: 'home' }] }],
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
}

const specSource = (declared: InstanceSettings | null): string =>
  `import { test${declared === null ? '' : ', type InstanceSettings'} } from '../../fixtures.ts';\n${declared === null ? '' : `\nexport const instanceSettings: InstanceSettings = ${JSON.stringify(declared)};\n`}\ntest('x', async ({ host }) => {\n  await host.seedUser();\n});\n`;

function world(options: { readonly specs?: Readonly<Record<string, InstanceSettings | null | string>>; readonly plan?: FakeE2EPlan; readonly env?: Record<string, string>; readonly clerk?: FakeClerkOptions } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'verify-run-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  writeFileSync(join(dir, 'app.swift'), 'app');
  for (const [path, declared] of Object.entries(options.specs ?? GOLDEN)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), typeof declared === 'string' ? declared : specSource(declared));
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
    logs: async () => '',
    describe: (lease: LocalLease) => lease.deviceName,
  } as unknown as DeviceBackend;
  const host = {
    repo: 'clerk-ios',
    platforms: ['ios'],
    screens: ['home'],
    backends: [backend],
    appId: () => 'com.clerk.E2EHost',
    entry: () => ({ kind: 'binary' }),
    buildInputs: () => ['app.swift'],
    async build(platform: 'ios', key: BuildKey, into: ScratchPath) {
      mkdirSync(into, { recursive: true });
      writeFileSync(join(into, 'E2EHost.app'), '');
      return { platform, key, appId: 'com.clerk.E2EHost', path: join(into, 'E2EHost.app') as ScratchPath, source: 'local' };
    },
  } as unknown as HostAdapter;
  const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') });
  const env = options.env ?? { CLERK_PLATFORM_API_KEY: PLATFORM_KEY };
  const deps = (instanceEnv: Record<string, string> = env): Deps => ({
    host,
    workspace,
    runner: async () => ({ code: 0, stdout: '', stderr: '' }),
    env: {},
    progress,
    instances: createInstances({ workspace, env: instanceEnv, runner: async () => ({ code: 127, stdout: '', stderr: '' }), progress, fetch: request }),
  });
  const invocations = () => readFileSync(join(dir, 'invocations.jsonl'), 'utf8').trim().split('\n').map((line) => JSON.parse(line) as { specs: string[]; output: string; args: string[] });
  const lastRecord = () => readRecord(workspace.runDir(workspace.runs().at(-1)!));
  const writes = () => clerk.platformRequests().filter((request) => request.method !== 'GET').map((request) => `${request.method} ${request.url.replace('api.clerk.com/v1/platform', '').replace(/\/app_\w+\/instances\/ins_\w+/, '/{app}')}`);
  return { dir, clerk, frontendApi, workspace, lines, hooks, deps, invocations, lastRecord, writes };
}

const RUN_ALL: Extract<Command, { verb: 'run' }> = { verb: 'run', selection: { all: true }, skip: [], include: [], video: false, waitSeconds: 0 };
const statuses = (results: readonly { readonly spec: { readonly path: string }; readonly title: string; readonly status: string }[]) => results.map((result) => `${result.status} ${result.spec.path.split('/').at(-1)}${result.title === 'not run' ? ' (not run)' : ''}`);

describe('a run whose spec files declare different settings', () => {
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
    assert.deepEqual(record.instances, [{ application: application.id }]);
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'passed choose-organization.e2e.ts', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.equal(JSON.stringify(record.results).includes('sourceHash'), false);

    assert.equal(application.users, 5, 'every spec seeded its user in the one application, with that application\'s key');
    assert.equal(record.identities.length, 5);
    assert.ok(record.identities.every((identity) => identity.userId?.startsWith(`user_${application.id}_`)));
    const identities = w.workspace.unclosedEntries().flatMap((entry) => (entry.kind === 'identity' || entry.kind === 'user' ? [entry] : []));
    assert.deepEqual(identities.map((entry) => entry.kind), Array.from({ length: 5 }, () => ['identity', 'user']).flat(), 'each spec reserved one email and made one user');

    const log = readFileSync(join(dir, 'e2e.log'), 'utf8').split('\n');
    assert.deepEqual(log.filter((line) => line.startsWith('settings ')), [`settings ${ORG_LABEL}: 1 spec file`, `settings ${MFA_LABEL}: 2 spec files`]);
    assert.ok(log.indexOf(`fake e2e runs ${SIGN_UP}`) < log.indexOf(`settings ${ORG_LABEL}: 1 spec file`) && log.indexOf(`settings ${ORG_LABEL}: 1 spec file`) < log.indexOf(`fake e2e runs ${CHOOSE_ORG}`), 'one log for the whole run, in the order the groups ran');
    assert.deepEqual(record.screenshots, [{ label: 'home', path: join(dir, 'screenshots', 'home.png') }], 'one screenshot per label across the groups');
    assert.equal(readFileSync(join(dir, 'screenshots', 'home.png'), 'utf8'), 'e2e-3', 'the last group to take a label keeps it');

    assert.match(result.next, /^\{cli\} attach /);
    assert.equal(exitCodeFor(result), 0);
    const comment = commentBody(assertPublishable(record, []));
    assert.ok(comment.includes(`Instance settings \`${ORG_LABEL}\` (declared by \`${CHOOSE_ORG}\`): 1 of 1 passed.`));
    assert.ok(comment.includes(`Instance settings \`${MFA_LABEL}\` (declared by \`${COMPLETE_MFA}\`): 2 of 2 passed.`));
    assert.equal(comment.includes('Instance settings `standard`'), false);

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
    assert.equal(commentBody(assertPublishable(record, [])).includes('Instance settings'), false);
  });

  it('opens the Platform credential before it leases a device when the run will change settings', async () => {
    const w = world();
    await w.deps().instances.ensure({ willChange: false }, () => undefined);
    await assert.rejects(runVerb(w.deps({}), RUN_ALL), (error: VerifyFailure) => error.code === 'KEYS_MISSING');
    assert.equal(w.workspace.readLease('ios'), null, 'a credential that is gone stops the run before a device is leased, not between two groups');
    assert.equal(w.lines.includes('device leased'), false);

    w.lines.length = 0;
    await runVerb(w.deps(), RUN_ALL);
    const opened = w.lines.findIndex((line) => line.startsWith('clerk   Platform API: '));
    assert.ok(opened >= 0 && opened < w.lines.indexOf('device leased'), w.lines.join('\n'));
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
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'USAGE' && error.message === `${SETUP_MFA} changed while the run was in progress` && error.fix.startsWith('rerun'));
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'passed choose-organization.e2e.ts', 'failed complete-setup-mfa.e2e.ts (not run)', 'failed setup-mfa.e2e.ts (not run)']);
    assert.deepEqual(record.settings[2], { label: MFA_LABEL, askedBy: COMPLETE_MFA, specs: [COMPLETE_MFA, SETUP_MFA], application: null, changed: false, held: false, e2eReport: null });
    assert.equal(w.invocations().length, 2);
    assert.equal(w.clerk.live()[0]!.environment['user_settings.sign_up.mfa.required'], false, 'the settings of a plan that no longer matches the file were never applied');
  });

  it('fails the group of a spec file edited while its settings were being applied, before e2e runs it, and still runs the next', async () => {
    const w = world();
    w.hooks.push((line) => {
      if (line.startsWith('settings changing ') && line.endsWith(`to ${ORG_LABEL}, which ${CHOOSE_ORG} declares`)) writeFileSync(join(w.dir, CHOOSE_ORG), specSource(MFA));
    });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'USAGE' && error.message === `${CHOOSE_ORG} changed while the run was in progress` && error.fix.startsWith('rerun'));
    const record = w.lastRecord();
    assert.deepEqual(w.invocations().map((invocation) => invocation.specs), [[AUTH_START, SIGN_UP], [COMPLETE_MFA, SETUP_MFA]], 'e2e never ran the file under the settings of its old text');
    assert.deepEqual(statuses(record.results), ['passed auth-start.e2e.ts', 'passed complete.e2e.ts', 'failed choose-organization.e2e.ts (not run)', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.deepEqual(record.settings.map((group) => [group.application !== null, group.changed, group.held, group.e2eReport !== null]), [[true, false, true, true], [true, true, false, false], [true, true, true, true]]);
    assert.deepEqual(w.workspace.unclosedEntries().filter((entry) => entry.kind === 'application').length, 1);
  });

  it('fails the group of a spec file edited while e2e was running it, though e2e reported a pass, and still runs the next', async () => {
    const w = world();
    writeFileSync(join(w.dir, 'fake-e2e.json'), JSON.stringify({ edit: join(w.dir, AUTH_START) }));
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.code === 'USAGE' && error.message === `${AUTH_START} changed while the run was in progress` && error.fix.startsWith('rerun'));
    const record = w.lastRecord();
    assert.deepEqual(statuses(record.results), ['failed auth-start.e2e.ts (not run)', 'failed complete.e2e.ts (not run)', 'passed choose-organization.e2e.ts', 'passed complete-setup-mfa.e2e.ts', 'passed setup-mfa.e2e.ts']);
    assert.deepEqual(record.settings.map((group) => [group.application !== null, group.held, group.e2eReport !== null]), [[true, true, true], [true, true, true], [true, true, true]]);
    assert.equal(w.invocations().length, 3);
    notPublishable(w);
  });

  it('keeps in the run directory the text each group was planned from, not what the file holds later', async () => {
    const w = world();
    w.hooks.push((line) => {
      if (line.startsWith('instances ')) writeFileSync(join(w.dir, CHOOSE_ORG), specSource(MFA));
    });
    await assert.rejects(runVerb(w.deps(), RUN_ALL), (error: VerifyFailure) => error.message === `${CHOOSE_ORG} changed while the run was in progress`);
    const run = w.workspace.runDir(w.workspace.runs().at(-1)!);
    assert.equal(readFileSync(join(run, CHOOSE_ORG), 'utf8'), specSource(FORCED_ORG));
    assert.equal(readFileSync(join(run, AUTH_START), 'utf8'), specSource(null));
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
