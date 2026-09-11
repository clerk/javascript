import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const options = {
  challenge: 'Y2hhbGxlbmdl',
  rpId: 'passkeys.example.com',
  timeout: 45000,
  userVerification: 'preferred',
  allowCredentials: [
    { type: 'public-key', id: 'Y3JlZGVudGlhbDE', transports: ['internal', 'hybrid'] },
    { type: 'public-key', id: 'Y3JlZGVudGlhbDI' },
  ],
};

async function run(t, overrides, inspect) {
  const challenge = { ...options, ...overrides };
  let presentations = 0;
  let presented;
  const f = await fixture({
    capabilities: ['passkeys'],
    passkeys: message => {
      presentations++;
      presented = message.args;
      throw Object.assign(new Error('Fixture stops at presentation'), { code: 'user_cancelled' });
    },
    http: request => {
      if (!request.url.includes('/sign_ins')) return;
      assert.equal(new URL(request.url).pathname, '/v1/client/sign_ins');
      return response({
        ...fixtures.signIn,
        status: 'needs_first_factor',
        supported_first_factors: [{ strategy: 'passkey' }],
        first_factor_verification: {
          ...fixtures.signIn.first_factor_verification,
          strategy: 'passkey',
          nonce: JSON.stringify(challenge),
        },
      });
    },
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.signIn, 'SignIn.passkey', [{ flow: 'discoverable' }]);
  assert.equal(f.resource(f.state.roots.signIn).status, 'needs_first_factor');
  assert.equal(f.state.roots.session, null);
  assert.equal(f.requests.filter(request => request.url.includes('/sign_ins')).length, 1);
  inspect({ result, presentations, presented });
}

test('server assertion options preserve relying party, credential order and transports', async t => {
  await run(t, {}, ({ result, presentations, presented }) => {
    assert.equal(presentations, 1);
    assert.equal(result.result.error.code, 'user_cancelled');
    assert.equal(presented.rpId, options.rpId);
    assert.equal(presented.timeout, 45000);
    assert.equal(presented.userVerification, 'preferred');
    assert.deepEqual(presented.challenge, { base64url: options.challenge });
    assert.deepEqual(
      presented.allowCredentials,
      options.allowCredentials.map(credential => ({
        ...credential,
        id: { base64url: credential.id },
      })),
    );
  });
});

for (const [name, overrides] of [
  ['missing relying party', { rpId: undefined }],
  ['registration-style relying party', { rpId: undefined, rp: { id: 'passkeys.example.com' } }],
  ['empty relying party', { rpId: '' }],
  ['whitespace relying party', { rpId: '  ' }],
  ['non-string relying party', { rpId: 123 }],
]) {
  test(`${name} fails before native presentation without a domain fallback`, async t => {
    await run(t, overrides, ({ result, presentations }) => {
      assert.equal(presentations, 0);
      assert.equal(result.result.error.code, 'invalid_credential_options');
      assert.equal(result.result.error.passkeyStage, 'requestingAuthorization');
    });
  });
}

for (const [name, credential] of [
  ['missing credential ID', { type: 'public-key' }],
  ['invalid credential ID', { type: 'public-key', id: '!!!' }],
]) {
  test(`${name} rejects the server list instead of dropping entries`, async t => {
    await run(t, { allowCredentials: [options.allowCredentials[0], credential] }, ({ result, presentations }) => {
      assert.equal(presentations, 0);
      assert.ok(result.result.error);
      assert.equal(result.result.error.passkeyStage, 'preparingFirstFactor');
    });
  });
}
