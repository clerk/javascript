import type { Page } from '@playwright/test';

type BypassBotProtectionParams = {
  page: Page;
  options?: {
    /*
     * The frontend API URL for your Clerk dev instance, without the protocol.
     * If provided, it overrides the Frontend API URL parsed from the publishable key.
     * Example: 'relieved-chamois-66.accounts.dev'
     */
    frontendApiUrl?: string;
  };
};

const TESTING_TOKEN_PARAM = '__clerk_testing_token';

export const clerkBypassBotProtection = async ({ page, options }: BypassBotProtectionParams) => {
  const fapiUrl = options?.frontendApiUrl || process.env.CLERK_FAPI;
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
