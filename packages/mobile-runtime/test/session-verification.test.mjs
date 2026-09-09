import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response, sessionFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const variant = ($case, value) => ({ $case, value });
const cases = [
  ...['first_factor', 'second_factor', 'multi_factor'].map(level => [
    'startVerification',
    { level },
    'verify',
    { level },
  ]),
  [
    'prepareFirstFactorVerification',
    variant(0, { strategy: 'passkey' }),
    'verify/prepare_first_factor',
    { strategy: 'passkey' },
  ],
  [
    'prepareFirstFactorVerification',
    variant(1, { strategy: 'email_code', emailAddressId: 'idn_email' }),
    'verify/prepare_first_factor',
    { strategy: 'email_code', email_address_id: 'idn_email' },
  ],
  [
    'prepareFirstFactorVerification',
    variant(2, { strategy: 'phone_code', phoneNumberId: 'idn_phone', default: true }),
    'verify/prepare_first_factor',
    { strategy: 'phone_code', phone_number_id: 'idn_phone', default: 'true' },
  ],
  [
    'prepareFirstFactorVerification',
    variant(3, {
      strategy: 'enterprise_sso',
      emailAddressId: 'idn_email',
      enterpriseConnectionId: 'econn_123',
      redirectUrl: 'clerk-test://sso-callback',
    }),
    'verify/prepare_first_factor',
    {
      strategy: 'enterprise_sso',
      email_address_id: 'idn_email',
      enterprise_connection_id: 'econn_123',
      redirect_url: 'clerk-test://sso-callback',
    },
  ],
  [
    'attemptFirstFactorVerification',
    variant(0, { strategy: 'email_code', code: '123456' }),
    'verify/attempt_first_factor',
    { strategy: 'email_code', code: '123456' },
  ],
  [
    'attemptFirstFactorVerification',
    variant(1, { strategy: 'phone_code', code: '123456' }),
    'verify/attempt_first_factor',
    { strategy: 'phone_code', code: '123456' },
  ],
  [
    'attemptFirstFactorVerification',
    variant(2, { strategy: 'password', password: 'fixture-password' }),
    'verify/attempt_first_factor',
    { strategy: 'password', password: 'fixture-password' },
  ],
  [
    'prepareSecondFactorVerification',
    { strategy: 'phone_code', phoneNumberId: 'idn_phone' },
    'verify/prepare_second_factor',
    { strategy: 'phone_code', phone_number_id: 'idn_phone' },
  ],
  ...['phone_code', 'totp', 'backup_code'].map((strategy, index) => [
    'attemptSecondFactorVerification',
    variant(index, { strategy, code: '123456' }),
    'verify/attempt_second_factor',
    { strategy, code: '123456' },
  ]),
];

function verificationFixture(status = 'needs_first_factor') {
  return {
    object: 'session_verification',
    id: 'sv_fixture',
    status,
    level: 'multi_factor',
    session: sessionFixture(),
    first_factor_verification: {
      status: 'unverified',
      strategy: 'enterprise_sso',
      attempts: 0,
      expire_at: null,
      error: null,
      verified_at_client: null,
    },
    second_factor_verification: null,
    supported_first_factors: [
      { strategy: 'enterprise_sso', enterprise_connection_id: 'econn_123', enterprise_connection_name: 'Acme' },
    ],
    supported_second_factors: [
      {
        strategy: 'phone_code',
        phone_number_id: 'idn_phone',
        safe_identifier: '+15555550123',
        primary: true,
        default: true,
      },
    ],
  };
}

