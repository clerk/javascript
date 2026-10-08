import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { startBroker } from '../src/core/broker.ts';
import { TEST_PHONES, createClerkBackends, newTestEmail } from '../src/core/clerk.ts';
import type { ExecResult, Runner } from '../src/core/exec.ts';
import { compareEnvironment, flattenEnvironment } from '../src/core/instances/settings.ts';
import { createInstances } from '../src/core/instances/instances.ts';
import { createPlatform, deadlineOf, describeCredential, throwawayApplication, throwawayName } from '../src/core/instances/platform.ts';
import { STANDARD, STANDARD_ENVIRONMENT_KEY, STANDARD_FILE, SettingsRefused, planGroups, standardFile, type SettingsGroup } from '../src/core/instances/settings.ts';
import { openApplications } from '../src/core/instances/throwaway.ts';
import { withoutClerkKeys } from '../src/core/keys.ts';
import { finishOrphanLedgers } from '../src/core/ledgers.ts';
import { createOutput, takePlatformKey } from '../src/core/cli.ts';
import { Secret, redact } from '../src/core/secret.ts';
import { down, type Deps } from '../src/core/verbs.ts';
import { newEntryId, newRunId, openWorkspace, takeSlotLock } from '../src/core/workspace.ts';
import { RETRYABLE, VerifyFailure, type DeviceBackend, type HostAdapter, type InstanceSettings, type InstanceView, type LocalLease, type PublishableKey, type ScratchPath } from '../src/core/types.ts';
import { PLATFORM_KEY, PLATFORM_SCOPES, SECRET_KEY_SCOPE, WORKSPACE, fakeClerk, type FakeClerkOptions } from '../testing/fake-clerk.ts';

const T0 = Date.parse('2026-10-05T12:00:00Z');
const HOUR = 3_600_000;
const host = { repo: 'clerk-ios', platforms: ['ios'] } as unknown as HostAdapter;

const MFA: InstanceSettings = { config: { auth_multi_factor: { required_for_sign_up: true } }, environment: { 'user_settings.sign_up.mfa.required': true } };
const FORCED_ORG: InstanceSettings = { config: { organization_settings: { force_organization_selection: true } }, environment: { 'organization_settings.force_organization_selection': true } };
const MFA_LABEL = 'auth_multi_factor.required_for_sign_up=true';
const ORG_LABEL = 'organization_settings.force_organization_selection=true';
const MFA_BODY = { ...standardFile().config, auth_multi_factor: { ...(standardFile().config.auth_multi_factor as object), required_for_sign_up: true } };
const MFA_SPEC = 'specs/golden/session-tasks/setup-mfa.e2e.ts';
const MFA_FILE = 'specs/golden/session-tasks/setup-mfa.settings.json';
const ORG_SPEC = 'specs/golden/session-tasks/choose-organization.e2e.ts';
const STANDARD_SPEC = 'specs/golden/auth-start/auth-start.e2e.ts';

const groupOf = (declared: InstanceSettings | null, path: string): SettingsGroup =>
  planGroups([{ spec: { kind: 'golden', path, feature: null }, source: "test('x', () => {});\n", declaration: declared === null ? null : JSON.stringify(declared) }], null)[0]!;
const keyRefused = (error: VerifyFailure): boolean =>
  error.code === 'NOT_READY' &&
  error.message === "api.clerk.com answered 401 to the instance's own secret key; the likely cause is a cloud environment whose API credential for api.clerk.com has no path prefix, so it replaces the key on every request to that host" &&
  error.fix === 'set Path prefixes on that credential to /v1/platform/, so it is attached to Platform API calls only, then rerun';
const standardGroup = groupOf(null, STANDARD_SPEC);
const mfaGroup = groupOf(MFA, MFA_SPEC);
const orgGroup = groupOf(FORCED_ORG, ORG_SPEC);

const idOf = (view: InstanceView | undefined): string | null => view?.id ?? null;
const quiet = () => undefined;
const NOTHING_NEW = { willChange: false } as const;

const noOp: Runner = async () => ({ code: 127, stdout: '', stderr: 'spawn op ENOENT' });
const REFERENCE = 'op://fake-vault/fake-item/credential';
const REFERENCE_SHAPE = 'op://<vault>/<item>/credential';
const namesTheItem = (text: string): boolean => [REFERENCE, 'fake-vault', 'fake-item'].some((part) => text.includes(part));
const opAnswers = (read: ExecResult): Runner => async (_command, args) => (args[0] === '--version' ? { code: 0, stdout: '2.30.0', stderr: '' } : read);

function world(options: { readonly env?: Record<string, string>; readonly clerk?: FakeClerkOptions; readonly runner?: Runner; readonly dir?: string; readonly home?: string; readonly shared?: ReturnType<typeof fakeClerk> } = {}) {
  const dir = options.dir ?? mkdtempSync(join(tmpdir(), 'verify-instances-'));
  const clock = { at: T0 };
  const clerk = options.shared ?? fakeClerk({ now: () => clock.at, ...options.clerk });
  const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: options.home ?? join(dir, 'home') });
  const lines: string[] = [];
  const slept: number[] = [];
  const env = options.env ?? { CLERK_PLATFORM_API_KEY: PLATFORM_KEY };
  const alive = new Set<number>();
  const open = (pid = 1000, fetchImpl: typeof fetch = clerk.fetch) =>
    createInstances({
      workspace,
      env,
      runner: options.runner ?? noOp,
      progress: (line) => lines.push(line),
      fetch: fetchImpl,
      sleep: async (ms) => {
        slept.push(ms);
        clock.at += ms;
      },
      now: () => clock.at,
      drivers: { self: { pid, startedAt: T0 }, isRunning: (driver) => alive.has(driver.pid) },
    });
  const say = (line: string) => void lines.push(line);
  return { dir, clock, clerk, workspace, lines, slept, env, alive, open, say, instances: open() };
}

type World = ReturnType<typeof world>;

const LEAVES = Object.keys(standardFile().environment).length;

const platformCalls = (w: World) => w.clerk.platformRequests().map((request) => `${request.method} ${request.url.replace('api.clerk.com/v1/platform', '').split('?')[0]!.replace(/app_\w+/, '{app}').replace(/ins_\w+/, '{ins}')}`);
const writes = (w: World) => w.clerk.platformRequests().filter((request) => request.method !== 'GET').map((request) => `${request.method} ${request.url.replace('api.clerk.com/v1/platform', '').replace(/\/instances\/ins_\w+/, '')}`);
const patches = (w: World) => w.clerk.platformRequests().filter((request) => request.method === 'PATCH');
const instancesDir = (w: World) => join(w.workspace.root, 'instances');
const stateOf = (w: World, name: string) => JSON.parse(readFileSync(join(instancesDir(w), `${name}.state.json`), 'utf8')) as { environmentKey?: string; settings?: { key: string; label: string; askedBy: string | null }; drivers: { pid: number }[] };

const sentSince = (w: World, before: number): string[] => w.clerk.platformRequests().slice(before).map((request) => `${request.method} ${request.url.replace('api.clerk.com/v1/platform', '')}`);
const secretKeyReads = (w: World): ReturnType<World['clerk']['platformRequests']> => w.clerk.platformRequests().filter((request) => request.url.endsWith('?include_secret_keys=true'));
const readOf = (application: { readonly id: string }): string => `GET /applications/${application.id}?include_secret_keys=true`;

function filesHolding(w: World, value: string): string[] {
  const under = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? under(join(dir, entry.name)) : readFileSync(join(dir, entry.name), 'utf8').includes(value) ? [join(dir, entry.name)] : []));
  return under(w.dir).sort();
}

function plantedApplication(w: World, random: string, secretKey?: string) {
  const application = w.clerk.plant(throwawayName(new Date(T0 + 6 * HOUR), random), secretKey);
  w.workspace.append({ id: newEntryId(), kind: 'application', name: application.name, workspace: WORKSPACE });
  mkdirSync(instancesDir(w), { recursive: true });
  return application;
}

function heldWithoutState(w: World, random: string, secretKey?: string) {
  const application = plantedApplication(w, random, secretKey);
  writeFileSync(join(instancesDir(w), `${application.name}.json`), `${JSON.stringify({ application: application.id, instanceId: application.instanceId, publishableKey: application.pk })}\n`, { mode: 0o600 });
  return application;
}

describe('comparing a public environment with the standard file', () => {
  it('pins the settings a spec cannot run without, which no config key sets', () => {
    const { environment } = standardFile();
    for (const leaf of ['auth_config.test_mode', 'auth_config.native_settings.api_enabled', 'user_settings.attributes.ticket.enabled', 'user_settings.actions.create_organization']) assert.equal(environment[leaf], true, leaf);
  });

  it('reports each expected leaf that differs or is absent, and nothing about a leaf it was not asked for', () => {
    const live = { auth_config: { test_mode: false, reverification: false, brand_new: 1 } };
    const compared = compareEnvironment({ 'auth_config.test_mode': true, 'auth_config.reverification': false, 'auth_config.single_session_mode': false, toString: true }, live);
    assert.equal(compared.compared, 4);
    assert.deepEqual(compared.differing, [
      { path: 'auth_config.test_mode', expected: true, found: false },
      { path: 'auth_config.single_session_mode', expected: false, found: undefined },
      { path: 'toString', expected: true, found: undefined },
    ]);
  });

  it('reads a list of plain values as one leaf whatever its order', () => {
    assert.deepEqual(flattenEnvironment({ a: ['b', 'a'], c: [{ d: 1 }] }), { a: ['a', 'b'], 'c[0].d': 1 });
  });
});

describe('throwaway names', () => {
  it('carry the deadline, and only names this tool made parse', () => {
    const name = throwawayName(new Date('2026-10-06T03:12:59Z'), '9c1f04ab');
    assert.equal(name, 'verify-throwaway-until-20261006t0312z-9c1f04ab');
    assert.equal(deadlineOf(name)?.toISOString(), '2026-10-06T03:12:00.000Z');
    assert.equal(deadlineOf('verify-throwaway-9c1f04ab77e2'), null);
    assert.equal(deadlineOf('my-app-until-20261006t0312z-9c1f04ab'), null);
  });
});

