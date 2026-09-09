import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response, sessionFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const strict = { $case: 1, value: 'strict' };
const strictMfa = { $case: 0, value: 'strict_mfa' };
const check = (field, value, reverification) => ({
  $case: ['role', 'permission', 'feature', 'plan', 'none'].indexOf(field),
  value: { ...(field === 'none' ? {} : { [field]: value }), ...(reverification ? { reverification } : {}) },
});

function authorizedSession(options = {}) {
  const session = sessionFixture();
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const claims = {
    sid: session.id,
    iat: now,
    exp: now + 3600,
    fea: 'o:reservations,u:dashboard,ou:support,uo:billing',
    pla: 'u:plus',
    ...options.claims,
  };
  session.last_active_token = options.noToken
    ? null
    : { object: 'token', jwt: `${encode({ alg: 'none' })}.${encode(claims)}.fixture` };
  session.factor_verification_age = Object.hasOwn(options, 'ages') ? options.ages : [0, 0];
  if (options.omitAges) delete session.factor_verification_age;
  session.last_active_organization_id = options.noOrg ? null : 'org_authorization';
  session.user.organization_memberships = options.noOrg
    ? []
    : [
        {
          object: 'organization_membership',
          id: 'orgmem_authorization',
          role: 'admin',
          role_name: 'Admin',
          permissions: ['org:sys_memberships:read'],
          public_metadata: {},
          created_at: 1700000000000,
          updated_at: 1700000000000,
          organization: {
            object: 'organization',
            id: 'org_authorization',
            name: 'Authorization Org',
            slug: 'authorization-org',
            image_url: '',
            has_image: false,
            public_metadata: {},
            created_at: 1700000000000,
            updated_at: 1700000000000,
          },
        },
      ];
  return session;
}

const cases = [
  ['existing plan', {}, check('plan', 'plus'), true],
  ['missing plan', {}, check('plan', 'free'), false],
  ...[
    'o:reservations',
    'org:reservations',
    'organization:reservations',
    'reservations',
    'u:dashboard',
    'user:dashboard',
    'dashboard',
    'o:support',
    'u:support',
    'o:billing',
    'u:billing',
  ].map(value => [`feature ${value}`, {}, check('feature', value), true]),
  ['unknown feature scope', {}, check('feature', 'lol:dashboard'), false],
  ['missing feature', {}, check('feature', 'missing'), false],
  ['empty request', {}, check('none'), false],
  ['role prefix', {}, check('role', 'org:admin'), true],
  ['role without prefix', {}, check('role', 'admin'), true],
  ['wrong role', {}, check('role', 'org:member'), false],
  ['permission present', {}, check('permission', 'org:sys_memberships:read'), true],
  ['permission absent', {}, check('permission', 'org:sys_profile:delete'), false],
  ['permission without org', { noOrg: true }, check('permission', 'org:sys_memberships:read', strict), false],
  ['role without org', { noOrg: true }, check('role', 'org:admin', strict), false],
  ['project factor ages', { ages: [5, 10] }, check('plan', 'plus'), true],
  ['missing factor ages', { ages: null }, check('permission', 'org:sys_memberships:read', strict), false],
  ['fresh permission and reverification', {}, check('permission', 'org:sys_memberships:read', strict), true],
  ['stale reverification', { ages: [10, 10] }, check('permission', 'org:sys_memberships:read', strict), false],
  [
    'strict MFA without second factor',
    { ages: [0, -1] },
    check('permission', 'org:sys_memberships:read', strictMfa),
    true,
  ],
  ['no enrolled factors', { ages: [-1, -1] }, check('permission', 'org:sys_memberships:read', strict), false],
  ['missing feature despite fresh factors', { claims: { fea: '' } }, check('feature', 'org:premium', strict), false],
  ['missing feature claims', { noToken: true }, check('feature', 'reservations'), false],
  ['missing plan claims', { noToken: true }, check('plan', 'plus'), false],
  ['malformed feature claim', { claims: { fea: 'reservations,dashboard' } }, check('feature', 'reservations'), false],
  ['user feature without org', { noOrg: true, claims: { fea: 'u:dashboard' } }, check('feature', 'u:dashboard'), true],
  [
    'org feature absent without org',
    { noOrg: true, claims: { fea: 'u:dashboard' } },
    check('feature', 'o:dashboard'),
    false,
  ],
  ...[0, -1].map(afterMinutes => [
    `invalid maximum age ${afterMinutes}`,
    {},
    check('none', undefined, { $case: 4, value: { level: 'multi_factor', afterMinutes } }),
    false,
  ]),
  [
    'unknown reverification level',
    {},
    check('none', undefined, { $case: 4, value: { level: 'nope', afterMinutes: 10 } }),
    'invalid_bridge_value',
  ],
];

for (const [name, options, params, expected] of cases) {
  test(`generated session authorization: ${name}`, async t => {
    const session = authorizedSession(options);
    const f = await fixture({
      client: { ...fixtures.client, sessions: [session], last_active_session_id: session.id },
    });
    t.after(f.dispose);
    const before = f.requests.length;
    const result = await f.invoke(f.state.roots.session, 'Session.checkAuthorization', [params]);
    if (expected === 'invalid_bridge_value') {
      assert.equal(result.failure?.kind, 'bridge');
      assert.equal(result.failure?.code, expected);
    } else {
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      assert.equal(result.result, expected);
    }
    assert.equal(f.requests.length, before, 'authorization uses local canonical state');
    assert.deepEqual(
      f.resource(f.state.roots.session).factorVerificationAge,
      options.omitAges ? null : (options.ages ?? (Object.hasOwn(options, 'ages') ? null : [0, 0])),
    );
  });
}

test('authorization observes changed membership permissions after session reload', async t => {
  const session = authorizedSession();
  const updated = structuredClone(session);
  updated.user.organization_memberships[0].permissions = [];
  const client = value => ({ ...fixtures.client, sessions: [value], last_active_session_id: value.id });
  const f = await fixture({
    client: client(session),
    http: request =>
      new URL(request.url).pathname.endsWith(`/sessions/${session.id}`)
        ? response(updated, { body: JSON.stringify({ response: updated, client: client(updated) }) })
        : undefined,
  });
  t.after(f.dispose);
  const handle = f.state.roots.session;
  const params = check('permission', 'org:sys_memberships:read');
  assert.equal((await f.invoke(handle, 'Session.checkAuthorization', [params])).result, true);
  assert.equal((await f.invoke(handle, 'Session.reload')).failure, undefined);
  assert.deepEqual(f.state.roots.session, handle);
  assert.equal((await f.invoke(handle, 'Session.checkAuthorization', [params])).result, false);
});

for (const name of ['omitted', 'malformed']) {
  test(`authorization rejects ${name} required factor ages at startup`, async t => {
    const session = authorizedSession(name === 'omitted' ? { omitAges: true } : { ages: [0] });
    const f = await fixture({
      allowFailure: true,
      client: { ...fixtures.client, sessions: [session], last_active_session_id: session.id },
    });
    t.after(f.dispose);
    assert.equal(f.ready.kind, 'initializationFailed');
    assert.equal(f.ready.failure?.code, 'invalid_projection:Session.factorVerificationAge', JSON.stringify(f.ready));
  });
}
