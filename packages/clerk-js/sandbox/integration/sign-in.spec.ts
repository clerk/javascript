import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { createColorMixRunner } from './helpers';

const signInRootElement = '.cl-signIn-root';

const runner = createColorMixRunner({
  path: '/sign-in',
  waitForClerkElement: signInRootElement,
  fn: async (page: Page) => {
    await expect(page.locator(signInRootElement)).toHaveScreenshot('sign-in.png');
  },
});

test('sign-in', async ({ page }) => {
  await runner(page);
});