describe('platform credential', () => {
  const open = (env: Record<string, string>, clerk: FakeClerkOptions = {}, runner: Runner = noOp) => {
    const fake = fakeClerk(clerk);
    const lines: string[] = [];
    const ran: string[][] = [];
    const platform = createPlatform({ env, runner: (command, args, options) => (ran.push([command, ...args]), runner(command, args, options)), progress: (line) => lines.push(line), fetch: fake.fetch, sleep: async () => undefined });
    return { fake, lines, ran, platform };
  };
  const op = opAnswers;
  const referenced = { VERIFY_PLATFORM_KEY_REFERENCE: REFERENCE };
  const readsOf = (ran: readonly string[][]) => ran.filter((command) => command[1] === 'read');

  it('uses the environment variable and asks 1Password nothing', async () => {
    const { fake, ran, platform } = open({ CLERK_PLATFORM_API_KEY: PLATFORM_KEY });
    const workspace = await platform.open();
    assert.equal(workspace.credential.via, 'environment');
    assert.equal(workspace.workspace, WORKSPACE);
    assert.deepEqual(fake.requests.map((r) => `${r.method} ${r.url}`), ['GET api.clerk.com/v1/platform/me', 'GET api.clerk.com/v1/platform/applications']);
    assert.deepEqual(ran, []);
  });

  it('fails on a set variable that does not work, with no fall-through', async () => {
    const { ran, platform } = open({ CLERK_PLATFORM_API_KEY: 'ak_someOtherKey' }, { attachesKey: false });
    await assert.rejects(platform.open(), (error: VerifyFailure) => error.code === 'KEYS_MISSING' && /CLERK_PLATFORM_API_KEY is set/.test(error.message));
    assert.deepEqual(ran, []);
  });

  it('reads the key from a private file, and refuses one other users can read', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-key-'));
    const file = join(dir, 'key');
    writeFileSync(file, `${PLATFORM_KEY}\n`, { mode: 0o600 });
    assert.equal((await open({ CLERK_PLATFORM_API_KEY_FILE: file }).platform.open()).credential.via, 'environment');
    chmodSync(file, 0o644);
    await assert.rejects(open({ CLERK_PLATFORM_API_KEY_FILE: file }).platform.open(), (error: VerifyFailure) => error.fix === `chmod 600 ${file}`);
  });

  it('holds no key when something outside the machine attaches one', async () => {
    const { fake, ran, platform } = open({}, { attachesKey: true });
    const workspace = await platform.open();
    assert.equal(workspace.credential.via, 'proxy');
    assert.ok(fake.requests.every((request) => request.authorization === null), 'this process sent no Authorization header');
    assert.deepEqual(ran, [], '1Password is not asked when the proxy already works');
  });

  it('asks 1Password last, once, by reference, and never says what the reference is', async () => {
    const { ran, lines, platform } = open(referenced, {}, op({ code: 0, stdout: PLATFORM_KEY, stderr: '' }));
    const workspace = await platform.open();
    await platform.open();
    assert.deepEqual(Object.keys(workspace.credential).sort(), ['key', 'via']);
    assert.equal(describeCredential(workspace.credential), '1Password');
    assert.deepEqual(readsOf(ran), [['op', 'read', '--no-newline', REFERENCE]], 'one read for the whole process');
    assert.equal(ran.flat().includes(PLATFORM_KEY), false, 'the key is never an argument');
    assert.deepEqual(lines, ['wait    reading the team key from 1Password; approve the request in the 1Password app within 60s']);
  });

  it('prints no line that holds the reference when a command reads the key from 1Password', async () => {
    const w = world({ env: referenced, runner: op({ code: 0, stdout: PLATFORM_KEY, stderr: '' }) });
    const up = await w.instances.ensure(NOTHING_NEW, w.say);
    assert.ok(w.lines.includes(`instances 1Password reaches the verification workspace ${WORKSPACE}`));
    assert.ok(w.lines.length > 1);
    assert.deepEqual([...w.lines, JSON.stringify(up)].filter(namesTheItem), []);
  });

  it('never runs op when no reference is set, and says how to set one without naming the item', async () => {
    const unset: readonly Record<string, string>[] = [{}, { VERIFY_PLATFORM_KEY_REFERENCE: '  ' }];
    for (const env of unset) {
      const { ran, platform } = open(env, {}, op({ code: 0, stdout: PLATFORM_KEY, stderr: '' }));
      await assert.rejects(platform.open(), (error: VerifyFailure) => {
        assert.equal(error.code, 'KEYS_MISSING');
        assert.equal(error.message, 'no Clerk Platform API credential works here (CLERK_PLATFORM_API_KEY and CLERK_PLATFORM_API_KEY_FILE are not set; a request with no key gets 401 authorization_header_format_invalid, so nothing outside this machine attaches one; no 1Password reference is set)');
        assert.equal(
          error.fix,
          `on a Mac, with the 1Password CLI installed and its desktop app integration on, set VERIFY_PLATFORM_KEY_REFERENCE to the 1Password secret reference of the item that holds the team key, of the shape ${REFERENCE_SHAPE}; in a cloud environment, add an API credential for api.clerk.com with path prefix /v1/platform/; anywhere, set CLERK_PLATFORM_API_KEY to the team key, or CLERK_PLATFORM_API_KEY_FILE to a file that holds it and that only you can read`,
        );
        return true;
      });
      assert.deepEqual(ran, []);
    }
  });

  it('refuses a reference that is not an op:// reference, naming where it was and not what it was', async () => {
    const { ran, platform } = open({ VERIFY_PLATFORM_KEY_REFERENCE: 'Fake Vault/fake item/credential' }, {}, op({ code: 0, stdout: PLATFORM_KEY, stderr: '' }));
    await assert.rejects(platform.open(), (error: VerifyFailure) => {
      assert.equal(error.code, 'USAGE');
      assert.equal(error.message, 'VERIFY_PLATFORM_KEY_REFERENCE does not hold a 1Password secret reference');
      assert.equal(error.fix, `put a reference of the shape ${REFERENCE_SHAPE} there, or remove it`);
      return true;
    });
    assert.deepEqual(ran, []);
  });

  it('does not fail over a malformed reference when a source it tries before 1Password works', async () => {
    const malformed = { VERIFY_PLATFORM_KEY_REFERENCE: 'Fake Vault/fake item/credential' };
    const keyed = open({ ...malformed, CLERK_PLATFORM_API_KEY: PLATFORM_KEY });
    assert.equal((await keyed.platform.open()).credential.via, 'environment');
    const proxied = open(malformed, { attachesKey: true });
    assert.equal((await proxied.platform.open()).credential.via, 'proxy');
    assert.deepEqual([...keyed.ran, ...proxied.ran], []);
  });

  it('treats a missing op as no credential, and an unapproved read as an error', async () => {
    await assert.rejects(open(referenced).platform.open(), (error: VerifyFailure) => error.code === 'KEYS_MISSING' && /op\) is not installed/.test(error.message) && error.fix.startsWith('on a Mac, install the 1Password CLI and turn on its desktop app integration; ') && !namesTheItem(error.fix));
    await assert.rejects(open(referenced, {}, op({ code: 124, stdout: '', stderr: '' })).platform.open(), (error: VerifyFailure) => error.message === 'op read of the 1Password item the reference names was not approved within 60s');
    await assert.rejects(open(referenced, {}, op({ code: 1, stdout: '', stderr: '[ERROR] authorization denied\nmore' })).platform.open(), (error: VerifyFailure) => error.message.endsWith('failed: [ERROR] authorization denied'));
  });

  it('does not print the reference, the vault, or the item when op repeats them in its error', async () => {
    const reference = 'op://vault-only-here/item-only-here/credential';
    const stderr = `[ERROR] could not read secret '${reference}': "item-only-here" isn't an item in the "vault-only-here" vault\n`;
    const { platform } = open({ VERIFY_PLATFORM_KEY_REFERENCE: reference }, {}, op({ code: 1, stdout: '', stderr }));
    const failure = await platform.open().then(() => assert.fail('the read failed'), (error: VerifyFailure) => error);
    assert.equal(failure.message, 'op read of the 1Password item the reference names failed: [ERROR] could not read secret \'<redacted>\': "<redacted>" isn\'t an item in the "<redacted>" vault');
    let printed = '';
    const sink = { write: (text: string) => ((printed += text), true) };
    const output = createOutput(false, '/tmp', 'bin/control-x', sink, sink);
    output.failure(failure);
    output.progress(`op said ${stderr}`);
    assert.equal(printed.includes(reference), false, 'the reference is a secret to every line the CLI prints');
    assert.match(printed, /op said \[ERROR\] could not read secret '<redacted>'/);
  });

  it('calls a key from 1Password that fails the key in the item the reference names', async () => {
    const elsewhere = open(referenced, { workspace: 'org_someRealWorkspace' }, op({ code: 0, stdout: PLATFORM_KEY, stderr: '' }));
    await assert.rejects(elsewhere.platform.open(), (error: VerifyFailure) => error.message.startsWith('the key in the 1Password item the reference names belongs to workspace org_someRealWorkspace') && error.fix === 'use the team key; a key of any other workspace is refused');
    const stale = open(referenced, {}, op({ code: 0, stdout: 'ak_noLongerWorks', stderr: '' }));
    await assert.rejects(stale.platform.open(), (error: VerifyFailure) => error.message === "Clerk's Platform API answered 401 could_not_authenticate_request to the key in the 1Password item the reference names" && !namesTheItem(`${error.message} ${error.fix}`));
  });

  it('refuses a key of any other workspace before it lists or creates anything', async () => {
    const { fake, platform } = open({ CLERK_PLATFORM_API_KEY: PLATFORM_KEY }, { workspace: 'org_someRealWorkspace' });
    await assert.rejects(platform.open(), (error: VerifyFailure) => error.code === 'KEYS_MISSING' && error.message.includes('org_someRealWorkspace') && error.message.includes(WORKSPACE));
    assert.deepEqual(fake.requests.map((r) => r.url), ['api.clerk.com/v1/platform/me']);
  });

  it('refuses a workspace that holds an application without the prefix', async () => {
    const { fake, platform } = open({ CLERK_PLATFORM_API_KEY: PLATFORM_KEY });
    fake.plant('Production Dashboard');
    await assert.rejects(platform.open(), (error: VerifyFailure) => error.code === 'NOT_READY' && /does not start with verify-throwaway-/.test(error.message) && !error.message.includes('Production Dashboard'));
    assert.ok(fake.requests.every((request) => request.method === 'GET'));
  });

  it('checks the workspace again before a create that comes long after the last check', async () => {
    let at = T0;
    const fake = fakeClerk({ now: () => at });
    const platform = createPlatform({ env: { CLERK_PLATFORM_API_KEY: PLATFORM_KEY }, runner: noOp, progress: () => undefined, fetch: fake.fetch, now: () => at });
    const workspace = await platform.open();
    await workspace.create(throwawayName(new Date(T0 + HOUR), 'aaaaaaaa'));
    assert.equal(fake.requests.length, 3, 'a create right after the check adds one request');
    at += 60_000;
    fake.plant('Someone Else');
    await assert.rejects(workspace.create(throwawayName(new Date(T0 + HOUR), 'bbbbbbbb')), /does not start with verify-throwaway-/);
    assert.equal(fake.live().length, 2, 'nothing was created after the workspace changed');
  });

  it('waits out a rate limit for as long as Clerk asks, then succeeds', async () => {
    const fake = fakeClerk();
    const waits: number[] = [];
    const lines: string[] = [];
    const platform = createPlatform({ env: { CLERK_PLATFORM_API_KEY: PLATFORM_KEY }, runner: noOp, progress: (line) => lines.push(line), fetch: fake.fetch, sleep: async (ms) => void waits.push(ms) });
    fake.rateLimit(2, '7');
    await platform.open();
    assert.deepEqual(waits, [7000, 7000]);
    assert.equal(lines.filter((line) => line.startsWith('wait    Clerk\'s Platform API is rate limiting')).length, 2);
    fake.rateLimit(1);
    waits.length = 0;
    await (await platform.open()).list();
    assert.deepEqual(waits, [2000], 'with no Retry-After it backs off on its own schedule');
    fake.rateLimit(1, '3600');
    waits.length = 0;
    await (await platform.open()).list();
    assert.deepEqual(waits, [60_000], 'and never sleeps longer than a minute on Clerk\'s word');
  });

  it('gives up on a rate limit that does not lift, with an error a caller may retry', async () => {
    const fake = fakeClerk();
    const platform = createPlatform({ env: { CLERK_PLATFORM_API_KEY: PLATFORM_KEY }, runner: noOp, progress: () => undefined, fetch: fake.fetch, sleep: async () => undefined });
    fake.rateLimit(50);
    await assert.rejects(platform.open(), (error: VerifyFailure) => error.code === 'RATE_LIMITED' && RETRYABLE.has(error.code));
    assert.ok(fake.requests.length > 1 && fake.requests.length <= 10, `it retried a bounded number of times (${fake.requests.length} requests)`);
  });

  it('refuses a list that is not one array, because a partial list would hide what the workspace holds', async () => {
    for (const shape of ['envelope', 'unreadable'] as const) {
      const { fake, platform } = open({ CLERK_PLATFORM_API_KEY: PLATFORM_KEY });
      fake.plant(throwawayName(new Date(T0), 'aaaaaaaa'));
      fake.plant('Production Dashboard');
      fake.state.listShape = shape;
      fake.state.pageSize = 1;
      await assert.rejects(platform.open(), /no longer has a shape this tool can read in full/, shape);
      assert.ok(fake.requests.every((request) => request.method === 'GET'));
    }
  });

  it('checks the workspace again before a delete that comes long after the last check', async () => {
    let at = T0;
    const fake = fakeClerk({ now: () => at });
    const platform = createPlatform({ env: { CLERK_PLATFORM_API_KEY: PLATFORM_KEY }, runner: noOp, progress: () => undefined, fetch: fake.fetch, now: () => at });
    const workspace = await platform.open();
    const created = await workspace.create(throwawayName(new Date(T0 + HOUR), 'aaaaaaaa'));
    at += 60_000;
    fake.plant('Someone Else');
    await assert.rejects(workspace.delete(created.application), /does not start with verify-throwaway-/);
    assert.equal(fake.live().length, 2, 'nothing was deleted after the workspace changed');
  });

  it('cannot be asked to delete a name without the prefix', () => {
    assert.throws(() => throwawayApplication('app_1', 'Production Dashboard'), /lacks the verify-throwaway- prefix/);
  });
});

describe('what Clerk says to a config change', () => {
  const opened = async () => {
    const fake = fakeClerk();
    const platform = createPlatform({ env: { CLERK_PLATFORM_API_KEY: PLATFORM_KEY }, runner: noOp, progress: quiet, fetch: fake.fetch, sleep: async () => undefined });
    const workspace = await platform.open();
    const created = await workspace.create(throwawayName(new Date(T0 + HOUR), 'aaaaaaaa'));
    return { fake, workspace, created };
  };

  it('answers with the whole object of each key the body named, and a dry run changes nothing', async () => {
    const { fake, workspace, created } = await opened();
    const dry = await workspace.configure(created, MFA.config, { dryRun: true });
    assert.deepEqual(dry.after, { auth_multi_factor: { required_for_sign_up: true } });
    assert.equal(fake.live()[0]!.environment['user_settings.sign_up.mfa.required'], false);
    await workspace.configure(created, standardFile().config);
    const real = await workspace.configure(created, MFA.config);
    assert.deepEqual(real.after, { auth_multi_factor: { ...(standardFile().config.auth_multi_factor as object), required_for_sign_up: true } }, 'a PATCH merges into what the instance has');
    assert.equal(fake.live()[0]!.environment['user_settings.sign_up.mfa.required'], true);
  });

  it('turns a refused body into a refusal that names the key when Clerk names it', async () => {
    const { fake, workspace, created } = await opened();
    fake.state.refusals.push({ path: 'auth_email.no_such_toggle', status: 400, code: 'unknown_config_key', param: 'auth_email.no_such_toggle', message: 'is not a config key' });
    await assert.rejects(workspace.configure(created, { auth_email: { no_such_toggle: true } }), (error: SettingsRefused) => error instanceof SettingsRefused && error.code === 'INSTANCE_MISCONFIGURED' && error.param === 'auth_email.no_such_toggle' && error.said === 'auth_email.no_such_toggle (400 unknown_config_key): is not a config key');
    fake.state.refusals.push({ path: 'auth_attack_protection.pii_protection_enabled', value: false, status: 409, code: 'user_settings_invalid', message: 'the settings are not valid together' });
    await assert.rejects(workspace.configure(created, { auth_attack_protection: { pii_protection_enabled: false } }), (error: SettingsRefused) => error instanceof SettingsRefused && error.param === null && error.said === '409 user_settings_invalid: the settings are not valid together');
    fake.state.refusals.push({ path: 'compliance.legal_consent.enabled', value: true, status: 422, code: 'form_param_missing', param: ['terms_of_service_url', 'privacy_policy_url'], message: 'is required' });
    await assert.rejects(workspace.configure(created, { compliance: { legal_consent: { enabled: true } } }), (error: SettingsRefused) => error instanceof SettingsRefused && error.param === 'terms_of_service_url' && error.said === 'terms_of_service_url (422 form_param_missing): is required', 'any 4xx that is about the body is a refusal, and a code two errors share is said once');
    assert.deepEqual(fake.live()[0]!.config, {}, 'a refused body applied nothing');
  });

  it('reads a 4xx that names a parameter as a refusal of the body whatever its status, except a rate limit', async () => {
    const { fake, workspace, created } = await opened();
    for (const status of [401, 403, 404, 408]) {
      fake.state.refusals = [{ path: 'auth_email.no_such_toggle', status, code: 'form_param_unknown', param: 'no_such_toggle', message: 'is unknown' }];
      await assert.rejects(workspace.configure(created, { auth_email: { no_such_toggle: true } }), (error: SettingsRefused) => error instanceof SettingsRefused && error.param === 'no_such_toggle' && error.said === `no_such_toggle (${status} form_param_unknown): is unknown`, String(status));
      fake.state.refusals = [{ path: 'auth_email.no_such_toggle', status, code: 'not_about_the_body', message: 'names no parameter' }];
      await assert.rejects(workspace.configure(created, { auth_email: { no_such_toggle: true } }), (error: VerifyFailure) => !(error instanceof SettingsRefused) && error.code === 'NOT_READY' && error.message.includes(`answered ${status} not_about_the_body`), String(status));
    }
    fake.state.refusals = [{ path: 'auth_email.no_such_toggle', status: 429, code: 'too_many_requests', param: 'no_such_toggle', message: 'slow down' }];
    await assert.rejects(workspace.configure(created, { auth_email: { no_such_toggle: true } }), (error: VerifyFailure) => !(error instanceof SettingsRefused) && error.code === 'RATE_LIMITED');
  });

  it('keeps an outage, a rate limit, and a credential problem what they were', async () => {
    const { fake, workspace, created } = await opened();
    fake.state.failConfigure = 1;
    await assert.rejects(workspace.configure(created, MFA.config), (error: VerifyFailure) => !(error instanceof SettingsRefused) && error.code === 'NOT_READY' && /answered 500/.test(error.message));
    fake.rateLimit(50);
    await assert.rejects(workspace.configure(created, MFA.config), (error: VerifyFailure) => !(error instanceof SettingsRefused) && error.code === 'RATE_LIMITED');
    fake.rateLimit(0);
    fake.live()[0]!.deleted = true;
    await assert.rejects(workspace.configure(created, MFA.config), (error: VerifyFailure) => !(error instanceof SettingsRefused) && /answered 404/.test(error.message), 'an application that is gone is not a refused declaration');
  });
});

