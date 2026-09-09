import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response, deferred } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const [root, type, endpoint] of [
  ['signIn', 'SignIn', 'sign_ins'],
  ['signUp', 'SignUp', 'sign_ups'],
]) {
  test(`${root}.sso uses the native Apple identity provider and leaves finalization explicit`, async t => {
    let credentials = 0;
    const f = await fixture({
      capabilities: ['appleIdentity'],
      appleIdentity: () => {
        credentials++;
        return { token: 'apple_fixture_identity_token', firstName: 'Apple', lastName: 'User' };
      },
      http: request => {
        if (!new URL(request.url).pathname.includes(`/${endpoint}`)) return;
        const data = { ...fixtures[root], status: 'complete', created_session_id: 'sess_native' };
        return response(data);
      },
    });
    t.after(f.dispose);
    const completed = await f.invoke(f.state.roots[root], `${type}.sso`, [{ strategy: 'oauth_token_apple' }]);
    assert.equal(completed.failure, undefined, JSON.stringify(completed.failure));
    assert.equal(completed.result.error, null);
    assert.equal(credentials, 1);
    const request = f.requests.find(r => new URL(r.url).pathname.includes(`/${endpoint}`));
    const body = new URLSearchParams(request.body);
    assert.equal(body.get('strategy'), 'oauth_token_apple');
    assert.equal(body.get('token'), 'apple_fixture_identity_token');
    assert.equal(f.resource(f.state.roots[root]).status, 'complete');
    assert.equal(f.state.roots.session, null);
    assert.equal(
      f.messages.some(m => m.kind === 'hostRequest' && m.capability === 'browser'),
      false,
    );
    assert.equal(
      JSON.stringify(f.messages.filter(m => m.state).map(m => m.state)).includes('apple_fixture_identity_token'),
      false,
    );
  });
}

test('Apple identity cancellation and unavailable providers do not start an authentication request', async t => {
  for (const available of [false, true]) {
    const f = await fixture({
      capabilities: available ? ['appleIdentity'] : [],
      appleIdentity: () => {
        throw Object.assign(new Error('cancelled'), { code: 'user_cancelled' });
      },
    });
    t.after(f.dispose);
    const before = f.requests.length;
    const result = await f.invoke(f.state.roots.signIn, 'SignIn.sso', [{ strategy: 'oauth_token_apple' }]);
    assert.equal(result.result.error.code, available ? 'user_cancelled' : 'capability_unavailable');
    assert.equal(f.requests.length, before);
    assert.equal(f.state.roots.session, null);
  }
});

test('reset fences a pending Apple identity result before an authentication request', async t => {
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
  const attempt = f.invoke(f.state.roots.signIn, 'SignIn.sso', [{ strategy: 'oauth_token_apple' }]);
  await opened.promise;
  const reset = await f.invoke(f.state.roots.signIn, 'SignIn.reset');
  assert.equal(reset.failure, undefined);
  assert.equal((await attempt).failure.code, 'stale_operation');
  credential.resolve({ token: 'late_apple_identity_token' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.requests.length, before);
  assert.equal(f.state.roots.session, null);
});
