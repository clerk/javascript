import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, response, tokenFixture, callbackUrl, deferred } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

const accountFixture = (id = 'eac_native') => ({
  object: 'external_account',
  id,
  provider: 'google',
  identification_id: 'idn_native',
  provider_user_id: 'provider_user',
  approved_scopes: 'profile',
  email_address: 'user@example.com',
  first_name: 'First',
  last_name: 'Last',
  image_url: '',
  username: '',
  phone_number: '',
  public_metadata: {},
  label: '',
  verification: {
    status: 'unverified',
    strategy: 'oauth_google',
    external_verification_redirect_url: 'https://provider.example/authorize',
    attempts: null,
    expire_at: null,
    error: null,
    verified_at_client: null,
  },
});

async function connectedFixture(options = {}) {
  let completed = false;
  const prepared = accountFixture(options.recreate ? 'eac_replaced' : 'eac_native');
  if (options.apple) {
    prepared.provider = 'apple';
    prepared.verification.strategy = 'oauth_token_apple';
  }
  const initial = accountFixture();
  if (options.error) initial.verification.error = { code: 'oauth_token_expired', message: 'Reconnect' };
  const final = {
    ...prepared,
    approved_scopes: 'profile calendar',
    verification: { ...prepared.verification, status: 'verified', external_verification_redirect_url: null },
  };
  const client = () => {
    const value = structuredClone(fixtures.authenticatedClient);
    value.sessions[0].user.external_accounts = completed ? [final] : options.existing ? [initial] : [];
    return value;
  };
  const f = await fixture({
    client: client(),
    capabilities: options.apple ? ['appleIdentity'] : [],
    appleIdentity: () => ({ token: 'apple_link_token' }),
    browser: async () => {
      if (options.browser) return options.browser();
      if (options.cancel) throw Object.assign(new Error('Cancelled'), { code: 'user_cancelled' });
      if (options.mismatch) return { callbackUrl: 'other-app://callback' };
      completed = true;
    },
    http: request => {
      const pathname = new URL(request.url).pathname;
      if (pathname.endsWith('/client')) return response(client());
      if (pathname.includes('/tokens')) return response(tokenFixture(), { body: JSON.stringify(tokenFixture()) });
      if (pathname.endsWith('/touch')) return response(client().sessions[0]);
      if (pathname.endsWith('/sessions')) return response({ ...fixtures.client, id: 'client_native', sessions: [] });
      if (pathname.includes('/external_accounts')) {
        if (options.apple) completed = true;
        return response(prepared);
      }
    },
  });
  return f;
}

for (const scenario of ['create', 'reauthorize', 'recreate']) {
  test(`native external account ${scenario} completes the browser roundtrip in core`, async t => {
    const f = await connectedFixture({
      existing: scenario !== 'create',
      error: scenario === 'recreate',
      recreate: scenario === 'recreate',
    });
    t.after(f.dispose);
    const before = f.requests.length;
    const scopes = scenario === 'recreate' ? ['profile'] : ['calendar'];
    const params = { additionalScopes: scopes, oidcPrompt: 'consent login', oidcLoginHint: 'user@example.com' };
    const result =
      scenario === 'create'
        ? await f.invoke(f.state.roots.user, 'User.createExternalAccount', [{ ...params, strategy: 'oauth_google' }])
        : await f.invoke(f.resource(f.state.roots.user).externalAccounts[0].$ref, 'ExternalAccount.reauthorize', [
            params,
          ]);
    assert.equal(
      result.failure,
      undefined,
      JSON.stringify({
        failure: result.failure,
        accounts: f.resource(f.state.roots.user).externalAccounts,
        paths: f.requests.map(r => new URL(r.url).pathname),
      }),
    );
    const account = f.resource(result.result.$ref);
    assert.equal(account.id, scenario === 'recreate' ? 'eac_replaced' : 'eac_native');
    assert.equal(account.approvedScopes, 'profile calendar');
    assert.deepEqual(f.resource(f.state.roots.user).externalAccounts[0], result.result);
    const requests = f.requests.slice(before);
    const mutation = requests.find(r => r.url.includes('/external_accounts'));
    const body = new URLSearchParams(mutation.body);
    assert.equal(body.get('redirect_url'), callbackUrl);
    assert.equal(body.get('oidc_prompt'), 'consent login');
    assert.equal(body.get('oidc_login_hint'), 'user@example.com');
    assert.equal(mutation.url.includes('/reauthorize'), scenario === 'reauthorize');
    const reload = requests.find(r => new URL(r.url).pathname.endsWith('/client'));
    assert.equal(new URL(reload.url).searchParams.get('rotating_token_nonce'), 'fixture_nonce');
    assert.equal(f.messages.filter(m => m.kind === 'hostRequest' && m.capability === 'browser').length, 1);
  });
}

test('native Apple account linking uses an identity token and refreshes the canonical user', async t => {
  const f = await connectedFixture({ apple: true });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.user, 'User.createExternalAccount', [{ strategy: 'oauth_token_apple' }]);
  assert.equal(
    result.failure,
    undefined,
    JSON.stringify({
      failure: result.failure,
      accounts: f.resource(f.state.roots.user).externalAccounts,
      paths: f.requests.map(r => new URL(r.url).pathname),
    }),
  );
  assert.equal(f.resource(result.result.$ref).provider, 'apple');
  assert.deepEqual(f.resource(f.state.roots.user).externalAccounts[0], result.result);
  const request = f.requests.find(r => r.url.includes('/external_accounts'));
  assert.equal(new URLSearchParams(request.body).get('token'), 'apple_link_token');
  assert.equal(
    f.messages.some(m => m.kind === 'hostRequest' && m.capability === 'browser'),
    false,
  );
  assert.equal(JSON.stringify(f.messages.filter(m => m.state)).includes('apple_link_token'), false);
});

for (const outcome of ['cancel', 'mismatch']) {
  test(`external account ${outcome} does not reconcile an unverified callback`, async t => {
    const f = await connectedFixture({ [outcome]: true });
    t.after(f.dispose);
    const before = f.requests.length;
    const result = await f.invoke(f.state.roots.user, 'User.createExternalAccount', [{ strategy: 'oauth_google' }]);
    assert.equal(result.failure.code, outcome === 'cancel' ? 'user_cancelled' : 'oauth_transport_callback_mismatch');
    assert.equal(
      f.requests.slice(before).some(r => new URL(r.url).pathname.endsWith('/client')),
      false,
    );
    assert.equal(f.resource(f.state.roots.user).externalAccounts.length, 0);
  });
}

test('sign-out cancels pending account authorization and ignores a late callback', async t => {
  const opened = deferred(),
    callback = deferred();
  const f = await connectedFixture({
    browser: () => {
      opened.resolve();
      return callback.promise;
    },
  });
  t.after(f.dispose);
  const pending = f.invoke(f.state.roots.user, 'User.createExternalAccount', [{ strategy: 'oauth_google' }]);
  await opened.promise;
  const signedOut = await f.invoke(f.state.roots.clerk, 'Clerk.signOut');
  assert.equal(signedOut.failure, undefined);
  assert.equal(f.state.roots.user, null);
  assert.equal((await pending).failure.code, 'stale_operation');
  const before = f.requests.length;
  callback.resolve({ callbackUrl: `${callbackUrl}?rotating_token_nonce=late_account_nonce` });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.requests.length, before);
  assert.equal(f.state.roots.user, null);
});
