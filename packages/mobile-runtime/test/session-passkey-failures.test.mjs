import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const credential = {
  id: 'Y3JlZGVudGlhbA',
  rawId: 'Y3JlZGVudGlhbA',
  type: 'public-key',
  authenticatorAttachment: 'platform',
  response: { clientDataJSON: 'e30', authenticatorData: 'YXV0aA', signature: 'c2ln', userHandle: null },
};

for (const scenario of [
  'preparation-rejected',
  'submission-rejected',
  'missing-options',
  'provider-failed',
  'invalid-credential',
  'unsupported',
]) {
  test(`generated session passkey verification stops at ${scenario}`, async t => {
    const client = structuredClone(fixtures.authenticatedClient);
    const paths = [];
    let presentations = 0;
    const f = await fixture({
      client,
      capabilities: scenario === 'unsupported' ? [] : ['passkeys'],
      passkeys: message => {
        assert.equal(message.capability, 'passkeys.get');
        presentations++;
        if (scenario === 'provider-failed')
          throw Object.assign(new Error('private provider detail'), { code: 'host_failure' });
        return scenario === 'invalid-credential' ? { ...credential, response: null } : credential;
      },
      http: request => {
        const path = new URL(request.url).pathname;
        if (!path.includes('/verify/')) return;
        paths.push(path);
        assert.equal(request.method, 'POST');
        const attempting = path.endsWith('/attempt_first_factor');
        assert.equal(path, `/v1/client/sessions/sess_native/verify/${attempting ? 'attempt' : 'prepare'}_first_factor`);
        const body = new URLSearchParams(request.body);
        assert.equal(body.get('strategy'), 'passkey');
        if (attempting) assert.deepEqual(JSON.parse(body.get('public_key_credential')), credential);
        if (scenario === 'preparation-rejected' || (scenario === 'submission-rejected' && attempting)) {
          return response(null, {
            status: 422,
            body: JSON.stringify({
              clerk_trace_id: 'session-passkey-trace',
              errors: [
                {
                  code: scenario,
                  message: 'Verification rejected',
                  long_message: 'Try another passkey.',
                  meta: { param_name: 'public_key_credential', password: 'private response detail' },
                },
              ],
            }),
          });
        }
        assert.equal(attempting, false, 'Unexpected credential submission');
        return response({
          object: 'session_verification',
          id: 'sv_passkey_failure',
          status: 'needs_first_factor',
          level: 'first_factor',
          session: client.sessions[0],
          first_factor_verification: {
            status: 'unverified',
            strategy: 'passkey',
            nonce:
              scenario === 'missing-options'
                ? null
                : JSON.stringify({
                    challenge: 'Y2hhbGxlbmdl',
                    rpId: 'native-core.clerk.accounts.dev',
                    userVerification: 'required',
                  }),
            attempts: 0,
            expire_at: null,
            error: null,
            verified_at_client: null,
          },
          second_factor_verification: null,
          supported_first_factors: [{ strategy: 'passkey' }],
          supported_second_factors: null,
        });
      },
    });
    t.after(f.dispose);
    const owner = f.state.roots.session;
    const user = f.state.roots.user;
    const result = await f.invoke(owner, 'Session.verifyWithPasskey');
    assert.ok(result.failure);
    assert.equal(result.result, undefined);
    if (scenario.endsWith('-rejected')) {
      assert.equal(result.failure.status, 422);
      assert.equal(result.failure.clerkTraceId, 'session-passkey-trace');
      assert.deepEqual(result.failure.errors, [
        {
          code: scenario,
          message: 'Verification rejected',
          longMessage: 'Try another passkey.',
          meta: { paramName: 'public_key_credential' },
        },
      ]);
    } else {
      assert.equal(
        result.failure.code,
        {
          'missing-options': 'operation_failed',
          'provider-failed': 'host_failure',
          'invalid-credential': 'invalid_credential_result',
          unsupported: 'passkey_not_supported',
        }[scenario],
      );
    }
    assert.equal(JSON.stringify(result).includes('private response detail'), false);
    assert.equal(JSON.stringify(result).includes('private provider detail'), false);
    assert.equal(
      presentations,
      ['submission-rejected', 'provider-failed', 'invalid-credential'].includes(scenario) ? 1 : 0,
    );
    assert.deepEqual(paths, [
      '/v1/client/sessions/sess_native/verify/prepare_first_factor',
      ...(scenario === 'submission-rejected' ? ['/v1/client/sessions/sess_native/verify/attempt_first_factor'] : []),
    ]);
    assert.deepEqual(f.state.roots.session, owner);
    assert.deepEqual(f.state.roots.user, user);
    assert.equal(f.resource(owner).status, 'active');
  });
}
