import { randomBytes } from 'node:crypto';

import type { OAuthApplication } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';

test.describe('OAuth machine authentication @machine', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;
  let oAuthApp: OAuthApplication;

  test.beforeAll(async () => {
    test.setTimeout(120_000);

    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/app/api/protected/route.ts',
        () => `
        import { auth } from '@clerk/nextjs/server';

        export async function GET() {
          const { userId, tokenType } = await auth({ acceptsToken: 'oauth_token' });

          if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          return Response.json({ userId, tokenType });
        }
        `,
      )
      .addFile(
        'src/app/oauth/callback/route.ts',
        () => `
        import { NextResponse } from 'next/server';

        export async function GET() {
          return NextResponse.json({ message: 'OAuth callback received' });
        }
        `,
      )
      .commit();

    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();

    // Test user that will authorize the OAuth application
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);

    const clerkClient = createClerkClient({
      secretKey: app.env.privateVariables.get('CLERK_SECRET_KEY'),
      publishableKey: app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY'),
    });

    // Create an OAuth application via the BAPI
    oAuthApp = await clerkClient.oauthApplications.create({
      name: `Integration Test OAuth App - ${Date.now()}`,
      redirectUris: [`${app.serverUrl}/oauth/callback`],
      scopes: 'profile email',
    });
  });

  test.afterAll(async () => {
    const clerkClient = createClerkClient({
      secretKey: app.env.privateVariables.get('CLERK_SECRET_KEY'),
      publishableKey: app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY'),
    });

    if (oAuthApp.id) {
      await clerkClient.oauthApplications.delete(oAuthApp.id);
    }

    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('verifies valid OAuth access token obtained through authorization flow', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Build the authorization URL
    const state = randomBytes(16).toString('hex');
    const redirectUri = `${app.serverUrl}/oauth/callback`;
    const authorizeUrl = new URL(oAuthApp.authorizeUrl);
    authorizeUrl.searchParams.set('client_id', oAuthApp.clientId);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', 'profile email');
    authorizeUrl.searchParams.set('state', state);

    // Navigate to Clerk's authorization endpoint
    await u.page.goto(authorizeUrl.toString());

    // Sign in on Account Portal
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });

    // Accept consent screen
    // Per https://clerk.com/docs/guides/configure/auth-strategies/oauth/how-clerk-implements-oauth#consent-screen-management
    const consentButton = u.page.getByRole('button', { name: 'Allow' });
    await consentButton.waitFor({ timeout: 10000 });
    await consentButton.click();

    // Wait for the redirect to complete
    await u.page.waitForURL(/oauth\/callback/, { timeout: 10000 });

    // Extract the authorization code from the callback URL
    const currentUrl = u.page.url();
    const urlObj = new URL(currentUrl);
    const finalAuthCode = urlObj.searchParams.get('code');

    expect(finalAuthCode).toBeTruthy();

    // Exchange authorization code for access token
    expect(oAuthApp.clientSecret).toBeTruthy();

    const tokenResponse = await u.page.request.post(oAuthApp.tokenFetchUrl, {
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code: finalAuthCode,
        redirect_uri: redirectUri,
        client_id: oAuthApp.clientId,
        client_secret: oAuthApp.clientSecret,
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    expect(tokenResponse.status()).toBe(200);
    const tokenResponseBody = await tokenResponse.text();

    const tokenData = JSON.parse(tokenResponseBody) as { access_token?: string };
    const accessToken = tokenData.access_token;

    expect(accessToken).toBeTruthy();

    // Use the access token to authenticate a request to our protected route
    const protectedRouteUrl = new URL('/api/protected', app.serverUrl);
    const protectedResponse = await u.page.request.get(protectedRouteUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(protectedResponse.status()).toBe(200);
    const authData = await protectedResponse.json();
    expect(authData.userId).toBeDefined();
    expect(authData.tokenType).toBe(TokenType.OAuthToken);
  });

  test('rejects request without OAuth token', async ({ request }) => {
    const url = new URL('/api/protected', app.serverUrl);
    const res = await request.get(url.toString());
    expect(res.status()).toBe(401);
  });

  test('rejects request with invalid OAuth token', async ({ request }) => {
    const url = new URL('/api/protected', app.serverUrl);
    const res = await request.get(url.toString(), {
      headers: {
        Authorization: 'Bearer invalid_oauth_token',
      },
    });
    expect(res.status()).toBe(401);
  });
});
