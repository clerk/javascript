import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response, deferred, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const now = Date.now();
const localRecord = (id = 'td_fixture', userId = 'user_native', localKeyId = 'tdlk_fixture') => ({
  id,
  userId,
  localKeyId,
  appIdentifier: 'com.example.native',
  policy: 'biometry_current_set',
  identifierHint: 'test@example.com',
  createdAt: now,
  updatedAt: now,
});
const remoteRecord = (id = 'td_fixture') => ({
  id,
  object: 'trusted_device',
  platform: 'ios',
  app_identifier: 'com.example.native',
  name: 'Test device',
  algorithm: 'ES256',
  status: 'active',
  created_at: now,
  updated_at: now,
  last_used_at: null,
  revoked_at: null,
});
const challenge = {
  object: 'trusted_device_challenge',
  challenge: 'fixture_nonce',
  challenge_id: 'tdc_fixture',
  trusted_device_id: 'td_fixture',
  client_data: 'fixture_client_data_to_sign',
  expires_at: now + 600000,
  algorithm: 'ES256',
};

async function biometricFixture(options = {}) {
  let records = options.records ?? [localRecord()];
  let cleanup = options.cleanup ?? [];
  const keys = new Set(records.map(record => record.localKeyId ?? record.local_key_id));
  const deleted = [];
  let signed = 0;
  const remote = options.remote ?? [remoteRecord()];
  const client = structuredClone(options.signedIn ? fixtures.authenticatedClient : fixtures.client);
  const environment = structuredClone(fixtures.environment);
  environment.auth_config.native_settings = {
    api_enabled: true,
    trusted_device_sign_in_enabled: options.enabled !== false,
  };
  const f = await fixture({
    client,
    configuration: { platform: options.platform ?? 'ios' },
    capabilities: options.noCapability ? [] : ['biometrics'],
    biometrics: async message => {
      const { capability, args } = message;
      const result = await options.biometrics?.(message);
      if (result !== undefined) return result;
      if (capability === 'biometrics.appIdentifier') return 'com.example.native';
      if (capability === 'biometrics.storage.read')
        return JSON.stringify(args.key === 'credentials' ? records : cleanup);
      if (capability === 'biometrics.storage.write') {
        if (args.key === 'credentials') records = JSON.parse(args.value);
        else cleanup = JSON.parse(args.value);
        return null;
      }
      if (capability === 'biometrics.supports') return options.supported !== false;
      if (capability === 'biometrics.hasKey') return options.missingKey ? false : keys.has(args.localKeyId);
      if (capability === 'biometrics.createKey') {
        keys.add('tdlk_created');
        return {
          localKeyId: 'tdlk_created',
          publicKeyJwk: '{"kty":"EC","crv":"P-256","x":"fixture_x","y":"fixture_y"}',
        };
      }
      if (capability === 'biometrics.deleteKey') {
        deleted.push(args.localKeyId);
        keys.delete(args.localKeyId);
        return null;
      }
      if (capability === 'biometrics.sign') {
        signed++;
        assert.equal(args.clientData, challenge.client_data);
        if (options.cancel) throw Object.assign(new Error('Cancelled'), { code: 'user_cancelled' });
        return { clientData: args.clientData, signature: 'fixture_signature_to_send', algorithm: 'ES256' };
      }
      throw new Error(capability);
    },
    http: async request => {
      const custom = await options.http?.(request);
      if (custom) return custom;
      const path = new URL(request.url).pathname;
      if (path.endsWith('/environment')) return response(environment);
      if (path.includes('/tokens')) return response(tokenFixture(), { body: JSON.stringify(tokenFixture()) });
      if (path.endsWith('/touch')) return response(fixtures.session);
      if (path.endsWith('/biometric_credentials/prepare')) return response(challenge);
      if (path.endsWith('/biometric_credentials/attempt')) return response(remoteRecord('td_created'));
      if (path.endsWith('/biometric_credentials/validate')) return response({ valid: options.valid !== false });
      if (path.endsWith('/biometric_credentials')) return response(remote);
      if (path.includes('/biometric_credentials/'))
        return response({ ...remoteRecord(path.split('/').at(-1)), status: 'revoked' });
      if (path.endsWith('/sign_ins'))
        return response({
          ...fixtures.signIn,
          first_factor_verification: {
            ...fixtures.signIn.first_factor_verification,
            strategy: 'trusted_device',
            trusted_device_challenge: challenge,
          },
        });
      if (path.endsWith('/attempt_first_factor'))
        return response({ ...fixtures.signIn, status: 'complete', created_session_id: 'sess_bio' });
    },
  });
  return Object.assign(f, { records: () => records, cleanup: () => cleanup, signed: () => signed, keys, deleted });
}
const call = (f, operation, args = []) =>
  f.invoke(f.resource(f.state.roots.clerk).biometricCredentials.$ref, `BiometricCredentials.${operation}`, args);

