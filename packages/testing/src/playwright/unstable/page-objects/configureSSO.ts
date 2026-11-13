import { expect } from '@playwright/test';

import type { EnhancedPage } from './app';

type WizardMode = 'manual' | 'metadata file';
type SamlConfiguration = { domain: string; metadata: string; issuer: string; signOnUrl: string };
const providers: Record<WizardMode, string> = { manual: 'Custom SAML Provider', 'metadata file': 'Google Workspace' };

async function configureIdp(page: EnhancedPage, mode: WizardMode, { metadata, issuer, signOnUrl }: SamlConfiguration) {
  const stepDescription = page.locator('.cl-configureSSOStepHeaderDescription');
  if (mode === 'manual') {
    const configureManually = page.getByRole('radio', { name: 'Configure manually', exact: true });
    while (!(await configureManually.isVisible())) {
      const previousStep = await stepDescription.innerText();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();

      await expect(stepDescription.filter({ hasText: previousStep })).toHaveCount(0);
    }

    await configureManually.check();

    await page.getByLabel('Issuer', { exact: true }).fill(issuer);
    await page.getByLabel('Sign on URL', { exact: true }).fill(signOnUrl);

    const certificate = metadata.match(/<[^>]*X509Certificate[^>]*>([^<]+)</)?.[1];
    if (!certificate) {
      throw new Error('SAML metadata has no signing certificate.');
    }
    await page.locator('input[type=file]').setInputFiles({
      name: 'idp.pem',
      mimeType: 'application/x-pem-file',
      buffer: Buffer.from(`-----BEGIN CERTIFICATE-----\n${certificate}\n-----END CERTIFICATE-----`),
    });
  } else {
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await page
      .locator('input[type=file]')
      .setInputFiles({ name: 'idp.xml', mimeType: 'text/xml', buffer: Buffer.from(metadata) });
  }

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  if (mode === 'metadata file') {
    while (!(await page.getByRole('button', { name: 'Open test URL', exact: true }).isVisible())) {
      const previousStep = await stepDescription.innerText();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();

      await expect(stepDescription.filter({ hasText: previousStep })).toHaveCount(0);
    }
  }
}

export const createConfigureSSOPageObject = ({ page }: { page: EnhancedPage }) => ({
  configureSaml: async (config: SamlConfiguration, mode: WizardMode = 'manual') => {
    await page.locator('.cl-profileSection__sso').getByRole('button', { name: 'Configure', exact: true }).click();

    await page.getByLabel('Domain', { exact: true }).fill(config.domain);
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 60_000 });

    await page.getByText(providers[mode], { exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await configureIdp(page, mode, config);

    await page.getByRole('button', { name: 'Open test URL', exact: true }).waitFor();
  },
  openTest: async () => {
    const popup = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Open test URL', exact: true }).click();

    return popup;
  },
});
