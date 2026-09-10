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
  let installationCurrent = options.installationCurrent ?? true;
  let installationMarks = 0;
  const keys = new Set(records.map(record => record.localKeyId ?? record.local_key_id));
  const deleted = [];
  let signed = 0;
  const remote = options.remote ?? [remoteRecord()];
  const client = structuredClone(options.client ?? (options.signedIn ? fixtures.authenticatedClient : fixtures.client));
  const environment = structuredClone(fixtures.environment);
  environment.auth_config.native_settings = {
    api_enabled: options.nativeEnabled !== false,
    trusted_device_sign_in_enabled: options.enabled !== false,
  };
  const f = await fixture({
    client,
    configuration: { platform: options.platform ?? 'ios' },
    capabilities: options.noCapability
      ? []
      : ['biometrics', ...(options.installationCurrent === undefined ? [] : ['biometrics.installation'])],
    biometrics: async message => {
      const { capability, args } = message;
      const result = await options.biometrics?.(message);
      if (result !== undefined) return result;
      if (capability === 'biometrics.installation.isCurrent') return installationCurrent;
      if (capability === 'biometrics.installation.markCurrent') {
        installationCurrent = true;
        installationMarks++;
        return null;
      }
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
      if (path.endsWith('/biometric_credentials/attempt'))
        return response({ ...remoteRecord('td_created'), platform: options.platform ?? 'ios' });
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
            trusted_device_challenge: {
              ...challenge,
              trusted_device_id: new URLSearchParams(request.body).get('trusted_device_id'),
            },
          },
        });
      if (path.endsWith('/attempt_first_factor'))
        return response({ ...fixtures.signIn, status: 'complete', created_session_id: 'sess_bio' });
    },
  });
  return Object.assign(f, {
    records: () => records,
    cleanup: () => cleanup,
    signed: () => signed,
    keys,
    deleted,
    installationCurrent: () => installationCurrent,
    installationMarks: () => installationMarks,
  });
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

test('a new Apple installation deletes only its own surviving biometric keys before becoming available', async t => {
  const other = { ...localRecord('td_other', 'user_other', 'key_other'), appIdentifier: 'com.example.other' };
  const malformedOwn = { localKeyId: 'key_malformed', appIdentifier: 'com.example.native' };
  const f = await biometricFixture({ installationCurrent: false, records: [localRecord(), other, malformedOwn] });
  t.after(f.dispose);
  assert.deepEqual(f.deleted.sort(), ['key_malformed', 'tdlk_fixture']);
  assert.deepEqual(f.records(), [other]);
  assert.equal(f.installationCurrent(), true);
  assert.equal(f.installationMarks(), 1);
  assert.deepEqual((await call(f, 'localAvailability')).result, {
    isAvailable: false,
    unavailableReason: 'noLocalCredential',
  });
  assert.equal(f.signed(), 0);
});

test('an existing Apple installation preserves its enrolled credential', async t => {
  const f = await biometricFixture({ installationCurrent: true });
  t.after(f.dispose);
  assert.deepEqual(f.deleted, []);
  assert.deepEqual((await call(f, 'localAvailability')).result, { isAvailable: true, unavailableReason: null });
  assert.equal(f.records().length, 1);
});

test('failed installation cleanup blocks use and coalesces a later successful retry', async t => {
  let failDeletion = true;
  const deleting = deferred(),
    release = deferred();
  const f = await biometricFixture({
    installationCurrent: false,
    biometrics: async ({ capability }) => {
      if (capability !== 'biometrics.deleteKey') return;
      if (failDeletion) throw Object.assign(new Error('Locked'), { code: 'secure_storage_locked' });
      deleting.resolve();
      await release.promise;
    },
  });
  t.after(f.dispose);
  assert.equal(f.installationCurrent(), false);
  assert.equal(f.records().length, 1);
  const attempt = await f.invoke(f.state.roots.signIn, 'SignIn.biometricCredential');
  assert.equal(attempt.result?.error?.code ?? attempt.failure?.code, 'secure_storage_locked', JSON.stringify(attempt));
  assert.equal(f.signed(), 0);
  failDeletion = false;
  const first = call(f, 'localAvailability');
  await deleting.promise;
  const second = call(f, 'localAvailability');
  release.resolve();
  for (const result of await Promise.all([first, second]))
    assert.deepEqual(result.result, { isAvailable: false, unavailableReason: 'noLocalCredential' });
  assert.equal(f.installationCurrent(), true);
  assert.equal(f.installationMarks(), 1);
  assert.deepEqual(f.deleted, ['tdlk_fixture']);
  assert.deepEqual(f.records(), []);
});

