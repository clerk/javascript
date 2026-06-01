import { createClerkClient } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { instanceKeys } from '../../presets/envs';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { createUserService } from '../../testUtils/usersService';

test.describe('Custom Flows OAuth @custom', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    test.setTimeout(150_000);
    app = await appConfigs.customFlows.reactVite.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();

    const client = createClerkClient({
      secretKey: instanceKeys.get('oauth-provider').sk,
      publishableKey: instanceKeys.get('oauth-provider').pk,
    });
    const users = createUserService(client);
    fakeUser = users.createFakeUser({ withUsername: true });
    await users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    const u = createTestUtils({ app });
    await fakeUser.deleteIfExists();
    await u.services.users.deleteIfExists({ email: fakeUser.email });
    await app.teardown();
  });

  test('SDK-75: retrying OAuth after an abandoned redirect creates a fresh sign-in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Block the OAuth provider redirect on the first attempt only. clerk-js sets
    // `firstFactorVerification.status='unverified'` and `externalVerificationRedirectURL`
    // the moment the POST resolves — before the navigation runs — so aborting the
    // navigation deterministically reproduces the SDK-75 abandoned-redirect state
    // without depending on browser back/BFCache semantics.
    let blockOnce = true;
    await page.route('**/oauth/authorize**', async route => {
      if (blockOnce && route.request().isNavigationRequest()) {
        blockOnce = false;
        await route.abort('aborted');
        return;
      }
      await route.continue();
    });

    await u.page.goToRelative('/sign-in');
    await u.page.waitForClerkJsLoaded();

    const oauthButton = u.page.getByRole('button', { name: /^Sign in with / });
    await oauthButton.first().waitFor();

    // First attempt: capture the POST, then let the redirect get aborted.
    const firstPostPromise = page.waitForRequest(
      req => req.method() === 'POST' && /\/v1\/client\/sign_ins(\?|$)/.test(req.url()),
    );
    await oauthButton.first().click();
    await firstPostPromise;

    // The redirect was aborted, so we stay on the app's sign-in page with stale
    // OAuth state lingering in the SignIn resource. Wait for the OAuth button to
    // be re-enabled (fetchStatus settles back to 'idle' once the navigation aborts).
    await u.page.waitForURL(url => url.toString().startsWith(app.serverUrl) && url.pathname.includes('/sign-in'));
    await oauthButton.first().waitFor();

    // Second attempt: must POST to /client/sign_ins again. If the previous reuse
    // logic kicked in (pre-fix), SignInFuture.sso would skip create and silently
    // no-op — so the second POST not happening is exactly the regression.
    const secondPostPromise = page.waitForRequest(
      req => req.method() === 'POST' && /\/v1\/client\/sign_ins(\?|$)/.test(req.url()),
    );
    await oauthButton.first().click();
    const secondPost = await secondPostPromise;
    expect(secondPost.method()).toBe('POST');

    // Complete the OAuth flow end-to-end and assert we're signed in on the app instance.
    await u.page.getByText('Sign in to oauth-provider').waitFor();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.enterTestOtpCode();

    await u.page.waitForAppUrl('/protected');
    await u.po.expect.toBeSignedIn();
  });
});
