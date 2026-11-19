import { expect, test } from '@playwright/test';

import { testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouterMosaic.*'] })('Mosaic Server Components @mosaic', ({ app }) => {
  test.afterAll(async () => {
    await app.teardown();
  });

  test('renders compound and single components and a glyph from a Server Component', async ({ page }) => {
    await page.goto(app.serverUrl + '/server-components');

    await expect(page.getByRole('heading', { name: 'Server rendered' })).toBeVisible();
    await expect(page.getByText('AC')).toBeAttached();
    await expect(page.getByText('New')).toBeVisible();
    await expect(page.getByTestId('external-icon').locator('svg')).toBeAttached();
  });
});
