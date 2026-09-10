import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const options = {
  challenge: 'Y2hhbGxlbmdl',
  rp: { id: 'example.com', name: 'Example' },
  user: { id: 'dXNlcl9uYXRpdmU', name: 'test@example.com', displayName: 'Test User' },
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
  excludeCredentials: [{ type: 'public-key', id: 'b2xkX2NyZWRlbnRpYWw' }],
};
const credential = {
  id: 'Y3JlZGVudGlhbA',
  type: 'public-key',
  rawId: 'Y3JlZGVudGlhbA',
  authenticatorAttachment: 'platform',
  response: { clientDataJSON: 'e30', attestationObject: 'YXR0ZXN0YXRpb24', transports: ['internal'] },
};

for (const fail of [false, true]) {
  test(`generated passkey registration ${fail ? 'stops after native cancellation' : 'supports rename and deletion receipts'}`, async t => {
    const client = structuredClone(fixtures.authenticatedClient);
    let passkey = {
      object: 'passkey',
      id: 'passkey_native',
      name: null,
      last_used_at: null,
      created_at: 1700000000000,
      updated_at: 1700000000000,
      verification: {
        status: 'unverified',
        strategy: 'passkey',
        nonce: JSON.stringify(options),
        attempts: null,
        expire_at: null,
        error: null,
        verified_at_client: null,
      },
    };
    let presented;
    let submitted;
    const f = await fixture({
      client,
      capabilities: ['passkeys'],
      passkeys: message => {
        assert.equal(message.capability, 'passkeys.create');
        presented = message.args;
        if (fail) throw Object.assign(new Error('Cancelled'), { code: 'user_cancelled' });
        return credential;
      },
      http: request => {
        const url = new URL(request.url);
        if (url.pathname.endsWith('/tokens')) return response(tokenFixture(), { body: JSON.stringify(tokenFixture()) });
        if (url.pathname.endsWith('/touch')) return response(client.sessions[0]);
        if (!url.pathname.includes('/passkeys')) return;
        const body = new URLSearchParams(request.body);
        const method = url.searchParams.get('_method') ?? request.method;
        assert.equal(request.method, 'POST');
        if (url.pathname.endsWith('/attempt_verification')) {
          assert.equal(url.pathname, '/v1/me/passkeys/passkey_native/attempt_verification');
          assert.equal(body.get('strategy'), 'passkey');
          submitted = JSON.parse(body.get('public_key_credential'));
          passkey = { ...passkey, verification: { ...passkey.verification, status: 'verified' } };
        } else if (method === 'PATCH') {
          assert.equal(url.pathname, '/v1/me/passkeys/passkey_native');
          assert.equal(body.get('name'), 'New Name');
          passkey = { ...passkey, name: body.get('name') };
        } else if (method === 'DELETE') {
          assert.equal(url.pathname, '/v1/me/passkeys/passkey_native');
          client.sessions[0].user.passkeys = [];
          return response(null, {
            body: JSON.stringify({ response: { object: 'passkey', id: passkey.id, deleted: true }, client }),
          });
        } else {
          assert.equal(url.pathname, '/v1/me/passkeys');
        }
        client.sessions[0].user.passkeys = [structuredClone(passkey)];
        return response(null, { body: JSON.stringify({ response: passkey, client }) });
      },
    });
    t.after(f.dispose);
    const created = await f.invoke(f.state.roots.user, 'User.createPasskey');
    assert.deepEqual(presented?.challenge, { base64url: options.challenge });
    assert.equal(presented?.rp.id, options.rp.id);
    assert.deepEqual(presented?.user.id, { base64url: options.user.id });
    assert.deepEqual(presented?.excludeCredentials[0].id, { base64url: options.excludeCredentials[0].id });
    if (fail) {
      assert.equal(created.failure.code, 'user_cancelled');
      assert.equal(submitted, undefined);
      assert.equal(f.requests.filter(r => r.url.includes('/passkeys')).length, 1);
      return;
    }
    assert.equal(created.failure, undefined, JSON.stringify(created.failure));
    assert.equal(submitted.response.clientDataJSON, credential.response.clientDataJSON);
    assert.equal(submitted.response.attestationObject, credential.response.attestationObject);
    const handle = created.result.$ref;
    assert.equal(f.resource(handle).id, passkey.id);
    assert.equal(f.resource(f.resource(handle).verification.$ref).status, 'verified');
    const renamed = await f.invoke(handle, 'Passkey.update', [{ name: 'New Name' }]);
    assert.equal(renamed.failure, undefined, JSON.stringify(renamed.failure));
    assert.deepEqual(renamed.result, created.result);
    assert.equal(f.resource(handle).name, 'New Name');
    const removed = await f.invoke(handle, 'Passkey.delete');
    assert.equal(removed.failure, undefined, JSON.stringify(removed.failure));
    assert.equal(removed.result.id, passkey.id);
    assert.equal(removed.result.deleted, true);
    assert.deepEqual(f.resource(f.state.roots.user).passkeys, []);
    assert.equal(f.resource(handle).name, 'New Name');
  });
}
