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
  let app: Application;

  test.beforeAll(async () => {
    app = await commonSetup.commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withKeyless);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
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
      const urlToReturnTo = 'https://dashboard.clerk.com/apps/claim?token=';
      return (
        url.pathname === '/apps/claim/sign-in' &&
        url.searchParams.get('sign_in_force_redirect_url')?.startsWith(urlToReturnTo) &&
        url.searchParams.get('sign_up_force_redirect_url')?.startsWith(urlToReturnTo)
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
    await newPage.waitForURL(url =>
      url.href.startsWith(
        'https://dashboard.clerk.com/sign-in?redirect_url=https%3A%2F%2Fdashboard.clerk.com%2Fapps%2Fapp_',
      ),
    );
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

  test('Navigates to non existed page (/_not-found) without a infinite redirect loop.', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();

    await u.po.keylessPopover.waitForMounted();

    const redirectMap = new Map<string, number>();
    page.on('request', request => {
      const url = request.url();
      redirectMap.set(url, (redirectMap.get(url) || 0) + 1);
      expect(redirectMap.get(url)).toBeLessThanOrEqual(1);
    });

    await u.page.goToRelative('/something');
    await u.page.waitForAppUrl('/something');
  });
});
