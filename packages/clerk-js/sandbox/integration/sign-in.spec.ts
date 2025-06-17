import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { createColorMixRunner, waitForClerkLoaded } from './helpers';

const runner = createColorMixRunner(async (page: Page) => {
  await page.goto('/sign-in');
  await waitForClerkLoaded(page, '.cl-signIn-root');
  await expect(page).toHaveScreenshot('sign-in.png');
});

test('sign-in', async ({ page }) => {
  await runner(page);
});