describe('one throwaway application', () => {
  it('is created by up, put on the whole standard config with one PATCH, and recorded', async () => {
    const w = world();
    const up = await w.instances.ensure(NOTHING_NEW, w.say);
    const application = w.clerk.live()[0]!;
    assert.deepEqual(up, [{ id: application.id, name: application.name, created: true, settings: 'standard' }]);
    assert.deepEqual(platformCalls(w), ['GET /me', 'GET /applications', 'POST /applications', 'PATCH /applications/{app}/instances/{ins}/config']);
    assert.deepEqual(patches(w)[0]!.body, standardFile().config);
    assert.equal(deadlineOf(application.name)?.getTime(), T0 + 6 * HOUR);
    assert.ok(w.lines.includes(`instance creating ${application.name} in ${WORKSPACE}`));
    assert.ok(w.lines.includes(`instance ${application.id}  up in 0.0s on standard, ${LEAVES} settings match ${STANDARD_FILE}`), w.lines.join('\n'));
    assert.deepEqual(stateOf(w, application.name), { environmentKey: STANDARD_ENVIRONMENT_KEY, settings: STANDARD, drivers: [] });
    assert.equal(w.instances.recordedKey(), STANDARD.key);
  });

  it('asks the Platform API only for the secret key when it is already up, and says what it is on', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const before = w.clerk.platformRequests().length;
    const again = await w.open().ensure(NOTHING_NEW, w.say);
    assert.deepEqual(sentSince(w, before), ['GET /me', readOf(w.clerk.live()[0]!)], 'the credential is checked, the key is read, and the applications are not listed');
    assert.deepEqual(again.map((view) => [view.created, view.settings]), [[false, 'standard']]);
    assert.ok(w.lines.includes('instances this worktree already holds throwaway instances'));
  });

  it('opens the credential when the run will change settings, though nothing needs creating', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const before = w.clerk.platformRequests().length;
    await w.open().ensure({ willChange: true }, quiet);
    assert.deepEqual(sentSince(w, before), ['GET /me', readOf(w.clerk.live()[0]!), 'GET /applications'], 'a missing credential or a 1Password prompt would have come here, before any device is leased');
    const noCredential = (): ReturnType<typeof createInstances> => createInstances({ workspace: w.workspace, env: {}, runner: noOp, progress: quiet, fetch: w.clerk.fetch });
    const sent = w.clerk.requests.length;
    await assert.rejects(noCredential().access(), (error: VerifyFailure) => error.code === 'KEYS_MISSING', 'the secret key is on no disk, so a held application needs the credential too, and up and run ask for it before they lease a device');
    for (const options of [{ willChange: true }, NOTHING_NEW]) await assert.rejects(noCredential().ensure(options, quiet), (error: VerifyFailure) => error.code === 'KEYS_MISSING');
    assert.deepEqual(w.clerk.requests.slice(sent).map((request) => `${request.authorization === null ? 'no key' : 'a key'} ${request.method} ${request.url}`), Array.from({ length: 3 }, () => 'no key GET api.clerk.com/v1/platform/me'), 'nothing but the question of whether a key is attached outside this machine');
  });

  it('writes the name to the ledger before the create call, so a lost answer is still deleted', async () => {
    const w = world();
    w.clerk.state.loseCreateAnswer = true;
    await assert.rejects(w.instances.ensure(NOTHING_NEW, quiet), /answered 500/);
    const [entry] = openApplications(w.workspace);
    assert.equal(w.clerk.live()[0]?.name, entry?.name, 'Clerk has the application and the ledger has its name');
    assert.equal('instance' in (entry ?? {}), false, 'a new entry names no instance');
    w.clerk.state.loseCreateAnswer = false;
    const finished = await w.open().finish(w.workspace, { keepApplications: false }, quiet);
    assert.deepEqual(finished, [{ name: entry?.name }]);
    assert.equal(w.clerk.live().length, 0);
    assert.deepEqual(openApplications(w.workspace), []);
  });

  it('replaces an application whose keys were lost instead of leaking it', async () => {
    const w = world();
    w.clerk.state.loseCreateAnswer = true;
    await assert.rejects(w.instances.ensure(NOTHING_NEW, quiet));
    w.clerk.state.loseCreateAnswer = false;
    const lost = w.clerk.live()[0]!.id;
    const up = await w.open().ensure(NOTHING_NEW, w.say);
    assert.deepEqual(w.clerk.live().map((a) => a.id), [idOf(up[0])]);
    assert.notEqual(idOf(up[0]), lost);
    assert.equal(openApplications(w.workspace).length, 1);
    assert.ok(w.lines.some((line) => line.includes('retired (its keys are lost)')));
  });

  it('recovers from a crash between create and configure by configuring the same application again', async () => {
    const w = world();
    w.clerk.state.failConfigure = 1;
    await assert.rejects(w.instances.ensure(NOTHING_NEW, quiet), /configuring verify-throwaway-/);
    const created = w.clerk.live()[0]!;
    assert.equal(created.environment['user_settings.password_settings.min_length'], 15, 'still as Clerk made it');
    assert.equal(w.open().recordedKey(), null);
    const up = await w.open().ensure(NOTHING_NEW, w.say);
    assert.deepEqual(up.map((view) => [idOf(view), view.created]), [[created.id, false]]);
    assert.equal(w.clerk.applications.length, 1, 'no second application');
    assert.equal(created.environment['user_settings.password_settings.min_length'], 8);
    assert.ok(w.lines.includes(`settings changing ${created.id} from unknown settings to standard, because what it is on is not recorded`));
    assert.ok(w.lines.some((line) => line.startsWith(`settings standard  on ${created.id} in 0.0s (Clerk answered in 0.00s, the instance showed it 0.00s later), ${LEAVES} settings match`)));
  });

  it('fails when a required setting does not show after the PATCH', async () => {
    const w = world();
    w.clerk.state.ignoreConfigKey = 'auth_config.single_session_mode';
    await assert.rejects(w.instances.ensure(NOTHING_NEW, quiet), (error: VerifyFailure) => error.code === 'INSTANCE_MISCONFIGURED' && !(error instanceof SettingsRefused) && error.message.includes(`does not match ${STANDARD_FILE}`) && error.message.includes('auth_config.single_session_mode is true, and the file says false'));
    assert.ok(w.slept.length > 0, 'it waited for the setting to take effect before failing');
    assert.equal(openApplications(w.workspace).length, 1, 'the application stays in the ledger for down');
    assert.equal(w.open().recordedKey(), null, 'and nothing records it as being on the standard settings');
  });

  it('compares the required settings and the declared ones, and nothing else the instance shows', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, w.say);
    const application = w.clerk.live()[0]!;
    assert.ok(w.lines.includes(`instance ${application.id}  up in 0.0s on standard, ${LEAVES} settings match ${STANDARD_FILE}`));
    application.environment['auth_config.reverification'] = false;
    const applied = await w.instances.apply(mfaGroup, w.say);
    assert.equal(await applied.stillApplied(), true, 'a setting that nothing requires and no spec declared does not fail a run');
    await applied.release();
    assert.equal((await w.open().ensure(NOTHING_NEW, quiet)).length, 1);
    assert.equal(patches(w).length, 2, 'and it causes no repair');
    assert.ok(w.lines.some((line) => line.startsWith(`settings ${MFA_LABEL}  on ${application.id}`) && line.endsWith(`${LEAVES} settings match`)));
  });

  it('compares a leaf a declaration names though the standard file does not list it', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const application = w.clerk.live()[0]!;
    w.clerk.state.alsoMoves = { 'auth_config.reverification': false };
    const declared: InstanceSettings = { config: MFA.config, environment: { ...MFA.environment, 'auth_config.reverification': false } };
    const applied = await w.instances.apply(groupOf(declared, MFA_SPEC), w.say);
    assert.ok(w.lines.some((line) => line.startsWith(`settings ${MFA_LABEL}  on ${application.id}`) && line.endsWith(`${LEAVES + 1} settings match`)), 'the declared leaf is one of the settings compared');
    assert.equal(await applied.stillApplied(), true);
    application.environment['auth_config.reverification'] = true;
    assert.equal(await applied.stillApplied(), false);
  });

  it('never writes a keys file over one that is there', async () => {
    const w = world();
    const first = 'the first write\n';
    let cachedKeys = '';
    const writeFirst = (line: string) => {
      const creating = /^instance creating (\S+) in /.exec(line);
      if (creating === null) return;
      cachedKeys = join(instancesDir(w), `${creating[1]}.json`);
      mkdirSync(instancesDir(w), { recursive: true });
      writeFileSync(cachedKeys, first);
    };
    await assert.rejects(w.instances.ensure(NOTHING_NEW, writeFirst), { code: 'EEXIST' });
    assert.equal(readFileSync(cachedKeys, 'utf8'), first);
    assert.deepEqual(filesHolding(w, w.clerk.live()[0]!.sk), [], 'and the secret key of the application it could not record is on no disk');
  });

  it('creates a new application when Clerk no longer serves the old one', async () => {
    const w = world();
    const first = await w.instances.ensure(NOTHING_NEW, quiet);
    w.clerk.live()[0]!.deleted = true;
    const second = await w.open().ensure(NOTHING_NEW, w.say);
    assert.notEqual(idOf(second[0]), idOf(first[0]));
    assert.equal(openApplications(w.workspace).length, 1);
    assert.ok(w.lines.includes(`instance ${idOf(first[0])} retired (Clerk no longer serves it)`));
  });

  it('replaces an application whose deadline is near, before a run starts on it', async () => {
    const w = world();
    const first = await w.instances.ensure(NOTHING_NEW, quiet);
    w.clock.at = T0 + 6 * HOUR - 20 * 60_000;
    const second = await w.open().ensure(NOTHING_NEW, w.say);
    assert.notEqual(idOf(second[0]), idOf(first[0]));
    assert.deepEqual(w.clerk.live().map((a) => a.id), [idOf(second[0])], 'the old one was deleted, not left for the reaper');
    assert.ok(w.lines.some((line) => line.includes('its deadline is near')));
  });

  it('replaces an application that holds 60 of the 100 users a development instance allows', async () => {
    const w = world();
    const first = await w.instances.ensure(NOTHING_NEW, quiet);
    w.clerk.live()[0]!.users = 59;
    assert.equal(idOf((await w.open().ensure(NOTHING_NEW, quiet))[0]), idOf(first[0]), '59 users is still room for a run');
    w.clerk.live()[0]!.users = 60;
    const second = await w.open().ensure(NOTHING_NEW, w.say);
    assert.notEqual(idOf(second[0]), idOf(first[0]));
    assert.deepEqual(w.clerk.live().map((a) => a.id), [idOf(second[0])]);
    assert.ok(w.lines.includes(`instance ${idOf(first[0])} retired (it holds 60 of the 100 users a development instance allows)`));
  });

  it('deletes an application it retires by its id when the listing it holds was taken before the application existed', async () => {
    const w = world();
    const first = await w.instances.ensure(NOTHING_NEW, quiet);
    w.clerk.live()[0]!.users = 60;
    const stale = (async (input: string | URL, init?: RequestInit) => ((init?.method ?? 'GET') === 'GET' && String(input).endsWith('/platform/applications') ? new Response('[]', { status: 200 }) : w.clerk.fetch(input, init))) as typeof fetch;
    const second = await w.open(1000, stale).ensure(NOTHING_NEW, w.say);
    assert.ok(w.lines.includes(`instance ${idOf(first[0])} retired (it holds 60 of the 100 users a development instance allows)`));
    assert.deepEqual(w.clerk.live().map((a) => a.id), [idOf(second[0])], 'the retired application is gone from Clerk, not only from the ledger');
  });

  it('does not treat a Frontend API error as a deleted application', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const broken = (async (input: string | URL, init?: RequestInit) => (String(input).includes('.clerk.accounts.dev') ? new Response('bad gateway', { status: 502 }) : w.clerk.fetch(input, init))) as typeof fetch;
    await assert.rejects(w.open(1000, broken).ensure(NOTHING_NEW, quiet), /answered 502/);
    assert.equal(w.clerk.live().length, 1);
  });

  it('sets the deadline by Clerk\'s clock when this machine\'s clock is wrong', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-instances-'));
    const clerk = fakeClerk({ now: () => T0 });
    const instances = createInstances({ workspace: openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') }), env: { CLERK_PLATFORM_API_KEY: PLATFORM_KEY }, runner: noOp, progress: quiet, fetch: clerk.fetch, now: () => T0 - 5 * HOUR });
    await instances.ensure(NOTHING_NEW, quiet);
    assert.equal(deadlineOf(clerk.live()[0]!.name)?.getTime(), T0 + 6 * HOUR);
  });

  it('fails with the likely cause and the fix when api.clerk.com refuses the own key of a new application, asks once, and keeps the application for down', async () => {
    const w = world();
    w.clerk.state.refuseInstanceKeys = true;
    await assert.rejects(w.instances.ensure(NOTHING_NEW, quiet), keyRefused);
    assert.equal(openApplications(w.workspace).length, 1, 'the application stays in the ledger for down');
    assert.deepEqual(w.clerk.requests.filter((request) => request.url.startsWith('api.clerk.') && !request.url.startsWith('api.clerk.com/v1/platform/')).map((request) => request.url), ['api.clerk.com/v1/users/count'], 'one call, to api.clerk.com, and none to another name of the API');
  });

  it('creates no application to apply a group, because only up and the start of a run create one', async () => {
    const w = world();
    await assert.rejects(w.instances.apply(mfaGroup, quiet), (error: VerifyFailure) => error.code === 'NOT_READY' && error.message === 'this worktree holds no application to put on the settings of a group' && error.fix === '{cli} up');
    assert.deepEqual(w.clerk.requests, []);
  });

  it('rejects a lifetime shorter than a session can last', async () => {
    const w = world({ env: { CLERK_PLATFORM_API_KEY: PLATFORM_KEY, VERIFY_THROWAWAY_HOURS: '0' } });
    await assert.rejects(w.instances.ensure(NOTHING_NEW, quiet), (error: VerifyFailure) => error.code === 'USAGE');
    assert.equal(w.clerk.applications.length, 0);
  });

  it('serves keys only while an instance is applied', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    assert.throws(() => w.instances.keys(), (error: VerifyFailure) => error.code === 'NOT_READY' && /no instance is applied/.test(error.message));
    assert.throws(() => w.instances.clerk(), /no instance is applied/);
    const applied = await w.instances.apply(standardGroup, quiet);
    assert.equal(w.instances.keys().pk, w.clerk.live()[0]!.pk);
    assert.equal(await w.instances.clerk().userCount(), 0);
    await assert.rejects(w.instances.apply(mfaGroup, quiet), /still applied/, 'one run drives on one instance at a time');
    await applied.release();
    assert.throws(() => w.instances.keys(), /no instance is applied/);
  });

  it('keeps the record and the state in private files, writes the record once, and keeps the platform key nowhere', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, w.say);
    const dir = instancesDir(w);
    const { name } = w.clerk.live()[0]!;
    const record = join(dir, `${name}.json`);
    const written = { bytes: readFileSync(record, 'utf8'), inode: statSync(record).ino };
    for (const group of [mfaGroup, orgGroup, standardGroup]) await (await w.instances.apply(group, w.say)).release();
    await w.open().ensure({ willChange: true }, w.say);
    assert.deepEqual({ bytes: readFileSync(record, 'utf8'), inode: statSync(record).ino }, written, 'the record is written once');
    assert.deepEqual(readdirSync(dir).sort(), [`${name}.json`, `${name}.state.json`], 'no staging file is left behind');
    for (const file of readdirSync(dir).map((each) => join(dir, each))) assert.equal(statSync(file).mode & 0o777, 0o600, file);
    assert.equal(statSync(dir).mode & 0o777, 0o700);
    assert.equal(w.lines.join('\n').includes(PLATFORM_KEY), false);
    assert.deepEqual(filesHolding(w, PLATFORM_KEY), []);
    assert.equal(redact(`leaked ${PLATFORM_KEY}`), 'leaked <redacted>', 'a used platform key is redacted from any output line');
  });

  it('keeps the secret key of its application in no file of the worktree or the home, from the create to the down', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, w.say);
    const { name, sk, pk } = w.clerk.live()[0]!;
    assert.deepEqual(filesHolding(w, sk), [], 'after the application is created');
    for (const group of [mfaGroup, standardGroup]) {
      const applied = await w.instances.apply(group, w.say);
      assert.equal(await w.instances.clerk().userCount(), 0, 'the run used the key');
      await applied.release();
    }
    assert.deepEqual(filesHolding(w, sk), [], 'after a run in the command that created it');
    const run = w.open();
    await run.ensure(NOTHING_NEW, w.say);
    const applied = await run.apply(mfaGroup, w.say);
    assert.equal(await run.clerk().userCount(), 0, 'a run in a later command used the key it read from Clerk');
    await applied.release();
    assert.deepEqual(filesHolding(w, sk), [], 'after a run in a later command');
    const later = w.open();
    await later.ensure({ willChange: true }, w.say);
    await later.doctorChecks({ live: false }, w.say);
    assert.deepEqual(filesHolding(w, sk), [], 'after another up and doctor');
    assert.equal(w.lines.join('\n').includes(sk), false);
    const record = JSON.parse(readFileSync(join(instancesDir(w), `${name}.json`), 'utf8')) as Record<string, unknown>;
    assert.deepEqual(record, { application: w.clerk.live()[0]!.id, instanceId: w.clerk.live()[0]!.instanceId, publishableKey: pk });
    await w.open().finish(w.workspace, { keepApplications: false }, quiet);
    assert.deepEqual(filesHolding(w, sk), [], 'after down');
  });

  it('reads the secret key from the Platform API into a value that output redacts', async () => {
    const w = world();
    const unseen = 'sk_test_readFromClerkAndHeldInMemoryOnly';
    const application = heldWithoutState(w, 'aaaaaaaa', unseen);
    assert.equal(redact(`Bearer ${unseen}`), `Bearer ${unseen}`, 'nothing has read it yet');
    const up = await w.open().ensure(NOTHING_NEW, quiet);
    assert.deepEqual(up.map((view) => [idOf(view), view.created]), [[application.id, false]], 'the Backend API took the key that was read');
    assert.equal(redact(`Bearer ${unseen}`), 'Bearer <redacted>');
    assert.deepEqual(filesHolding(w, unseen), []);
  });

  it('reads the secret key once in a command, however many calls use it, and again in the next command', async () => {
    const w = world();
    const application = heldWithoutState(w, 'aaaaaaaa');
    const command = w.open();
    await command.ensure({ willChange: true }, quiet);
    for (const group of [standardGroup, mfaGroup, orgGroup]) {
      const applied = await command.apply(group, quiet);
      await command.clerk().userCount();
      await command.clerk().findUserId(newTestEmail(newRunId(), 1));
      await applied.release();
    }
    await command.doctorChecks({ live: false }, quiet);
    assert.deepEqual(secretKeyReads(w).map((request) => `${request.method} ${request.url.replace('api.clerk.com/v1/platform', '')}`), [readOf(application)]);
    assert.ok(w.clerk.requests.filter((request) => request.url.startsWith('api.clerk.com/v1/users')).length >= 7, 'while the Backend API was called with it many times');
    await w.open().doctorChecks({ live: false }, quiet);
    assert.equal(secretKeyReads(w).length, 2, 'the next command holds nothing from the last one');
  });

  it('reads no secret key in the command that creates the application, because the create answer carries it', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const applied = await w.instances.apply(mfaGroup, quiet);
    await w.instances.clerk().userCount();
    await applied.release();
    assert.deepEqual(secretKeyReads(w), []);
  });

  it('reads no secret key for a down, a dry look at what is held, or an application another run drives', async () => {
    const w = world();
    const application = heldWithoutState(w, 'aaaaaaaa');
    assert.equal(w.open().recordedKey(), null);
    const otherRun = 2000;
    w.alive.add(otherRun);
    writeFileSync(join(instancesDir(w), `${application.name}.state.json`), `${JSON.stringify({ environmentKey: STANDARD_ENVIRONMENT_KEY, settings: STANDARD, drivers: [{ pid: otherRun, startedAt: T0 }] })}\n`);
    await w.open().ensure(NOTHING_NEW, quiet);
    await assert.rejects(w.open().apply(standardGroup, quiet), { code: 'DEVICE_BUSY' });
    await w.open().finish(w.workspace, { keepApplications: true }, quiet);
    await w.open().finish(w.workspace, { keepApplications: false }, quiet);
    assert.deepEqual(secretKeyReads(w), []);
    assert.equal(w.clerk.live().length, 0);
  });

  it('fails with the scope by name when the Platform API key may not read secret keys, and falls back to nothing on disk', async () => {
    const w = world();
    const application = heldWithoutState(w, 'aaaaaaaa');
    w.clerk.state.scopes = PLATFORM_SCOPES.filter((scope) => scope !== SECRET_KEY_SCOPE);
    const missingScope = (error: VerifyFailure): boolean =>
      error.code === 'KEYS_MISSING' &&
      error.message === `the Platform API key lacks the scope ${SECRET_KEY_SCOPE}, which reading the secret key of ${application.name} needs (403 authorization_missing_scopes)` &&
      error.fix === `add ${SECRET_KEY_SCOPE} to the Platform API key; the secret key of an application is kept on no disk, so each command that needs it reads it from Clerk`;
    await assert.rejects(w.open().ensure(NOTHING_NEW, quiet), missingScope);
    await assert.rejects(w.open().apply(standardGroup, quiet), missingScope);
    const api = (await w.open().doctorChecks({ live: false }, quiet)).find((check) => check.id === 'clerk-api')!;
    assert.deepEqual([api.ok, api.detail, api.fix], [false, `the Platform API key lacks the scope ${SECRET_KEY_SCOPE}, which reading the secret key of ${application.name} needs (403 authorization_missing_scopes)`, `add ${SECRET_KEY_SCOPE} to the Platform API key; the secret key of an application is kept on no disk, so each command that needs it reads it from Clerk`]);
    assert.deepEqual(filesHolding(w, application.sk), [], 'the secret key is in no file');
    assert.deepEqual(w.clerk.requests.filter((request) => request.url.startsWith('api.clerk.com/v1/users')), [], 'no call went to the Backend API');
    assert.deepEqual(writes(w), [], 'the application was neither deleted nor replaced');
    assert.deepEqual(openApplications(w.workspace).map((entry) => entry.name), [application.name]);
    w.clerk.state.scopes = PLATFORM_SCOPES;
    assert.deepEqual((await w.open().ensure(NOTHING_NEW, quiet)).map((view) => [idOf(view), view.created]), [[application.id, false]], 'with the scope, the same application serves again');
  });

  it('reports any other refusal of the secret key as the Platform API reports the rest', async () => {
    const w = world();
    const application = heldWithoutState(w, 'aaaaaaaa');
    const answering = (status: number, body: unknown): typeof fetch => (async (input: string | URL, init?: RequestInit) => (String(input).endsWith('?include_secret_keys=true') ? new Response(JSON.stringify(body), { status }) : w.clerk.fetch(input, init))) as typeof fetch;
    await assert.rejects(
      w.open(1000, answering(500, { errors: [{ code: 'internal' }] })).ensure(NOTHING_NEW, quiet),
      (error: VerifyFailure) => error.code === 'NOT_READY' && error.message === `Clerk's Platform API answered 500 internal to reading the secret key of ${application.name}` && error.fix === 'rerun; if it repeats, run `{cli} doctor`',
    );
    await assert.rejects(
      w.open(1000, answering(200, { application_id: application.id, instances: [{ environment_type: 'development', instance_id: application.instanceId, publishable_key: application.pk }] })).ensure(NOTHING_NEW, quiet),
      (error: VerifyFailure) => error.code === 'NOT_READY' && error.message === `Clerk's answer about ${application.name} carries no secret key of a development instance`,
    );
    assert.deepEqual(writes(w), []);
  });

  it('names the scopes Clerk reports as missing when it refuses the read, and the secret key scope when Clerk names none', async () => {
    const w = world();
    const application = heldWithoutState(w, 'aaaaaaaa');
    const refusing = (meta: unknown): typeof fetch =>
      (async (input: string | URL, init?: RequestInit) =>
        String(input).endsWith('?include_secret_keys=true') ? new Response(JSON.stringify({ errors: [{ code: 'authorization_missing_scopes', ...(meta === undefined ? {} : { meta }) }] }), { status: 403 }) : w.clerk.fetch(input, init)) as typeof fetch;
    const lacking = (named: string, added: string) => (error: VerifyFailure): boolean =>
      error.code === 'KEYS_MISSING' &&
      error.message === `the Platform API key lacks ${named}, which reading the secret key of ${application.name} needs (403 authorization_missing_scopes)` &&
      error.fix === `add ${added} to the Platform API key; the secret key of an application is kept on no disk, so each command that needs it reads it from Clerk`;
    await assert.rejects(w.open(1000, refusing({ scopes: ['applications:read'] })).ensure(NOTHING_NEW, quiet), lacking('the scope applications:read', 'applications:read'));
    await assert.rejects(
      w.open(1000, refusing({ scopes: ['applications:read', SECRET_KEY_SCOPE] })).ensure(NOTHING_NEW, quiet),
      lacking(`the scopes applications:read and ${SECRET_KEY_SCOPE}`, `applications:read and ${SECRET_KEY_SCOPE}`),
    );
    for (const meta of [undefined, { scopes: [] }, { scopes: 'all' }]) await assert.rejects(w.open(1000, refusing(meta)).ensure(NOTHING_NEW, quiet), lacking(`the scope ${SECRET_KEY_SCOPE}`, SECRET_KEY_SCOPE));
  });
});

