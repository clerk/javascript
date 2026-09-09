import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response, deferred, sessionFixture, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

test('production handshake rejects mismatched bindings before HTTP or storage', async () => {
  const f = await fixture({ configuration: { contractHash: 'wrong' }, allowFailure: true });
  assert.equal(f.ready.failure.code, 'incompatible_bindings');
  assert.equal(f.requests.length, 0);
  f.dispose();
});

test('generated email verification preserves MFA requirements and returned domain errors', async t => {
  let reject = false;
  const f = await fixture({
    client: { ...fixtures.client, sign_in: fixtures.signIn },
    http: request => {
      if (!request.url.includes('/attempt_first_factor')) return;
      assert.equal(new URLSearchParams(request.body).get('strategy'), 'email_code');
      if (reject)
        return response(null, {
          status: 422,
          body: JSON.stringify({
            errors: [
              {
                code: 'form_code_incorrect',
                message: 'Incorrect code',
                long_message: 'Try again',
                meta: { param_name: 'code', password: 'must-not-cross' },
              },
            ],
          }),
        });
      return response({ ...fixtures.signIn, status: 'needs_second_factor' });
    },
  });
  t.after(f.dispose);
  const group = f.group('signIn', 'emailCode');
  const success = await f.invoke(group, `${group.type}.verifyCode`, [{ code: '123456' }]);
  assert.deepEqual(success.result, { error: null });
  assert.equal(f.resource(f.state.roots.signIn).status, 'needs_second_factor');
  assert.equal(f.state.roots.session, null);
  reject = true;
  const failure = await f.invoke(group, `${group.type}.verifyCode`, [{ code: 'wrong' }]);
  assert.equal(failure.result.error.kind, 'clerk');
  assert.equal(failure.result.error.errors[0].code, 'form_code_incorrect');
  assert.equal(JSON.stringify(failure).includes('must-not-cross'), false);
  assert.equal(failure.state.revision, f.state.revision);
});

test('local reset replaces the attempt, invalidates held groups, and makes no HTTP request', async t => {
  const f = await fixture({ client: { ...fixtures.client, sign_in: fixtures.signIn } });
  t.after(f.dispose);
  const old = f.state.roots.signIn;
  const group = f.group('signIn', 'emailCode');
  const count = f.requests.length;
  const reset = await f.invoke(old, 'SignIn.reset');
  assert.deepEqual(reset.result, { error: null });
  assert.equal(f.requests.length, count);
  assert.notDeepEqual(f.state.roots.signIn, old);
  assert.equal(f.resource(f.state.roots.signIn).status, 'needs_identifier');
  const stale = await f.invoke(group, `${group.type}.verifyCode`, [{ code: '123456' }]);
  assert.equal(stale.failure.code, 'stale_resource');
  assert.equal(f.requests.length, count);
});

test('reset cancels an outstanding browser effect and ignores its late callback', async t => {
  const browser = deferred(),
    opened = deferred();
  const f = await fixture({
    browser: () => {
      opened.resolve();
      return browser.promise;
    },
    http: request => {
      if (request.url.includes('/sign_ins')) return response(fixtures.signIn);
    },
  });
  t.after(f.dispose);
  const sso = f.invoke(f.state.roots.signIn, 'SignIn.sso', [{ strategy: 'oauth_google' }]);
  await opened.promise;
  await f.invoke(f.state.roots.signIn, 'SignIn.reset');
  const result = await sso;
  assert.equal(result.failure.code, 'stale_operation');
  browser.resolve({ callbackUrl: 'clerk-test://sso-callback?rotating_token_nonce=late' });
  await new Promise(r => setImmediate(r));
  assert.equal(f.requests.filter(r => r.method === 'GET' && r.url.includes('sign_ins')).length, 0);
  assert.equal(f.resource(f.state.roots.signIn).status, 'needs_identifier');
  assert.ok(f.messages.some(m => m.kind === 'hostCancel'));
});

