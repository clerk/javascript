import { expect } from '@playwright/test';

import { common } from './commonPageObject';
import type { FakeOrganization } from './organizationsService';
import type { TestArgs } from './signInPageObject';

export const createSessionTaskComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    resolveForceOrganizationSelectionTask: async (fakeOrganization: FakeOrganization) => {
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