describe('putting the application on the settings a group declares', () => {
  it('drives three groups on one application with one create and three PATCHes in all', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, w.say);
    const application = w.clerk.live()[0]!;
    const seen: (readonly [string, boolean, unknown, unknown])[] = [];
    for (const group of [standardGroup, mfaGroup, orgGroup]) {
      const applied = await w.instances.apply(group, w.say);
      assert.deepEqual(applied.instance, { id: application.id, name: application.name });
      assert.equal(applied.keys.pk, application.pk);
      seen.push([group.settings.label, applied.changed, application.environment['user_settings.sign_up.mfa.required'], application.environment['organization_settings.force_organization_selection']]);
      assert.equal(await applied.stillApplied(), true);
      await applied.release();
    }
    assert.deepEqual(seen, [['standard', false, false, false], [MFA_LABEL, true, true, false], [ORG_LABEL, true, false, true]], 'the next group returns what the last one changed to standard');
    assert.deepEqual(writes(w), ['POST /applications', `PATCH /applications/${application.id}/config`, `PATCH /applications/${application.id}/config`, `PATCH /applications/${application.id}/config`]);
    assert.equal(w.clerk.applications.length, 1, 'never a second application');
    assert.deepEqual(patches(w)[1]!.body, MFA_BODY);
    assert.deepEqual((patches(w)[2]!.body as { auth_multi_factor: unknown }).auth_multi_factor, standardFile().config.auth_multi_factor, 'the body is always the whole standard config with the declaration laid over it');
    assert.deepEqual(stateOf(w, application.name).settings, orgGroup.settings);
    assert.ok(w.lines.includes(`settings standard  already on ${application.id}`));
    assert.ok(w.lines.includes(`settings changing ${application.id} from standard to ${MFA_LABEL}, which ${MFA_SPEC} declares`));
    assert.ok(w.lines.includes(`settings ${MFA_LABEL}  on ${application.id} in 0.0s (Clerk answered in 0.00s, the instance showed it 0.00s later), ${LEAVES} settings match`));
    assert.ok(w.lines.includes(`settings changing ${application.id} from ${MFA_LABEL} to ${ORG_LABEL}, which ${ORG_SPEC} declares`));
  });

  it('returns to standard for the first spec of a standard group, and a later run finds the settings recorded', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const id = w.clerk.live()[0]!.id;
    await (await w.instances.apply(mfaGroup, quiet)).release();
    const later = w.open();
    assert.equal(later.recordedKey(), mfaGroup.settings.key);
    assert.deepEqual((await later.ensure(NOTHING_NEW, quiet)).map((view) => view.settings), [MFA_LABEL], 'up leaves the settings alone and says what they are');
    const before = patches(w).length;
    await (await later.apply(mfaGroup, w.say)).release();
    assert.equal(patches(w).length, before, 'the same settings again cost no PATCH');
    await (await later.apply(standardGroup, w.say)).release();
    assert.ok(w.lines.includes(`settings changing ${id} from ${MFA_LABEL} to standard, for ${STANDARD_SPEC}`));
    assert.equal(w.clerk.live()[0]!.environment['user_settings.sign_up.mfa.required'], false);
  });

  it('sends the PATCH again after a crash between the PATCH and the record', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const application = w.clerk.live()[0]!;
    let patched = false;
    const dying = (async (input: string | URL, init?: RequestInit) => {
      if (patched && String(input).includes('.clerk.accounts.dev')) throw new Error('the process died here');
      patched ||= init?.method === 'PATCH';
      return w.clerk.fetch(input, init);
    }) as typeof fetch;
    await assert.rejects(w.open(1000, dying).apply(mfaGroup, quiet), /the process died here/);
    assert.equal(application.environment['user_settings.sign_up.mfa.required'], true, 'Clerk applied the change');
    assert.equal(stateOf(w, application.name).settings, undefined, 'and nothing records it');
    const before = patches(w).length;
    await (await w.open().apply(mfaGroup, w.say)).release();
    assert.equal(patches(w).length, before + 1);
    assert.ok(w.lines.includes(`settings changing ${application.id} from unknown settings to ${MFA_LABEL}, which ${MFA_SPEC} declares`));
    assert.equal(w.open().recordedKey(), mfaGroup.settings.key);
  });

  it('repairs recorded settings that the live environment contradicts', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const application = w.clerk.live()[0]!;
    application.environment['user_settings.sign_up.mfa.required'] = true;
    await w.open().ensure(NOTHING_NEW, w.say);
    assert.ok(w.lines.includes(`settings changing ${application.id} from standard to standard, because it no longer shows standard`));
    assert.equal(application.environment['user_settings.sign_up.mfa.required'], false);

    await (await w.open().apply(mfaGroup, quiet)).release();
    application.environment['user_settings.sign_up.mfa.required'] = false;
    const before = patches(w).length;
    const applied = await w.open().apply(mfaGroup, quiet);
    assert.equal(patches(w).length, before + 1, 'a record is trusted only after the live environment agrees');
    assert.notEqual(applied.changed, null);
    assert.equal(application.environment['user_settings.sign_up.mfa.required'], true);
  });

  it('says after a group whether the settings still hold', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const applied = await w.instances.apply(mfaGroup, quiet);
    assert.equal(await applied.stillApplied(), true);
    const { environment } = w.clerk.live()[0]!;
    environment['user_settings.sign_up.mfa.required'] = false;
    assert.equal(await applied.stillApplied(), false);
    environment['user_settings.sign_up.mfa.required'] = true;
    assert.equal(await applied.stillApplied(), true);
    environment['auth_config.test_mode'] = false;
    assert.equal(await applied.stillApplied(), false, 'a required setting that no longer holds counts too');
  });

  it('never retires an application over a torn or missing state file, and repairs it instead', async () => {
    for (const damage of ['torn', 'missing'] as const) {
      const w = world();
      await w.instances.ensure(NOTHING_NEW, quiet);
      const application = w.clerk.live()[0]!;
      const stateFile = join(instancesDir(w), `${application.name}.state.json`);
      if (damage === 'torn') writeFileSync(stateFile, '{"settings":{"key":"');
      else rmSync(stateFile);
      const keys = readFileSync(join(instancesDir(w), `${application.name}.json`), 'utf8');
      assert.equal(w.open().recordedKey(), null, damage);
      const up = await w.open().ensure(NOTHING_NEW, quiet);
      assert.deepEqual(up.map((view) => [idOf(view), view.created]), [[application.id, false]], damage);
      assert.deepEqual(writes(w).slice(1), [`PATCH /applications/${application.id}/config`, `PATCH /applications/${application.id}/config`], `${damage}: one PATCH to create it and one to repair it, and no delete`);
      assert.equal(readFileSync(join(instancesDir(w), `${application.name}.json`), 'utf8'), keys, damage);
      assert.equal(w.open().recordedKey(), STANDARD.key, damage);
    }
  });

  it('treats a record made against another standard file as no record', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const name = w.clerk.live()[0]!.name;
    writeFileSync(join(instancesDir(w), `${name}.state.json`), JSON.stringify({ settings: { ...STANDARD, key: '000000000000' }, drivers: [] }));
    assert.equal(w.open().recordedKey(), null);
  });

  it('returns an application recorded against another standard environment to the standard settings, and does not fail on what that file expected', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const application = w.clerk.live()[0]!;
    const OTHER_RUN = 4242;
    writeFileSync(join(instancesDir(w), `${application.name}.state.json`), JSON.stringify({ environmentKey: '000000000000', settings: STANDARD, drivers: [{ pid: OTHER_RUN, startedAt: T0 }] }));
    assert.equal(w.open().recordedKey(), null, 'what the application is on is unknown');

    w.alive.add(OTHER_RUN);
    const before = patches(w).length;
    await w.open().ensure(NOTHING_NEW, quiet);
    assert.equal(patches(w).length, before, 'the run recorded as driving on it is still believed');

    w.alive.clear();
    await w.open().ensure(NOTHING_NEW, w.say);
    assert.ok(w.lines.includes(`settings changing ${application.id} from unknown settings to standard, because what it is on is not recorded`));
    assert.deepEqual(stateOf(w, application.name), { environmentKey: STANDARD_ENVIRONMENT_KEY, settings: STANDARD, drivers: [{ pid: OTHER_RUN, startedAt: T0 }] });
  });

  it('moves an application whose state file is lost straight to the declared settings, with one request', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const application = w.clerk.live()[0]!;
    rmSync(join(instancesDir(w), `${application.name}.state.json`));
    const before = patches(w).length;
    await (await w.open().apply(mfaGroup, quiet)).release();
    assert.deepEqual(patches(w).slice(before).map((patch) => patch.body), [MFA_BODY], 'the body is the whole standard config with the declaration laid over it, so nothing has to come first');
    assert.deepEqual(stateOf(w, application.name).settings, mfaGroup.settings);
    assert.equal(application.environment['user_settings.sign_up.mfa.required'], true);
  });

  it('drives and deletes an application the worktree holds with no state file, without creating one', async () => {
    const w = world();
    const old = heldWithoutState(w, 'aaaaaaaa');
    const instances = w.open();
    const up = await instances.ensure(NOTHING_NEW, w.say);
    assert.deepEqual(up.map((view) => [idOf(view), view.created, view.settings]), [[old.id, false, 'standard']]);
    const applied = await instances.apply(mfaGroup, quiet);
    assert.equal(applied.instance.id, old.id);
    await applied.release();
    const finished = await w.open().finish(w.workspace, { keepApplications: false }, quiet);
    assert.deepEqual(finished.map((application) => application.name), [old.name]);
    assert.equal(w.clerk.live().length, 0);
    assert.equal(writes(w).some((call) => call.startsWith('POST')), false, 'no create');
    assert.deepEqual(readdirSync(instancesDir(w)), []);
  });
});

