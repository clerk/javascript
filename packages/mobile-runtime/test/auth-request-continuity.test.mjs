import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

test('sign-up create and update preserve metadata JSON, profile fields and explicit consent', async t => {
  const f = await fixture({
    http: request => (new URL(request.url).pathname.includes('/sign_ups') ? response(fixtures.signUp) : undefined),
  });
  t.after(f.dispose);
  const metadata = { customCamelKey: 'value', nested: { retain_null: null }, list: [1, false, 'x'] };
  for (const [operation, method, legalAccepted] of [
    ['SignUp.create', 'POST', true],
    ['SignUp.update', 'PATCH', false],
  ]) {
    const result = await f.invoke(f.state.roots.signUp, operation, [
      {
        firstName: 'John',
        lastName: 'Doe',
        unsafeMetadata: metadata,
        legalAccepted,
      },
    ]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(result.result.error, null);
    const request = f.requests.at(-1);
    assert.equal(request.method, 'POST');
    assert.equal(new URL(request.url).searchParams.get('_method'), method === 'PATCH' ? 'PATCH' : null);
    assert.equal(
      new URL(request.url).pathname,
      method === 'POST' ? '/v1/client/sign_ups' : '/v1/client/sign_ups/sua_native',
    );
    const body = new URLSearchParams(request.body);
    assert.equal(body.get('first_name'), 'John');
    assert.equal(body.get('last_name'), 'Doe');
    assert.equal(body.get('legal_accepted'), legalAccepted ? 'true' : 'false');
    assert.deepEqual(JSON.parse(body.get('unsafe_metadata')), metadata);
    assert.equal(
      [...body.keys()].some(key => key.startsWith('unsafe_metadata[')),
      false,
    );
  }
});

for (const group of ['resetPasswordEmailCode', 'resetPasswordPhoneCode']) {
  for (const signOutOfOtherSessions of [true, false, undefined]) {
    test(`${group} preserves revoke-other-sessions choice ${signOutOfOtherSessions ?? '(default)'}`, async t => {
      const f = await fixture({
        client: { ...fixtures.client, sign_in: { ...fixtures.signIn, status: 'needs_new_password' } },
        http: request =>
          new URL(request.url).pathname.endsWith('/reset_password')
            ? response({ ...fixtures.signIn, status: 'complete', created_session_id: 'sess_native' })
            : undefined,
      });
      t.after(f.dispose);
      const handle = f.group('signIn', group);
      const result = await f.invoke(handle, `${handle.type}.submitPassword`, [
        {
          password: 'new-fixture-password',
          ...(signOutOfOtherSessions === undefined ? {} : { signOutOfOtherSessions }),
        },
      ]);
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      assert.equal(result.result.error, null);
      const request = f.requests.at(-1);
      assert.equal(request.method, 'POST');
      assert.equal(new URL(request.url).pathname, '/v1/client/sign_ins/sia_native/reset_password');
      const body = new URLSearchParams(request.body);
      assert.equal(body.get('password'), 'new-fixture-password');
      assert.equal(body.get('sign_out_of_other_sessions'), String(signOutOfOtherSessions ?? true));
      assert.equal(f.resource(f.state.roots.signIn).status, 'complete');
      assert.equal(f.state.roots.session, null);
    });
  }
}

for (const [operation, params, expected] of [
  ['SignIn.create', { identifier: 'test@example.com' }, { identifier: 'test@example.com' }],
  [
    'SignIn.create',
    { identifier: 'test@example.com', password: 'fixture_password' },
    { identifier: 'test@example.com', password: 'fixture_password' },
  ],
  ['SignIn.ticket', { ticket: 'fixture_ticket' }, { strategy: 'ticket', ticket: 'fixture_ticket' }],
  [
    'SignIn.create',
    { strategy: 'oauth_token_apple', token: 'provided_apple_token' },
    { strategy: 'oauth_token_apple', token: 'provided_apple_token' },
  ],
  [
    'SignUp.create',
    { emailAddress: 'test@example.com', password: 'fixture_password' },
    { email_address: 'test@example.com', password: 'fixture_password' },
  ],
  [
    'SignUp.create',
    { transfer: true, unsafeMetadata: { birthday: '1990-01-01' }, legalAccepted: true },
    { transfer: 'true', unsafe_metadata: '{"birthday":"1990-01-01"}', legal_accepted: 'true' },
  ],
  [
    'SignUp.create',
    {
      strategy: 'oauth_token_apple',
      token: 'provided_apple_token',
      firstName: 'Jane',
      lastName: 'Doe',
      unsafeMetadata: { plan: 'pro' },
    },
    {
      strategy: 'oauth_token_apple',
      token: 'provided_apple_token',
      first_name: 'Jane',
      last_name: 'Doe',
      unsafe_metadata: '{"plan":"pro"}',
    },
  ],
  [
    'SignUp.ticket',
    { ticket: 'fixture_ticket', unsafeMetadata: { plan: 'pro' } },
    { strategy: 'ticket', ticket: 'fixture_ticket', unsafe_metadata: '{"plan":"pro"}' },
  ],
]) {
  test(`generated ${operation} preserves direct authentication fields ${JSON.stringify(Object.keys(params))}`, async t => {
    const root = operation.startsWith('SignIn') ? 'signIn' : 'signUp';
    const endpoint = root === 'signIn' ? 'sign_ins' : 'sign_ups';
    const f = await fixture({
      http: request =>
        new URL(request.url).pathname.endsWith(`/${endpoint}`)
          ? response({ ...fixtures[root], status: 'complete', created_session_id: 'sess_native' })
          : undefined,
    });
    t.after(f.dispose);
    const count = f.requests.length;
    const result = await f.invoke(f.state.roots[root], operation, [params]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(result.result.error, null);
    assert.equal(f.requests.length, count + 1);
    const request = f.requests.at(-1);
    assert.equal(request.method, 'POST');
    assert.equal(new URL(request.url).pathname, `/v1/client/${endpoint}`);
    const body = new URLSearchParams(request.body);
    for (const [key, value] of Object.entries(expected)) assert.equal(body.get(key), value);
    assert.equal(body.has('transfer'), 'transfer' in params);
    assert.equal(
      f.messages.some(m => m.kind === 'hostRequest' && ['appleIdentity', 'browser'].includes(m.capability)),
      false,
    );
    assert.equal(f.resource(f.state.roots[root]).status, 'complete');
    assert.equal(f.state.roots.session, null);
    const states = JSON.stringify(f.messages.filter(m => m.state));
    for (const secret of ['fixture_password', 'fixture_ticket', 'provided_apple_token'])
      assert.equal(states.includes(secret), false);
  });
}
