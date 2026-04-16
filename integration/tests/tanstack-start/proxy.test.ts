import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodesProxy] })(
  'frontend API proxy tests for @tanstack-react-start',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test('handshake redirect uses forwarded headers for proxyUrl, not localhost', async () => {
      // This test proves that the SDK must derive proxyUrl from x-forwarded-* headers.
      // When a reverse proxy sits in front of the app, the raw request URL is localhost,
      // but the handshake redirect must point to the public origin.
      //
      // We simulate a behind-proxy scenario by sending x-forwarded-proto and x-forwarded-host
      // headers, with a __client_uat cookie (non-zero) but no session cookie, which forces
      // a handshake. The handshake redirect Location should use the forwarded origin.
      const url = new URL('/me', app.serverUrl);
      const res = await fetch(url.toString(), {
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'myapp.example.com',
          'sec-fetch-dest': 'document',
          Accept: 'text/html',
          Cookie: '__clerk_db_jwt=needstobeset; __client_uat=1',
        },
        redirect: 'manual',
      });

      // The server should respond with a 307 handshake redirect
      expect(res.status).toBe(307);
      const location = res.headers.get('location') ?? '';
      // The redirect must point to the public origin (from forwarded headers),
      // NOT to http://localhost:PORT. If the SDK uses requestUrl.origin instead
      // of forwarded headers, this assertion will fail.
      const decoded = decodeURIComponent(location);
      expect(decoded).toContain('https://myapp.example.com');
      expect(decoded).not.toContain('localhost');
    });

    test('auth works correctly with proxy enabled', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');

      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });

      await u.po.userButton.waitForMounted();

      await u.page.goToRelative('/me');

      const userId = await u.page.getByTestId('userId').textContent();
      expect(userId).toBeTruthy();
    });
  },
);
