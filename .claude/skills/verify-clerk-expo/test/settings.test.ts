import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { STANDARD, STANDARD_FILE, configFor, configLeaves, declaredIn, expectedEnvironment, planGroups, readSpecText, sameLeaf, settingsFileOf, settingsOf, sourceHash, standardFile, straySettingsFile } from '../src/core/instances/settings.ts';
import { VerifyFailure, type InstanceSettings, type SpecRef } from '../src/core/types.ts';

const MFA: InstanceSettings = { config: { auth_multi_factor: { required_for_sign_up: true } }, environment: { 'user_settings.sign_up.mfa.required': true } };
const FORCED_ORG: InstanceSettings = { config: { organization_settings: { force_organization_selection: true } }, environment: { 'organization_settings.force_organization_selection': true } };

const SPEC_SOURCE = "import { test } from '../../fixtures.ts';\n\ntest('x', async ({ host }) => { await host.launch({}); });\n";
const spec = (path: string): SpecRef => ({ kind: 'golden', path, feature: null });
const text = (declaration: InstanceSettings | string | null, source = SPEC_SOURCE) => ({ source, declaration: declaration === null || typeof declaration === 'string' ? declaration : JSON.stringify(declaration) });
const file = (path: string, declared: InstanceSettings | string | null = null) => ({ spec: spec(path), ...text(declared) });
const usage = (pattern: RegExp) => (error: VerifyFailure) => error instanceof VerifyFailure && error.code === 'USAGE' && pattern.test(error.message);
const ODD = 'specs/explored/odd.e2e.ts';
const ODD_FILE = 'specs/explored/odd.settings.json';
const refuses = (declarations: Readonly<Record<string, string>>, why: RegExp = /./): void => {
  for (const [what, declaration] of Object.entries(declarations)) {
    assert.throws(
      () => declaredIn(text(declaration), ODD),
      (error: VerifyFailure) => error instanceof VerifyFailure && error.code === 'USAGE' && error.message.startsWith(`${ODD_FILE}: `) && why.test(error.message) && error.fix.startsWith(`write the settings of ${ODD} as one JSON object, as in \`{ "config": `),
      what,
    );
  }
};

describe('the standard file', () => {
  it('pins a standard value for every setting the two golden declarations change', () => {
    const pinned = configLeaves(standardFile().config);
    assert.equal(pinned['auth_multi_factor.required_for_sign_up'], false);
    assert.equal(pinned['organization_settings.force_organization_selection'], false);
    assert.deepEqual(pinned['auth_email.sign_in_strategies'], ['email_code', 'email_link'], 'a list is one leaf');
  });
});

