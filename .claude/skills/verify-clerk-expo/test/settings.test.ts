import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { STANDARD, STANDARD_FILE, configFor, configLeaves, declaredIn, expectedEnvironment, planGroups, sameLeaf, settingsOf, standardFile } from '../src/core/instances/settings.ts';
import { VerifyFailure, type InstanceSettings, type SpecRef } from '../src/core/types.ts';

const MFA: InstanceSettings = { config: { auth_multi_factor: { required_for_sign_up: true } }, environment: { 'user_settings.sign_up.mfa.required': true } };
const FORCED_ORG: InstanceSettings = { config: { organization_settings: { force_organization_selection: true } }, environment: { 'organization_settings.force_organization_selection': true } };

const exported = (literal: string, annotation = ': InstanceSettings') => `import { test } from '../../fixtures.ts';\n\nexport const instanceSettings${annotation} = ${literal}\n\ntest('x', async () => {});\n`;
const literalOf = (settings: InstanceSettings) => `${JSON.stringify(settings)};`;
const spec = (path: string): SpecRef => ({ kind: 'golden', path, feature: null });
const file = (path: string, declared: InstanceSettings | null = null) => ({ spec: spec(path), source: declared === null ? "test('x', async ({ host }) => { await host.launch({ screen: 'home' }); });\n" : exported(literalOf(declared)) });
const usage = (pattern: RegExp) => (error: VerifyFailure) => error instanceof VerifyFailure && error.code === 'USAGE' && pattern.test(error.message);
const ODD = 'specs/explored/odd.e2e.ts';
const refuses = (sources: Readonly<Record<string, string>>, why: RegExp = /./): void => {
  for (const [what, source] of Object.entries(sources)) {
    assert.throws(
      () => declaredIn(source, ODD),
      (error: VerifyFailure) => error instanceof VerifyFailure && error.code === 'USAGE' && error.message.startsWith(`${ODD}: `) && why.test(error.message) && error.fix.includes('export const instanceSettings: InstanceSettings = { config:'),
      what,
    );
  }
};

describe('the standard file', () => {
  it('pins a standard value for every setting the two golden declarations change', () => {
    const pinned = configLeaves(standardFile().config);
    assert.equal(Object.keys(pinned).length, 101);
    assert.equal(pinned['auth_multi_factor.required_for_sign_up'], false);
    assert.equal(pinned['organization_settings.force_organization_selection'], false);
    assert.deepEqual(pinned['auth_email.sign_in_strategies'], ['email_code', 'email_link'], 'a list is one leaf');
  });
});

