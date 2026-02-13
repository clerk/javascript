import type { BrowserContext, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { Application } from '../models/application';
import { createTestUtils } from './index';

/**
 * Mocks the environment API call to return a claimed instance.
 * Used in keyless mode tests to simulate an instance that has been claimed.
 */
export const mockClaimedInstanceEnvironmentCall = async (page: Page): Promise<void> => {
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

/**
 * Tests that the keyless popover can be toggled and the claim link opens the dashboard.
 */
export async function testToggleCollapsePopoverAndClaim({
  page,
  context,
  app,
  dashboardUrl,
  framework,
}: {
  page: Page;
  context: BrowserContext;
  app: Application;
  dashboardUrl: string;
  framework: string;
}): Promise<void> {
  const u = createTestUtils({ app, page, context });
  await u.page.goToAppHome();
  await u.page.waitForClerkJsLoaded();
  await u.po.expect.toBeSignedOut();

  await u.po.keylessPopover.waitForMounted();

  const claim = u.po.keylessPopover.promptsToClaim();

  const [newPage] = await Promise.all([context.waitForEvent('page'), claim.click()]);

  await newPage.waitForLoadState();

  await newPage.waitForURL(url => {
    const signInForceRedirectUrl = url.searchParams.get('sign_in_force_redirect_url');
    const signUpForceRedirectUrl = url.searchParams.get('sign_up_force_redirect_url');

    const signInHasRequiredParams =
      signInForceRedirectUrl?.includes(`${dashboardUrl}apps/claim`) &&
      signInForceRedirectUrl?.includes('token=') &&
      signInForceRedirectUrl?.includes(`framework=${framework}`);

    const signUpRegularCase =
      signUpForceRedirectUrl?.includes(`${dashboardUrl}apps/claim`) &&
      signUpForceRedirectUrl?.includes('token=') &&
      signUpForceRedirectUrl?.includes(`framework=${framework}`);

    const signUpPrepareAccountCase =
      signUpForceRedirectUrl?.startsWith(`${dashboardUrl}prepare-account`) &&
      signUpForceRedirectUrl?.includes(encodeURIComponent('apps/claim')) &&
      signUpForceRedirectUrl?.includes(encodeURIComponent('token=')) &&
      signUpForceRedirectUrl?.includes(encodeURIComponent(`framework=${framework}`));

    const signUpHasRequiredParams = signUpRegularCase || signUpPrepareAccountCase;

    return url.pathname === '/apps/claim/sign-in' && signInHasRequiredParams && signUpHasRequiredParams;
  });
}

/**
 * Tests that a claimed application with missing explicit keys shows the popover expanded
 * with a prompt to get keys from the dashboard.
 */
export async function testClaimedAppWithMissingKeys({
  page,
  context,
  app,
  dashboardUrl,
}: {
  page: Page;
  context: BrowserContext;
  app: Application;
  dashboardUrl: string;
}): Promise<void> {
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
}

/**
 * Tests that the keyless popover is removed after adding keys to .env and restarting the dev server.
 */
export async function testKeylessRemovedAfterEnvAndRestart({
  page,
  context,
  app,
}: {
  page: Page;
  context: BrowserContext;
  app: Application;
}): Promise<void> {
  const u = createTestUtils({ app, page, context });
  await u.page.goToAppHome();

  await u.po.keylessPopover.waitForMounted();

  // Copy keys from keyless.json to .env
  await app.keylessToEnv();

  // Restart the dev server to pick up new env vars (Vite doesn't hot-reload .env)
  await app.restart();

  await u.page.goToAppHome();

  // Keyless popover should no longer be present since we now have explicit keys
  await u.po.keylessPopover.waitForUnmounted();
}