describe('two runs in one worktree', () => {
  const FIRST = 1000;
  const SECOND = 2000;

  it('refuses a second run while the first still drives, on any settings, and makes no second application', async () => {
    const w = world();
    const first = w.open(FIRST);
    await first.ensure(NOTHING_NEW, quiet);
    const held = await first.apply(mfaGroup, quiet);
    w.alive.add(FIRST);
    const application = w.clerk.live()[0]!;
    const second = w.open(SECOND);
    await second.ensure({ willChange: true }, quiet);
    const before = w.clerk.platformRequests().length;
    for (const group of [orgGroup, mfaGroup, standardGroup]) {
      await assert.rejects(
        second.apply(group, quiet),
        (error: VerifyFailure) =>
          error.code === 'DEVICE_BUSY' &&
          RETRYABLE.has(error.code) &&
          error.message === `another run in this worktree (pid ${FIRST}) is driving on ${application.id}, and a worktree has one application, which serves one run at a time` &&
          error.fix === 'let that run finish, then rerun',
        group.settings.label,
      );
    }
    assert.equal(w.clerk.platformRequests().length, before, 'it asked the Platform API for nothing: no second application, no change of settings');
    assert.equal(w.clerk.applications.length, 1);
    assert.deepEqual(stateOf(w, application.name).drivers.map((driver) => driver.pid), [FIRST]);
    assert.equal(await held.stillApplied(), true, 'the first run still has its settings');
    assert.throws(() => second.keys(), /no instance is applied/);

    await held.release();
    await assert.rejects(second.apply(orgGroup, quiet), { code: 'DEVICE_BUSY' }, 'between two groups of the first run the application is still its own');
    await first.stopDriving();
    const own = await second.apply(orgGroup, quiet);
    assert.deepEqual(own.instance, { id: application.id, name: application.name }, 'once the first run has ended, the second drives on the same application');
  });

  it('takes over the application of a run that died', async () => {
    const w = world();
    const first = w.open(FIRST);
    await first.ensure(NOTHING_NEW, quiet);
    await first.apply(mfaGroup, quiet);
    const application = w.clerk.live()[0]!;
    assert.deepEqual(stateOf(w, application.name).drivers, [{ pid: FIRST, startedAt: T0 }]);
    const own = await w.open(SECOND).apply(orgGroup, quiet);
    assert.deepEqual(own.instance, { id: application.id, name: application.name });
    assert.equal(w.clerk.applications.length, 1);
    assert.deepEqual(stateOf(w, application.name).drivers.map((driver) => driver.pid), [SECOND], 'a dead driver counts as nobody');
  });

  it('keeps driving on the application it checked when it started, though its deadline comes within the hour meanwhile', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    w.clock.at = T0 + 6 * HOUR - 20 * 60_000;
    for (const group of [mfaGroup, mfaGroup, orgGroup]) await (await w.instances.apply(group, quiet)).release();
    assert.equal(w.clerk.applications.length, 1, 'a run that started with more than an hour left ends before a reap can come');
  });

  it('waits for the lock another command in the worktree holds before it ensures, applies, or stops driving', async () => {
    const w = world();
    mkdirSync(join(w.workspace.root, 'locks'), { recursive: true });
    const whileLocked = async <T>(what: string, start: () => Promise<T>, untouched: () => void): Promise<T> => {
      const unlock = await takeSlotLock(join(w.workspace.root, 'locks', 'instances'), 0, () => new VerifyFailure('NOT_READY', 'the lock is taken', ''));
      w.lines.length = 0;
      let settled = false;
      const pending = start().finally(() => (settled = true));
      while (!settled && !w.lines.includes(`wait    another {cli} in this worktree (pid ${process.pid}) is creating, changing, or deleting instances; waiting for it, with no time limit`)) await new Promise((resolve) => setTimeout(resolve, 5));
      assert.equal(settled, false, `${what} went ahead while the lock was held`);
      untouched();
      unlock();
      return pending;
    };

    await whileLocked('ensure', () => w.instances.ensure(NOTHING_NEW, quiet), () => assert.deepEqual(w.clerk.requests, []));
    const application = w.clerk.live()[0]!;
    const applied = await whileLocked('apply', () => w.instances.apply(mfaGroup, quiet), () => assert.equal(patches(w).length, 1, 'only the PATCH that put it on the standard file'));
    assert.equal(application.environment['user_settings.sign_up.mfa.required'], true);
    await applied.release();
    await whileLocked('stopDriving', () => w.instances.stopDriving(), () => assert.deepEqual(stateOf(w, application.name).drivers.map((driver) => driver.pid), [1000]));
    assert.deepEqual(stateOf(w, application.name).drivers, []);
  });

  it('leaves an application another run is driving completely alone before a run', async () => {
    const w = world();
    const first = w.open(FIRST);
    await first.ensure(NOTHING_NEW, quiet);
    await first.apply(mfaGroup, quiet);
    w.alive.add(FIRST);
    const application = w.clerk.live()[0]!;
    application.users = 99;
    application.environment['user_settings.sign_up.mfa.required'] = false;
    w.clock.at = T0 + 8 * HOUR;
    const before = writes(w).length;
    const up = await w.open(SECOND).ensure({ willChange: true }, w.say);
    assert.deepEqual(writes(w).slice(before), [], 'not retired near its deadline or its user limit, not repaired, not reaped, not changed');
    assert.deepEqual(up.map((view) => [idOf(view), view.settings]), [[application.id, MFA_LABEL]]);
    assert.equal(application.deleted, false);
  });
});

