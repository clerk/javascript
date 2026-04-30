import { expect } from '@playwright/test';

import type { EnhancedPage } from './app';
import { common } from './common';

export const createSessionTaskComponentPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    resolveForceOrganizationSelectionTask: async (fakeOrganization: { name: string; slug?: string }) => {
      const createOrganizationButton = page.getByRole('button', { name: /continue/i });

      await expect(createOrganizationButton).toBeVisible();

      await page.locator('input[name=name]').fill(fakeOrganization.name);
      if (fakeOrganization.slug) {
        await page.locator('input[name=slug]').fill(fakeOrganization.slug);
      }

      await createOrganizationButton.click();
    },
    resolveResetPasswordTask: async ({
      newPassword,
      confirmPassword,
    }: {
      newPassword: string;
      confirmPassword: string;
    }) => {
      await page.locator('input[name=newPassword]').fill(newPassword);
      await page.locator('input[name=confirmPassword]').fill(confirmPassword);

      const resetPasswordButton = page.getByRole('button', { name: /reset password/i });
      await expect(resetPasswordButton).toBeVisible();
      await resetPasswordButton.click();
    },
  };

  return self;
};
