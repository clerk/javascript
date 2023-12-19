import { test, expect } from '@playwright/test';

test('has component from @clerk/elements', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Hello World!')).toBeVisible();
});