describe('a declaration Clerk or the instance does not take', () => {
  const ready = async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    return { w, application: w.clerk.live()[0]! };
  };

  it('names the key Clerk refused and the spec that declared it, and leaves the application as it was', async () => {
    const { w, application } = await ready();
    w.clerk.state.refusals.push({ path: 'auth_multi_factor.required_for_sign_up', value: true, status: 400, code: 'unknown_config_key', param: 'auth_multi_factor.required_for_sign_up', message: 'is not a config key' });
    await assert.rejects(
      w.instances.apply(mfaGroup, quiet),
      (error: SettingsRefused) =>
        error instanceof SettingsRefused &&
        error.code === 'INSTANCE_MISCONFIGURED' &&
        error.message === `${MFA_SPEC} declares ${MFA_LABEL}, and Clerk's Platform API refused it: auth_multi_factor.required_for_sign_up (400 unknown_config_key): is not a config key` &&
        error.fix === `correct or remove \`auth_multi_factor.required_for_sign_up\` in \`config\` in ${MFA_FILE}: Clerk says what is wrong with it above.`,
    );
    assert.deepEqual(writes(w).slice(-2), [`PATCH /applications/${application.id}/config`, `PATCH /applications/${application.id}/config?dry_run=true`], 'one dry run of the standard file alone, to see whose fault it is');
    assert.equal(w.instances.recordedKey(), STANDARD.key, 'a refused PATCH applied nothing, so the record stands');
    const before = patches(w).length;
    await (await w.instances.apply(standardGroup, w.say)).release();
    assert.equal(patches(w).length, before, 'and the next group finds its settings without a PATCH');
    assert.throws(() => w.open().keys(), /no instance is applied/);
  });

  it('says to add what Clerk named when the declaration does not set it, and to correct it when the declaration sets it by its last segment', async () => {
    const { w } = await ready();
    const consent: InstanceSettings = { config: { compliance: { legal_consent: { enabled: true } } }, environment: { 'user_settings.sign_up.legal_consent_enabled': true } };
    w.clerk.state.refusals.push({ path: 'compliance.legal_consent.enabled', value: true, status: 422, code: 'form_param_missing', param: ['terms_of_service_url', 'privacy_policy_url'], message: 'is required' });
    await assert.rejects(
      w.instances.apply(groupOf(consent, MFA_SPEC), quiet),
      (error: SettingsRefused) =>
        error instanceof SettingsRefused &&
        error.message === `${MFA_SPEC} declares compliance.legal_consent.enabled=true, and Clerk's Platform API refused it: terms_of_service_url (422 form_param_missing): is required` &&
        error.fix === `add \`terms_of_service_url\` to \`config\` in ${MFA_FILE} (Clerk requires it with what the spec declares), or remove what requires it.`,
    );
    w.clerk.state.refusals.push({ path: 'auth_multi_factor.required_for_sign_up', value: true, status: 422, code: 'form_param_value_invalid', param: 'required_for_sign_up', message: 'is not allowed' });
    await assert.rejects(w.instances.apply(mfaGroup, quiet), (error: SettingsRefused) => error instanceof SettingsRefused && error.fix.startsWith(`correct or remove \`required_for_sign_up\` in \`config\` in ${MFA_FILE}: Clerk says what is wrong with it above.`));
  });

  it('names every declared leaf when Clerk names no key', async () => {
    const { w } = await ready();
    const both: InstanceSettings = { config: { auth_multi_factor: { required_for_sign_up: true }, auth_attack_protection: { pii_protection_enabled: false } }, environment: MFA.environment };
    w.clerk.state.refusals.push({ path: 'auth_attack_protection.pii_protection_enabled', value: false, status: 409, code: 'user_settings_invalid', message: 'the settings are not valid together' });
    await assert.rejects(w.instances.apply(groupOf(both, MFA_SPEC), quiet), (error: SettingsRefused) => error instanceof SettingsRefused && error.message.endsWith('refused it: 409 user_settings_invalid: the settings are not valid together') && error.fix === `Clerk refused these together; remove or correct one of auth_multi_factor.required_for_sign_up, auth_attack_protection.pii_protection_enabled in \`config\` in ${MFA_FILE}.`);
  });

  it('blames the standard file, not the spec, when Clerk refuses the standard file alone too', async () => {
    const { w } = await ready();
    w.clerk.state.refusals.push({ path: 'auth_password.min_length', status: 400, code: 'config_key_body_invalid', param: 'auth_password.min_length', message: 'must be at least 10' });
    await assert.rejects(
      w.instances.apply(mfaGroup, quiet),
      (error: VerifyFailure) =>
        !(error instanceof SettingsRefused) &&
        error.code === 'INSTANCE_MISCONFIGURED' &&
        error.message === `Clerk's Platform API refused the standard settings in ${STANDARD_FILE}: auth_password.min_length (400 config_key_body_invalid): must be at least 10` &&
        error.fix === 'the standard file needs a change of its own; the spec is not at fault',
    );
    const fresh = world();
    fresh.clerk.state.refusals.push({ path: 'auth_password.min_length', status: 400, code: 'config_key_body_invalid', param: 'auth_password.min_length', message: 'must be at least 10' });
    await assert.rejects(fresh.instances.ensure(NOTHING_NEW, quiet), (error: VerifyFailure) => !(error instanceof SettingsRefused) && error.message.startsWith(`Clerk's Platform API refused the standard settings in ${STANDARD_FILE}`));
    assert.equal(writes(fresh).some((call) => call.includes('dry_run')), false, 'the standard file was the body, so no second request is needed');
  });

  it('fails a change that moved a required setting the declaration does not list as soon as two reads agree, and lists it ready to paste', async () => {
    const { w, application } = await ready();
    w.clerk.state.alsoMoves = { 'auth_config.test_mode': false, 'user_settings.sign_up.captcha_enabled': true };
    w.slept.length = 0;
    await assert.rejects(
      w.instances.apply(mfaGroup, quiet),
      (error: SettingsRefused) =>
        error instanceof SettingsRefused &&
        error.message === `${MFA_SPEC} declares ${MFA_LABEL}, and 0.5s after Clerk accepted it on ${application.id} the change moved 2 settings the declaration does not list: "auth_config.test_mode": false, "user_settings.sign_up.captcha_enabled": true` &&
        error.fix === `one setting can move several leaves: add them to \`environment\` in ${MFA_FILE}, as listed`,
    );
    assert.deepEqual(w.slept, [500], 'the second read showed the same as the first, so it did not wait out the 15s');
    assert.equal(w.instances.recordedKey(), null, 'the application is on settings nobody declared, so the next use sends its own');
    w.clerk.state.alsoMoves = {};
    application.environment['auth_config.test_mode'] = true;
    application.environment['user_settings.sign_up.captcha_enabled'] = false;
    const both: InstanceSettings = { config: MFA.config, environment: { ...MFA.environment } };
    await (await w.instances.apply(groupOf(both, MFA_SPEC), quiet)).release();
  });

  it('keeps waiting while a declared leaf does not show, and stops only when two reads in a row show the same rest', async () => {
    const { w, application } = await ready();
    w.clerk.state.ignoreConfigKey = 'user_settings.sign_up.mfa.required';
    w.clerk.state.alsoMoves = { 'auth_config.test_mode': false, 'user_settings.sign_up.captcha_enabled': true };
    let reads = 0;
    let patched = false;
    const slow: typeof fetch = async (input, init) => {
      patched ||= init?.method === 'PATCH';
      if (patched && String(input).endsWith('/v1/environment')) {
        reads += 1;
        if (reads === 3) application.environment['user_settings.sign_up.mfa.required'] = true;
        if (reads === 4) application.environment['user_settings.sign_up.captcha_enabled'] = false;
      }
      return w.clerk.fetch(input, init);
    };
    w.slept.length = 0;
    await assert.rejects(
      w.open(1000, slow).apply(mfaGroup, quiet),
      (error: SettingsRefused) => error instanceof SettingsRefused && error.message === `${MFA_SPEC} declares ${MFA_LABEL}, and 2.0s after Clerk accepted it on ${application.id} the change moved 1 setting the declaration does not list: "auth_config.test_mode": false`,
    );
    assert.equal(reads, 5, 'two reads without the declared leaf, one with it, one where the rest changed, and one that agreed with it');
    assert.deepEqual(w.slept, [500, 500, 500, 500]);
  });

  it('fails a change whose declared leaf never shows after the full wait, naming what the instance shows instead', async () => {
    const { w, application } = await ready();
    w.clerk.state.ignoreConfigKey = 'user_settings.sign_up.mfa.required';
    w.slept.length = 0;
    await assert.rejects(
      w.instances.apply(mfaGroup, quiet),
      (error: SettingsRefused) => error instanceof SettingsRefused && error.message === `${MFA_SPEC} declares ${MFA_LABEL}, and 15.0s after Clerk accepted it on ${application.id} it does not show user_settings.sign_up.mfa.required is false, and the declaration expects true` && error.fix.includes(`\`environment\` in ${MFA_FILE}`),
    );
    assert.equal(w.slept.reduce((sum, ms) => sum + ms, 0), 15_000, 'identical reads that lack a declared leaf are not an answer yet');
  });

  it('says that the instance has no such leaf when a declared leaf is misspelt, and gives a fix for it and for the leaf the change did move', async () => {
    const { w, application } = await ready();
    const misspelt: InstanceSettings = { config: MFA.config, environment: { 'user_settings.sign_up.mfa.requird': true } };
    await assert.rejects(
      w.instances.apply(groupOf(misspelt, MFA_SPEC), quiet),
      (error: SettingsRefused) =>
        error instanceof SettingsRefused &&
        error.message === `${MFA_SPEC} declares ${MFA_LABEL}, and 15.0s after Clerk accepted it on ${application.id} its public environment has no leaf user_settings.sign_up.mfa.requird; and the change moved 1 setting the declaration does not list: "user_settings.sign_up.mfa.required": true` &&
        error.fix === `check the spelling of user_settings.sign_up.mfa.requird under \`environment\` in ${MFA_FILE}; one setting can move several leaves: add them to \`environment\` in ${MFA_FILE}, as listed`,
    );
  });

  it('fails when Clerk accepts a change and its answer does not hold it', async () => {
    const { w } = await ready();
    w.clerk.state.dropFromAfter = 'auth_multi_factor.required_for_sign_up';
    await assert.rejects(w.instances.apply(mfaGroup, quiet), (error: VerifyFailure) => error.code === 'INSTANCE_MISCONFIGURED' && !(error instanceof SettingsRefused) && error.message.includes('its answer does not hold auth_multi_factor.required_for_sign_up=true (it has no such key)'));
  });

  it('blames the declaration when Clerk accepts a declared value and stores another, and the tool when it is a value no declaration set', async () => {
    const { w } = await ready();
    const long: InstanceSettings = { config: { auth_password: { min_length: 200 } }, environment: { 'user_settings.password_settings.min_length': 200 } };
    w.clerk.state.storesInstead = { 'auth_password.min_length': 72 };
    await assert.rejects(
      w.instances.apply(groupOf(long, MFA_SPEC), quiet),
      (error: SettingsRefused) =>
        error instanceof SettingsRefused &&
        error.message === `${MFA_SPEC} declares auth_password.min_length=200, and Clerk stored 72` &&
        error.fix === `correct \`auth_password.min_length\` in \`config\` in ${MFA_FILE} to a value Clerk keeps`,
    );
    assert.equal(w.instances.recordedKey(), null, 'the application is on a value nobody declared, so the next use sends its own settings');
    await assert.rejects(w.instances.apply(mfaGroup, quiet), (error: VerifyFailure) => error.code === 'INSTANCE_MISCONFIGURED' && !(error instanceof SettingsRefused) && error.message.includes('its answer does not hold auth_password.min_length=8 (it has 72)'));
  });

});