for (const failingCapability of [
  'biometrics.storage.read',
  'biometrics.storage.write',
  'biometrics.installation.markCurrent',
]) {
  test(`installation completion waits for successful ${failingCapability}`, async t => {
    let fail = true;
    const f = await biometricFixture({
      installationCurrent: false,
      biometrics: ({ capability }) => {
        if (fail && capability === failingCapability)
          throw Object.assign(new Error('Unavailable'), { code: 'installation_fixture_failure' });
      },
    });
    t.after(f.dispose);
    assert.equal(f.installationCurrent(), false);
    assert.equal((await call(f, 'localAvailability')).failure?.code, 'installation_fixture_failure');
    assert.equal(f.signed(), 0);
    fail = false;
    assert.deepEqual((await call(f, 'localAvailability')).result, {
      isAvailable: false,
      unavailableReason: 'noLocalCredential',
    });
    assert.equal(f.installationCurrent(), true);
    assert.deepEqual(f.records(), []);
  });
}

for (const operation of [
  'enroll',
  'revoke',
  'forgetLocalCredentials',
  'availability',
  'validateLocalCredential',
  'localAvailability',
]) {
  test(`biometric ${operation} preserves unrelated raw metadata`, async t => {
    const other = {
      id: 'other_legacy',
      localKeyId: 'other_key',
      appIdentifier: 'com.example.other',
      futureField: { nested: ['keep', null] },
    };
    const ownMalformed = { id: 'own_legacy', localKeyId: 'own_key', appIdentifier: 'com.example.native' };
    const validOther = {
      ...localRecord('valid_other', 'user_other', 'valid_other_key'),
      appIdentifier: 'com.example.other',
    };
    const f = await biometricFixture({
      signedIn: true,
      records: [localRecord(), other, ownMalformed, validOther],
      remote: [],
      valid: false,
      missingKey: operation === 'localAvailability',
    });
    t.after(f.dispose);
    const params =
      operation === 'revoke'
        ? [{ id: 'td_fixture' }]
        : operation === 'forgetLocalCredentials'
          ? [{ userId: 'user_native' }]
          : [];
    const result = await call(f, operation, params);
    assert.equal(result.failure, undefined, JSON.stringify(result));
    assert.deepEqual(
      f.records().filter(record => record.appIdentifier === 'com.example.other'),
      [other, validOther],
    );
    assert.ok(f.records().some(record => record.id === 'own_legacy'));
    assert.equal(f.keys.has('other_key'), true);
    assert.equal(f.keys.has('own_key'), true);
  });
}

for (const raw of ['not-json', '{"not":"a list"}']) {
  test(`biometric enrollment refuses to overwrite unreadable metadata (${raw})`, async t => {
    let writes = 0;
    const f = await biometricFixture({
      signedIn: true,
      biometrics: ({ capability, args }) => {
        if (args.key !== 'credentials') return;
        if (capability === 'biometrics.storage.read') return raw;
        if (capability === 'biometrics.storage.write') writes++;
      },
    });
    t.after(f.dispose);
    const result = await call(f, 'enroll');
    assert.equal(result.failure?.code, 'invalid_biometric_metadata', JSON.stringify(result));
    assert.equal(writes, 0);
    assert.equal(f.keys.has('tdlk_fixture'), true);
    assert.equal(f.keys.has('tdlk_created'), false);
  });
}