describe('reading a declaration from the settings file beside a spec', () => {
  it('names the settings file after the spec file', () => {
    assert.equal(settingsFileOf('specs/golden/session-tasks/setup-mfa.e2e.ts'), 'specs/golden/session-tasks/setup-mfa.settings.json');
    assert.equal(settingsFileOf(ODD), ODD_FILE);
  });

  it('reads the spec and the file beside it, and nothing when the spec has no file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-settings-'));
    mkdirSync(join(dir, 'specs/explored'), { recursive: true });
    writeFileSync(join(dir, ODD), SPEC_SOURCE);
    assert.deepEqual(readSpecText(dir, ODD), { source: SPEC_SOURCE, declaration: null });
    assert.equal(declaredIn(readSpecText(dir, ODD), ODD), null);
    writeFileSync(join(dir, ODD_FILE), `${JSON.stringify(MFA, null, 2)}\n`);
    assert.deepEqual(declaredIn(readSpecText(dir, ODD), ODD), MFA);
  });

  it('reads config and environment, with nesting, lists, numbers, and null', () => {
    const declared = { config: { auth_password: { min_length: 12, max_length: -1, enabled: false, note: null }, auth_email: { sign_in_strategies: ['email_code', 'email_link'] } }, environment: { 'user_settings.password_settings.min_length': 12, 'auth_config.second_factors': ['totp'] } };
    assert.deepEqual(declaredIn(text(declared), ODD), declared);
  });

  it('fails closed, with the file and the form to write, on anything that is not one JSON object with a config and an environment', () => {
    refuses(
      {
        'an empty file': '',
        'a JavaScript literal': "{ config: { auth_multi_factor: { required_for_sign_up: true } }, environment: { 'user_settings.sign_up.mfa.required': true } }",
        'a trailing comma': '{ "config": { "a": { "b": true } }, "environment": { "a.b": true }, }',
        'a comment': `// why\n${JSON.stringify(MFA)}`,
        'an export': `export default ${JSON.stringify(MFA)}`,
      },
      /it is not JSON \(/,
    );
    refuses({ 'a list': '[1, 2]', 'a string': '"mfa"', null: 'null' }, /it is not a JSON object/);
    refuses({ 'a key other than config and environment': '{ "config": { "a": { "b": true } }, "environment": { "a.b": true }, "extra": 1 }' }, /it has extra, and only config and environment are read/);
    refuses({ 'no config': '{ "environment": { "a.b": true } }', 'an empty config': '{ "config": {}, "environment": { "a.b": true } }', 'a config that is a list': '{ "config": [], "environment": { "a.b": true } }' }, /it needs a config object/);
    refuses({ 'no environment': '{ "config": { "a": { "b": true } } }', 'an empty environment': '{ "config": { "a": { "b": true } }, "environment": {} }' }, /it needs an environment object/);
    refuses(
      { 'an environment value that is an object': '{ "config": { "a": { "b": true } }, "environment": { "a": { "b": true } } }', 'an environment list of objects': '{ "config": { "a": { "b": true } }, "environment": { "a.b": [{ "c": 1 }] } }' },
      /environment leaf a(\.b)? is an object; write each leaf by its full dotted path/,
    );
  });

  it('gives a spec a new hash when its settings file changes, appears, or goes, so a run can tell that its plan is stale', () => {
    const hashes = [text(null), text(MFA), text(FORCED_ORG), text(''), text(MFA, `${SPEC_SOURCE}\n`)].map(sourceHash);
    assert.equal(new Set(hashes).size, hashes.length);
    assert.equal(sourceHash(text(MFA)), sourceHash(text(MFA)));
    assert.match(hashes[0]!, /^[0-9a-f]{64}$/);
  });

  it('finds a JSON file under specs that is not the settings file of a spec beside it, and none when each has its spec', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-settings-'));
    assert.equal(straySettingsFile(dir), null, 'a skill with no specs directory has none');
    mkdirSync(join(dir, 'specs/golden/session-tasks'), { recursive: true });
    for (const name of ['setup-mfa.e2e.ts', 'setup-mfa.settings.json']) writeFileSync(join(dir, 'specs/golden/session-tasks', name), '');
    assert.equal(straySettingsFile(dir), null);
    writeFileSync(join(dir, 'specs/golden/session-tasks/setup-mfa.e2e.settings.json'), '');
    const stray = straySettingsFile(dir);
    assert.equal(stray?.code, 'USAGE');
    assert.equal(stray?.message, 'specs/golden/session-tasks/setup-mfa.e2e.settings.json is not the settings file of a spec, so no run reads it');
    assert.equal(stray?.fix, 'name a settings file after its spec file, with .settings.json in place of .e2e.ts, or delete it');
    for (const misnamed of ['setup-mfa.setting.json', 'setup-mfa-settings.json', 'settings.json', 'setup-mfa.settings.jsonc']) {
      const other = mkdtempSync(join(tmpdir(), 'verify-settings-'));
      mkdirSync(join(other, 'specs/explored'), { recursive: true });
      for (const name of ['setup-mfa.e2e.ts', misnamed]) writeFileSync(join(other, 'specs/explored', name), '');
      assert.equal(straySettingsFile(other)?.message, `specs/explored/${misnamed} is not the settings file of a spec, so no run reads it`);
    }
  });
});

