import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response, deferred } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const completeSignIn = { ...fixtures.signIn, status: 'complete', created_session_id: 'sess_native' };
const completeSignUp = { ...fixtures.signUp, status: 'complete', created_session_id: 'sess_native' };
const transferableSignIn = {
  ...fixtures.signIn,
  first_factor_verification: { ...fixtures.signIn.first_factor_verification, status: 'transferable' },
};
const transferableSignUp = {
  ...fixtures.signUp,
  verifications: {
    external_account: {
      ...fixtures.signUp.verifications.external_account,
      status: 'transferable',
      error: { code: 'external_account_exists', message: 'Account exists' },
    },
  },
};

for (const scenario of ['new-user', 'existing-user', 'restricted-existing', 'restricted-new', 'sign-in-only']) {
  test(`prebuilt Apple SSO preserves one credential and explicit finalize: ${scenario}`, async t => {
    let prompts = 0;
    const attempts = [];
    const f = await fixture({
      capabilities: ['appleIdentity'],
      appleIdentity: () => {
        prompts++;
        return { token: 'one_apple_token', firstName: 'First', lastName: 'Last' };
      },
      http: request => {
        const pathname = new URL(request.url).pathname;
        if (pathname.endsWith('/environment')) {
          const environment = structuredClone(fixtures.environment);
          environment.user_settings.attributes.first_name.enabled = true;
          environment.user_settings.attributes.last_name.enabled = true;
          return response(environment);
        }
        if (!/\/sign_(ins|ups)/.test(pathname)) return;
        attempts.push({ pathname, body: new URLSearchParams(request.body) });
        if (pathname.includes('/sign_ups')) {
          if (scenario.startsWith('restricted'))
            return response(null, {
              status: 403,
              body: JSON.stringify({ errors: [{ code: 'sign_up_mode_restricted', message: 'Restricted' }] }),
            });
          return response(scenario === 'existing-user' ? transferableSignUp : completeSignUp);
        }
        return response(scenario === 'restricted-new' ? transferableSignIn : completeSignIn);
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.clerk, 'Clerk.authenticateWithSSO', [
      {
        strategy: 'oauth_token_apple',
        start: 'auto',
        transferable: scenario !== 'sign-in-only',
        unsafeMetadata: { preference: 'saved' },
      },
    ]);
    assert.equal(prompts, 1);
    assert.equal(f.state.roots.session, null);
    if (scenario === 'restricted-new') {
      assert.equal(result.failure.errors[0].code, 'sign_up_mode_restricted');
    } else {
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      assert.equal(result.result.value.kind, scenario === 'new-user' ? 'signUp' : 'signIn');
    }
    assert.equal(attempts.length, ['new-user', 'sign-in-only'].includes(scenario) ? 1 : 2);
    assert.equal(attempts[0].body.get('token'), 'one_apple_token');
    if (scenario !== 'sign-in-only') {
      assert.equal(attempts[0].body.get('first_name'), 'First');
      assert.equal(attempts[0].body.get('last_name'), 'Last');
      assert.equal(attempts[0].body.get('unsafe_metadata'), '{"preference":"saved"}');
    }
    if (scenario.startsWith('restricted')) assert.equal(attempts[1].body.get('token'), 'one_apple_token');
    if (scenario === 'existing-user') assert.equal(attempts[1].body.get('transfer'), 'true');
    assert.equal(JSON.stringify(f.messages.filter(m => m.state)).includes('one_apple_token'), false);
  });
}

for (const transferable of [true, false]) {
  test(`prebuilt OAuth completes the future SSO browser roundtrip before optional transfer: ${transferable}`, async t => {
    let browsers = 0;
    const f = await fixture({
      browser: () => {
        browsers++;
      },
      http: request => {
        const pathname = new URL(request.url).pathname;
        if (pathname.includes('/sign_ins'))
          return response(request.method === 'GET' ? transferableSignIn : fixtures.signIn);
        if (pathname.includes('/sign_ups')) return response(completeSignUp);
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.clerk, 'Clerk.authenticateWithSSO', [
      {
        strategy: 'oauth_google',
        start: 'signIn',
        transferable,
        unsafeMetadata: { carried: true },
      },
    ]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(result.result.value.kind, transferable ? 'signUp' : 'signIn');
    assert.equal(browsers, 1);
    assert.equal(f.state.roots.session, null);
    const reload = f.requests.find(r => r.method === 'GET' && r.url.includes('/sign_ins/'));
    assert.equal(new URL(reload.url).searchParams.get('rotating_token_nonce'), 'fixture_nonce');
    const signup = f.requests.find(r => r.url.includes('/sign_ups'));
    assert.equal(Boolean(signup), transferable);
    if (signup) {
      const body = new URLSearchParams(signup.body);
      assert.equal(body.get('transfer'), 'true');
      assert.equal(body.get('unsafe_metadata'), '{"carried":true}');
    }
  });
}

test('reset cancels a prebuilt Apple prompt without beginning authentication', async t => {
  const opened = deferred(),
    credential = deferred();
  const f = await fixture({
    capabilities: ['appleIdentity'],
    appleIdentity: () => {
      opened.resolve();
      return credential.promise;
    },
  });
  t.after(f.dispose);
  const before = f.requests.length;
  const attempt = f.invoke(f.state.roots.clerk, 'Clerk.authenticateWithSSO', [
    {
      strategy: 'oauth_token_apple',
      start: 'auto',
      transferable: true,
    },
  ]);
  await opened.promise;
  await f.invoke(f.state.roots.signIn, 'SignIn.reset');
  assert.ok((await attempt).failure);
  credential.resolve({ token: 'late_identity' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.requests.length, before);
  assert.equal(f.state.roots.session, null);
});
