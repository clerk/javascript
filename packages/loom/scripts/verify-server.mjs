import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

const modules = new Set();
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const result = nextResolve(specifier, context);
    modules.add(result.url);
    return result;
  },
});
const { prefetchProfile, prefetchUser } = await import('../dist/server.js');

const publicEnvironment = JSON.parse(
  await (
    await import('node:fs/promises')
  ).readFile(new URL('../src/__tests__/fixtures/environment.json', import.meta.url), 'utf8'),
);
const rawUser = {
  id: 'user_a',
  object: 'user',
  first_name: 'Ada',
  last_name: null,
  username: null,
  image_url: 'https://img.example/ada',
  has_image: true,
  primary_email_address_id: null,
  email_addresses: [],
  enterprise_accounts: [],
  password_enabled: false,
  delete_self_enabled: true,
  external_accounts: [
    {
      id: 'provider_google_id',
      external_account_id: 'eac_google',
      provider: 'google',
      username: null,
      email_address: '',
      approved_scopes: 'email',
      verification: {
        status: 'verified',
        strategy: 'oauth_google',
        error: { code: 'oauth_fetch_user_error', message: 'Reconnect' },
      },
    },
  ],
  private_metadata: { secret: 'must-not-hydrate' },
};
const originalFetch = globalThis.fetch;
let publicReads = 0;
try {
  globalThis.fetch = async (input, options) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.pathname === '/v1/environment') {
      publicReads++;
      assert.equal(options.headers, undefined);
      assert.equal(options.redirect, 'error');
      assert.equal(options.cache, 'no-store');
      return Response.json(publicEnvironment);
    }
    assert.equal(url.pathname, '/v1/users/user_a');
    return Response.json(rawUser);
  };
  const { createClerkClient } = await import('../../backend/dist/index.mjs');
  const backend = createClerkClient({ secretKey: 'sk_test_example', apiUrl: 'https://api.clerk.test' });
  const resource = await backend.users.getUser('user_a');
  assert.equal(resource.raw.external_accounts[0].verification.error.message, 'Reconnect');
  const context = {
    identity: { userId: 'user_a', sessionId: 'sess_a' },
    resolveBackend: async () => ({
      client: { users: { getUser: async () => resource } },
      routing: {
        publishableKey: `pk_test_${Buffer.from('example.clerk.accounts.dev$').toString('base64')}`,
        frontendApi: 'example.clerk.accounts.dev',
        domain: '',
      },
    }),
  };
  const userOnly = await prefetchUser(context);
  assert.equal(publicReads, 0);
  const profile = await prefetchProfile(context);
  assert.equal(publicReads, 1);
  assert.equal((await profile.settings).kind, 'ready');
  const portableProfile = JSON.parse(
    JSON.stringify({ hydration: profile.hydration, settings: await profile.settings }),
  );
  assert.equal(portableProfile.settings.kind, 'ready');
  assert.deepEqual(portableProfile.settings.hydration.scope, portableProfile.hydration.scope);
  assert.deepEqual(portableProfile.hydration.user.data, userOnly.user.data);
  assert.equal(typeof window, 'undefined');
  assert.equal(typeof document, 'undefined');
  assert.deepEqual(profile.hydration.user.data, userOnly.user.data);
  assert.equal(profile.hydration.user.data.externalAccounts[0].id, 'eac_google');
  assert.equal(profile.hydration.user.data.externalAccounts[0].verification.error.longMessage, 'Reconnect');
  assert.equal(JSON.stringify(portableProfile).includes('must-not-hydrate'), false);
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(
  [...modules].some(url => /(?:tanstack|react-query|clerk-js|nextjs)(?:[/@.-]|$)/i.test(url)),
  false,
);
console.log('Built profile server prefetch projects user and settings without device or client runtime.');
