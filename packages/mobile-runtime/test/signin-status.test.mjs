import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const status of ['needs_client_trust', 'future_sign_in_status']) {
  test(`nested client sign-in preserves ${status} and related fields`, async t => {
    const f = await fixture({
      client: {
        ...fixtures.client,
        sign_in: {
          ...fixtures.signIn,
          status,
          supported_identifiers: ['email_address'],
          identifier: 'person@example.com',
          created_session_id: null,
        },
      },
    });
    t.after(f.dispose);
    const signIn = f.resource(f.state.roots.signIn);
    assert.equal(signIn.status, status);
    assert.equal(Object.hasOwn(signIn, 'supportedIdentifiers'), false);
    assert.equal(signIn.identifier, 'person@example.com');
    assert.equal(signIn.createdSessionId, null);
    assert.equal(f.state.roots.session, null);
  });
}

test('server updates replace unknown sign-in status while preserving the resource handle', async t => {
  let status = 'future_sign_in_status';
  const f = await fixture({
    client: { ...fixtures.client, sign_in: { ...fixtures.signIn, status } },
    http: request => {
      if (!request.url.includes('/sign_ins')) return;
      return response({
        ...fixtures.signIn,
        status,
        identifier: 'updated@example.com',
        created_session_id: status === 'complete' ? 'sess_native' : null,
      });
    },
  });
  t.after(f.dispose);
  const handle = f.state.roots.signIn;
  for (status of ['another_future_status', 'complete']) {
    const result = await f.invoke(handle, 'SignIn.create', [{ identifier: 'updated@example.com' }]);
    assert.equal(result.result.error, null);
    assert.deepEqual(f.state.roots.signIn, handle);
    const signIn = f.resource(handle);
    assert.equal(signIn.status, status);
    assert.equal(signIn.identifier, 'updated@example.com');
    assert.equal(signIn.createdSessionId, status === 'complete' ? 'sess_native' : null);
    assert.equal(f.state.roots.session, null);
  }
});