test('biometric enrollment deletes a replaced key after saving the same credential ID', async t => {
  const f = await biometricFixture({
    signedIn: true,
    http: request =>
      new URL(request.url).pathname.endsWith('/biometric_credentials/attempt') ? response(remoteRecord()) : undefined,
  });
  t.after(f.dispose);
  const result = await call(f, 'enroll');
  assert.equal(result.failure, undefined, JSON.stringify(result));
  assert.equal(result.result.id, 'td_fixture');
  assert.equal(f.records().length, 1);
  assert.equal(f.records()[0].localKeyId, 'tdlk_created');
  assert.equal(f.keys.has('tdlk_fixture'), false);
  assert.equal(f.keys.has('tdlk_created'), true);
});

for (const capability of ['biometrics.storage.read', 'biometrics.storage.write', 'biometrics.deleteKey']) {
  test(`server biometric revocation survives local ${capability} failure`, async t => {
    const f = await biometricFixture({
      signedIn: true,
      biometrics: message => {
        if (
          message.capability === capability &&
          (capability === 'biometrics.deleteKey' || message.args.key === 'credentials')
        )
          throw Object.assign(new Error('Locked'), { code: 'secure_storage_locked' });
      },
    });
    t.after(f.dispose);
    const result = await call(f, 'revoke', [{ id: 'td_fixture' }]);
    assert.equal(result.failure, undefined, JSON.stringify(result));
    assert.equal(result.result.id, 'td_fixture');
    assert.deepEqual(result.result.status, { $case: 1, value: 'revoked' });
    assert.equal(f.records()[0].id, 'td_fixture');
  });
}

test('saved biometric enrollment survives a subsequent cleanup read failure', async t => {
  let saved = false;
  const f = await biometricFixture({
    signedIn: true,
    biometrics: ({ capability, args }) => {
      if (args.key !== 'credentials') return;
      if (capability === 'biometrics.storage.write') saved = true;
      if (capability === 'biometrics.storage.read' && saved)
        throw Object.assign(new Error('Locked'), { code: 'secure_storage_locked' });
    },
  });
  t.after(f.dispose);
  const result = await call(f, 'enroll');
  assert.equal(result.failure, undefined, JSON.stringify(result));
  assert.equal(result.result.id, 'td_created');
  assert.equal(f.keys.has('tdlk_created'), true);
  assert.ok(f.records().some(record => record.localKeyId === 'tdlk_created'));
  assert.equal(f.keys.has('tdlk_fixture'), true);
});

for (const future of [false, true]) {
  test(`biometric list preserves backend fields and ${future ? 'future' : 'known'} values`, async t => {
    const remote = {
      ...remoteRecord(),
      name: "Sean's iPhone",
      created_at: 1710000000000,
      updated_at: 1710000001000,
      last_used_at: 1710000002000,
      revoked_at: null,
      ...(future ? { platform: 'future_os', algorithm: 'future_algorithm', status: 'future_status' } : {}),
    };
    const f = await biometricFixture({ signedIn: true, remote: [remote] });
    t.after(f.dispose);
    const result = await call(f, 'list');
    assert.equal(result.failure, undefined, JSON.stringify(result));
    assert.deepEqual(result.result, [
      {
        id: 'td_fixture',
        object: 'trusted_device',
        appIdentifier: 'com.example.native',
        name: "Sean's iPhone",
        platform: { $case: future ? 2 : 0, value: remote.platform },
        algorithm: { $case: 0, value: remote.algorithm },
        status: { $case: future ? 2 : 0, value: remote.status },
        createdAt: '2024-03-09T16:00:00.000Z',
        updatedAt: '2024-03-09T16:00:01.000Z',
        lastUsedAt: '2024-03-09T16:00:02.000Z',
        revokedAt: null,
      },
    ]);
    const request = f.requests.find(r => new URL(r.url).pathname.endsWith('/biometric_credentials'));
    assert.equal(request.method, 'GET');
    assert.equal(new URL(request.url).searchParams.get('_clerk_session_id'), 'sess_native');
  });
}