describe('reading a declaration from a spec file', () => {
  it('returns null only when the word is nowhere in the file', () => {
    assert.equal(declaredIn("import type { InstanceSettings } from '../../fixtures.ts';\ntest('x', () => {});\n", 'specs/a.e2e.ts'), null);
  });

  it('reads identifier and quoted keys, both quote kinds, backticks, numbers, lists, comments, and trailing commas', () => {
    const source = exported(`{
  // why this spec needs it
  config: {
    auth_multi_factor: { required_for_sign_up: true, }, /* inline */
    "auth_password": { 'min_length': 12, max_length: -1, enabled: false, note: null, ratio: 1.5e1 },
    auth_email: { sign_in_strategies: ['email_code', "email_link", \`a\\tb\\u0041\`,], },
  },
  environment: {
    'user_settings.sign_up.mfa.required': true,
  },
};`);
    assert.deepEqual(declaredIn(source, 'specs/a.e2e.ts'), {
      config: {
        auth_multi_factor: { required_for_sign_up: true },
        auth_password: { min_length: 12, max_length: -1, enabled: false, note: null, ratio: 15 },
        auth_email: { sign_in_strategies: ['email_code', 'email_link', 'a\tbA'] },
      },
      environment: { 'user_settings.sign_up.mfa.required': true },
    });
  });

  it('accepts no annotation, `as const`, and `satisfies`, with or without the semicolon', () => {
    const body = JSON.stringify(MFA);
    for (const [literal, annotation] of [[`${body}`, ''], [`${body} as const;`, ''], [`${body} satisfies InstanceSettings;`, ''], [`${body} as const satisfies InstanceSettings`, ''], [`${body}; // trailing`, ': InstanceSettings']] as const) {
      assert.deepEqual(declaredIn(exported(literal, annotation), 'specs/a.e2e.ts'), MFA, literal);
    }
  });

  it('fails closed, with the spec path and the form to write, on anything that is not exactly one plain literal', () => {
    const good = literalOf(MFA);
    const refused: Readonly<Record<string, string>> = {
      'a second export': `${exported(good)}export const instanceSettings = ${good}\n`,
      'a named re-export': `const instanceSettings = ${good}\nexport { instanceSettings };\n`,
      'a default export': `const instanceSettings = ${good}\nexport default instanceSettings;\n`,
      'a mention in a comment': `// instanceSettings would go here\ntest('x', () => {});\n`,
      'a mention in a string': `test('needs instanceSettings', () => {});\n`,
      'a second mention beside a good export': `${exported(good)}console.log(instanceSettings);\n`,
      'an indented export': `if (true) {\n  export const instanceSettings = ${good}\n}\n`,
      'a variable': exported('shared;'),
      'a shared constant as a value': exported('{ config: MFA_CONFIG, environment: { a: true } };'),
      'a spread': exported("{ ...base, config: { a: { b: true } }, environment: { 'a.b': true } };"),
      'a spread in a list': exported("{ config: { a: { b: [...list] } }, environment: { 'a.b': true } };"),
      'a call': exported('makeSettings({ mfa: true });'),
      'a call as a value': exported("{ config: { a: { b: on() } }, environment: { 'a.b': true } };"),
      'a computed key': exported("{ config: { [key]: { b: true } }, environment: { 'a.b': true } };"),
      'a template with a substitution': exported("{ config: { a: { b: `x${y}` } }, environment: { 'a.b': true } };"),
      'a shorthand property': exported("{ config, environment: { 'a.b': true } };"),
      'a __proto__ key': exported("{ config: { __proto__: { b: true } }, environment: { 'a.b': true } };"),
      'a quoted __proto__ key': exported("{ config: { a: { '__proto__': true } }, environment: { 'a.b': true } };"),
      'a key other than config and environment': exported("{ config: { a: { b: true } }, environment: { 'a.b': true }, extra: 1 };"),
      'no config': exported("{ environment: { 'a.b': true } };"),
      'an empty config': exported("{ config: {}, environment: { 'a.b': true } };"),
      'no environment': exported('{ config: { a: { b: true } } };'),
      'an empty environment': exported('{ config: { a: { b: true } }, environment: {} };'),
      'an environment value that is an object': exported('{ config: { a: { b: true } }, environment: { a: { b: true } } };'),
      'an environment list of objects': exported("{ config: { a: { b: true } }, environment: { 'a.b': [{ c: 1 }] } };"),
      'a list as the whole value': exported('[1, 2];'),
      'something after the literal': exported(`${JSON.stringify(MFA)}.config;`),
      'a literal that never ends': exported("{ config: { a: { b: true } }, environment: { 'a.b': true }"),
      'a generic annotation': exported(good, ': Readonly<InstanceSettings>'),
    };
    refuses(refused);
  });

  it('refuses an export line that sits inside a comment, a string, or a template', () => {
    const line = `export const instanceSettings = ${literalOf(MFA)}`;
    refuses({ 'a block comment': `/*\n${line}\n*/\ntest('x', () => {});\n`, 'a block comment after code': `const a = 1; /* why\n${line}\n*/\n` }, /inside a comment/);
    refuses({ 'a string continued over lines': `const text = 'a \\\n${line}\\\n';\n` }, /inside a string/);
    refuses({ 'a string its line does not close': `const text = 'a\n${line}\n` }, /a string before its instanceSettings export never ends/);
    refuses(
      {
        'a template': `const text = \`\n${line}\n\`;\n`,
        'a template after a substitution that holds a brace and a quote': `const text = \`\${{ a: '}' }.a}\n${line}\n\`;\n`,
        'a template nested in a substitution': `const text = \`\${\`\n${line}\n\`}\`;\n`,
        'a substitution': `const text = \`\${\n${line}\n}\`;\n`,
      },
      /inside a template/,
    );
  });

  it('refuses a `/` before the export that may start a regular expression, which would hide a quote from the tool', () => {
    const line = `export const instanceSettings = ${literalOf(MFA)}`;
    refuses({ 'a regular expression that holds a quote, then a template': `const text = /'/.source + \`'\n${line}\n\`;\n`, 'a division': `const half = 10 / 2;\n${line}\n` }, /may start a regular expression/);
  });

  it('reads an export that follows comments, strings, and templates which hold quotes, braces, and comment marks', () => {
    const before = [
      '// it\'s a "note" with a ` and a /* that never ends',
      '/* it\'s "closed" // here ` */',
      "import { test } from '../../fixtures.ts';",
      'const a = \'a // b /* c \\\' d\', b = "it\'s `";',
      "const c = `${a ? `${{ b }.b}` : '}'} /* \\` // ${'`'}`;",
    ].join('\n');
    assert.deepEqual(declaredIn(`${before}\nexport const instanceSettings = ${literalOf(MFA)}\n`, 'specs/a.e2e.ts'), MFA);
  });

  it('refuses a literal that the next line continues as an expression', () => {
    const body = JSON.stringify(MFA);
    refuses(
      {
        'a call': exported(`${body}\n(shared);`),
        'a member': exported(`${body}\n  .config;`),
        'an optional member': exported(`${body}\n  ?.config;`),
        'an index': exported(`${body}\n[0];`),
        'an operator': exported(`${body}\n  || shared;`),
        'a division': exported(`${body}\n/ 2;`),
        'a tagged template': exported(`${body}\n\`x\`;`),
        'a keyword operator': exported(`${body}\nin shared;`),
        'a call after a comment and a blank line': exported(`${body} // why\n\n/* more */ (shared);`),
        'a call after as const': exported(`${body} as const\n(shared);`),
        'a call after satisfies': exported(`${body} satisfies InstanceSettings\n(shared);`),
      },
      /continues the expression/,
    );
    for (const next of ['', ';', '\n;(shared)', ';\n(async () => {})();', '\ninterface Other {}', '\ninstances.use();', '\n// a comment\nconst other = 1;', '\n{ const other = 1; }']) {
      assert.deepEqual(declaredIn(`export const instanceSettings = ${body}${next}\n`, 'specs/a.e2e.ts'), MFA, JSON.stringify(next));
    }
  });

  it('refuses a number JSON cannot hold and an escape JSON does not have', () => {
    const holding = (value: string) => exported(`{ config: { a: { b: ${value} } }, environment: { 'a.b': true } };`);
    refuses({ '1e999': holding('1e999'), '-1e999': holding('-1e999') }, /not a finite number/);
    refuses(
      {
        'a legacy octal escape': holding("'\\1'"),
        'a NUL escape': holding("'\\0'"),
        'a vertical tab': holding("'\\v'"),
        'a letter that only loses its backslash': holding("'\\q'"),
        'a line continuation': holding("'a\\\nb'"),
        'an escaped dollar in a template': holding('`\\${a}`'),
        'an escape in a quoted key': exported("{ config: { 'a\\1': { b: true } }, environment: { 'a.b': true } };"),
      },
      /has an escape this tool does not read/,
    );
    assert.deepEqual(declaredIn(holding("'\\n\\t\\r\\\\\\'\\\"\\`\\u0041\\u{1F600}\\x41\\b\\f\\/'"), 'specs/a.e2e.ts')?.config, { a: { b: '\n\t\r\\\'"`A\u{1F600}A\b\f/' } });
  });

  it('refuses a literal nested deeper than 32 levels as a declaration error, however deep it goes', () => {
    const lists = (levels: number) => exported(`{ config: { a: ${'['.repeat(levels)}${']'.repeat(levels)} }, environment: { 'a.b': true } };`);
    const objects = (levels: number) => exported(`{ config: { a: ${'{ b: '.repeat(levels)}1${' }'.repeat(levels)} }, environment: { 'a.b': true } };`);
    assert.ok(declaredIn(lists(30), 'specs/a.e2e.ts'), 'the outer object, config, and 30 lists are 32 levels');
    assert.ok(declaredIn(objects(30), 'specs/a.e2e.ts'));
    refuses({ '31 lists': lists(31), '31 objects': objects(31), '50,000 lists': lists(50_000), '50,000 objects': objects(50_000) }, /nests more than 32 levels deep/);
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
    assert.throws(() => settingsOf(unpinned, 'specs/a.e2e.ts'), (error: VerifyFailure) => error.code === 'INSTANCE_MISCONFIGURED' && error.message.includes('specs/a.e2e.ts') && error.message.includes('auth_email.brand_new_toggle') && error.fix.startsWith("check the spelling against Clerk's Platform API config; ") && error.fix.includes(`; add the standard value of \`auth_email.brand_new_toggle\` to \`config\` in ${STANDARD_FILE}`) && error.fix.includes('node src/core/manifest.ts --write'));
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
    assert.throws(() => settingsOf({ config: { auth_multi_factor: { required_for_sign_up: false } }, environment: MFA.environment }, 'specs/a.e2e.ts'), usage(/^specs\/a\.e2e\.ts declares only standard values/));
  });

  it('refuses an environment leaf the standard file does not list, or one at its standard value', () => {
    assert.throws(() => settingsOf({ config: MFA.config, environment: { 'user_settings.sign_up.mfa.requried': true } }, 'specs/a.e2e.ts'), (error: VerifyFailure) => usage(/specs\/a\.e2e\.ts expects the environment leaf user_settings\.sign_up\.mfa\.requried/)(error) && error.fix.endsWith('; a failed change lists the leaves a setting moves') && !error.fix.includes('doctor'));
    assert.throws(() => settingsOf({ config: MFA.config, environment: { 'user_settings.sign_up.mfa.required': false } }, 'specs/a.e2e.ts'), usage(/user_settings\.sign_up\.mfa\.required to be false, which is its standard value/));
    const listed = standardFile().environment['auth_config.first_factors'] as readonly string[];
    assert.throws(() => settingsOf({ config: MFA.config, environment: { 'auth_config.first_factors': [...listed].reverse() } }, 'a'), usage(/standard value/), 'a list in another order is the same value');
    assert.ok(settingsOf({ config: MFA.config, environment: { 'auth_config.reverification': false } }, 'a'), 'a leaf under defaults can be declared');
  });

  it('does not take a name every object inherits for a pinned config leaf or a listed environment leaf', () => {
    assert.throws(() => settingsOf({ config: { constructor: true }, environment: MFA.environment }, 'specs/a.e2e.ts'), (error: VerifyFailure) => error.code === 'INSTANCE_MISCONFIGURED' && /^specs\/a\.e2e\.ts declares constructor, and the standard file has no value/.test(error.message));
    assert.throws(() => settingsOf({ config: MFA.config, environment: { toString: true } }, 'specs/a.e2e.ts'), usage(/^specs\/a\.e2e\.ts expects the environment leaf toString, which/));
  });

  it('expects every leaf of the standard file, with the declared leaves laid over it', () => {
    const file = standardFile();
    const expected = expectedEnvironment(settingsOf(MFA, 'a'));
    assert.equal(Object.keys(expected).length, Object.keys(file.environment).length + Object.keys(file.defaults).length);
    assert.equal(expected['user_settings.sign_up.mfa.required'], true);
    assert.equal(expected['auth_config.reverification'], file.defaults['auth_config.reverification']);
    assert.equal(expectedEnvironment(STANDARD)['user_settings.sign_up.mfa.required'], false);
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
    assert.throws(() => planGroups([file('specs/a.e2e.ts'), { spec: spec('specs/b.e2e.ts'), source: 'export const instanceSettings = shared;\n' }], null), usage(/^specs\/b\.e2e\.ts: /));
  });
});