for (const [method, params, path, expectedBody] of cases) {
  test(`generated session verification: ${method} ${expectedBody.strategy ?? expectedBody.level}`, async t => {
    const status = method.startsWith('attempt')
      ? 'complete'
      : path.includes('second')
        ? 'needs_second_factor'
        : 'needs_first_factor';
    let requested = 0;
    const f = await fixture({
      client: fixtures.authenticatedClient,
      http: request => {
        if (!new URL(request.url).pathname.includes('/verify')) return;
        requested++;
        assert.equal(request.method, 'POST');
        assert.equal(new URL(request.url).pathname, `/v1/client/sessions/sess_native/${path}`);
        assert.deepEqual(Object.fromEntries(new URLSearchParams(request.body)), expectedBody);
        return response(verificationFixture(status));
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.session, `Session.${method}`, [params]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(requested, 1);
    const verification = f.resource(result.result.$ref);
    assert.equal(verification.status, status);
    assert.equal(verification.level, 'multi_factor');
    assert.equal(f.resource(verification.session.$ref).id, 'sess_native');
    assert.equal(verification.supportedFirstFactors[0].value.enterpriseConnectionId, 'econn_123');
    assert.equal(verification.supportedFirstFactors[0].value.enterpriseConnectionName, 'Acme');
    assert.equal(verification.supportedSecondFactors[0].value.phoneNumberId, 'idn_phone');
    assert.equal(verification.supportedSecondFactors[0].value.safeIdentifier, '+15555550123');
    assert.equal(verification.supportedSecondFactors[0].value.primary, true);
    assert.equal(verification.supportedSecondFactors[0].value.default, true);
    assert.equal(f.resource(verification.firstFactorVerification.$ref).status, 'unverified');
    assert.equal(f.resource(verification.secondFactorVerification.$ref).status, null);
  });
}

for (const fail of [false, true]) {
  test(`session passkey reverification ${fail ? 'propagates cancellation' : 'prepares and submits credential'}`, async t => {
    const challenge = 'Y2hhbGxlbmdl';
    const credential = {
      type: 'public-key',
      id: 'Y3JlZGVudGlhbA',
      rawId: 'Y3JlZGVudGlhbA',
      authenticatorAttachment: 'platform',
      response: { clientDataJSON: 'e30', authenticatorData: 'YXV0aA', signature: 'c2ln', userHandle: null },
    };
    const paths = [];
    let presented;
    const f = await fixture({
      client: fixtures.authenticatedClient,
      capabilities: ['passkeys'],
      passkeys: message => {
        presented = message.args;
        if (fail) throw Object.assign(new Error('Cancelled'), { code: 'passkey_operation_cancelled' });
        return credential;
      },
      http: request => {
        const path = new URL(request.url).pathname;
        if (!path.includes('/verify/')) return;
        paths.push(path.split('/').at(-1));
        const body = new URLSearchParams(request.body);
        assert.equal(body.get('strategy'), 'passkey');
        if (path.endsWith('/attempt_first_factor')) {
          assert.equal(JSON.parse(body.get('public_key_credential')).response.signature, credential.response.signature);
          return response(verificationFixture('complete'));
        }
        const prepared = verificationFixture();
        prepared.first_factor_verification = {
          ...prepared.first_factor_verification,
          strategy: 'passkey',
          nonce: JSON.stringify({ challenge, rpId: 'native-core.clerk.accounts.dev', userVerification: 'required' }),
        };
        return response(prepared);
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.session, 'Session.verifyWithPasskey');
    assert.deepEqual(presented.challenge, { base64url: challenge });
    assert.equal(presented.conditionalUI, false);
    if (fail) {
      assert.equal(result.failure?.code, 'passkey_operation_cancelled', JSON.stringify(result));
      assert.deepEqual(paths, ['prepare_first_factor']);
    } else {
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      assert.equal(f.resource(result.result.$ref).status, 'complete');
      assert.deepEqual(paths, ['prepare_first_factor', 'attempt_first_factor']);
    }
    assert.equal(JSON.stringify(f.messages.filter(m => m.state)).includes(challenge), false);
  });
}

test('session verification preserves structured invalid-code failure and permits retry', async t => {
  let fail = true;
  const f = await fixture({
    client: fixtures.authenticatedClient,
    http: request => {
      if (!new URL(request.url).pathname.includes('/verify/attempt_first_factor')) return;
      if (fail)
        return response(null, {
          status: 422,
          body: JSON.stringify({
            errors: [{ code: 'form_code_incorrect', message: 'Incorrect code', meta: { param_name: 'code' } }],
          }),
        });
      return response(verificationFixture('complete'));
    },
  });
  t.after(f.dispose);
  const handle = f.state.roots.session;
  const args = [variant(0, { strategy: 'email_code', code: '123456' })];
  const error = await f.invoke(handle, 'Session.attemptFirstFactorVerification', args);
  assert.equal(error.failure?.status, 422);
  assert.equal(error.failure?.errors[0].code, 'form_code_incorrect');
  fail = false;
  const success = await f.invoke(handle, 'Session.attemptFirstFactorVerification', args);
  assert.equal(success.failure, undefined, JSON.stringify(success.failure));
  assert.equal(f.resource(success.result.$ref).status, 'complete');
  assert.deepEqual(f.state.roots.session, handle);
});

test('session verification does not expose the inherited method without a reload endpoint', async t => {
  const f = await fixture({
    client: fixtures.authenticatedClient,
    http: request => {
      if (new URL(request.url).pathname.endsWith('/verify')) return response(verificationFixture());
    },
  });
  t.after(f.dispose);
  const start = await f.invoke(f.state.roots.session, 'Session.startVerification', [{ level: 'first_factor' }]);
  assert.equal(start.failure, undefined, JSON.stringify(start.failure));
  const before = f.requests.length;
  const result = await f.invoke(start.result.$ref, 'SessionVerification.reload');
  assert.equal(result.failure?.code, 'unknown_operation', JSON.stringify(result));
  assert.equal(f.requests.length, before);
});
