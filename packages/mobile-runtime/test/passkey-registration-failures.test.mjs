import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const options = {
  challenge: 'Y2hhbGxlbmdl',
  rp: { id: 'example.com', name: 'Example' },
  user: { id: 'dXNlcl9uYXRpdmU', name: 'test@example.com', displayName: 'Test User' },
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
};
const credential = {
  id: 'Y3JlZGVudGlhbA',
  type: 'public-key',
  rawId: 'Y3JlZGVudGlhbA',
  authenticatorAttachment: 'platform',
  response: { clientDataJSON: 'e30', attestationObject: 'YXR0ZXN0YXRpb24', transports: ['internal'] },
};

for (const scenario of [
  'creation-rejected',
  'verification-rejected',
  'provider-failed',
  'invalid-credential',
  'missing-options',
  'unsupported',
]) {
  test(`generated passkey registration stops at ${scenario}`, async t => {
    const client = structuredClone(fixtures.authenticatedClient);
    const paths = [];
    let presentations = 0;
    const passkey = {
      object: 'passkey',
      id: 'passkey_native',
      name: null,
      last_used_at: null,
      created_at: 1700000000000,
      updated_at: 1700000000000,
      verification: {
        status: 'unverified',
        strategy: 'passkey',
        nonce: scenario === 'missing-options' ? null : JSON.stringify(options),
        attempts: null,
        expire_at: null,
        error: null,
        verified_at_client: null,
      },
    };
    const f = await fixture({
      client,
      capabilities: scenario === 'unsupported' ? [] : ['passkeys'],
      passkeys: message => {
        assert.equal(message.capability, 'passkeys.create');
        presentations++;
        if (scenario === 'provider-failed')
          throw Object.assign(new Error('private provider detail'), { code: 'host_failure' });
        if (scenario === 'invalid-credential') return { ...credential, response: null };
        return credential;
      },
      http: request => {
        const url = new URL(request.url);
        if (url.pathname.endsWith('/tokens')) return response(tokenFixture(), { body: JSON.stringify(tokenFixture()) });
        if (url.pathname.endsWith('/touch')) return response(client.sessions[0]);
        if (!url.pathname.includes('/passkeys')) return;
        paths.push(url.pathname);
        assert.equal(request.method, 'POST');
        const attempting = url.pathname.endsWith('/attempt_verification');
        assert.equal(
          url.pathname,
          attempting ? '/v1/me/passkeys/passkey_native/attempt_verification' : '/v1/me/passkeys',
        );
        if (attempting) {
          const body = new URLSearchParams(request.body);
          assert.equal(body.get('strategy'), 'passkey');
          assert.deepEqual(JSON.parse(body.get('public_key_credential')), credential);
        }
        if (scenario === 'creation-rejected' || (scenario === 'verification-rejected' && attempting)) {
          return response(null, {
            status: 422,
            body: JSON.stringify({
              clerk_trace_id: 'passkey-fixture-trace',
              errors: [
                {
                  code: scenario,
                  message: 'Registration rejected',
                  long_message: 'Try another passkey.',
                  meta: { param_name: 'public_key_credential', password: 'private response detail' },
                },
              ],
            }),
          });
        }
        assert.equal(attempting, false, 'Unexpected credential submission');
        return response(passkey);
      },
    });
    t.after(f.dispose);
    const owner = f.state.roots.user;
    const session = f.state.roots.session;
    const result = await f.invoke(owner, 'User.createPasskey');
    assert.ok(result.failure);
    assert.equal(result.result, undefined);
    if (scenario.endsWith('-rejected')) {
      assert.equal(result.failure.status, 422);
      assert.equal(result.failure.clerkTraceId, 'passkey-fixture-trace');
      assert.deepEqual(result.failure.errors, [
        {
          code: scenario,
          message: 'Registration rejected',
          longMessage: 'Try another passkey.',
          meta: { paramName: 'public_key_credential' },
        },
      ]);
    } else {
      assert.equal(
        result.failure.code,
        {
          'provider-failed': 'host_failure',
          'invalid-credential': 'invalid_credential_result',
          'missing-options': 'operation_failed',
          unsupported: 'passkey_not_supported',
        }[scenario],
      );
    }
    assert.equal(JSON.stringify(result).includes('private response detail'), false);
    assert.equal(JSON.stringify(result).includes('private provider detail'), false);
    assert.equal(
      presentations,
      ['verification-rejected', 'provider-failed', 'invalid-credential'].includes(scenario) ? 1 : 0,
    );
    assert.deepEqual(
      paths,
      scenario === 'unsupported'
        ? []
        : [
            '/v1/me/passkeys',
            ...(scenario === 'verification-rejected' ? ['/v1/me/passkeys/passkey_native/attempt_verification'] : []),
          ],
    );
    assert.deepEqual(f.state.roots.user, owner);
    assert.deepEqual(f.state.roots.session, session);
    assert.deepEqual(f.resource(owner).passkeys, []);
  });
}
