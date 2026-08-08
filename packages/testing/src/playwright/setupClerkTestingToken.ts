import type { BrowserContext, Page } from '@playwright/test';

import type { SetupClerkTestingTokenOptions } from '../common';
import { ERROR_MISSING_FRONTEND_API_URL, TESTING_TOKEN_PARAM } from '../common';

/**
 * A function that lazily resolves a testing token. Returning `undefined` falls back to the
 * `CLERK_TESTING_TOKEN` environment variable.
 */
export type TestingTokenProvider = () => string | undefined | Promise<string | undefined>;

export type PlaywrightSetupClerkTestingTokenOptions = Omit<SetupClerkTestingTokenOptions, 'testingToken'> & {
  /*
   * The testing token to append to Frontend API requests, or a function that resolves it lazily.
   * If provided, it takes precedence over the CLERK_TESTING_TOKEN environment variable.
   * Useful when a test suite spans multiple Clerk instances, each needing its own token.
   */
  testingToken?: string | TestingTokenProvider;
};

type SetupClerkTestingTokenParams = {
  context?: BrowserContext;
  page?: Page;
  options?: PlaywrightSetupClerkTestingTokenOptions;
};

const setupContexts = new WeakMap<BrowserContext, Set<string>>();

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
 * @param params.options.testingToken - The testing token to append, or a function that resolves it lazily. Takes precedence over the `CLERK_TESTING_TOKEN` environment variable.
 * @returns A promise that resolves when the bot protection bypass is set up.
 * @throws An error if the Frontend API URL is not provided.
 * @remarks Set the `CLERK_TESTING_DEBUG` environment variable to enable verbose logging of retry attempts and route handler registration. Calling this again with the same frontend API URL on the same context is a no-op and its options (including `testingToken`) are ignored; the first registration wins. Calling it with a different frontend API URL registers an additional, independent bypass, so suites spanning multiple Clerk instances can set up one per instance.
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

  const setupHosts = setupContexts.get(browserContext) ?? new Set<string>();
  if (setupHosts.has(fapiUrl)) {
    if (process.env.CLERK_TESTING_DEBUG) {
      console.log(
        `[Clerk Testing] Route handler already registered for ${fapiUrl} on this context, skipping duplicate setup`,
      );
    }
    return;
  }

  const escapedFapiUrl = fapiUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const apiUrl = new RegExp(`^https://${escapedFapiUrl}/v1/.*?(\\?.*)?$`);

  // Resolve the token once per registration, shared by every intercepted request.
  let resolvedTokenPromise: Promise<string | undefined> | undefined;
  const resolveTestingToken = () => {
    if (!resolvedTokenPromise) {
      const provided = options?.testingToken;
      resolvedTokenPromise = Promise.resolve()
        .then(() => (typeof provided === 'function' ? provided() : provided))
        .catch(error => {
          console.warn(
            `[Clerk Testing] Failed to resolve the testing token for ${fapiUrl}. Falling back to the CLERK_TESTING_TOKEN environment variable.`,
            error,
          );
          return undefined;
        });
    }
    return resolvedTokenPromise;
  };

  setupHosts.add(fapiUrl);
  setupContexts.set(browserContext, setupHosts);
  try {
    await browserContext.route(apiUrl, async route => {
      const originalUrl = new URL(route.request().url());
      const testingToken = (await resolveTestingToken()) ?? process.env.CLERK_TESTING_TOKEN;

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

            // Diagnostics are best-effort: never let them prevent fulfilling the response.
            let diagnostics = '';
            try {
              const headers = response.headers();
              diagnostics = `\n  cf-ray: ${headers['cf-ray'] ?? 'n/a'}, retry-after: ${headers['retry-after'] ?? 'n/a'}, content-type: ${headers['content-type'] ?? 'n/a'}`;
              diagnostics += `\n  body: ${(await response.text()).slice(0, 500)}`;
            } catch {
              // ignore
            }
            console.warn(
              `[Clerk Testing] FAPI request failed with status ${status} after ${MAX_ROUTE_RETRIES + 1} attempts: ${route.request().url()}${diagnostics}`,
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
            `[Clerk Testing] FAPI request failed after ${MAX_ROUTE_RETRIES + 1} attempts: ${route.request().url()} (${String(error)})`,
          );
          await route.continue({ url: urlString }).catch(console.error);
          return;
        }
      }
    });
  } catch (e) {
    setupHosts.delete(fapiUrl);
    throw e;
  }
};