for (const scenario of ['ready', 'disabled', 'unsupported', 'missingKey', 'noLocal', 'noCapability']) {
  test(`biometric local availability reports ${scenario} from source policy without authentication`, async t => {
    const f = await biometricFixture({
      enabled: scenario !== 'disabled',
      supported: scenario !== 'unsupported',
      missingKey: scenario === 'missingKey',
      records: scenario === 'noLocal' ? [] : undefined,
      noCapability: scenario === 'noCapability',
    });
    t.after(f.dispose);
    const result = await call(f, 'localAvailability');
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    const expected =
      {
        disabled: 'featureDisabled',
        unsupported: 'biometricAuthenticationUnavailable',
        missingKey: 'localKeyMissing',
        noLocal: 'noLocalCredential',
        noCapability: 'unsupportedPlatform',
      }[scenario] ?? null;
    assert.deepEqual(result.result, { isAvailable: scenario === 'ready', unavailableReason: expected });
    assert.equal(f.signed(), 0);
    assert.equal(
      f.requests.some(request => request.url.includes('/biometric_credentials')),
      false,
    );
  });
}

test('biometric sign-in creates and attempts the canonical future resource without activation or secret snapshots', async t => {
  const f = await biometricFixture();
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.signIn, 'SignIn.biometricCredential', [
    { identifierHint: ' TEST@example.com ' },
  ]);
  assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.equal(f.resource(f.state.roots.signIn).status, 'complete');
  assert.equal(f.state.roots.session, null);
  const requests = f.requests.filter(request => request.url.includes('/sign_ins'));
  assert.equal(requests.length, 2);
  assert.equal(new URLSearchParams(requests[0].body).get('trusted_device_id'), 'td_fixture');
  assert.equal(new URLSearchParams(requests[1].body).get('signature'), 'fixture_signature_to_send');
  assert.equal(new URLSearchParams(requests[1].body).get('strategy'), 'trusted_device');
  const states = JSON.stringify(f.messages.filter(message => message.state));
  for (const value of ['tdlk_fixture', 'fixture_client_data_to_sign', 'fixture_signature_to_send', 'fixture_nonce'])
    assert.equal(states.includes(value), false, value);
});

test('cancelled biometric prompt preserves local enrollment and sends no attempt', async t => {
  const f = await biometricFixture({ cancel: true });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.signIn, 'SignIn.biometricCredential');
  assert.equal(result.result.error.code, 'user_cancelled');
  assert.equal(f.records().length, 1);
  assert.equal(
    f.requests.some(request => request.url.includes('/attempt_first_factor')),
    false,
  );
});

test('signed-in reconciliation removes a revoked local credential', async t => {
  const f = await biometricFixture({ signedIn: true, remote: [{ ...remoteRecord(), status: 'revoked' }] });
  t.after(f.dispose);
  const result = await call(f, 'availability', [{ currentUser: true }]);
  assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.equal(result.result.unavailableReason, 'serverCredentialRevoked');
  assert.equal(f.records().length, 0);
  assert.deepEqual(f.deleted, ['tdlk_fixture']);
});

test('enrollment saves normalized local metadata, replaces the installation key, and sends source-owned request bodies', async t => {
  const f = await biometricFixture({ signedIn: true });
  t.after(f.dispose);
  const result = await call(f, 'enroll', [{ identifierHint: ' TEST@example.com ', reason: 'Use Touch ID' }]);
  assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.equal(result.result.id, 'td_created');
  assert.equal(f.records().length, 1);
  assert.equal(f.records()[0].identifierHint, 'test@example.com');
  assert.equal(f.records()[0].localKeyId, 'tdlk_created');
  assert.deepEqual(f.deleted, ['tdlk_fixture']);
  const request = f.requests.find(request => request.url.includes('/biometric_credentials/attempt'));
  assert.equal(new URL(request.url).searchParams.get('_clerk_session_id'), 'sess_native');
  const body = new URLSearchParams(request.body);
  assert.equal(body.get('platform'), 'ios');
  assert.equal(body.get('client_data'), challenge.client_data);
  assert.ok(body.get('public_key_jwk').includes('fixture_x'));
});

test('enrollment storage failure revokes the new server credential and removes its private key', async t => {
  const f = await biometricFixture({
    signedIn: true,
    biometrics: ({ capability, args }) => {
      if (capability === 'biometrics.storage.write' && args.key === 'credentials')
        throw Object.assign(new Error('write failed'), { code: 'secure_storage_write_failed' });
    },
  });
  t.after(f.dispose);
  const result = await call(f, 'enroll');
  assert.equal(result.failure.code, 'secure_storage_write_failed');
  assert.ok(f.deleted.includes('tdlk_created'));
  assert.ok(
    f.requests.some(
      request =>
        request.url.includes('/biometric_credentials/td_created') &&
        new URL(request.url).searchParams.get('_method') === 'DELETE',
    ),
  );
});

test('account-scoped local cleanup preserves other users and retries pending deletions after restart', async t => {
  const f = await biometricFixture({
    records: [localRecord(), localRecord('td_other', 'user_other', 'key_other')],
    cleanup: ['user_native'],
  });
  t.after(f.dispose);
  assert.deepEqual(
    f.records().map(record => record.id),
    ['td_other'],
  );
  assert.deepEqual(f.cleanup(), []);
  assert.deepEqual(f.deleted, ['tdlk_fixture']);
});