describe('finishing a ledger', () => {
  it('deletes every application, confirms each is absent from the list, and is safe to repeat', async () => {
    const w = world();
    heldWithoutState(w, 'aaaaaaaa');
    const killed = heldWithoutState(w, 'bbbbbbbb');
    await w.open().ensure(NOTHING_NEW, quiet);
    writeFileSync(join(instancesDir(w), `${killed.name}.state.json.0a1b2c3d.tmp`), '{}');
    const finished = await w.open().finish(w.workspace, { keepApplications: false }, w.say);
    assert.equal(finished.length, 2);
    assert.equal(w.clerk.live().length, 0);
    assert.deepEqual(w.workspace.unclosedEntries(), []);
    assert.deepEqual(readdirSync(instancesDir(w)), [], 'the record and state files die with the applications, and so does a state file a killed process left half written');
    const calls = platformCalls(w);
    assert.equal(calls.filter((call) => call.startsWith('DELETE')).length, 2);
    assert.equal(calls.at(-1), 'GET /applications', 'the list is read again after the deletes');
    const before = w.clerk.requests.length;
    assert.deepEqual(await w.open().finish(w.workspace, { keepApplications: false }, quiet), []);
    assert.equal(w.clerk.requests.length, before, 'a second finish finds nothing open and asks nothing');
  });

  it('keeps the ledger entries when Clerk still lists the application', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    w.clerk.state.refuseDelete = true;
    await assert.rejects(w.open().finish(w.workspace, { keepApplications: false }, quiet), (error: VerifyFailure) => /could not be deleted/.test(error.message) && error.fix.includes('down again'));
    assert.equal(openApplications(w.workspace).length, 1);
    w.clerk.state.refuseDelete = false;
    await w.open().finish(w.workspace, { keepApplications: false }, quiet);
    assert.equal(w.clerk.live().length, 0);
  });

  it('closes the identities that lived in an application with no Backend API call', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const run = newRunId();
    w.workspace.append({ id: newEntryId(), kind: 'identity', run, email: newTestEmail(run, 1) });
    w.workspace.append({ id: newEntryId(), kind: 'user', run, userId: 'user_1', email: newTestEmail(run, 1) });
    w.workspace.append({ id: newEntryId(), kind: 'phone', run, phone: TEST_PHONES[0]! });

    const before = w.clerk.requests.length;
    await w.open().finish(w.workspace, { keepApplications: false }, quiet);
    assert.deepEqual(w.workspace.unclosedEntries(), [], 'the reserved email, the user, and the reserved phone are all closed');
    assert.deepEqual(w.clerk.requests.slice(before).filter((request) => !request.url.startsWith('api.clerk.com/v1/platform/')), [], 'the users went with the application, so none was looked up or deleted');
  });

  it('refuses an entry made in another workspace and leaves it open', async () => {
    const w = world();
    const name = throwawayName(new Date(T0 + HOUR), 'aaaaaaaa');
    w.workspace.append({ id: newEntryId(), kind: 'application', name, workspace: 'org_elsewhere' });
    await assert.rejects(
      w.instances.finish(w.workspace, { keepApplications: false }, quiet),
      (error: VerifyFailure) => /belong to workspace org_elsewhere, which this credential does not reach/.test(error.message) && error.fix === `${name} belongs to workspace org_elsewhere, which this credential cannot reach; only a credential of that workspace can delete it`,
    );
    assert.equal(openApplications(w.workspace).length, 1);
    assert.ok(w.clerk.requests.every((request) => request.method === 'GET'));
  });

  it('removes the files of an application before it closes the entry, so the next up finishes a kill between the two', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const { name } = w.clerk.live()[0]!;
    const append = w.workspace.append;
    w.workspace.append = (entry) => {
      if (entry.kind === 'done') throw new Error('the process died here');
      append(entry);
    };
    await assert.rejects(w.open().finish(w.workspace, { keepApplications: false }, quiet), /the process died here/);
    w.workspace.append = append;
    assert.deepEqual(readdirSync(instancesDir(w)), [], 'the record is gone, though the entry is still open');
    assert.deepEqual(openApplications(w.workspace).map((entry) => entry.name), [name]);
    await w.open().ensure(NOTHING_NEW, w.say);
    assert.ok(w.lines.includes(`instance ${name} retired (its keys are lost)`));
    assert.equal(openApplications(w.workspace).some((entry) => entry.name === name), false);
  });

  it('still sends the delete when the list does not show an application it has the id for', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    let hidden = true;
    const hiding = (async (input: string | URL, init?: RequestInit) => (hidden && (init?.method ?? 'GET') === 'GET' && String(input).endsWith('/platform/applications') ? new Response('[]', { status: 200 }) : w.clerk.fetch(input, init))) as typeof fetch;
    await w.open(1000, hiding).finish(w.workspace, { keepApplications: false }, quiet);
    hidden = false;
    assert.equal(w.clerk.live().length, 0, 'a list that was wrongly empty did not leave a live application behind');
  });

  it('finishes the ledger of a worktree that is gone', async () => {
    const home = mkdtempSync(join(tmpdir(), 'verify-instances-home-'));
    const gone = world({ home });
    await gone.instances.ensure(NOTHING_NEW, quiet);
    rmSync(gone.dir, { recursive: true, force: true });
    const here = world({ home, shared: gone.clerk });
    await finishOrphanLedgers(home, here.dir, here.instances, here.say);
    assert.equal(gone.clerk.live().length, 0);
    assert.deepEqual(gone.workspace.unclosedEntries(), []);
    assert.ok(here.lines.some((line) => /^reap    ledger of .* 1 application/.test(line)));
    assert.equal(here.lines.some((line) => line.startsWith('wait    another')), false, 'another worktree\'s ledger waits for no lock here');
  });

  it('leaves the applications alone when asked to keep them, and still closes their identities', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const run = newRunId();
    w.workspace.append({ id: newEntryId(), kind: 'identity', run, email: newTestEmail(run, 1) });
    await w.open().finish(w.workspace, { keepApplications: true }, quiet);
    assert.equal(w.clerk.live().length, 1);
    assert.deepEqual(w.workspace.unclosedEntries().map((entry) => entry.kind), ['application']);
  });

});

describe('reaping', () => {
  it('deletes only applications past their own deadline, never this worktree\'s, and at most five a command', async () => {
    const w = world();
    const expired = Array.from({ length: 7 }, (_, n) => w.clerk.plant(throwawayName(new Date(T0 - HOUR), `0000000${n}`)));
    const fresh = w.clerk.plant(throwawayName(new Date(T0 + HOUR), 'ffffffff'));
    const justPast = w.clerk.plant(throwawayName(new Date(T0 - 60_000), 'eeeeeeee'));
    await w.instances.ensure(NOTHING_NEW, w.say);
    assert.equal(expired.filter((a) => a.deleted).length, 5);
    assert.equal(fresh.deleted, false, 'another session\'s live instance');
    assert.equal(justPast.deleted, false, 'inside the grace after its deadline');
    assert.equal(w.clerk.live().filter((a) => a.id.startsWith('app_fake')).length, 1, 'its own new instance');
    assert.ok(w.lines.some((line) => line.startsWith('reap    2 more expired applications')));
  });

  it('does not reap the application it has just retired, or spend one of its five reaps on it', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const retired = w.clerk.live()[0]!;
    const expired = Array.from({ length: 5 }, (_, n) => w.clerk.plant(throwawayName(new Date(T0 + HOUR), `0000000${n}`)));
    w.clock.at = T0 + 7 * HOUR;
    await w.open().ensure(NOTHING_NEW, w.say);
    assert.ok(w.lines.includes(`instance ${retired.id} retired (its deadline is near)`));
    assert.equal(w.clerk.platformRequests().filter((request) => request.method === 'DELETE' && request.url.endsWith(`/${retired.id}`)).length, 1, 'one delete for the retired application');
    assert.deepEqual(expired.map((application) => application.deleted), [true, true, true, true, true], 'and all five reaps for the applications other sessions left');
    assert.deepEqual(w.lines.filter((line) => line.startsWith('reap    ')).map((line) => line.split(/ +/)[1]), expired.map((application) => application.name));
  });

  it('judges a deadline by Clerk\'s clock, not this machine\'s', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-instances-'));
    const clerk = fakeClerk({ now: () => T0 });
    const other = clerk.plant(throwawayName(new Date(T0 + HOUR), 'aaaaaaaa'));
    const fastClock = T0 + 5 * HOUR;
    const instances = createInstances({ workspace: openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') }), env: { CLERK_PLATFORM_API_KEY: PLATFORM_KEY }, runner: noOp, progress: quiet, fetch: clerk.fetch, now: () => fastClock });
    await instances.ensure(NOTHING_NEW, quiet);
    assert.equal(other.deleted, false);
  });

  it('reaps nothing when Clerk\'s answer carries no date', async () => {
    const w = world();
    const expired = w.clerk.plant(throwawayName(new Date(T0 - 10 * HOUR), 'aaaaaaaa'));
    w.clerk.state.noDate = true;
    await w.instances.ensure(NOTHING_NEW, w.say);
    assert.equal(expired.deleted, false);
  });

  it('does not fail the command when a reap is refused', async () => {
    const w = world();
    w.clerk.plant(throwawayName(new Date(T0 - HOUR), 'bbbbbbbb'));
    const refusing = (async (input: string | URL, init?: RequestInit) => (init?.method === 'DELETE' ? new Response(JSON.stringify({ errors: [{ code: 'internal' }] }), { status: 500 }) : w.clerk.fetch(input, init))) as typeof fetch;
    await w.open(1000, refusing).ensure(NOTHING_NEW, w.say);
    assert.ok(w.lines.some((line) => line.includes('left in place')));
  });
});

describe('the Backend API', () => {
  const keys = { pk: 'pk_test_x' as PublishableKey, sk: new Secret('clerk-secret-key', 'sk_test_ownInstanceKey123') };
  const answering = (status: number) => {
    const calls: string[] = [];
    const fetchImpl = (async (url: string | URL) => {
      calls.push(new URL(String(url)).host);
      return new Response(JSON.stringify(status === 200 ? [] : { errors: [{ code: status === 401 ? 'clerk_key_invalid' : 'internal' }] }), { status });
    }) as typeof fetch;
    return { calls, backend: createClerkBackends(fetchImpl)(() => keys) };
  };
  const email = newTestEmail(newRunId(), 1);

  it('is api.clerk.com, called with the instance key', async () => {
    const { calls, backend } = answering(200);
    assert.equal(await backend.findUserId(email), null);
    assert.deepEqual(calls, ['api.clerk.com']);
  });

  it('fails a 401 with one message that names the likely cause and the fix, and asks no other host', async () => {
    const { calls, backend } = answering(401);
    await assert.rejects(backend.findUserId(email), keyRefused);
    assert.deepEqual(calls, ['api.clerk.com']);
  });

  it('reports any other refusal as what Clerk answered', async () => {
    await assert.rejects(answering(500).backend.findUserId(email), /^Error: Clerk GET \/users answered 500 \(internal\)$/);
  });

  it('brings no instance up in a sandbox whose credential replaces the instance key on api.clerk.com, says why in up and in doctor, and can still delete it', async () => {
    const w = world({ env: {}, clerk: { attachesKey: true, replacesAuthorizationOnCom: true } });
    await assert.rejects(w.instances.ensure(NOTHING_NEW, w.say), keyRefused);
    assert.ok(w.lines.some((line) => line.startsWith('instances a key attached outside this machine (no key is in this process) reaches')));
    const check = (await w.open().doctorChecks({ live: false }, quiet)).find((c) => c.id === 'clerk-api')!;
    assert.deepEqual([check.ok, keyRefused(new VerifyFailure('NOT_READY', check.detail, check.fix ?? ''))], [false, true]);
    assert.equal(w.clerk.requests.some((request) => request.url.startsWith('api.clerk.dev')), false);
    assert.ok(w.clerk.platformRequests().every((request) => request.authorization === null));
    await w.open().finish(w.workspace, { keepApplications: false }, quiet);
    assert.equal(w.clerk.live().length, 0);
  });
});

