import type { BrowserContext, Page } from '@playwright/test';

import type { SetupClerkTestingTokenOptions } from '../common';
import { ERROR_MISSING_FRONTEND_API_URL, TESTING_TOKEN_PARAM } from '../common';

type SetupClerkTestingTokenParams = {
  context?: BrowserContext;
  page?: Page;
  options?: SetupClerkTestingTokenOptions;
};

/**
 * Bypasses bot protection by appending the testing token in the Frontend API requests.
 *
 * @param params.context - The Playwright browser context object.
 * @param params.page - The Playwright page object.
 * @param params.options.frontendApiUrl - The frontend API URL for your Clerk dev instance, without the protocol.
 * @returns A promise that resolves when the bot protection bypass is set up.
 * @throws An error if the Frontend API URL is not provided.
 * @example
 * import { setupClerkTestingToken } from '@clerk/testing/playwright';
 *
 * test('should bypass bot protection', async ({ context }) => {
 *    await setupClerkTestingToken({ context });
 *    const page = await context.newPage();
 *    await page.goto('https://your-app.com');
 *    // Continue with your test...
 *  });
 */
export const setupClerkTestingToken = async ({ context, options, page }: SetupClerkTestingTokenParams) => {
  const browserContext = context ?? page?.context();

  if (!browserContext) {
    throw new Error('Either context or page must be provided to setup testing token');
  }

  const fapiUrl = options?.frontendApiUrl || process.env.CLERK_FAPI;
  if (!fapiUrl) {
    throw new Error(ERROR_MISSING_FRONTEND_API_URL);
  }

  const escapedFapiUrl = fapiUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const apiUrl = new RegExp(`^https://${escapedFapiUrl}/v1/.*?(\\?.*)?$`);

  await browserContext.route(apiUrl, async route => {
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
        response,
        json,
      });
    } catch {
      await route
        .continue({
          url: originalUrl.toString(),
        })
        .catch(console.error);
    }
  });
};
