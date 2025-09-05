import { expect } from '@playwright/test';

import type { EnhancedPage } from './app';
import { common } from './common';

export const createSessionTaskComponentPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    resolveForceOrganizationSelectionTask: async (fakeOrganization: { name: string; slug: string }) => {
      const createOrganizationButton = page.getByRole('button', { name: /continue/i });

      await expect(createOrganizationButton).toBeVisible();

      await page.locator('input[name=name]').fill(fakeOrganization.name);
      await page.locator('input[name=slug]').fill(fakeOrganization.slug);

      await createOrganizationButton.click();
    },
  };

  return self;
};
