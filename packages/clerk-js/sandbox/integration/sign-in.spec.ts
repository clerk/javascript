import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { createColorMixRunner, waitForClerkLoaded } from './helpers';

const runner = createColorMixRunner(async (page: Page) => {
  const el = '.cl-signIn-root';

  await page.goto('/sign-in');
  await waitForClerkLoaded(page, el);
  await expect(page.locator(el)).toHaveScreenshot('sign-in.png');
});

test('sign-in', async ({ page }) => {
  await runner(page);
});