describe('checking a declaration against the standard file', () => {
  it('names the settings by the config leaves they change', () => {
    const settings = settingsOf(MFA, 'specs/a.e2e.ts');
    assert.equal(settings.label, 'auth_multi_factor.required_for_sign_up=true');
    assert.equal(settings.askedBy, 'specs/a.e2e.ts');
    assert.notEqual(settings.key, STANDARD.key);
    assert.equal(settingsOf({ config: { auth_password: { min_length: 12 }, auth_email: { sign_in_strategies: ['email_code'] } }, environment: { 'user_settings.password_settings.min_length': 12 } }, 'a').label, 'auth_password.min_length=12, auth_email.sign_in_strategies=["email_code"]');
    assert.deepEqual(STANDARD, { key: STANDARD.key, label: 'standard', declared: null, askedBy: null });
    assert.equal(settingsOf(null, 'specs/a.e2e.ts'), STANDARD);
  });

  it('sends the whole standard config with the declaration laid over it', () => {
    const body = configFor(settingsOf(MFA, 'a'));
    const standard = standardFile().config;
    assert.deepEqual(Object.keys(body), Object.keys(standard));
    assert.deepEqual(body.auth_multi_factor, { ...(standard.auth_multi_factor as object), required_for_sign_up: true });
    assert.deepEqual(body.organization_settings, standard.organization_settings, 'so a setting an earlier group changed goes back to standard');
    assert.equal(configFor(STANDARD), standard);
  });

  it('gives two declarations with one effect one key, and different effects different keys', () => {
    const alsoStandardLeaf: InstanceSettings = { config: { auth_multi_factor: { required_for_sign_up: true, required_for_sign_in: false } }, environment: MFA.environment };
    assert.equal(settingsOf(alsoStandardLeaf, 'b').key, settingsOf(MFA, 'a').key);
    assert.notEqual(settingsOf(FORCED_ORG, 'c').key, settingsOf(MFA, 'a').key);
  });

  it('refuses a config leaf the standard file does not pin, and says what to add', () => {
    const unpinned: InstanceSettings = { config: { auth_email: { brand_new_toggle: true } }, environment: MFA.environment };
    assert.throws(() => settingsOf(unpinned, 'specs/a.e2e.ts'), (error: VerifyFailure) => error.code === 'INSTANCE_MISCONFIGURED' && error.message.includes('specs/a.e2e.ts') && error.message.includes('auth_email.brand_new_toggle') && error.fix.startsWith("check the spelling against Clerk's Platform API config; ") && error.fix.includes(`; add the standard value of \`auth_email.brand_new_toggle\` to \`config\` in ${STANDARD_FILE}`));
  });

  it('lists the keys the standard file has beside a config key it does not, before it says to change the file', () => {
    const fixOf = (config: InstanceSettings['config']): string => {
      try {
        settingsOf({ config, environment: MFA.environment }, 'specs/a.e2e.ts');
      } catch (error) {
        return (error as VerifyFailure).fix;
      }
      return assert.fail('the declaration was accepted');
    };
    const add = (leaf: string) => `add the standard value of \`${leaf}\` to \`config\` in ${STANDARD_FILE}`;
    assert.ok(fixOf({ auth_multi_factor: { requird_for_sign_up: true } }).startsWith(`check the spelling against Clerk's Platform API config; the standard file has authenticator_app, backup_code, required_for_sign_in, required_for_sign_up under \`auth_multi_factor\`; ${add('auth_multi_factor.requird_for_sign_up')}`));
    assert.ok(fixOf({ auth_multi_factor: { backup_code: { enabld: false } } }).startsWith(`check the spelling against Clerk's Platform API config; the standard file has enabled under \`auth_multi_factor.backup_code\`; ${add('auth_multi_factor.backup_code.enabld')}`));
    const top = Object.keys(standardFile().config);
    assert.ok(top.length > 12);
    assert.ok(fixOf({ auth_multi_factr: { required_for_sign_up: true } }).startsWith(`check the spelling against Clerk's Platform API config; the standard file has ${top.slice(0, 12).join(', ')}, and ${top.length - 12} more at the top of \`config\`; ${add('auth_multi_factr.required_for_sign_up')}`), 'a misspelt parent lists what stands beside it, and never more than 12');
    assert.ok(fixOf({ auth_multi_factor: { required_for_sign_up: { always: true } } }).startsWith(`check the spelling against Clerk's Platform API config; ${add('auth_multi_factor.required_for_sign_up.always')}`), 'nothing to list under a key that holds a plain value');
  });

  it('says the standard file has an object where a declaration gives one plain value, and names its keys', () => {
    assert.throws(
      () => settingsOf({ config: { auth_multi_factor: true }, environment: MFA.environment }, 'specs/a.e2e.ts'),
      (error: VerifyFailure) =>
        error.code === 'INSTANCE_MISCONFIGURED' &&
        error.message === 'specs/a.e2e.ts declares auth_multi_factor as true, and the standard file has an object there' &&
        error.fix === 'declare the keys of `auth_multi_factor` to change, each by its own name; the standard file has authenticator_app, backup_code, required_for_sign_in, required_for_sign_up there',
    );
  });

  it('compares the members of a list by what they hold, in any order', () => {
    assert.equal(sameLeaf([{ a: 1 }], [{ a: 2 }]), false, 'two lists of objects of one length are not the same list');
    assert.equal(sameLeaf([{ a: 1, b: [2, 3] }, { c: null }], [{ c: null }, { b: [2, 3], a: 1 }]), true);
    assert.equal(sameLeaf(['b', 'a'], ['a', 'b']), true);
    assert.equal(sameLeaf(['a'], ['a', 'a']), false);
    const declared = settingsOf({ config: MFA.config, environment: { 'auth_config.second_factors': ['totp', 'phone_code'] } }, 'a');
    assert.deepEqual(expectedEnvironment(declared)['auth_config.second_factors'], ['phone_code', 'totp'], 'a declared list is expected in the order a live one is read in');
  });

  it('refuses a declaration that only restates standard values', () => {
    assert.throws(() => settingsOf({ config: { auth_multi_factor: { required_for_sign_up: false } }, environment: MFA.environment }, 'specs/a.e2e.ts'), (error: VerifyFailure) => usage(/^specs\/a\.e2e\.ts declares only standard values/)(error) && error.fix.startsWith('delete specs/a.settings.json; '));
  });

  it('refuses an environment leaf at its standard value, and takes one the standard file does not list', () => {
    assert.throws(() => settingsOf({ config: MFA.config, environment: { 'user_settings.sign_up.mfa.required': false } }, 'specs/a.e2e.ts'), usage(/user_settings\.sign_up\.mfa\.required to be false, which is its standard value/));
    const listed = standardFile().environment['auth_config.first_factors'] as readonly string[];
    assert.throws(() => settingsOf({ config: MFA.config, environment: { 'auth_config.first_factors': [...listed].reverse() } }, 'a'), usage(/standard value/), 'a list in another order is the same value');
    assert.ok(settingsOf({ config: MFA.config, environment: { 'auth_config.reverification': false } }, 'a'), 'the instance decides whether a leaf the file does not list shows the change');
  });

  it('does not take a name every object inherits for a pinned config leaf', () => {
    assert.throws(() => settingsOf({ config: { constructor: true }, environment: MFA.environment }, 'specs/a.e2e.ts'), (error: VerifyFailure) => error.code === 'INSTANCE_MISCONFIGURED' && /^specs\/a\.e2e\.ts declares constructor, and the standard file has no value/.test(error.message));
  });

  it('requires that a user may delete their own account', () => {
    assert.equal(standardFile().environment['user_settings.actions.delete_self'], true);
  });

  it('expects the required leaves of the standard file, with the declared leaves laid over them and added to them', () => {
    const required = Object.keys(standardFile().environment);
    const expected = expectedEnvironment(settingsOf(MFA, 'a'));
    assert.deepEqual(Object.keys(expected), required);
    assert.equal(expected['user_settings.sign_up.mfa.required'], true);
    assert.equal(expectedEnvironment(STANDARD)['user_settings.sign_up.mfa.required'], false);
    const unlisted = expectedEnvironment(settingsOf({ config: MFA.config, environment: { 'auth_config.reverification': false } }, 'a'));
    assert.deepEqual([Object.keys(unlisted).length, unlisted['auth_config.reverification']], [required.length + 1, false]);
  });
});

