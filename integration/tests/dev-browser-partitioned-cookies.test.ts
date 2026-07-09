import { expect, test } from '@playwright/test';
import { parsePublishableKey } from '@clerk/shared/keys';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'dev browser partitioned cookies @generic',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

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

    test('URL query param dev browser token takes precedence over existing partitioned cookie on initial load', async ({
      page,
      context,
    }) => {
      const pk = app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
      const { frontendApi } = parsePublishableKey(pk)!;
      const fapiOrigin = `https://${frontendApi}`;

      // Obtain a valid dev browser token directly from FAPI before any page load
      const devBrowserRes = await page.request.post(`${fapiOrigin}/v1/dev_browser`);
      expect(devBrowserRes.ok()).toBe(true);
      const { id: freshToken } = await devBrowserRes.json();
      expect(freshToken).toBeTruthy();

      // Pre-set a stale __clerk_db_jwt cookie before the page ever loads.
      // This simulates the partitioned cookie that already exists in the browser
      // from a previous session.
      const appUrl = new URL(app.serverUrl);
      await context.addCookies([
        {
          name: '__clerk_db_jwt',
          value: 'stale_partitioned_value',
          domain: appUrl.hostname,
          path: '/',
        },
      ]);

      // Collect every dev browser token attached to FAPI requests
      const fapiTokens: string[] = [];
      page.on('request', req => {
        if (req.url().includes('__clerk_db_jwt') && req.url().includes('/v1/')) {
          const url = new URL(req.url());
          const token = url.searchParams.get('__clerk_db_jwt');
          if (token) {
            fapiTokens.push(token);
          }
        }
      });

      // Initial page load with the fresh token in the URL query param,
      // simulating a redirect back from Clerk's Account Portal.
      const signInUrl = new URL(app.serverUrl + '/sign-in');
      signInUrl.searchParams.set('__clerk_db_jwt', freshToken);

      await page.goto(signInUrl.toString());
      await page.waitForLoadState('networkidle');

      // Every FAPI request during initial load must use the URL token,
      // not the stale partitioned cookie.
      expect(fapiTokens.length).toBeGreaterThan(0);
      for (const token of fapiTokens) {
        expect(token).toBe(freshToken);
        expect(token).not.toBe('stale_partitioned_value');
      }

      // Verify clerk-js is functional: sign in should succeed
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
    });
  },
);
