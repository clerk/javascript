import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const challenge = {
  challenge: 'Y2hhbGxlbmdl',
  rpId: 'native-core.clerk.accounts.dev',
  userVerification: 'required',
  allowCredentials: [{ id: 'Y3JlZGVudGlhbA', type: 'public-key' }],
};
const credential = {
  type: 'public-key',
  id: 'Y3JlZGVudGlhbA',
  rawId: 'Y3JlZGVudGlhbA',
  authenticatorAttachment: 'platform',
  response: { clientDataJSON: 'e30', authenticatorData: 'YXV0aA', signature: 'c2ln', userHandle: null },
};
const attempt = (second = false) => ({
  ...fixtures.signIn,
  status: second ? 'needs_second_factor' : 'needs_first_factor',
  supported_first_factors: [{ strategy: 'passkey' }],
  supported_second_factors: second ? [{ strategy: 'passkey' }] : [],
  first_factor_verification: {
    ...fixtures.signIn.first_factor_verification,
    strategy: 'passkey',
    nonce: JSON.stringify(challenge),
  },
  second_factor_verification: second
    ? {
        ...fixtures.signIn.first_factor_verification,
        strategy: 'passkey',
        nonce: JSON.stringify(challenge),
      }
    : null,
});
const apiError = () =>
  response(null, {
    status: 400,
    body: JSON.stringify({
      clerk_trace_id: 'passkey-signin-trace',
      errors: [
        { code: 'passkey_verification_failed', message: 'Credential rejected', long_message: 'Try another passkey.' },
      ],
    }),
  });

