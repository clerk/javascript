import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { CLERK_DB_JWT_COOKIE_NAME, CLERK_SESSION_COOKIE_NAME } from './common';

test.describe('Next with ClerkJS V5 <-> Account Portal Core 1 @ap-flows', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouterAPWithClerkNextLatest.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withAPCore1ClerkLatest);
    await app.dev();
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('sign in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    // Begin in localhost
    await u.page.goToStart();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    // Get the Initial DevBrowser JWT
    const initialDbJwt = await context
      .cookies(page.url())
      .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);

    // Navigate to the Account Portal
    await u.page.getByRole('button', { name: /Sign in/i }).click();
    await u.po.signIn.waitForMounted();

    // Check that the DevBrowser JWT between localhost and AP is the same
    const accountPortalURL = page.url();
    // Check that we are in Account Portal
    expect(accountPortalURL).toContain('.accounts.dev');
    const accountPortalDbJwt = await context
      .cookies(accountPortalURL)
      .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);
    expect(accountPortalDbJwt).toEqual(initialDbJwt);

    // Sign in with email and password
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    // Navigate back to localhost
    await u.page.waitForAppUrl('/');
    await u.po.expect.toBeSignedIn();
    await u.po.userButton.waitForMounted();

    // Get the new DevBrowser JWT that was set after signing in the Account Portal
    const appDbJwtAfterSignIn = await context
      .cookies(accountPortalURL)
      .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);

    // Get the new DevBrowser JWT
    const newLocalhostDbJwt = await context
      .cookies(page.url())
      .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);

    // Get the __session cookie
    const __session = await context
      .cookies(page.url())
      .then(cookies => cookies.find(c => c.name === CLERK_SESSION_COOKIE_NAME)?.value);

    // Check that the new localhost DevBrowser JWT is the same as the one set after signing in the Account Portal
    // and not the same as the initial DevBrowser JWT
    expect(newLocalhostDbJwt).toEqual(appDbJwtAfterSignIn);
    expect(newLocalhostDbJwt).not.toEqual(initialDbJwt);

    // Check that the __session cookie is set
    expect(!!__session).toBeTruthy();

    await expect(u.page.getByRole('button', { name: /Open user button/i })).toBeVisible();

    // cleanup the search params after consuming the dev browser jwt
    const finalURL = new URL(u.page.url());
    expect(finalURL.searchParams.size).toEqual(0);
  });

  test('sign up', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser({ fictionalEmail: true });

    // Begin in localhost
    await u.page.goToStart();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    // Get the Initial DevBrowser JWT
    const initialDbJwt = await context
      .cookies(page.url())
      .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);

    // Navigate to the Account Portal
    await u.page.getByRole('button', { name: /Sign up/i }).click();
    await u.po.signUp.waitForMounted();

    // Check that the DevBrowser JWT between localhost and AP is the same
    const accountPortalURL = page.url();
    // Check that we are in Account Portal
    expect(accountPortalURL).toContain('.accounts.dev');
    const accountPortalDbJwt = await context
      .cookies(accountPortalURL)
      .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);
    expect(accountPortalDbJwt).toEqual(initialDbJwt);

    // Sign up with email and password
    await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.signUp.enterOtpCode('424242');

    // Navigate back to localhost
    await u.page.waitForAppUrl('/');
    await u.po.expect.toBeSignedIn();
    await u.po.userButton.waitForMounted();

    // Get the new DevBrowser JWT that was set after signing in the Account Portal
    const appDbJwtAfterSignIn = await context
      .cookies(accountPortalURL)
      .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);

    // Get the new DevBrowser JWT
    const newLocalhostDbJwt = await context
      .cookies(u.page.url())
      .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);

    // Get the __session cookie
    const __session = await context
      .cookies(u.page.url())
      .then(cookies => cookies.find(c => c.name === CLERK_SESSION_COOKIE_NAME)?.value);

    // Check that the new localhost DevBrowser JWT is the same as the one set after signing in the Account Portal
    // and not the same as the initial DevBrowser JWT
    expect(newLocalhostDbJwt).toEqual(appDbJwtAfterSignIn);
    expect(newLocalhostDbJwt).not.toEqual(initialDbJwt);

    // Check that the __session cookie is set
    expect(!!__session).toBeTruthy();

    await expect(u.page.getByRole('button', { name: /Open user button/i })).toBeVisible();

    // cleanup the search params after consuming the dev browser jwt
    const finalURL = new URL(u.page.url());
    expect(finalURL.searchParams.size).toEqual(0);

    // cleanup
    await fakeUser.deleteIfExists();
  });

  test('ssr', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Begin in localhost
    await u.page.goToStart();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    // Navigate to the Account Portal
    await u.page.getByRole('button', { name: /Sign in/i }).click();
    await u.po.signIn.waitForMounted();

    // Sign in with email and password
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    // Navigate back to localhost
    const response = await page.waitForResponse(
      response =>
        response.url().includes('localhost') &&
        response.status() === 200 &&
        response.request().resourceType() === 'document',
    );

    // This text is included in the SSR response because it's wrapped inside the SignedIn component
    expect(await response.text()).toContain('signed-in-state');
    await u.po.expect.toBeSignedIn();
    await u.po.userButton.waitForMounted();

    await expect(u.page.getByRole('button', { name: /Open user button/i })).toBeVisible();
  });
});
