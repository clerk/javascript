import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';
import { mockClaimedInstanceEnvironmentCall } from '../../testUtils/keylessHelpers';

const commonSetup = appConfigs.tanstack.reactStart.clone();

test.describe('Keyless mode @tanstack-react-start', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90_000);

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
    // Keep files for debugging
    await app?.teardown();
  });

  test('Toggle collapse popover and claim.', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.po.keylessPopover.waitForMounted();

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

  test('Keyless popover is removed after adding keys to .env and restarting.', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();

    await u.po.keylessPopover.waitForMounted();
    expect(await u.po.keylessPopover.isExpanded()).toBe(false);

    // Copy keys from keyless.json to .env
    await app.keylessToEnv();

    // Restart the dev server to pick up new env vars (Vite doesn't hot-reload .env)
    await app.restart();

    await u.page.goToAppHome();

    // Keyless popover should no longer be present since we now have explicit keys
    await u.po.keylessPopover.waitForUnmounted();
  });
});