describe('planning a run in groups', () => {
  const golden = [file('specs/golden/auth-start/auth-start.e2e.ts'), file('specs/golden/session-tasks/choose-organization.e2e.ts', FORCED_ORG), file('specs/golden/session-tasks/complete-setup-mfa.e2e.ts', MFA), file('specs/golden/session-tasks/setup-mfa.e2e.ts', MFA), file('specs/golden/sign-up/complete.e2e.ts')];
  const mfaKey = settingsOf(MFA, 'x').key;
  const orgKey = settingsOf(FORCED_ORG, 'x').key;
  const order = (applied: string | null, specs = golden) => planGroups(specs, applied).map((group) => group.settings.label);

  it('puts the group already applied first, so a run changes the instance once less than it has groups', () => {
    assert.deepEqual(order(STANDARD.key), ['standard', 'organization_settings.force_organization_selection=true', 'auth_multi_factor.required_for_sign_up=true']);
    assert.deepEqual(order(mfaKey), ['auth_multi_factor.required_for_sign_up=true', 'organization_settings.force_organization_selection=true', 'standard']);
    assert.deepEqual(order(orgKey), ['organization_settings.force_organization_selection=true', 'auth_multi_factor.required_for_sign_up=true', 'standard']);
  });

  it('with nothing applied, or settings no group has, keeps the order the specs came in and leaves standard for last', () => {
    for (const applied of [null, 'ffffffffffff']) assert.deepEqual(order(applied), ['organization_settings.force_organization_selection=true', 'auth_multi_factor.required_for_sign_up=true', 'standard']);
  });

  it('is stable: the same files in the same order plan the same groups, each with its files in order', () => {
    const plan = planGroups(golden, STANDARD.key);
    assert.deepEqual(plan, planGroups(golden, STANDARD.key));
    assert.deepEqual(plan.map((group) => group.specs.map((s) => s.path.split('/').at(-1))), [['auth-start.e2e.ts', 'complete.e2e.ts'], ['choose-organization.e2e.ts'], ['complete-setup-mfa.e2e.ts', 'setup-mfa.e2e.ts']]);
    assert.equal(plan[2]!.settings.askedBy, 'specs/golden/session-tasks/complete-setup-mfa.e2e.ts', 'the first spec of a group is the one that asked');
    assert.equal(plan[0]!.settings, STANDARD);
    assert.match(plan[0]!.specs[0]!.sourceHash, /^[0-9a-f]{64}$/);
    assert.notEqual(plan[0]!.specs[0]!.sourceHash, plan[1]!.specs[0]!.sourceHash);
  });

  it('makes one group of two files with one config, and expects the leaves of both', () => {
    const more: InstanceSettings = { config: MFA.config, environment: { 'auth_config.reverification': false } };
    const [group, ...rest] = planGroups([file('specs/a.e2e.ts', MFA), file('specs/b.e2e.ts', more)], null);
    assert.deepEqual(rest, []);
    assert.deepEqual(group!.settings.declared?.environment, { 'user_settings.sign_up.mfa.required': true, 'auth_config.reverification': false });
    assert.equal(group!.settings.key, mfaKey);
  });

  it('refuses two files with one config that expect different values of a leaf, naming both', () => {
    const a: InstanceSettings = { config: MFA.config, environment: { 'user_settings.password_settings.min_length': 12 } };
    const b: InstanceSettings = { config: MFA.config, environment: { 'user_settings.password_settings.min_length': 14 } };
    assert.throws(() => planGroups([file('specs/a.e2e.ts', a), file('specs/b.e2e.ts', b)], null), usage(/^specs\/a\.e2e\.ts and specs\/b\.e2e\.ts declare the same config and expect different values of user_settings\.password_settings\.min_length/));
  });

  it('reports a malformed declaration before anything is planned', () => {
    assert.throws(() => planGroups([file('specs/a.e2e.ts'), file('specs/b.e2e.ts', '{ config: {} }')], null), usage(/^specs\/b\.settings\.json: it is not JSON/));
  });
});
