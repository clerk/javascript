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

const { prefetchSessions, prefetchUser } = await import('../dist/server.js');
const publishableKey = 'pk_test_fake';
const hydration = await prefetchSessions({
  identity: { userId: 'user_a', sessionId: 'sess_a' },
  resolveBackend: async () => ({
    client: {
      sessions: {
        getActiveDevices: async (sessionId, { signal }) => {
          assert.equal(sessionId, 'sess_a');
          assert.ok(signal instanceof AbortSignal);
          return {
            object: 'active_device_sessions',
            subject: { instance_id: 'ins_a', user_id: 'user_a', session_id: 'sess_a' },
            sessions: [
              {
                id: 'sess_a',
                status: 'active',
                last_active_at: null,
                expire_at: 2,
                abandon_at: 3,
                has_actor: false,
                latest_activity: { id: 'activity' },
                secret: 'must-not-hydrate',
              },
            ],
          };
        },
      },
    },
    routing: { publishableKey, frontendApi: 'clerk.example.com', proxyUrl: '/proxy', domain: 'example.com' },
  }),
});

const userHydration = await prefetchUser({
  identity: { userId: 'user_a', sessionId: 'sess_a' },
  resolveBackend: async () => ({
    client: {
      users: {
        getUser: async userId => ({
          id: userId,
          firstName: 'Ada',
          lastName: null,
          username: null,
          imageUrl: 'https://img.example/ada',
          hasImage: false,
          primaryEmailAddressId: 'email_a',
          passwordEnabled: false,
          deleteSelfEnabled: true,
          externalAccounts: [],
          enterpriseAccounts: [],
          emailAddresses: [
            {
              id: 'email_a',
              emailAddress: 'ada@example.com',
              verification: { status: 'verified', secret: 'must-not-hydrate' },
            },
          ],
          privateMetadata: 'must-not-hydrate',
          raw: 'must-not-hydrate',
        }),
      },
    },
    routing: { publishableKey, frontendApi: 'clerk.example.com', domain: '' },
  }),
});
assert.deepEqual(userHydration?.user?.data, {
  id: 'user_a',
  firstName: 'Ada',
  lastName: null,
  username: null,
  imageUrl: 'https://img.example/ada',
  hasImage: false,
  primaryEmailAddressId: 'email_a',
  passwordEnabled: false,
  deleteSelfEnabled: true,
  externalAccounts: [],
  enterpriseAccounts: [],
  emailAddresses: [
    {
      id: 'email_a',
      emailAddress: 'ada@example.com',
      verification: { status: 'verified', strategy: null, expireAt: null, error: null },
    },
  ],
});
assert.equal(userHydration?.sessions, undefined);
assert.equal(JSON.stringify(userHydration).includes('must-not-hydrate'), false);

hooks.deregister();
assert.deepEqual(hydration?.scope, {
  instanceKey: JSON.stringify([publishableKey, 'clerk.example.com', '/proxy', 'example.com']),
  userId: 'user_a',
  sessionId: 'sess_a',
});
assert.equal(hydration?.version, 5);
assert.deepEqual(JSON.parse(JSON.stringify(hydration?.sessions?.data)), [
  {
    id: 'sess_a',
    status: 'active',
    lastActiveAt: null,
    expireAt: 2,
    abandonAt: 3,
    hasActor: false,
    latestActivity: { id: 'activity' },
  },
]);
assert.equal(JSON.stringify(hydration).includes('must-not-hydrate'), false);
assert.equal(
  [...modules].some(url => /(?:react|mosaic|clerk-js|next|nextjs|backend)(?:[/@.-]|$)/i.test(url)),
  false,
);
console.log(`Built server: ${modules.size} modules loaded; minimal hydration and no framework or backend runtime.`);

const { prefetchProfile } = await import('../dist/server.js');
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
  assert.deepEqual(profile.hydration.user.data, userOnly.user.data);
  assert.equal(profile.hydration.user.data.externalAccounts[0].id, 'eac_google');
  assert.equal(profile.hydration.user.data.externalAccounts[0].verification.error.longMessage, 'Reconnect');
  assert.equal(JSON.stringify(profile).includes('must-not-hydrate'), false);
} finally {
  globalThis.fetch = originalFetch;
}
console.log('Actual Backend User resource preserves raw verification errors for profile and user-only prefetch.');