for (const status of ['active', 'pending']) {
  test(`explicit finalize adopts the ${status} session before completion without navigation`, async t => {
    const session = sessionFixture(status);
    const token = tokenFixture();
    const complete = { ...fixtures.signIn, status: 'complete', created_session_id: session.id };
    const client = {
      ...fixtures.client,
      id: 'client_native',
      sign_in: complete,
      sessions: [session],
      last_active_session_id: null,
    };
    let clientReads = 0;
    const f = await fixture({
      client: { ...client, sessions: [] },
      http: request => {
        if (new URL(request.url).pathname.endsWith('/client') && ++clientReads > 1) return response(client);
        if (request.url.includes('/touch'))
          return response(session, {
            body: JSON.stringify({ response: session, client: { ...client, last_active_session_id: session.id } }),
          });
        if (request.url.includes('/tokens')) return response(token, { body: JSON.stringify(token) });
      },
    });
    t.after(f.dispose);
    assert.equal(f.state.roots.session, null);
    const result = await f.invoke(f.state.roots.signIn, 'SignIn.finalize');
    assert.deepEqual(result.result, { error: null }, JSON.stringify(result.failure || result.result));
    assert.equal(f.resource(f.state.roots.session).status, status);
    assert.equal(f.resource(f.state.roots.user).id, 'user_native');
    assert.equal(JSON.stringify(result.state).includes('fixture_signature'), false);
    assert.equal(
      f.messages.some(m => m.capability === 'browser'),
      false,
    );
    if (status === 'pending') assert.equal(f.resource(f.state.roots.session).currentTask.key, 'choose-organization');
    else {
      const jwt = await f.invoke(f.state.roots.session, 'Session.getToken');
      assert.equal(jwt.result, token.jwt);
    }
  });
}

test('sign-out fences a finalization response and its credential before it can restore a session', async t => {
  const session = sessionFixture();
  const client = {
    ...fixtures.client,
    id: 'client_native',
    sign_in: { ...fixtures.signIn, status: 'complete', created_session_id: session.id },
    sessions: [session],
  };
  const touch = deferred(),
    touched = deferred();
  let reads = 0;
  const f = await fixture({
    client: { ...client, sessions: [] },
    http: async request => {
      const path = new URL(request.url).pathname;
      if (path.endsWith('/client') && ++reads > 1) return response(client);
      if (path.endsWith('/touch')) {
        touched.resolve();
        return touch.promise;
      }
      if (path.endsWith('/sessions')) return response({ ...fixtures.client, id: client.id, sessions: [] });
    },
  });
  t.after(f.dispose);
  const finalized = f.invoke(f.state.roots.signIn, 'SignIn.finalize');
  await touched.promise;
  const signedOut = await f.invoke(f.state.roots.clerk, 'Clerk.signOut');
  assert.equal(signedOut.failure, undefined);
  assert.equal(f.state.roots.session, null);
  touch.resolve(
    response(session, {
      headers: { authorization: 'stale_credential' },
      body: JSON.stringify({ response: session, client: { ...client, last_active_session_id: session.id } }),
    }),
  );
  const stale = await finalized;
  assert.equal(stale.failure.code, 'stale_operation');
  assert.equal(f.state.roots.session, null);
  assert.notEqual(f.credential, 'stale_credential');
  assert.equal(
    f.requests.some(r => r.url.includes('/tokens')),
    false,
  );
});

test('background is nonfatal and foreground recovers resources through the core', async t => {
  const reloaded = deferred();
  let reads = 0;
  const f = await fixture({
    http: request => {
      if (new URL(request.url).pathname.endsWith('/client') && ++reads > 1) reloaded.resolve();
    },
  });
  t.after(f.dispose);
  f.receive({ kind: 'lifecycle', state: 'background' });
  const reset = await f.invoke(f.state.roots.signIn, 'SignIn.reset');
  assert.equal(reset.failure, undefined);
  assert.equal(reads, 1);
  f.receive({ kind: 'lifecycle', state: 'foreground' });
  await reloaded.promise;
  assert.equal(
    f.messages.some(message => message.kind === 'runtimeError'),
    false,
  );
});