test('reset cancels a biometric prompt without sending its eventual signature', async t => {
  const started = deferred(),
    finish = deferred();
  const f = await biometricFixture({
    biometrics: async ({ capability, args }) => {
      if (capability === 'biometrics.sign') {
        started.resolve();
        await finish.promise;
        return { clientData: args.clientData, signature: 'late_signature', algorithm: 'ES256' };
      }
    },
  });
  t.after(f.dispose);
  const pending = f.invoke(f.state.roots.signIn, 'SignIn.biometricCredential');
  await started.promise;
  await f.invoke(f.state.roots.signIn, 'SignIn.reset');
  finish.resolve();
  const result = await pending;
  assert.ok(result.failure || result.result.error);
  assert.equal(
    f.requests.some(request => request.url.includes('/attempt_first_factor')),
    false,
  );
  assert.equal(f.records().length, 1);
});

for (const kind of ['wrongCredential', 'expired']) {
  test(`biometric ${kind} challenge fails before a system prompt`, async t => {
    const f = await biometricFixture({
      http: request =>
        new URL(request.url).pathname.endsWith('/sign_ins')
          ? response({
              ...fixtures.signIn,
              first_factor_verification: {
                ...fixtures.signIn.first_factor_verification,
                trusted_device_challenge: {
                  ...challenge,
                  ...(kind === 'wrongCredential' ? { trusted_device_id: 'other' } : { expires_at: Date.now() - 1 }),
                },
              },
            })
          : undefined,
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.signIn, 'SignIn.biometricCredential');
    assert.equal(
      result.result.error.code,
      kind === 'expired' ? 'expired_biometric_challenge' : 'invalid_biometric_challenge',
    );
    assert.equal(f.signed(), 0);
  });
}

test('server validation removes missing credentials but preserves them on transient errors', async t => {
  const missing = await biometricFixture({ valid: false });
  t.after(missing.dispose);
  assert.deepEqual((await call(missing, 'validateLocalCredential')).result, {
    status: 'invalid',
    reason: 'serverCredentialMissing',
  });
  assert.equal(missing.records().length, 0);
  const transient = await biometricFixture({
    http: request =>
      request.url.includes('/biometric_credentials/validate')
        ? response(null, {
            status: 503,
            body: JSON.stringify({ errors: [{ code: 'service_unavailable', message: 'Try again' }] }),
          })
        : undefined,
  });
  t.after(transient.dispose);
  assert.deepEqual((await call(transient, 'validateLocalCredential')).result, { status: 'inconclusive', reason: null });
  assert.equal(transient.records().length, 1);
});

test('canonical account deletion removes local biometric metadata and retains a failed cleanup for restart', async t => {
  const f = await biometricFixture({
    signedIn: true,
    http: request =>
      new URL(request.url).pathname.endsWith('/me')
        ? response({ id: 'user_native', object: 'user', deleted: true })
        : undefined,
    biometrics: ({ capability }) => {
      if (capability === 'biometrics.deleteKey')
        throw Object.assign(new Error('Locked'), { code: 'secure_storage_locked' });
    },
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.user, 'User.delete');
  assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.deepEqual(f.cleanup(), ['user_native']);
  assert.equal(f.records().length, 1);
});

for (const policy of [undefined, 'biometry_current_set']) {
  test(`legacy Android metadata remains usable with policy ${policy ?? '(omitted default)'}`, async t => {
    // clerk-android 1ea9f972: ClerkApi.json uses SnakeCase and omits defaults,
    // including BiometricCredentialLocalRecord's device-passcode policy.
    const records = [
      {
        id: 'td_fixture',
        local_key_id: 'tdlk_fixture',
        user_id: 'user_native',
        app_identifier: 'com.example.native',
        identifier_hint: 'test@example.com',
        created_at: now,
        updated_at: now,
        ...(policy ? { policy } : {}),
      },
    ];
    const policies = [];
    const f = await biometricFixture({
      platform: 'android',
      records,
      biometrics: message => {
        if (message.capability === 'biometrics.supports') policies.push(message.args.policy);
      },
    });
    t.after(f.dispose);
    assert.deepEqual((await call(f, 'localAvailability')).result, { isAvailable: true, unavailableReason: null });
    const result = await f.invoke(f.state.roots.signIn, 'SignIn.biometricCredential', [
      { identifierHint: 'test@example.com' },
    ]);
    assert.equal(result.failure, undefined, JSON.stringify(result));
    assert.equal(f.resource(f.state.roots.signIn).status, 'complete');
    assert.ok(policies.length > 0);
    assert.ok(policies.every(value => value === (policy ?? 'biometry_or_device_passcode')));
    assert.equal(f.signed(), 1);
    assert.equal(f.state.roots.session, null);
    const forgotten = await call(f, 'forgetLocalCredentials', [{ userId: 'user_native' }]);
    assert.equal(forgotten.result, 1);
    assert.deepEqual(f.records(), []);
  });
}