for (const [platform, policy, expected] of [
  ['ios', undefined, 'biometry_current_set'],
  ['android', undefined, 'biometry_or_device_passcode'],
  ['ios', 'biometry_any', 'biometry_any'],
  ['ios', 'biometry_or_device_passcode', 'biometry_or_device_passcode'],
]) {
  test(`biometric enrollment uses ${platform} policy ${policy ?? 'default'} and exact request fields`, async t => {
    const prompts = [];
    const f = await biometricFixture({
      signedIn: true,
      platform,
      biometrics: message => {
        if (['biometrics.createKey', 'biometrics.sign'].includes(message.capability)) prompts.push(message);
      },
    });
    t.after(f.dispose);
    const result = await call(f, 'enroll', [
      {
        name: "Sean's phone",
        identifierHint: '  SEAN@EXAMPLE.COM  ',
        reason: 'Set up biometrics',
        promptSubtitle: 'Enrollment',
        ...(policy ? { policy } : {}),
      },
    ]);
    assert.equal(result.failure, undefined, JSON.stringify(result));
    assert.equal(f.records()[0].policy, expected);
    assert.equal(f.records()[0].userId, 'user_native');
    assert.equal(f.records()[0].identifierHint, 'sean@example.com');
    assert.equal(prompts[0].args.policy, expected);
    assert.equal(prompts[1].args.policy, expected);
    assert.equal(prompts[1].args.reason, 'Set up biometrics');
    assert.equal(prompts[1].args.promptSubtitle, 'Enrollment');
    for (const step of ['prepare', 'attempt']) {
      const request = f.requests.find(r => new URL(r.url).pathname.endsWith(`/biometric_credentials/${step}`));
      assert.equal(request.method, 'POST');
      assert.equal(new URL(request.url).searchParams.get('_clerk_session_id'), 'sess_native');
      assert.deepEqual(Object.fromEntries(new URLSearchParams(request.body)), {
        platform,
        app_identifier: 'com.example.native',
        name: "Sean's phone",
        algorithm: 'ES256',
        public_key_jwk: '{"kty":"EC","crv":"P-256","x":"fixture_x","y":"fixture_y"}',
        ...(step === 'attempt' ? { client_data: challenge.client_data, signature: 'fixture_signature_to_send' } : {}),
      });
    }
  });
}

for (const [scenario, signedIn, params, expected, remoteIds] of [
  ['newest', false, {}, 'td_new', []],
  ['explicit ID', false, { id: 'td_fixture' }, 'td_fixture', []],
  ['normalized hint', false, { identifierHint: ' TEST@example.com ' }, 'td_fixture', []],
  ['current user', true, {}, 'td_fixture', ['td_fixture']],
  ['changed hint with currentUser', true, { currentUser: true }, 'td_fixture', ['td_fixture']],
  ['stale newer credential', true, {}, 'td_fixture', ['td_fixture']],
]) {
  test(`biometric selection honors ${scenario} through sign-in`, async t => {
    const original = { ...localRecord(), createdAt: now - 2000 };
    if (scenario === 'changed hint with currentUser') original.identifierHint = 'old@example.com';
    const newer = {
      ...localRecord(
        'td_new',
        signedIn && scenario !== 'stale newer credential' ? 'user_other' : 'user_native',
        'key_new',
      ),
      identifierHint: 'other@example.com',
      createdAt: now - 1000,
    };
    const otherApp = {
      ...localRecord('td_other_app', 'user_native', 'key_other_app'),
      appIdentifier: 'com.example.other',
    };
    const f = await biometricFixture({
      signedIn,
      records: [original, newer, otherApp],
      remote: remoteIds.map(remoteRecord),
    });
    t.after(f.dispose);
    if (params.currentUser) {
      assert.equal((await call(f, 'localAvailability', [params])).result.isAvailable, true);
      assert.equal((await call(f, 'availability', [params])).result.isAvailable, true);
    }
    const result = await f.invoke(f.state.roots.signIn, 'SignIn.biometricCredential', [
      params.currentUser ? {} : params,
    ]);
    assert.equal(result.failure, undefined, JSON.stringify(result));
    assert.equal(result.result.error, null, JSON.stringify(result));
    assert.equal(f.resource(f.state.roots.signIn).status, 'complete');
    const prepare = f.requests.find(r => new URL(r.url).pathname.endsWith('/sign_ins'));
    assert.equal(new URLSearchParams(prepare.body).get('trusted_device_id'), expected);
    assert.ok(f.records().some(record => record.id === 'td_other_app'));
    assert.equal(f.keys.has('key_other_app'), true);
    if (scenario === 'stale newer credential') assert.ok(!f.records().some(record => record.id === 'td_new'));
    else assert.ok(f.records().some(record => record.id === 'td_new'));
  });
}

