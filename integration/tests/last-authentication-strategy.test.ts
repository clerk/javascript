import type { LastAuthenticationStrategy } from '@clerk/shared/types';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const mockLastAuthenticationStrategyResponse = async (
  page: Page,
  lastAuthenticationStrategy: LastAuthenticationStrategy | null | undefined,
) => {
  await page.route('**/v1/client?**', async route => {
    const response = await route.fetch();
    const json = await response.json();
    let modifiedJson = json;

    if (lastAuthenticationStrategy === undefined && json.response.last_authentication_strategy) {
      delete json.response['last_authentication_strategy'];
      modifiedJson = json;
    } else {
      modifiedJson = {
        ...json,
        response: {
          ...json.response,
          last_authentication_strategy: lastAuthenticationStrategy,
        },
      };
    }

    await route.fulfill({ response, json: modifiedJson });
  });
};

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })(
  'lastAuthenticationStrategy @generic',
  ({ app }) => {
    test.afterAll(async () => {
      await app.teardown();
    });

    // TODO(Tom): Remove once the API-side of this feature is fully released. [2025-09-07]
    test('should not show "Last used" badge when lastAuthenticationStrategy is not present', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });
      await mockLastAuthenticationStrategyResponse(page, undefined);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();

      // Ensure no "Last used" badge is present.
      await expect(page.locator('.cl-lastAuthenticationStrategyBadge')).toHaveCount(0);

      // Ensure none of the social buttons have been pulled to the first row.
      const socialButtonContainers = u.page.locator('.cl-socialButtons');
      await expect(socialButtonContainers).toHaveCount(1);
      await expect(socialButtonContainers.first().locator('.cl-button')).toHaveCount(3);
    });

    test('should not show "Last used" badge when lastAuthenticationStrategy is null', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await mockLastAuthenticationStrategyResponse(page, null);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();

      // Ensure no "Last used" badge is present.
      await expect(page.locator('.cl-lastAuthenticationStrategyBadge')).toHaveCount(0);

      // Ensure none of the social buttons have been pulled to the first row.
      const socialButtonContainers = u.page.locator('.cl-socialButtons');
      await expect(socialButtonContainers).toHaveCount(1);
      await expect(socialButtonContainers.first().locator('.cl-button')).toHaveCount(3);
    });

    test('should show "Last used" badge when lastAuthenticationStrategy is saml_google', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await mockLastAuthenticationStrategyResponse(page, 'saml_google');

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();

      // Ensure "Last used" badge is present.
      const lastUsedBadge = page.locator('.cl-lastAuthenticationStrategyBadge');
      await expect(lastUsedBadge).toBeVisible();
      await expect(lastUsedBadge).toHaveCount(1);

      const btn = page.getByRole('button', { name: 'Last used Sign in with Google' });
      await expect(btn).toBeVisible();

      // Ensure the last used social button has been pulled to the first row.
      const socialButtonContainers = u.page.locator('.cl-socialButtons');
      await expect(socialButtonContainers).toHaveCount(2);
      await expect(socialButtonContainers.first().locator('.cl-button__google')).toHaveCount(1);
      await expect(socialButtonContainers.last().locator('.cl-button')).toHaveCount(2);
    });

    test('should show "Last used" badge when lastAuthenticationStrategy is oauth_google', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await mockLastAuthenticationStrategyResponse(page, 'oauth_google');

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();

      // Ensure "Last used" badge is present.
      const lastUsedBadge = page.locator('.cl-lastAuthenticationStrategyBadge');
      await expect(lastUsedBadge).toBeVisible();
      await expect(lastUsedBadge).toHaveCount(1);

      const btn = page.getByRole('button', { name: 'Last used Sign in with Google' });
      await expect(btn).toBeVisible();

      // Ensure the last used social button has been pulled to the first row.
      const socialButtonContainers = u.page.locator('.cl-socialButtons');
      await expect(socialButtonContainers).toHaveCount(2);
      await expect(socialButtonContainers.first().locator('.cl-button__google')).toHaveCount(1);
      await expect(socialButtonContainers.last().locator('.cl-button')).toHaveCount(2);
    });

    test('should show "Last used" badge when lastAuthenticationStrategy is email_address and identifier is toggleable', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });
      await mockLastAuthenticationStrategyResponse(page, 'email_address');

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();

      // Ensure "Last used" badge is not present.
      const lastUsedBadge = page.locator('.cl-lastAuthenticationStrategyBadge');
      await expect(lastUsedBadge).toHaveCount(0);

      // Ensure none of the social buttons have been pulled to the first row.
      const socialButtonContainers = u.page.locator('.cl-socialButtons');
      await expect(socialButtonContainers).toHaveCount(1);
      await expect(socialButtonContainers.first().locator('.cl-button')).toHaveCount(3);
    });

    test('should not show "Last used" badge on sign-up even when lastAuthenticationStrategy is set', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });
      await mockLastAuthenticationStrategyResponse(page, 'oauth_google');

      await u.po.signUp.goTo();
      await u.po.signUp.waitForMounted();

      await expect(page.locator('.cl-lastAuthenticationStrategyBadge')).toHaveCount(0);
    });
  },
);
