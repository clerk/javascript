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
  const u = createTestUtils({ app, page, context, useTestingToken: false });
  // Begin in localhost
  await u.page.goToAppHome();
  await u.page.waitForClerkJsLoaded();
  await u.po.expect.toBeSignedOut();

  // Get the Initial DevBrowser JWT
  const initialDbJwt = await context
    .cookies(page.url())
    .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);

  // Navigate to the Account Portal
  await u.page.getByRole('button', { name: /Sign in/i }).click();
  await u.po.signIn.waitForMounted();

  const accountPortalURL = page.url();
  // Check that we are in Account Portal (dev or staging)
  expect(accountPortalURL).toMatch(/\.accounts(stage\.dev|\.dev|\.stg)/);
  // Check that the DevBrowser JWT between localhost and AP is the same
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
  // and the same as the initial DevBrowser JWT
  expect(newLocalhostDbJwt).toEqual(appDbJwtAfterSignIn);
  expect(newLocalhostDbJwt).toEqual(initialDbJwt);

  // Check that the __session cookie is set
  expect(!!__session).toBeTruthy();

  expect(await u.po.userButton.waitForMounted()).not.toBeUndefined();

  // cleanup the search params after consuming the dev browser jwt
  const finalURL = new URL(u.page.url());
  expect(finalURL.searchParams.size).toEqual(0);
};

export const testSignUp = async ({ app, page, context }: TestParams) => {
  const u = createTestUtils({ app, page, context, useTestingToken: false });
  const tempUser = u.services.users.createFakeUser({ fictionalEmail: true });

  // Begin in localhost
  await u.page.goToAppHome();
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
  // Check that we are in Account Portal (dev or staging)
  expect(accountPortalURL).toMatch(/\.accounts(stage\.dev|\.dev|\.stg)/);
  const accountPortalDbJwt = await context
    .cookies(accountPortalURL)
    .then(cookies => cookies.find(c => c.name === CLERK_DB_JWT_COOKIE_NAME)?.value);
  expect(accountPortalDbJwt).toEqual(initialDbJwt);

  // Sign up with email and password
  await u.po.signUp.signUpWithEmailAndPassword({ email: tempUser.email, password: tempUser.password });

  await u.po.signUp.enterTestOtpCode();

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
  // and the same as the initial DevBrowser JWT
  expect(newLocalhostDbJwt).toEqual(appDbJwtAfterSignIn);
  expect(newLocalhostDbJwt).toEqual(initialDbJwt);

  // Check that the __session cookie is set
  expect(!!__session).toBeTruthy();

  expect(await u.po.userButton.waitForMounted()).not.toBeUndefined();

  // cleanup the search params after consuming the dev browser jwt
  const finalURL = new URL(u.page.url());
  expect(finalURL.searchParams.size).toEqual(0);

  // cleanup
  await tempUser.deleteIfExists();
};

export const testSSR = async ({ app, page, context, fakeUser }: TestParams) => {
  const u = createTestUtils({ app, page, context, useTestingToken: false });

  // Begin in localhost
  await u.page.goToAppHome();
  await u.page.waitForClerkJsLoaded();
  await u.po.expect.toBeSignedOut();

  // Navigate to the Account Portal
  await u.page.getByRole('button', { name: /Sign in/i }).click();
  await u.po.signIn.waitForMounted();

  // Sign in with email and password. If we wait for the session, we will miss the initial redirect back to localhost.
  await u.po.signIn.signInWithEmailAndInstantPassword({
    email: fakeUser.email,
    password: fakeUser.password,
    waitForSession: false,
  });

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

  expect(await u.po.userButton.waitForMounted()).not.toBeUndefined();
};

export const testSignOut = async ({ app, page, context, fakeUser }: TestParams) => {
  const u = createTestUtils({ app, page, context, useTestingToken: false });

  // Sign in via Account Portal first
  await u.page.goToAppHome();
  await u.page.waitForClerkJsLoaded();
  await u.po.expect.toBeSignedOut();

  await u.page.getByRole('button', { name: /Sign in/i }).click();
  await u.po.signIn.waitForMounted();
  await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
  await u.page.waitForAppUrl('/');
  await u.po.expect.toBeSignedIn();
  await u.po.userButton.waitForMounted();

  // Verify session cookie is set before sign-out
  const sessionBefore = await context
    .cookies(page.url())
    .then(cookies => cookies.find(c => c.name === CLERK_SESSION_COOKIE_NAME)?.value);
  expect(!!sessionBefore).toBeTruthy();

  // Sign out via Clerk.signOut()
  await page.evaluate(() => window.Clerk.signOut());
  await u.po.expect.toBeSignedOut();

  // Verify session cookie is cleared
  const sessionAfter = await context
    .cookies(page.url())
    .then(cookies => cookies.find(c => c.name === CLERK_SESSION_COOKIE_NAME)?.value);
  expect(!!sessionAfter).toBeFalsy();

  // Reload and verify user stays signed out (no auto-sign-in from stale state)
  await u.page.goToAppHome();
  await u.page.waitForClerkJsLoaded();
  await u.po.expect.toBeSignedOut();

  // Navigate to AP again and verify sign-in form is shown (not auto-signed-in)
  await u.page.getByRole('button', { name: /Sign in/i }).click();
  await u.po.signIn.waitForMounted();
  const apURL = page.url();
  expect(apURL).toMatch(/\.accounts(stage\.dev|\.dev|\.stg)/);
};

export const testHandshakeRecovery = async ({ app, page, context, fakeUser }: TestParams) => {
  const u = createTestUtils({ app, page, context, useTestingToken: false });

  // Sign in via Account Portal
  await u.page.goToAppHome();
  await u.page.waitForClerkJsLoaded();
  await u.po.expect.toBeSignedOut();

  await u.page.getByRole('button', { name: /Sign in/i }).click();
  await u.po.signIn.waitForMounted();
  await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
  await u.page.waitForAppUrl('/');
  await u.po.expect.toBeSignedIn();

  // Delete the __session cookie to simulate an expired/invalid session.
  // Keep __client_uat so the middleware detects a mismatch and triggers a handshake.
  const appUrl = new URL(page.url());
  await context.clearCookies({ name: CLERK_SESSION_COOKIE_NAME, domain: appUrl.hostname });

  // Reload the page. The middleware should:
  // 1. Detect missing session + present client_uat
  // 2. Trigger a handshake redirect to FAPI
  // 3. FAPI resolves the handshake and returns fresh cookies
  // 4. User ends up signed in again (no redirect loop, no error)
  await u.page.goToAppHome();
  await u.page.waitForClerkJsLoaded();

  // The page should load successfully (not stuck in a redirect loop).
  // The user should be signed in because the handshake recovered the session.
  await u.po.expect.toBeSignedIn();

  // Verify the session cookie was re-established by the handshake
  const sessionAfterRecovery = await context
    .cookies(page.url())
    .then(cookies => cookies.find(c => c.name === CLERK_SESSION_COOKIE_NAME)?.value);
  expect(!!sessionAfterRecovery).toBeTruthy();

  // Verify no leftover handshake params in the URL
  const finalURL = new URL(page.url());
  expect(finalURL.searchParams.has('__clerk_handshake')).toBeFalsy();
  expect(finalURL.searchParams.has('__clerk_handshake_nonce')).toBeFalsy();
};