for (const scenario of ['local signed-in', 'expired', 'hint mismatch', 'other user', 'native disabled']) {
  test(`biometric availability handles ${scenario} without unnecessary authenticated HTTP`, async t => {
    const client = structuredClone(fixtures.authenticatedClient);
    if (scenario === 'expired') client.sessions[0].status = 'expired';
    const f = await biometricFixture({
      client,
      nativeEnabled: scenario !== 'native disabled',
      records: [localRecord('td_fixture', scenario === 'other user' ? 'user_other' : 'user_native')],
    });
    t.after(f.dispose);
    const result = await call(
      f,
      scenario === 'local signed-in' ? 'localAvailability' : 'availability',
      scenario === 'hint mismatch' ? [{ identifierHint: 'different@example.com' }] : [],
    );
    assert.equal(result.failure, undefined, JSON.stringify(result));
    const reason =
      scenario === 'native disabled'
        ? 'nativeAPIDisabled'
        : ['hint mismatch', 'other user'].includes(scenario)
          ? 'noLocalCredential'
          : null;
    assert.deepEqual(result.result, { isAvailable: reason === null, unavailableReason: reason });
    assert.equal(
      f.requests.some(r => new URL(r.url).pathname.includes('/biometric_credentials')),
      false,
    );
    assert.equal(f.records().length, 1);
  });
}

