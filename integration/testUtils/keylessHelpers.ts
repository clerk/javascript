import type { Page } from '@playwright/test';

/**
 * Mocks the environment API call to return a claimed instance.
 * Used in keyless mode tests to simulate an instance that has been claimed.
 */
export const mockClaimedInstanceEnvironmentCall = async (page: Page) => {
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
