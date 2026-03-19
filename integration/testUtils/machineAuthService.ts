import { randomBytes } from 'node:crypto';

import type { ClerkClient, M2MToken, Machine, OAuthApplication } from '@clerk/backend';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

// ─── M2M ────────────────────────────────────────────────────────────────────

export type FakeMachineNetwork = {
  primaryServer: Machine;
  scopedSender: Machine;
  unscopedSender: Machine;
  scopedSenderToken: M2MToken;
  unscopedSenderToken: M2MToken;
  cleanup: () => Promise<void>;
};

/**
 * Creates a network of three machines for M2M testing:
 * - A primary API server (the "receiver")
 * - A sender machine scoped to the primary (should succeed)
 * - A sender machine with no scope (should fail)
 *
 * Each sender gets an opaque M2M token created for it.
 * Call `cleanup()` to revoke tokens and delete all machines.
 */
export async function createFakeMachineNetwork(clerkClient: ClerkClient): Promise<FakeMachineNetwork> {
  const fakeCompanyName = faker.company.name();

  const primaryServer = await clerkClient.machines.create({
    name: `${fakeCompanyName} Primary API Server`,
  });

  const scopedSender = await clerkClient.machines.create({
    name: `${fakeCompanyName} Scoped Sender`,
    scopedMachines: [primaryServer.id],
  });
  const scopedSenderToken = await clerkClient.m2m.createToken({
    machineSecretKey: scopedSender.secretKey,
    secondsUntilExpiration: 60 * 30,
  });

  const unscopedSender = await clerkClient.machines.create({
    name: `${fakeCompanyName} Unscoped Sender`,
  });
  const unscopedSenderToken = await clerkClient.m2m.createToken({
    machineSecretKey: unscopedSender.secretKey,
    secondsUntilExpiration: 60 * 30,
  });

  return {
    primaryServer,
    scopedSender,
    unscopedSender,
    scopedSenderToken,
    unscopedSenderToken,
    cleanup: async () => {
      await Promise.all([
        clerkClient.m2m.revokeToken({ m2mTokenId: scopedSenderToken.id }),
        clerkClient.m2m.revokeToken({ m2mTokenId: unscopedSenderToken.id }),
        clerkClient.machines.delete(scopedSender.id),
        clerkClient.machines.delete(unscopedSender.id),
        clerkClient.machines.delete(primaryServer.id),
      ]);
    },
  };
}

/**
 * Creates a JWT-format M2M token for a sender machine.
 * JWT tokens are self-contained and expire via the `exp` claim (no revocation needed).
 */
export async function createJwtM2MToken(clerkClient: ClerkClient, senderSecretKey: string): Promise<M2MToken> {
  return clerkClient.m2m.createToken({
    machineSecretKey: senderSecretKey,
    secondsUntilExpiration: 60 * 30,
    tokenFormat: 'jwt',
  });
}

// ─── OAuth ──────────────────────────────────────────────────────────────────

export type FakeOAuthApp = {
  oAuthApp: OAuthApplication;
  cleanup: () => Promise<void>;
};

/**
 * Creates an OAuth application via BAPI for testing the full authorization code flow.
 * Call `cleanup()` to delete the OAuth application.
 */
export async function createFakeOAuthApp(clerkClient: ClerkClient, callbackUrl: string): Promise<FakeOAuthApp> {
  const oAuthApp = await clerkClient.oauthApplications.create({
    name: `Integration Test OAuth App - ${Date.now()}`,
    redirectUris: [callbackUrl],
    scopes: 'profile email',
  });

  return {
    oAuthApp,
    cleanup: async () => {
      await clerkClient.oauthApplications.delete(oAuthApp.id);
    },
  };
}

export type ObtainOAuthAccessTokenParams = {
  page: Page;
  oAuthApp: OAuthApplication;
  redirectUri: string;
  fakeUser: { email?: string; password: string };
  signIn: {
    waitForMounted: (...args: any[]) => Promise<any>;
    signInWithEmailAndInstantPassword: (params: { email: string; password: string }) => Promise<any>;
  };
};

/**
 * Runs the full OAuth 2.0 authorization code flow using Playwright:
 * 1. Navigates to the authorize URL
 * 2. Signs in with the provided user credentials
 * 3. Accepts the consent screen
 * 4. Extracts the authorization code from the callback
 * 5. Exchanges the code for an access token
 *
 * Returns the access token string.
 */
export async function obtainOAuthAccessToken({
  page,
  oAuthApp,
  redirectUri,
  fakeUser,
  signIn,
}: ObtainOAuthAccessTokenParams): Promise<string> {
  const state = randomBytes(16).toString('hex');
  const authorizeUrl = new URL(oAuthApp.authorizeUrl);
  authorizeUrl.searchParams.set('client_id', oAuthApp.clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', 'profile email');
  authorizeUrl.searchParams.set('state', state);

  await page.goto(authorizeUrl.toString());

  // Sign in on Account Portal
  await signIn.waitForMounted();
  await signIn.signInWithEmailAndInstantPassword({
    email: fakeUser.email,
    password: fakeUser.password,
  });

  // Accept consent screen
  const consentButton = page.getByRole('button', { name: 'Allow' });
  await consentButton.waitFor({ timeout: 10000 });
  await consentButton.click();

  // Wait for redirect and extract authorization code
  await page.waitForURL(/oauth\/callback/, { timeout: 10000 });
  const callbackUrl = new URL(page.url());
  const authCode = callbackUrl.searchParams.get('code');
  expect(authCode).toBeTruthy();

  // Exchange code for access token
  expect(oAuthApp.clientSecret).toBeTruthy();
  const tokenResponse = await page.request.post(oAuthApp.tokenFetchUrl, {
    data: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: redirectUri,
      client_id: oAuthApp.clientId,
      client_secret: oAuthApp.clientSecret,
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  expect(tokenResponse.status()).toBe(200);
  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  expect(tokenData.access_token).toBeTruthy();

  return tokenData.access_token;
}