for (const flow of ['autofill', 'discoverable']) {
  test(`future passkey forwards native ${flow} presentation and binary options`, async t => {
    let presented;
    const f = await fixture({
      capabilities: ['passkeys', 'passkeys.autofill'],
      passkeys: message => {
        presented = message.args;
        return credential;
      },
      http: request => {
        if (!request.url.includes('/sign_ins')) return;
        return response(
          request.url.includes('/attempt_first_factor')
            ? { ...attempt(), status: 'complete', created_session_id: 'sess_native' }
            : attempt(),
        );
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.signIn, 'SignIn.passkey', [
      { flow, preferImmediatelyAvailableCredentials: true },
    ]);
    assert.equal(result.result.error, null);
    assert.equal(presented.conditionalUI, flow === 'autofill');
    assert.equal(presented.preferImmediatelyAvailableCredentials, true);
    assert.deepEqual(presented.challenge, { base64url: challenge.challenge });
    assert.deepEqual(presented.allowCredentials[0].id, { base64url: challenge.allowCredentials[0].id });
    const submitted = f.requests.find(r => r.url.includes('/attempt_first_factor'));
    const body = new URLSearchParams(submitted.body);
    assert.equal(JSON.parse(body.get('public_key_credential')).response.signature, credential.response.signature);
    assert.equal(f.resource(f.state.roots.signIn).status, 'complete');
    assert.equal(f.state.roots.session, null);
    assert.equal(JSON.stringify(f.messages.filter(m => m.state)).includes(challenge.challenge), false);
  });
}

test('future passkey prepares and attempts the active second factor without recreating sign-in', async t => {
  let presented;
  const f = await fixture({
    capabilities: ['passkeys', 'passkeys.autofill'],
    passkeys: message => {
      presented = message.args;
      return credential;
    },
    http: request => {
      if (!request.url.includes('/sign_ins')) return;
      return response(
        request.url.includes('/attempt_second_factor')
          ? { ...attempt(true), status: 'complete', created_session_id: 'sess_native' }
          : attempt(true),
      );
    },
  });
  t.after(f.dispose);
  await f.invoke(f.state.roots.signIn, 'SignIn.create', [{ identifier: 'user@example.com' }]);
  const before = f.requests.length;
  const result = await f.invoke(f.state.roots.signIn, 'SignIn.passkey', [{ flow: 'autofill' }]);
  assert.equal(result.result.error, null);
  assert.equal(presented.conditionalUI, false);
  assert.deepEqual(
    f.requests.slice(before).map(r => new URL(r.url).pathname.split('/').at(-1)),
    ['prepare_second_factor', 'attempt_second_factor'],
  );
  assert.equal(f.resource(f.state.roots.signIn).status, 'complete');
  assert.equal(f.state.roots.session, null);
});

for (const failedStage of ['preparingFirstFactor', 'requestingAuthorization', 'attemptingFirstFactor']) {
  test(`passkey failure retains source stage and error: ${failedStage}`, async t => {
    const f = await fixture({
      capabilities: ['passkeys'],
      passkeys: () => {
        if (failedStage === 'requestingAuthorization')
          throw Object.assign(new Error('Cancelled'), { code: 'user_cancelled' });
        return credential;
      },
      http: request => {
        if (!request.url.includes('/sign_ins')) return;
        if (failedStage === 'preparingFirstFactor' || request.url.includes('/attempt_first_factor')) return apiError();
        return response(attempt());
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.signIn, 'SignIn.passkey', [{ flow: 'discoverable' }]);
    assert.equal(result.result.error.passkeyStage, failedStage);
    if (failedStage === 'requestingAuthorization') assert.equal(result.result.error.code, 'user_cancelled');
    else {
      assert.equal(result.result.error.errors[0].code, 'passkey_verification_failed');
      assert.equal(result.result.error.clerkTraceId, 'passkey-signin-trace');
      assert.equal(result.result.error.errors[0].longMessage, 'Try another passkey.');
    }
    assert.equal(f.state.roots.session, null);
  });
}

for (const failedStage of ['preparingSecondFactor', 'attemptingSecondFactor']) {
  test(`second-factor passkey reports ${failedStage} without replacing its attempt`, async t => {
    const f = await fixture({
      capabilities: ['passkeys'],
      passkeys: () => credential,
      http: request => {
        if (!request.url.includes('/sign_ins')) return;
        if (
          request.url.includes(
            failedStage === 'preparingSecondFactor' ? '/prepare_second_factor' : '/attempt_second_factor',
          )
        )
          return apiError();
        return response(attempt(true));
      },
    });
    t.after(f.dispose);
    await f.invoke(f.state.roots.signIn, 'SignIn.create', [{ identifier: 'user@example.com' }]);
    const handle = f.state.roots.signIn;
    const result = await f.invoke(handle, 'SignIn.passkey');
    assert.equal(result.result.error.passkeyStage, failedStage);
    assert.equal(result.result.error.errors[0].code, 'passkey_verification_failed');
    assert.equal(result.result.error.clerkTraceId, 'passkey-signin-trace');
    assert.equal(result.result.error.errors[0].longMessage, 'Try another passkey.');
    assert.deepEqual(f.state.roots.signIn, handle);
    assert.equal(f.resource(handle).status, 'needs_second_factor');
    assert.equal(f.state.roots.session, null);
  });
}

test('unknown passkey provider failure retains the attempt without submitting a credential', async t => {
  const f = await fixture({
    capabilities: ['passkeys'],
    passkeys: () => {
      throw Object.assign(new Error('private provider detail'), { code: 'host_failure' });
    },
    http: request => (request.url.includes('/sign_ins') ? response(attempt()) : undefined),
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.signIn, 'SignIn.passkey', [{ flow: 'discoverable' }]);
  assert.equal(result.result.error.code, 'host_failure');
  assert.equal(result.result.error.passkeyStage, 'requestingAuthorization');
  assert.equal(
    f.requests.some(request => request.url.includes('/attempt_first_factor')),
    false,
  );
  assert.equal(f.resource(f.state.roots.signIn).status, 'needs_first_factor');
  assert.equal(f.state.roots.session, null);
  assert.equal(JSON.stringify(result).includes('private provider detail'), false);
});
