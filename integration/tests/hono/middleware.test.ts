import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'middleware and auth object tests for @hono',
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

    test('auth object contains userId and sessionId when signed in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');

      await u.po.signIn.waitForMounted();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();

      await u.po.userButton.waitForMounted();

      const url = new URL('/api/me', app.serverUrl);
      const res = await u.page.request.get(url.toString());
      expect(res.status()).toBe(200);

      const json = await res.json();
      expect(typeof json.userId).toBe('string');
      expect(typeof json.sessionId).toBe('string');
    });

    test('auth object contains null userId when signed out', async () => {
      const url = new URL('/api/me', app.serverUrl);
      // Raw fetch has no browser cookies, simulating an unauthenticated request.
      const res = await fetch(url.toString());

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.userId).toBeNull();
      expect(json.sessionId).toBeNull();
    });

    test('multiple sequential requests maintain session', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');

      await u.po.signIn.waitForMounted();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();

      await u.po.userButton.waitForMounted();

      const url = new URL('/api/me', app.serverUrl);

      const res1 = await u.page.request.get(url.toString());
      const json1 = await res1.json();

      const res2 = await u.page.request.get(url.toString());
      const json2 = await res2.json();

      expect(json1.userId).toBeTruthy();
      expect(json1.sessionId).toBeTruthy();
      expect(json1.userId).toBe(json2.userId);
      expect(json1.sessionId).toBe(json2.sessionId);
    });
  },
);
