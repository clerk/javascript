import { expect } from '@playwright/test';

import { common } from './common';
import type { EnhancedPage } from './app';

export const createSessionTaskComponentPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    resolveForceOrganizationSelectionTask: async (fakeOrganization: { name: string; slug: string }) => {
      const createOrganizationButton = page.getByRole('button', { name: /create organization/i });

      await expect(createOrganizationButton).toBeVisible();
      expect(page.url()).toContain('add-organization');

      await page.locator('input[name=name]').fill(fakeOrganization.name);
      await page.locator('input[name=slug]').fill(fakeOrganization.slug);

      await createOrganizationButton.click();
    },
  };

  return self;
};
