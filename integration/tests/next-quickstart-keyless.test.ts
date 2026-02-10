import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';
import { mockClaimedInstanceEnvironmentCall, testToggleCollapsePopoverAndClaim } from '../testUtils/keylessHelpers';

const commonSetup = appConfigs.next.appRouterQuickstart.clone();

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
    await testToggleCollapsePopoverAndClaim({ page, context, app, dashboardUrl, framework: 'nextjs' });
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
    await u.po.keylessPopover.promptToDismiss().click();

    await u.po.keylessPopover.waitForUnmounted();
  });
});