describe('doctor', () => {
  const specFile = (w: World, path: string, source: string) => {
    mkdirSync(join(w.dir, path, '..'), { recursive: true });
    writeFileSync(join(w.dir, path), source);
  };
  const settingsCheck = async (w: World) => (await w.open().doctorChecks({ live: false }, quiet)).find((c) => c.id === 'settings')!;

  it('says which credential reaches which workspace and creates nothing', async () => {
    const w = world();
    const checks = await w.instances.doctorChecks({ live: false }, quiet);
    assert.deepEqual(checks.map((c) => [c.id, c.ok]), [['instances', true], ['clerk-api', true], ['settings', true]]);
    assert.match(checks[0]!.detail, /^CLERK_PLATFORM_API_KEY reaches the verification workspace org_3KHungJxbvIscuSvy8oos5MHAli; none created yet$/);
    assert.match(checks[1]!.detail, /^not observed yet/);
    assert.equal(checks[2]!.detail, `none created yet; up creates one application from ${STANDARD_FILE}; 0 spec files declare settings`);
    assert.deepEqual(platformCalls(w), ['GET /me', 'GET /applications']);
  });

  it('fails when the Platform API key lacks a scope, names every one it lacks, and asks Clerk nothing more', async () => {
    const lacking = async (scopes: readonly string[] | undefined): Promise<{ readonly checks: readonly (readonly unknown[])[]; readonly calls: readonly string[]; readonly created: number }> => {
      const w = world();
      w.clerk.state.scopes = scopes;
      const checks = await w.instances.doctorChecks({ live: true }, quiet);
      return { checks: checks.map((c) => [c.id, c.ok, c.detail, c.fix]), calls: platformCalls(w), created: w.clerk.applications.length };
    };
    assert.deepEqual(await lacking(PLATFORM_SCOPES.filter((scope) => scope !== SECRET_KEY_SCOPE)), {
      checks: [['instances', false, `the Platform API key lacks the scope ${SECRET_KEY_SCOPE}, which verification needs`, `add ${SECRET_KEY_SCOPE} to the Platform API key`]],
      calls: ['GET /me'],
      created: 0,
    });
    assert.deepEqual((await lacking(['applications:read', 'users:read'])).checks, [
      ['instances', false, `the Platform API key lacks the scopes applications:manage, applications:delete, and ${SECRET_KEY_SCOPE}, which verification needs`, `add applications:manage, applications:delete, and ${SECRET_KEY_SCOPE} to the Platform API key`],
    ]);
    assert.match((await lacking(undefined)).checks[0]![2] as string, /^the Platform API key lacks the scopes applications:read, applications:manage, applications:delete, and application_secret_keys:read,/, 'an answer that lists no scopes proves none');
  });

  it('still reads a held application when the key lacks a scope, and says which', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    w.clerk.state.scopes = PLATFORM_SCOPES.filter((scope) => scope !== 'applications:delete');
    const checks = await w.open().doctorChecks({ live: false }, quiet);
    assert.deepEqual(checks.map((c) => [c.id, c.ok]), [['instances', false], ['clerk-api', true], ['settings', true]]);
    assert.match(checks[0]!.detail, /^app_fake1 \(verify-throwaway-until-\w+-[0-9a-f]{8}\) on standard; the Platform API key lacks the scope applications:delete, which verification needs$/);
    assert.equal(checks[0]!.fix, 'add applications:delete to the Platform API key');
  });

  it('names what a held application is on, which spec asked, and how many settings it compared', async () => {
    const w = world();
    specFile(w, MFA_SPEC, "test('x', () => {});\n");
    specFile(w, MFA_FILE, JSON.stringify(MFA));
    specFile(w, STANDARD_SPEC, "test('x', () => {});\n");
    await w.instances.ensure(NOTHING_NEW, quiet);
    const application = w.clerk.live()[0]!;
    application.environment['auth_config.reverification'] = false;
    const standard = await w.open().doctorChecks({ live: false }, quiet);
    assert.match(standard[0]!.detail, new RegExp(`^CLERK_PLATFORM_API_KEY reaches the verification workspace ${WORKSPACE}; ${application.id} \\(${application.name}\\) on standard$`));
    assert.equal(standard[1]!.detail, `api.clerk.com accepts the own key of ${application.id}`);
    assert.deepEqual([standard[2]!.id, standard[2]!.ok], ['settings', true]);
    assert.equal(standard[2]!.detail, `${application.id} is on standard; ${LEAVES} settings match ${STANDARD_FILE}; 1 spec file declares settings`, 'a setting the file does not require is not reported');

    await (await w.open().apply(mfaGroup, quiet)).release();
    const declared = await settingsCheck(w);
    assert.equal(declared.ok, true);
    assert.ok(declared.detail.startsWith(`${application.id} is on ${MFA_LABEL}, which ${MFA_SPEC} asked for; ${LEAVES} settings match ${STANDARD_FILE} with that declaration; `), declared.detail);
    assert.match((await w.open().doctorChecks({ live: false }, quiet))[0]!.detail, new RegExp(` on ${MFA_LABEL.replace(/\./g, '\\.')}$`));
  });

  it('fails when a held application no longer shows its recorded settings, or has none recorded', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const application = w.clerk.live()[0]!;
    application.environment['auth_config.test_mode'] = false;
    const differing = await settingsCheck(w);
    assert.equal(differing.ok, false);
    assert.ok(differing.detail.startsWith(`${application.id} is recorded as on standard and shows auth_config.test_mode is false, and those settings expect true`), differing.detail);
    assert.equal(differing.fix, '{cli} up returns it to the standard settings');
    application.environment['auth_config.test_mode'] = true;
    rmSync(join(instancesDir(w), `${application.name}.state.json`));
    const unknown = await settingsCheck(w);
    assert.deepEqual([unknown.ok, unknown.detail.split(';')[0]], [false, `${application.id} has no settings recorded`]);
    application.deleted = true;
    assert.match((await settingsCheck(w)).detail, new RegExp(`^Clerk no longer serves ${application.id}`));
  });

  it('fails on the first spec file whose declaration a run would refuse, and names it', async () => {
    const w = world();
    specFile(w, STANDARD_SPEC, "test('x', () => {});\n");
    specFile(w, 'specs/explored/a-stray.settings.json', JSON.stringify(MFA));
    specFile(w, 'specs/explored/c-malformed.e2e.ts', "test('x', () => {});\n");
    specFile(w, 'specs/explored/c-malformed.settings.json', "{ config: { auth_multi_factor: { required_for_sign_up: true } } }");
    specFile(w, 'specs/explored/d-unknown.e2e.ts', "test('x', () => {});\n");
    specFile(w, 'specs/explored/d-unknown.settings.json', JSON.stringify({ config: { auth_email: { nope: true } }, environment: MFA.environment }));
    const stray = await settingsCheck(w);
    assert.equal(stray.ok, false);
    assert.match(stray.detail, /; specs\/explored\/a-stray\.settings\.json is not the settings file of a spec, so no run reads it$/);
    rmSync(join(w.dir, 'specs/explored/a-stray.settings.json'));
    const malformed = await settingsCheck(w);
    assert.equal(malformed.ok, false);
    assert.match(malformed.detail, /; specs\/explored\/c-malformed\.settings\.json: it is not JSON \(/);
    assert.match(malformed.fix ?? '', /^write the settings of specs\/explored\/c-malformed\.e2e\.ts as one JSON object, as in `\{ "config": /);
    rmSync(join(w.dir, 'specs/explored/c-malformed.settings.json'));
    assert.match((await settingsCheck(w)).detail, /specs\/explored\/d-unknown\.e2e\.ts declares auth_email\.nope, and the standard file has no value to return it to$/);
  });

  it('says so when instances are held and the credential that down needs is gone', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const later = createInstances({ workspace: w.workspace, env: {}, runner: noOp, progress: quiet, fetch: w.clerk.fetch });
    const checks = await later.doctorChecks({ live: true }, quiet);
    assert.equal(checks[0]!.ok, false);
    assert.match(checks[0]!.detail, /^app_fake1 \(verify-throwaway-until-\w+-[0-9a-f]{8}\) on standard; no Clerk Platform API credential works here/);
    assert.equal(checks.find((c) => c.id === 'settings')?.ok, true, 'the held application is still read');
    assert.equal(w.clerk.live().length, 1);
  });

  it('--live leaves an application this worktree already holds alone', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const checks = await w.open().doctorChecks({ live: true }, quiet);
    const live = checks.find((c) => c.id === 'live-instance')!;
    assert.deepEqual([live.ok, live.state], [true, 'not-run']);
    assert.match(live.detail, /^not run: this worktree already holds app_fake1/);
    assert.equal(w.clerk.live().length, 1);
    assert.equal(w.clerk.applications.length, 1);
  });

  it('--live creates one application, checks it, deletes it, and leaves the ledger closed', async () => {
    const w = world();
    const checks = await w.instances.doctorChecks({ live: true }, quiet);
    assert.deepEqual(checks.map((c) => [c.id, c.ok]), [['instances', true], ['clerk-api', true], ['settings', true], ['live-instance', true]]);
    assert.match(checks.find((c) => c.id === 'settings')!.detail, /^app_fake1 is on standard; \d+ settings match/);
    assert.match(checks.find((c) => c.id === 'live-instance')!.detail, /^created app_fake1 \(verify-throwaway-until-\w+-[0-9a-f]{8}\), configured it, compared its environment, and deleted it \(1 application gone from the list\)/);
    assert.equal(w.clerk.applications.length, 1);
    assert.equal(w.clerk.live().length, 0);
    assert.deepEqual(w.workspace.unclosedEntries(), []);
  });

  it('fails the instances check alone when no credential works, with one fix line that says how to supply a key and nothing else', async () => {
    for (const live of [false, true]) {
      const w = world({ env: {} });
      const checks = await w.instances.doctorChecks({ live }, quiet);
      assert.deepEqual(checks.map((c) => [c.id, c.ok]), [['instances', false]]);
      const fix = checks[0]!.fix ?? '';
      for (const way of ['set CLERK_PLATFORM_API_KEY to the team key', 'CLERK_PLATFORM_API_KEY_FILE', 'VERIFY_PLATFORM_KEY_REFERENCE']) assert.ok(fix.includes(way), way);
      assert.deepEqual(fix.match(/op:\/\/[^;\s]*/g), [REFERENCE_SHAPE], 'the reference is shown as a shape, never with a vault or an item');
      let printed = '';
      createOutput(false, w.dir, 'bin/control-x', { write: (line: string) => (printed += line) }, { write: () => true }).result({ verb: 'doctor', ok: false, backend: { ios: 'local' }, checks });
      assert.equal(printed.split('\n').filter((line) => line.includes('fix:')).length, 1);
      assert.equal(w.clerk.applications.length, 0);
    }
  });
});

describe('the broker of a run', () => {

  it('seeds a user only while an instance is applied, with that application\'s own key, and ledgers each identity', async () => {
    const w = world();
    await w.instances.ensure(NOTHING_NEW, quiet);
    const { run, scratch } = w.workspace.newRun();
    const broker = await startBroker(run, w.workspace, scratch as ScratchPath, { clerk: () => w.instances.clerk(), publishableKey: () => w.instances.keys().pk, platforms: ['ios'] });
    const post = async (path: string, body: unknown) => {
      const response = await fetch(`${broker.url}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${readFileSync(broker.tokenFile, 'utf8')}` }, body: JSON.stringify(body) });
      return { status: response.status, json: (await response.json()) as Record<string, unknown> };
    };
    try {
      assert.equal((await post('/seedUser', {})).status, 400, 'nothing is applied before the run drives');
      const applied = await w.instances.apply(mfaGroup, quiet);
      const seeded = await post('/seedUser', {});
      assert.equal(seeded.status, 200);
      assert.deepEqual(Object.keys(seeded.json).sort(), ['email', 'id', 'password', 'phone'], 'a seeded user names no instance');
      assert.equal(seeded.json.password, null, 'and has no password unless the spec asked for one');
      assert.equal((await post('/reserveEmail', {})).status, 200);
      assert.equal((await post('/launch', { platform: 'ios', user: seeded.json, authMode: null, initialIdentifier: null, debugLogs: false, storageScope: null })).status, 200);
      await applied.release();
    } finally {
      await broker.stop();
    }
    const application = w.clerk.live()[0]!;
    assert.equal(application.users, 1, 'the user was made with the applied application\'s own key');
    const identities = w.workspace.unclosedEntries().flatMap((entry) => (entry.kind === 'identity' || entry.kind === 'user' ? [entry] : []));
    assert.deepEqual(identities.map((entry) => entry.kind), ['identity', 'user', 'identity'], 'the seed that was refused left no entry');
  });

});

describe('down with throwaway instances', () => {
  function setup(platforms: readonly ('ios' | 'android')[]) {
    const w = world();
    const backends = platforms.map((platform) => ({ kind: 'local', platform, availability: () => ({ usable: true, why: 'test' }), release: async () => undefined, reapable: async () => [], describe: (lease: LocalLease) => lease.deviceName }) as unknown as DeviceBackend);
    const deps = (): Deps => ({ host: { ...host, platforms, backends } as unknown as HostAdapter, workspace: w.workspace, runner: async () => assert.fail('down runs no commands'), env: w.env, progress: w.say, instances: w.open() });
    for (const platform of platforms) w.workspace.writeLease({ backend: 'local', platform, slot: 1, deviceName: `verify-${platform}-1`, deviceId: `id-${platform}`, claimNonce: `claim-${platform}`, acquiredAt: '2026-10-05T12:00:00Z', installedBuild: null });
    return { w, deps };
  }

  it('deletes the applications and reports them', async () => {
    const { w, deps } = setup(['ios']);
    await w.instances.ensure(NOTHING_NEW, quiet);
    const name = w.clerk.live()[0]!.name;
    const before = w.clerk.requests.length;
    const dry = await down(deps(), { verb: 'down', stale: false, dryRun: true });
    assert.ok(dry.dryRun);
    assert.deepEqual(dry.wouldDelete, [{ kind: 'application', name }]);
    assert.equal(w.clerk.requests.length, before, 'a dry run reads the ledger and asks Clerk nothing');
    const result = await down(deps(), { verb: 'down', stale: false, dryRun: false });
    assert.ok(!result.dryRun);
    assert.deepEqual(result.deletedApplications, [{ name }]);
    assert.equal(w.clerk.live().length, 0);
  });

  it('keeps them while another platform in the worktree still holds a lease', async () => {
    const { w, deps } = setup(['ios', 'android']);
    await w.instances.ensure(NOTHING_NEW, quiet);
    const first = await down(deps(), { verb: 'down', platform: 'ios', stale: false, dryRun: false });
    assert.ok(!first.dryRun);
    assert.deepEqual(first.deletedApplications, []);
    assert.equal(w.clerk.live().length, 1);
    assert.ok(w.lines.some((line) => line.includes('which its android lease still uses')));
    const second = await down(deps(), { verb: 'down', platform: 'android', stale: false, dryRun: false });
    assert.ok(!second.dryRun);
    assert.equal(second.deletedApplications.length, 1);
    assert.equal(w.clerk.live().length, 0);
  });

  it('deletes the applications even when the device would not release', async () => {
    const { w, deps } = setup(['ios']);
    await w.instances.ensure(NOTHING_NEW, quiet);
    const stuck = deps();
    const failing = { ...stuck, host: { ...stuck.host, backends: stuck.host.backends.map((backend) => ({ ...backend, release: async () => assert.fail('the simulator would not shut down') })) } as unknown as HostAdapter };
    await assert.rejects(down(failing, { verb: 'down', stale: false, dryRun: false }), /would not shut down/);
    assert.equal(w.clerk.live().length, 0, 'a lease that failed to release is not a reason to keep its instances');
  });

  it('still releases the device and reports the failure when the applications cannot be deleted', async () => {
    const { w, deps } = setup(['ios']);
    await w.instances.ensure(NOTHING_NEW, quiet);
    w.clerk.state.refuseDelete = true;
    await assert.rejects(down(deps(), { verb: 'down', stale: false, dryRun: false }), /could not be deleted/);
    assert.equal(w.workspace.readLease('ios'), null, 'the lease was released first');
    assert.equal(existsSync(instancesDir(w)), true);
    rmSync(w.dir, { recursive: true, force: true });
  });
});

describe('the key and child processes', () => {
  const credentialVariables = { CLERK_PLATFORM_API_KEY: PLATFORM_KEY, CLERK_PLATFORM_API_KEY_FILE: '/home/x/key', VERIFY_PLATFORM_KEY_REFERENCE: REFERENCE };

  it('takes the Platform API key and where it is kept out of the environment every child inherits, and keeps them for the instances layer', () => {
    const env: NodeJS.ProcessEnv = { ...credentialVariables, PATH: '/usr/bin' };
    const kept = takePlatformKey(env);
    assert.deepEqual(env, { PATH: '/usr/bin' });
    assert.deepEqual(kept, { ...credentialVariables, PATH: '/usr/bin' });
  });

  it('gives a program it starts neither the platform key nor where it is kept', () => {
    assert.deepEqual(withoutClerkKeys({ ...credentialVariables, HOME: '/home/x' }), { HOME: '/home/x' });
  });

  it('redacts a key from the moment it is read, before anything sends it', () => {
    new Secret('clerk-platform-key', 'ak_readButNeverUsed000000000000');
    assert.equal(redact('op said ak_readButNeverUsed000000000000'), 'op said <redacted>');
  });
});