test('native settings are projected from the owner with typed configuration', async t => {
  const f = await fixture();
  t.after(f.dispose);
  const environment = f.resource(f.resource(f.state.roots.clerk).environment.$ref);
  assert.equal(environment.userSettings.signUp.mode, 'public');
  assert.equal(environment.userSettings.attributes.email_address.enabled, false);
  assert.equal(environment.displayConfig.applicationName, 'TestApp');
});

test('custom OAuth configuration survives the generated native settings projection', async t => {
  const environment = structuredClone(fixtures.environment);
  environment.user_settings.social.oauth_custom_corporate = {
    enabled: true,
    required: false,
    authenticatable: true,
    strategy: 'oauth_custom_corporate',
    name: 'Corporate',
    logo_url: 'https://example.com/logo.png',
  };
  const f = await fixture({
    http: request => (new URL(request.url).pathname.endsWith('/environment') ? response(environment) : undefined),
  });
  t.after(f.dispose);
  const social = f.resource(f.resource(f.state.roots.clerk).environment.$ref).userSettings.social;
  assert.equal(social.oauth_custom_corporate.name, 'Corporate');
  assert.equal(social.oauth_custom_corporate.strategy, 'oauth_custom_corporate');
  assert.equal(social.oauth_custom_corporate.enabled, true);
});

test('phone recovery codes use an explicit generated read and never enter observable state', async t => {
  const codes = ['recovery-secret-one', 'recovery-secret-two'];
  const phone = {
    object: 'phone_number',
    id: 'phone_native',
    phone_number: '+15555550123',
    reserved_for_second_factor: false,
    default_second_factor: false,
    linked_to: [],
    verification: {
      status: 'verified',
      strategy: 'phone_code',
      attempts: null,
      expire_at: null,
      error: null,
      verified_at_client: null,
    },
  };
  const session = sessionFixture();
  session.user.phone_numbers = [phone];
  session.user.primary_phone_number_id = phone.id;
  const client = { ...fixtures.authenticatedClient, sessions: [session] };
  const f = await fixture({
    client,
    http: request => {
      if (request.url.includes('/phone_numbers/')) {
        assert.equal(request.method, 'POST');
        assert.equal(new URL(request.url).searchParams.get('_method'), 'PATCH');
        assert.equal(new URLSearchParams(request.body).get('reserved_for_second_factor'), 'true');
        return response({ ...phone, reserved_for_second_factor: true, backup_codes: codes });
      }
      if (request.url.includes('/tokens')) return response(tokenFixture(), { body: JSON.stringify(tokenFixture()) });
      if (request.url.includes('/touch')) return response(session);
    },
  });
  t.after(f.dispose);
  const resource = f.resource(f.state.roots.user).phoneNumbers[0].$ref;
  const reserved = await f.invoke(resource, 'PhoneNumber.setReservedForSecondFactor', [{ reserved: true }]);
  assert.equal(reserved.failure, undefined, JSON.stringify(reserved.failure));
  assert.equal(f.resource(resource).reservedForSecondFactor, true);
  assert.equal('backupCodes' in f.resource(resource), false);
  const requestCount = f.requests.length;
  const read = await f.invoke(resource, 'PhoneNumber.backupCodes');
  assert.deepEqual(read.result, codes);
  assert.equal(f.requests.length, requestCount);
  assert.equal(
    f.messages.filter(m => m.state).some(m => JSON.stringify(m.state).includes(codes[0])),
    false,
  );
});

test('the canonical environment resource refreshes settings before generated completion', async t => {
  let applicationName = 'Before';
  const f = await fixture({
    http: request => {
      if (!new URL(request.url).pathname.endsWith('/environment')) return;
      const environment = structuredClone(fixtures.environment);
      environment.display_config.application_name = applicationName;
      return response(environment);
    },
  });
  t.after(f.dispose);
  const handle = f.resource(f.state.roots.clerk).environment.$ref;
  assert.equal(handle.type, 'EnvironmentResource');
  assert.equal(f.resource(handle).displayConfig.applicationName, 'Before');
  applicationName = 'After';
  const result = await f.invoke(handle, 'EnvironmentResource.reload');
  assert.equal(result.failure, undefined);
  assert.deepEqual(result.result.$ref, handle);
  assert.equal(f.resource(handle).displayConfig.applicationName, 'After');
});

