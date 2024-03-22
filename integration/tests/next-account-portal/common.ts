import type { BrowserContext, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { Application } from '../../models/application';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';

const CLERK_DB_JWT_COOKIE_NAME = '__clerk_db_jwt';
const CLERK_SESSION_COOKIE_NAME = '__session';

type TestParams = {
  app: Application;
  page: Page;
  context: BrowserContext;
  fakeUser: FakeUser;
};

export const testSignIn = async ({ app, page, context, fakeUser }: TestParams) => {
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
};

export const testSignUp = async ({ app, page, context }: TestParams) => {
  const u = createTestUtils({ app, page, context });
  const tempUser = u.services.users.createFakeUser({ fictionalEmail: true });

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
  await u.po.signUp.signUpWithEmailAndPassword({ email: tempUser.email, password: tempUser.password });
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
  await tempUser.deleteIfExists();
};

export const testSSR = async ({ app, page, context, fakeUser }: TestParams) => {
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
};
