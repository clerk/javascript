import type { Page } from '@playwright/test';

import type { SetupClerkTestingTokenOptions } from '../common';
import { ERROR_MISSING_FRONTEND_API_URL, TESTING_TOKEN_PARAM } from '../common';

type SetupClerkTestingTokenParams = {
  page: Page;
  options?: SetupClerkTestingTokenOptions;
};

/**
 * Bypasses bot protection by appending the testing token in the Frontend API requests.
 *
 * @param params.page - The Playwright page object.
 * @param params.options.frontendApiUrl - The frontend API URL for your Clerk dev instance, without the protocol.
 * @returns A promise that resolves when the bot protection bypass is set up.
 * @throws An error if the Frontend API URL is not provided.
 * @example
 * import { setupClerkTestingToken } from '@clerk/testing/playwright';
 *
 * test('should bypass bot protection', async ({ page }) => {
 *    await setupClerkTestingToken({ page });
 *    await page.goto('https://your-app.com');
 *    // Continue with your test...
 *  });
 */
export const setupClerkTestingToken = async ({ page, options }: SetupClerkTestingTokenParams) => {
  const fapiUrl = options?.frontendApiUrl || process.env.CLERK_FAPI;
  if (!fapiUrl) {
    throw new Error(ERROR_MISSING_FRONTEND_API_URL);
  }
  const apiUrl = `https://${fapiUrl}/v1/**/*`;

  await page.route(apiUrl, async route => {
    const originalUrl = new URL(route.request().url());
    const testingToken = process.env.CLERK_TESTING_TOKEN;

    if (testingToken) {
      originalUrl.searchParams.set(TESTING_TOKEN_PARAM, testingToken);
    }

    try {
      const response = await route.fetch({
        url: originalUrl.toString(),
      });

      const json = await response.json();

      // Override captcha_bypass in /v1/client
      if (json?.response?.captcha_bypass === false) {
        json.response.captcha_bypass = true;
      }

      // Override captcha_bypass in piggybacking
      if (json?.client?.captcha_bypass === false) {
        json.client.captcha_bypass = true;
      }

      await route.fulfill({
        status: response.status(),
        headers: response.headers(),
        json: json,
      });
    } catch {
      await route.continue({
        url: originalUrl.toString(),
      });
    }
  });
};
