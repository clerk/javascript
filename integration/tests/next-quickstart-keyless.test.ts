import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

const commonSetup = appConfigs.next.appRouterQuickstart.clone();

const mockClaimedInstanceEnvironmentCall = async (page: Page) => {
  await page.route('*/**/v1/environment*', async route => {
    const response = await route.fetch();
    const json = await response.json();
    const newJson = {
      ...json,
      auth_config: {
        ...json.auth_config,
        claimed_at: Date.now(),
      },
    };
    await route.fulfill({ response, json: newJson });
  });
};

test.describe('Keyless mode @quickstart', () => {
  test.describe.configure({ mode: 'serial' });

  test.use({
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '',
    },
  });

  let app: Application;
  let dashboardUrl = 'https://dashboard.clerk.com/';

  test.beforeAll(async () => {
    app = await commonSetup.commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withKeyless);
    if (appConfigs.envs.withKeyless.privateVariables.get('CLERK_API_URL')?.includes('clerkstage')) {
      dashboardUrl = 'https://dashboard.clerkstage.dev/';
    }
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('Navigates to non-existent page (/_not-found) without a infinite redirect loop.', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.po.keylessPopover.waitForMounted();

    const redirectMap = new Map<string, number>();
    page.on('request', request => {
      // Only count GET requests since Next.js server actions are sent with POST requests.
      if (request.method() === 'GET') {
        const url = request.url();
        redirectMap.set(url, (redirectMap.get(url) || 0) + 1);
        expect(redirectMap.get(url)).toBeLessThanOrEqual(1);
      }
    });

    await u.page.goToRelative('/something');
    await u.page.waitForAppUrl('/something');
  });

  test('Toggle collapse popover and claim.', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.po.keylessPopover.waitForMounted();

    // Popover now starts expanded by default
    expect(await u.po.keylessPopover.isExpanded()).toBe(true);

    // Verify new content appears when expanded
    const notSignedInContent = u.po.keylessPopover.getNotSignedInContent();
    await expect(notSignedInContent.temporaryKeysText).toBeVisible();
    await expect(notSignedInContent.dashboardText).toBeVisible();
    await expect(notSignedInContent.bulletList).toBeVisible();

    // Test collapsing and expanding
    await u.po.keylessPopover.toggle();
    expect(await u.po.keylessPopover.isExpanded()).toBe(false);
    await u.po.keylessPopover.toggle();
    expect(await u.po.keylessPopover.isExpanded()).toBe(true);

    const claim = await u.po.keylessPopover.promptsToClaim();

    const [newPage] = await Promise.all([context.waitForEvent('page'), claim.click()]);

    await newPage.waitForLoadState();

    await newPage.waitForURL(url => {
      const urlToReturnTo = `${dashboardUrl}apps/claim?token=`;

      const signUpForceRedirectUrl = url.searchParams.get('sign_up_force_redirect_url');

      const signUpForceRedirectUrlCheck =
        signUpForceRedirectUrl?.startsWith(urlToReturnTo) ||
        (signUpForceRedirectUrl?.startsWith(`${dashboardUrl}prepare-account`) &&
          signUpForceRedirectUrl?.includes(encodeURIComponent('apps/claim?token=')));

      return (
        url.pathname === '/apps/claim/sign-in' &&
        url.searchParams.get('sign_in_force_redirect_url')?.startsWith(urlToReturnTo) &&
        signUpForceRedirectUrlCheck
      );
    });
  });

  test('Lands on claimed application with missing explicit keys, expanded by default, click to get keys from dashboard.', async ({
    page,
    context,
  }) => {
    await mockClaimedInstanceEnvironmentCall(page);
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();

    await u.po.keylessPopover.waitForMounted();
    expect(await u.po.keylessPopover.isExpanded()).toBe(true);

    // Verify claimed state content
    const claimedContent = u.po.keylessPopover.getClaimedContent();
    await expect(claimedContent.title).toBeVisible();
    await expect(claimedContent.description).toBeVisible();

    await expect(u.po.keylessPopover.promptToUseClaimedKeys()).toBeVisible();

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      u.po.keylessPopover.promptToUseClaimedKeys().click(),
    ]);

    await newPage.waitForLoadState();
    await newPage.waitForURL(url => {
      return url.href.startsWith(`${dashboardUrl}sign-in?redirect_url=${encodeURIComponent(dashboardUrl)}apps%2Fapp_`);
    });
  });

  // Skipped: This test requires creating a user via backend API, which needs CLERK_SECRET_KEY.
  // Keyless mode is designed to work without keys, so we skip this test for now.
  // TODO: Revisit when we have a way to test signed-in states in keyless mode without backend API access.
  test.skip('Signed-in user sees updated prompt content.', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Create and sign in a user
    const fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPassword: true,
    });
    await u.services.users.createBapiUser(fakeUser);

    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();

    // Sign in
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.expect.toBeSignedIn();

    // Navigate back to home to see the keyless prompt
    await u.page.goToAppHome();
    await u.po.keylessPopover.waitForMounted();

    // Verify prompt is expanded by default when signed in
    expect(await u.po.keylessPopover.isExpanded()).toBe(true);

    // Verify signed-in content
    const signedInContent = u.po.keylessPopover.getSignedInContent();
    await expect(signedInContent.title).toBeVisible();
    await expect(signedInContent.description).toBeVisible();
    await expect(signedInContent.bulletList).toBeVisible();

    // Verify bullet items are present
    await expect(signedInContent.bulletItems.first()).toBeVisible();

    // Verify "Configure your application" button is visible
    await expect(u.po.keylessPopover.promptsToClaim()).toBeVisible();

    await fakeUser.deleteIfExists();
  });

  test('Not signed-in user sees updated prompt content.', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.po.keylessPopover.waitForMounted();

    // Popover starts expanded by default
    expect(await u.po.keylessPopover.isExpanded()).toBe(true);

    // Verify not signed-in content
    const notSignedInContent = u.po.keylessPopover.getNotSignedInContent();
    await expect(notSignedInContent.title).toBeVisible();
    await expect(notSignedInContent.temporaryKeysText).toBeVisible();
    await expect(notSignedInContent.bulletList).toBeVisible();
    await expect(notSignedInContent.dashboardText).toBeVisible();

    // Verify bullet items are present
    await expect(notSignedInContent.bulletItems.first()).toBeVisible();
  });

  test('Claimed application with keys inside .env, on dismiss, keyless prompt is removed.', async ({
    page,
    context,
  }) => {
    await mockClaimedInstanceEnvironmentCall(page);
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();

    await u.po.keylessPopover.waitForMounted();
    await expect(await u.po.keylessPopover.promptToUseClaimedKeys()).toBeVisible();

    /**
     * Copy keys from `.clerk/.tmp/keyless.json to `.env`
     */
    await app.keylessToEnv();
    /**
     * wait a bit for the server to load the new env file
     */
    await page.waitForTimeout(5_000);

    await page.reload();
    await u.po.keylessPopover.waitForMounted();

    // Verify success state content
    const successContent = u.po.keylessPopover.getSuccessContent();
    await expect(successContent.title).toBeVisible();
    await expect(successContent.configuredText).toBeVisible();
    await expect(successContent.dashboardLink).toBeVisible();

    await u.po.keylessPopover.promptToDismiss().click();

    await u.po.keylessPopover.waitForUnmounted();
  });
});