test('native client metadata uses the existing client without exposing legacy auth resources', async t => {
  const client = { ...fixtures.authenticatedClient, last_authentication_strategy: 'oauth_google' };
  const f = await fixture({ client });
  t.after(f.dispose);
  const clerk = f.resource(f.state.roots.clerk);
  assert.equal(clerk.lastAuthenticationStrategy, 'oauth_google');
  assert.equal(clerk.sessions.length, 1);
  assert.deepEqual(clerk.sessions[0].$ref, f.state.roots.session);
  assert.equal(clerk.signIn.$ref.type, 'SignIn');
  assert.equal(clerk.signUp.$ref.type, 'SignUp');
  assert.equal(clerk.client, undefined);
});

test('identification timestamps survive core hydration and generated state projection', async t => {
  const session = sessionFixture();
  const verification = {
    status: 'verified',
    strategy: 'email_code',
    attempts: null,
    expire_at: null,
    error: null,
    verified_at_client: null,
  };
  session.user.email_addresses = [
    {
      object: 'email_address',
      id: 'email_timestamp',
      email_address: 'time@example.com',
      verification,
      linked_to: [],
      matches_sso_connection: false,
      created_at: 0,
    },
  ];
  session.user.phone_numbers = [
    {
      object: 'phone_number',
      id: 'phone_timestamp',
      phone_number: '+15555550123',
      verification: { ...verification, strategy: 'phone_code' },
      linked_to: [],
      reserved_for_second_factor: false,
      default_second_factor: false,
      created_at: 1700000000000,
    },
  ];
  session.user.external_accounts = [
    {
      object: 'external_account',
      id: 'external_timestamp',
      provider: 'google',
      identification_id: 'ident_timestamp',
      provider_user_id: 'provider_timestamp',
      approved_scopes: '',
      email_address: 'time@example.com',
      first_name: '',
      last_name: '',
      image_url: '',
      username: '',
      phone_number: '',
      public_metadata: {},
      label: '',
      verification,
      created_at: 1700000001000,
    },
  ];
  const f = await fixture({ client: { ...fixtures.authenticatedClient, sessions: [session] } });
  t.after(f.dispose);
  const user = f.resource(f.state.roots.user);
  for (const [field, timestamp] of [
    ['emailAddresses', 0],
    ['phoneNumbers', 1700000000000],
    ['externalAccounts', 1700000001000],
  ]) {
    assert.equal(f.resource(user[field][0].$ref).createdAt, new Date(timestamp).toISOString());
  }
});

test('native auth settings refresh through the canonical environment and default to disabled', async t => {
  let settings = {
    api_enabled: true,
    trusted_device_sign_in_enabled: true,
    trusted_device_enrollment_prompt_after_sign_in_enabled: true,
    trusted_device_enrollment_prompt_after_sign_up_enabled: false,
  };
  const f = await fixture({
    http: request => {
      if (!new URL(request.url).pathname.endsWith('/environment')) return;
      const environment = structuredClone(fixtures.environment);
      environment.auth_config.native_settings = settings;
      return response(environment);
    },
  });
  t.after(f.dispose);
  const handle = f.resource(f.state.roots.clerk).environment.$ref;
  assert.deepEqual(f.resource(handle).authConfig.nativeSettings, {
    apiEnabled: true,
    trustedDeviceSignInEnabled: true,
    trustedDeviceEnrollmentPromptAfterSignInEnabled: true,
    trustedDeviceEnrollmentPromptAfterSignUpEnabled: false,
  });
  settings = undefined;
  const result = await f.invoke(handle, 'EnvironmentResource.reload');
  assert.equal(result.failure, undefined);
  assert.deepEqual(f.resource(handle).authConfig.nativeSettings, {
    apiEnabled: false,
    trustedDeviceSignInEnabled: false,
    trustedDeviceEnrollmentPromptAfterSignInEnabled: false,
    trustedDeviceEnrollmentPromptAfterSignUpEnabled: false,
  });
});
