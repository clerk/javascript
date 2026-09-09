import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response, deferred } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const signIn = { ...fixtures.signIn, status: 'complete', created_session_id: 'sess_native' };
const signUp = { ...fixtures.signUp, status: 'complete', created_session_id: 'sess_native' };
const apiError = code =>
  response(null, { status: 422, body: JSON.stringify({ errors: [{ code, message: 'Authentication failed' }] }) });

for (const scenario of ['existing', 'new', 'sign-in-only', 'rejected', 'empty-picker', 'cancelled']) {
  test(`shared Google credential flow: ${scenario}`, async t => {
    let prompts = 0,
      browsers = 0;
    const f = await fixture({
      capabilities: ['googleIdentity'],
      googleIdentity: ({ clientId }) => {
        assert.equal(clientId, 'configured_google_client');
        prompts++;
        if (scenario === 'empty-picker' || scenario === 'cancelled')
          throw Object.assign(new Error('Picker finished'), {
            code: scenario === 'cancelled' ? 'user_cancelled' : 'google_account_unavailable',
          });
        return { token: 'google_identity_secret' };
      },
      browser: () => {
        browsers++;
      },
      http: request => {
        const path = new URL(request.url).pathname;
        if (path.endsWith('/environment')) {
          const environment = structuredClone(fixtures.environment);
          environment.display_config.google_one_tap_client_id = 'configured_google_client';
          return response(environment);
        }
        if (path.includes('/sign_ins')) {
          if (scenario === 'new' || scenario === 'sign-in-only') return apiError('external_account_not_found');
          if (scenario === 'rejected') return apiError('verification_failed');
          return response(scenario === 'empty-picker' && request.method !== 'GET' ? fixtures.signIn : signIn);
        }
        if (path.includes('/sign_ups')) return response(signUp);
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.clerk, 'Clerk.authenticateWithSSO', [
      {
        strategy: 'oauth_google',
        start: 'signIn',
        transferable: scenario !== 'sign-in-only',
        preferGoogleOneTap: true,
        unsafeMetadata: { carried: true },
      },
    ]);
    assert.equal(prompts, 1);
    assert.equal(browsers, scenario === 'empty-picker' ? 1 : 0);
    assert.equal(f.state.roots.session, null, 'prebuilt convenience does not implicitly finalize');
    if (['sign-in-only', 'rejected', 'cancelled'].includes(scenario)) assert.ok(result.failure);
    else {
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      assert.equal(result.result.value.kind, scenario === 'new' ? 'signUp' : 'signIn');
    }
    const signup = f.requests.find(r => r.url.includes('/sign_ups'));
    assert.equal(Boolean(signup), scenario === 'new');
    if (signup) {
      const body = new URLSearchParams(signup.body);
      assert.equal(body.get('token'), 'google_identity_secret');
      assert.equal(body.get('unsafe_metadata'), '{"carried":true}');
    }
    assert.equal(JSON.stringify(f.messages.filter(m => m.state)).includes('google_identity_secret'), false);
  });
}

for (const mode of ['signIn', 'signUp', 'signInOrUp']) {
  for (const missing of [true, false]) {
    test(`identifier screen ${mode}, missing=${missing}`, async t => {
      const f = await fixture({
        http: request => {
          const path = new URL(request.url).pathname;
          if (path.includes('/sign_ins')) return missing ? apiError('form_identifier_not_found') : response(signIn);
          if (path.includes('/sign_ups')) return response(signUp);
        },
      });
      t.after(f.dispose);
      const result = await f.invoke(f.state.roots.clerk, 'Clerk.startAuthentication', [
        { mode, identifier: 'person@example.com', identifierType: 'emailAddress', unsafeMetadata: { carried: true } },
      ]);
      const expectsSignup = mode === 'signUp' || (mode === 'signInOrUp' && missing);
      if (mode === 'signIn' && missing) assert.equal(result.failure.errors[0].code, 'form_identifier_not_found');
      else {
        assert.equal(result.failure, undefined, JSON.stringify(result.failure));
        assert.equal(result.result.value.kind, expectsSignup ? 'signUp' : 'signIn');
      }
      assert.equal(f.state.roots.session, null);
      const signup = f.requests.find(r => r.url.includes('/sign_ups'));
      assert.equal(Boolean(signup), expectsSignup);
      if (signup) assert.equal(new URLSearchParams(signup.body).get('email_address'), 'person@example.com');
    });
  }
}

test('reset cancels the Google picker before a late token can authenticate', async t => {
  const opened = deferred(),
    credential = deferred();
  const f = await fixture({
    capabilities: ['googleIdentity'],
    googleIdentity: () => {
      opened.resolve();
      return credential.promise;
    },
    http: request => {
      if (new URL(request.url).pathname.endsWith('/environment')) {
        const environment = structuredClone(fixtures.environment);
        environment.display_config.google_one_tap_client_id = 'configured_google_client';
        return response(environment);
      }
    },
  });
  t.after(f.dispose);
  const before = f.requests.length;
  const result = f.invoke(f.state.roots.clerk, 'Clerk.authenticateWithSSO', [
    { strategy: 'oauth_google', start: 'signIn', transferable: true, preferGoogleOneTap: true },
  ]);
  await opened.promise;
  await f.invoke(f.state.roots.signIn, 'SignIn.reset');
  assert.ok((await result).failure);
  credential.resolve({ token: 'late_google_identity' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.requests.length, before);
});
