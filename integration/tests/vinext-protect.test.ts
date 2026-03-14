import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('vinext @vinext @protect', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    test.setTimeout(120_000);
    app = await appConfigs.vinext.app.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();

    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('unauthenticated user cannot access protected page', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/protected');

    // vinext returns a 404 page for auth.protect() when unauthenticated,
    // unlike Next.js which redirects to sign-in
    await expect(u.page.getByText(/not found/i)).toBeVisible();
  });

  test('authenticated user can access protected page', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/protected');

    await expect(u.page.getByRole('heading', { name: /Protected Page/i })).toBeVisible();
    await expect(u.page.getByText(/User ID:/i)).toBeVisible();
  });

  test('API route returns auth state correctly', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const apiUrl = new URL('/api/me', app.serverUrl).toString();

    // When signed out, userId should be null
    const signedOutResponse = await u.page.request.get(apiUrl);
    expect(signedOutResponse.ok()).toBe(true);
    const signedOutData = await signedOutResponse.json();
    expect(signedOutData.userId).toBeNull();

    // Sign in
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    // When signed in, userId and sessionId should be present
    const signedInResponse = await u.page.request.get(apiUrl);
    expect(signedInResponse.ok()).toBe(true);
    const signedInData = await signedInResponse.json();
    expect(signedInData.userId).not.toBeNull();
    expect(signedInData.sessionId).not.toBeNull();
  });
});
