import type { Page } from '@playwright/test';

type BypassBotProtectionParams = {
  page: Page;
  options?: {
    /*
     * The frontend API URL for your Clerk dev instance, without the protocol.
     * If provided, it overrides the Frontend API URL parsed from the publishable key.
     * Example: 'relieved-chamois-66.clerk.accounts.dev'
     */
    frontendApiUrl?: string;
  };
};

const TESTING_TOKEN_PARAM = '__clerk_testing_token';

/**
 * Bypasses bot protection by appending the testing token in the Frontend API requests.
 *
 * @param params.page - The Playwright page object.
 * @param params.options.frontendApiUrl - The frontend API URL for your Clerk dev instance, without the protocol.
 * @returns A promise that resolves when the bot protection bypass is set up.
 * @throws An error if the Frontend API URL is not provided.
 * @example
 * ```ts
 * import { setupClerkTestingToken } from '@clerk/testing/playwright';
 *
 * test('should bypass bot protection', async ({ page }) => {
 *    await setupClerkTestingToken({ page });
 *    await page.goto('https://your-app.com');
 *    // Continue with your test...
 *  });
 * ```
 *
 */
export const setupClerkTestingToken = async ({ page, options }: BypassBotProtectionParams) => {
  const fapiUrl = options?.frontendApiUrl || process.env.CLERK_FAPI;
  if (!fapiUrl) {
    throw new Error('The Frontend API URL is required to bypass bot protection.');
  }
  const apiUrl = `https://${fapiUrl}/v1/**/*`;

  await page.route(apiUrl, (route, request) => {
    const originalUrl = new URL(request.url());
    const testingToken = process.env.CLERK_TESTING_TOKEN;

    if (testingToken) {
      originalUrl.searchParams.set(TESTING_TOKEN_PARAM, testingToken);
    }

    route.continue({
      url: originalUrl.toString(),
    });
  });
};
