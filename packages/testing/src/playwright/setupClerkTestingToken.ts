import type { BrowserContext, Page } from '@playwright/test';

import type { SetupClerkTestingTokenOptions } from '../common';
import { ERROR_MISSING_FRONTEND_API_URL, TESTING_TOKEN_PARAM } from '../common';

type SetupClerkTestingTokenParams = {
  context?: BrowserContext;
  page?: Page;
  options?: SetupClerkTestingTokenOptions;
};

const setupContexts = new WeakSet<BrowserContext>();

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const MAX_ROUTE_RETRIES = 3;
const BASE_DELAY_MS = 500;
const JITTER_MAX_MS = 250;

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

  if (setupContexts.has(browserContext)) {
    if (process.env.CLERK_TESTING_DEBUG) {
      console.log('[Clerk Testing] Route handler already registered for this context, skipping duplicate setup');
    }
    return;
  }
  setupContexts.add(browserContext);

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

    const urlString = originalUrl.toString();

    for (let attempt = 0; attempt <= MAX_ROUTE_RETRIES; attempt++) {
      try {
        const response = await route.fetch({ url: urlString });
        const status = response.status();

        if (RETRYABLE_STATUS_CODES.has(status)) {
          if (attempt < MAX_ROUTE_RETRIES) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * JITTER_MAX_MS;
            if (process.env.CLERK_TESTING_DEBUG) {
              console.log(
                `[Clerk Testing] FAPI returned ${status}, retrying (attempt ${attempt + 1}/${MAX_ROUTE_RETRIES}, delay ${Math.round(delay)}ms): ${route.request().url()}`,
              );
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          console.warn(
            `[Clerk Testing] FAPI request failed with status ${status} after ${MAX_ROUTE_RETRIES + 1} attempts: ${route.request().url()}`,
          );
          await route.fulfill({ response });
          return;
        }

        const json = await response.json();

        // Override captcha_bypass in /v1/client
        if (json?.response?.captcha_bypass === false) {
          json.response.captcha_bypass = true;
        }

        // Override captcha_bypass in piggybacking
        if (json?.client?.captcha_bypass === false) {
          json.client.captcha_bypass = true;
        }

        await route.fulfill({ response, json });
        return;
      } catch (error) {
        if (attempt < MAX_ROUTE_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * JITTER_MAX_MS;
          if (process.env.CLERK_TESTING_DEBUG) {
            console.log(
              `[Clerk Testing] FAPI request error, retrying (attempt ${attempt + 1}/${MAX_ROUTE_RETRIES}, delay ${Math.round(delay)}ms): ${route.request().url()}`,
              error,
            );
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        console.warn(
          `[Clerk Testing] FAPI request failed after ${MAX_ROUTE_RETRIES + 1} attempts: ${route.request().url()}`,
          error,
        );
        await route.continue({ url: urlString }).catch(console.error);
        return;
      }
    }
  });
};