for (const [step, code, paramName, removed] of [
  ['sign_ins', 'trusted_device_not_registered', 'trusted_device_id', true],
  ['attempt_first_factor', 'form_resource_not_found', 'trusted_device_id', true],
  ['sign_ins', 'form_resource_not_found', 'identifier', false],
]) {
  test(`biometric ${step} handles ${code} for ${paramName}`, async t => {
    const f = await biometricFixture({
      http: request =>
        new URL(request.url).pathname.endsWith('/' + step)
          ? response(null, {
              status: 422,
              body: JSON.stringify({ errors: [{ code, message: 'Missing', meta: { param_name: paramName } }] }),
            })
          : undefined,
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.signIn, 'SignIn.biometricCredential');
    assert.equal(result.failure, undefined, JSON.stringify(result));
    assert.equal(result.result.error.errors[0].code, code);
    assert.equal(f.records().length, removed ? 0 : 1);
    assert.equal(f.keys.has('tdlk_fixture'), !removed);
    if (step === 'sign_ins') assert.equal(f.signed(), 0);
  });
}

for (const status of ['active', 'pending', 'signed-out']) {
  test(`biometric enrollment and current-device revocation require an eligible session (${status})`, async t => {
    const client = structuredClone(status === 'signed-out' ? fixtures.client : fixtures.authenticatedClient);
    if (status === 'pending') client.sessions[0].status = 'pending';
    const f = await biometricFixture({ client });
    t.after(f.dispose);
    for (const operation of ['enroll', 'revokeCurrentDeviceCredential']) {
      const result = await call(f, operation);
      if (status === 'signed-out') assert.equal(result.failure?.code, 'biometric_session_required');
      else assert.equal(result.failure, undefined, JSON.stringify(result));
    }
    if (status === 'signed-out') assert.equal(f.signed(), 0);
  });
}

test('current-device revocation preserves other users and returns null without a matching local record', async t => {
  const records = [localRecord(), localRecord('td_other', 'user_other', 'other_key')];
  const f = await biometricFixture({ signedIn: true, records });
  t.after(f.dispose);
  const revoked = await call(f, 'revokeCurrentDeviceCredential');
  assert.equal(revoked.failure, undefined, JSON.stringify(revoked));
  assert.equal(revoked.result.id, 'td_fixture');
  assert.deepEqual(f.records(), [records[1]]);
  const absent = await call(f, 'revokeCurrentDeviceCredential');
  assert.equal(absent.failure, undefined, JSON.stringify(absent));
  assert.equal(absent.result, null);
});

for (const [code, paramName, status, reason, removed] of [
  ['form_resource_not_found', 'trusted_device_id', 'invalid', 'serverCredentialMissing', true],
  ['native_api_disabled', undefined, 'invalid', 'nativeAPIDisabled', false],
  ['feature_not_enabled', undefined, 'invalid', 'featureDisabled', false],
  ['form_resource_not_found', 'identifier', 'inconclusive', null, false],
]) {
  test(`biometric validation preserves the outcome of ${code} for ${paramName ?? 'feature'}`, async t => {
    const f = await biometricFixture({
      http: request =>
        new URL(request.url).pathname.endsWith('/biometric_credentials/validate')
          ? response(null, {
              status: 422,
              body: JSON.stringify({ errors: [{ code, message: 'Unavailable', meta: { param_name: paramName } }] }),
            })
          : undefined,
    });
    t.after(f.dispose);
    assert.deepEqual((await call(f, 'validateLocalCredential')).result, { status, reason });
    assert.equal(f.records().length, removed ? 0 : 1);
    const request = f.requests.find(r => new URL(r.url).pathname.endsWith('/biometric_credentials/validate'));
    assert.equal(request.method, 'POST');
    assert.deepEqual(Object.fromEntries(new URLSearchParams(request.body)), { trusted_device_id: 'td_fixture' });
  });
}

test('biometric validation tries an older credential after removing a missing newest one', async t => {
  const validated = [];
  const f = await biometricFixture({
    records: [localRecord(), { ...localRecord('td_new', 'user_native', 'key_new'), createdAt: now + 1 }],
    http: request => {
      if (!new URL(request.url).pathname.endsWith('/biometric_credentials/validate')) return;
      const id = new URLSearchParams(request.body).get('trusted_device_id');
      validated.push(id);
      return response({ valid: id === 'td_fixture' });
    },
  });
  t.after(f.dispose);
  assert.deepEqual((await call(f, 'validateLocalCredential')).result, { status: 'valid', reason: null });
  assert.deepEqual(validated, ['td_new', 'td_fixture']);
  assert.deepEqual(f.deleted, ['key_new']);
  assert.deepEqual(f.records(), [localRecord()]);
});

for (const step of ['prepare', 'attempt']) {
  test(`biometric enrollment aborts and cleans up when its initiating session disappears during ${step}`, async t => {
    const client = structuredClone(fixtures.authenticatedClient);
    client.sessions[0].id = 'sess_replacement';
    client.last_active_session_id = 'sess_replacement';
    const f = await biometricFixture({
      signedIn: true,
      http: request => {
        if (!new URL(request.url).pathname.endsWith('/biometric_credentials/' + step)) return;
        const payload = step === 'prepare' ? challenge : remoteRecord('td_created');
        return response(payload, { body: JSON.stringify({ response: payload, client }) });
      },
    });
    t.after(f.dispose);
    const result = await call(f, 'enroll');
    assert.equal(result.failure?.code, 'stale_authentication_attempt', JSON.stringify(result));
    assert.equal(f.state.roots.session, null);
    assert.ok(f.resource(f.state.roots.clerk).sessions.some(ref => f.resource(ref.$ref).id === 'sess_replacement'));
    assert.deepEqual(f.records(), [localRecord()]);
    assert.equal(f.keys.has('tdlk_created'), false);
    const enrollmentRequests = f.requests.filter(r => new URL(r.url).pathname.includes('/biometric_credentials'));
    for (const request of enrollmentRequests)
      assert.equal(new URL(request.url).searchParams.get('_clerk_session_id'), 'sess_native');
    if (step === 'prepare') {
      assert.equal(f.signed(), 0);
      assert.equal(enrollmentRequests.length, 1);
    } else {
      const rollback = enrollmentRequests.find(r => new URL(r.url).pathname.endsWith('/td_created'));
      assert.ok(rollback, 'a completed server enrollment must be revoked when local adoption is rejected');
      assert.equal(new URL(rollback.url).searchParams.get('_method'), 'DELETE');
    }
  });
}

test('biometric sign-in rejects an absent challenge without preparing a separate factor', async t => {
  const f = await biometricFixture({
    http: request =>
      new URL(request.url).pathname.endsWith('/sign_ins')
        ? response({
            ...fixtures.signIn,
            first_factor_verification: { ...fixtures.signIn.first_factor_verification, trusted_device_challenge: null },
          })
        : undefined,
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.signIn, 'SignIn.biometricCredential');
  assert.equal(result.result.error.code, 'invalid_biometric_challenge');
  assert.equal(f.signed(), 0);
  assert.equal(
    f.requests.some(r => new URL(r.url).pathname.endsWith('/prepare_first_factor')),
    false,
  );
});

test('biometric enrollment rolls back persisted metadata if selection changes during the save', async t => {
  const saving = deferred(),
    release = deferred();
  let paused = false;
  const f = await biometricFixture({
    signedIn: true,
    biometrics: async ({ capability, args }) => {
      if (!paused && capability === 'biometrics.storage.write' && args.key === 'credentials') {
        paused = true;
        saving.resolve();
        await release.promise;
      }
    },
  });
  t.after(f.dispose);
  const enrollment = call(f, 'enroll');
  await saving.promise;
  const deselected = await f.invoke(f.state.roots.clerk, 'Clerk.setActive', [{ session: null }]);
  release.resolve();
  const result = await enrollment;
  assert.equal(deselected.failure, undefined, JSON.stringify(deselected.failure));
  assert.equal(result.failure?.code, 'stale_authentication_attempt', JSON.stringify(result));
  assert.equal(f.state.roots.session, null);
  assert.deepEqual(f.records(), [localRecord()]);
  assert.equal(f.keys.has('tdlk_created'), false);
  const rollback = f.requests.find(r => new URL(r.url).pathname.endsWith('/biometric_credentials/td_created'));
  assert.ok(rollback);
  assert.equal(new URL(rollback.url).searchParams.get('_clerk_session_id'), 'sess_native');
});

for (const failure of ['key', 'write']) {
  test(`account biometric cleanup preserves retryable metadata after a ${failure} failure`, async t => {
    let fail = true;
    const records = [localRecord(), localRecord('td_second', 'user_native', 'key_second')];
    const f = await biometricFixture({
      records,
      biometrics: ({ capability, args }) => {
        if (
          fail &&
          ((failure === 'key' && capability === 'biometrics.deleteKey') ||
            (failure === 'write' && capability === 'biometrics.storage.write' && args.key === 'credentials'))
        )
          throw Object.assign(new Error('Locked'), { code: 'secure_storage_locked' });
      },
    });
    t.after(f.dispose);
    assert.equal(
      (await call(f, 'forgetLocalCredentials', [{ userId: 'user_native' }])).failure?.code,
      'secure_storage_locked',
    );
    assert.deepEqual(f.records(), records);
    assert.deepEqual(f.cleanup(), ['user_native']);
    assert.equal(f.keys.has('key_second'), true);
    fail = false;
    assert.equal((await call(f, 'forgetLocalCredentials', [{ userId: 'user_native' }])).result, 2);
    assert.deepEqual(f.records(), []);
    assert.deepEqual(f.cleanup(), []);
    assert.equal(f.keys.has('tdlk_fixture'), false);
    assert.equal(f.keys.has('key_second'), false);
  });
}

test('replacement enrollment keeps committed metadata when deleting the prior key fails', async t => {
  const f = await biometricFixture({
    signedIn: true,
    http: request =>
      new URL(request.url).pathname.endsWith('/biometric_credentials/attempt') ? response(remoteRecord()) : undefined,
    biometrics: ({ capability, args }) => {
      if (capability === 'biometrics.deleteKey' && args.localKeyId === 'tdlk_fixture')
        throw Object.assign(new Error('Locked'), { code: 'secure_storage_locked' });
    },
  });
  t.after(f.dispose);
  assert.equal((await call(f, 'enroll')).failure, undefined);
  assert.equal(f.records().length, 1);
  assert.equal(f.records()[0].localKeyId, 'tdlk_created');
  assert.equal((await call(f, 'localAvailability')).result.isAvailable, true);
});

for (const field of ['policy', 'userId']) {
  test(`biometric selection skips local records missing ${field}`, async t => {
    const record = localRecord();
    delete record[field];
    const f = await biometricFixture({ records: [record] });
    t.after(f.dispose);
    assert.deepEqual((await call(f, 'localAvailability')).result, {
      isAvailable: false,
      unavailableReason: 'noLocalCredential',
    });
    assert.equal(f.signed(), 0);
    assert.deepEqual(f.records(), [record]);
  });
}

test('failed biometric enrollment removes only its new key and preserves existing enrollments', async t => {
  const f = await biometricFixture({
    signedIn: true,
    http: request =>
      new URL(request.url).pathname.endsWith('/biometric_credentials/attempt')
        ? response(null, {
            status: 422,
            body: JSON.stringify({ errors: [{ code: 'enrollment_rejected', message: 'Try again' }] }),
          })
        : undefined,
  });
  t.after(f.dispose);
  const result = await call(f, 'enroll');
  assert.equal(result.failure.errors[0].code, 'enrollment_rejected');
  assert.deepEqual(f.records(), [localRecord()]);
  assert.deepEqual(f.deleted, ['tdlk_created']);
  assert.equal(f.keys.has('tdlk_fixture'), true);
});

test('successful enrollment replaces current-app credentials across users without revoking their server IDs', async t => {
  const otherApp = {
    ...localRecord('td_other_app', 'user_other', 'key_other_app'),
    appIdentifier: 'com.example.other',
  };
  const f = await biometricFixture({
    signedIn: true,
    records: [localRecord(), localRecord('td_other_user', 'user_other', 'key_other_user'), otherApp],
  });
  t.after(f.dispose);
  assert.equal((await call(f, 'enroll')).failure, undefined);
  assert.deepEqual(f.deleted, ['tdlk_fixture', 'key_other_user']);
  assert.deepEqual(
    f.records().map(record => record.id),
    ['td_other_app', 'td_created'],
  );
  assert.deepEqual(f.records()[0], otherApp);
  assert.equal(
    f.requests.some(r => new URL(r.url).searchParams.get('_method') === 'DELETE'),
    false,
  );
});

for (const identifierHint of [undefined, '   ']) {
  test(`enrollment normalizes ${identifierHint === undefined ? 'omitted' : 'blank'} identifier hints`, async t => {
    const f = await biometricFixture({ signedIn: true });
    t.after(f.dispose);
    assert.equal((await call(f, 'enroll', [{ identifierHint }])).failure, undefined);
    assert.equal(f.records()[0].identifierHint, null);
    assert.equal((await call(f, 'localAvailability')).result.isAvailable, true);
    assert.equal(
      (await call(f, 'localAvailability', [{ identifierHint: 'other@example.com' }])).result.isAvailable,
      false,
    );
  });
}
