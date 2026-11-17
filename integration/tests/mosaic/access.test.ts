import type { Locator, Page } from '@playwright/test';

import { appConfigs } from '../../presets';
import { expect, test } from '../../sso/fixtures';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

const button = (scope: Page | Locator, name: string) => scope.getByRole('button', { name, exact: true });
const tab = (page: Page, name: string) => page.getByRole('tab', { name, exact: true });

async function openAccess(page: Page) {
  await page.goto('/organization-profile');
  await expect(tab(page, 'Access'), 'The test instance must have Access policies enabled.').toBeVisible();
  await tab(page, 'Access').click();
}

async function continueUntil(scope: Page | Locator, destination: Locator) {
  const reached = destination.or(button(scope, 'Continue').and(scope.locator(':enabled')));
  for (let step = 0; step < 8; step++) {
    await expect(reached.first()).toBeVisible();
    if (await destination.isVisible()) {
      return;
    }
    const heading = await scope.getByRole('heading').last().textContent();
    await button(scope, 'Continue').click();
    await expect
      .poll(
        async () =>
          (await destination.isVisible()) || (await scope.getByRole('heading').last().textContent()) !== heading,
      )
      .toBe(true);
  }
  await expect(destination).toBeVisible();
}

async function addPolicyDomain(page: Page, name: string) {
  await button(page, 'Add').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Domain', exact: true }).fill(name);
  await button(dialog, 'Add').click();
}

async function openManage(page: Page, name: string) {
  await button(page.getByRole('row').filter({ hasText: name }), 'Actions').click();
  await page.getByRole('menuitem', { name: 'Manage', exact: true }).click();
}

if (process.env.E2E_KEYCLOAK_URL && process.env.E2E_MOSAIC_ACCESS === '1') {
  testAgainstRunningApps({ withEnv: [appConfigs.envs.withAccessAndOnboarding] })('Mosaic Access @sso', ({ app }) => {
    test.use({ app, baseURL: async ({}, use) => use(app.serverUrl) });
    test.setTimeout(180_000);

    test.beforeEach(async ({ page, context, keycloak, organization }) => {
      const u = await createTestUtils({ app, page, context });
      await page.setViewportSize({ width: 1280, height: 800 });
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(`admin+clerk_test@admin-${keycloak.realm}.clerk.test`);
      await u.po.signIn.continue();
      await u.po.signIn.enterTestOtpCode();
      await u.po.expect.toBeSignedIn();
      await u.page.goToRelative('/organization-switcher');
      const trigger = page.getByRole('button', { name: /^Open organization menu/ });
      if ((await trigger.getAttribute('aria-label')) !== `Open organization menu for ${organization.name}`) {
        await trigger.click();
        await button(page.getByRole('dialog', { name: 'Organizations' }), organization.name).click();
      }
      await expect(trigger).toHaveAccessibleName(new RegExp(organization.name));
    });

    test('creates and edits an email policy that survives a reload', async ({ page, keycloak }) => {
      await openAccess(page);
      await button(page, 'Add policy').click();
      await addPolicyDomain(page, keycloak.domain);
      await button(page, 'Activate policy').click();
      const row = page.getByRole('row').filter({ hasText: keycloak.domain });
      await expect(row).toContainText('Invitation only');
      await expect(page.getByRole('row').filter({ hasText: 'Everyone else' })).toBeVisible();

      await openManage(page, keycloak.domain);
      const secondDomain = `second-${keycloak.domain}`;
      await addPolicyDomain(page, secondDomain);
      await button(page, 'Save changes').click();
      await expect(row).toContainText(secondDomain);
      await page.reload();
      await tab(page, 'Access').click();
      await expect(row).toContainText(secondDomain);
    });

    test('verifies domain ownership before saving an SSO policy', async ({ page, keycloak }) => {
      await openAccess(page);
      await button(page, 'Add policy').click();
      await addPolicyDomain(page, keycloak.domain);
      await expect(button(page, 'Activate policy')).toBeEnabled();

      await page.getByRole('radio', { name: 'Single sign-on', exact: true }).click();
      await expect(page.getByText('Ownership unverified', { exact: true })).toBeVisible();
      await expect(button(page, 'Add connection')).toBeVisible();
      await expect(button(page, 'Activate policy')).toBeDisabled();

      await button(page, 'Verify').click();
      const verification = page.getByRole('dialog', { name: new RegExp(keycloak.domain) });
      await expect(verification.getByText('TXT', { exact: true })).toBeVisible();
      await expect(verification.getByRole('textbox', { name: 'Value', exact: true })).not.toHaveValue('');
      await button(verification, 'Check verification').click();
      await expect(page.getByText('Ownership verified', { exact: true })).toBeVisible();
      await expect(button(page, 'Activate policy')).toBeDisabled();

      await page.reload();
      await tab(page, 'Access').click();
      await expect(button(page, 'Add policy')).toBeVisible();
      await expect(page.getByRole('row').filter({ hasText: keycloak.domain })).toHaveCount(0);
    });

    test('activates Keycloak SSO and configures Directory Sync', async ({ page, keycloak }) => {
      await page.goto('/legacy-organization-profile');
      await button(page, 'Security').click();
      await button(page, 'Configure').and(page.locator(':enabled')).click();
      await page.getByLabel('Domain', { exact: true }).fill(keycloak.domain);
      await button(page, 'Add').click();
      await expect(page.getByRole('checkbox', { name: `Use ${keycloak.domain} for this connection` })).toBeChecked({
        timeout: 60_000,
      });

      await openAccess(page);
      await tab(page, 'Connections').click();
      await button(page, 'Add connection').click();
      const wizard = page.getByRole('dialog');
      await button(wizard, 'Okta Workforce').click();
      await button(wizard, 'Continue').click();
      const name = 'Okta Workforce';
      await wizard.getByRole('combobox', { name: 'Domain', exact: true }).click();
      await page.getByRole('option', { name: keycloak.domain, exact: true }).click();
      await continueUntil(wizard, wizard.getByRole('textbox', { name: 'Audience URI', exact: true }));
      await keycloak.createSamlClient(
        keycloak.realm,
        await wizard.getByRole('textbox', { name: 'Audience URI', exact: true }).inputValue(),
        await wizard.getByRole('textbox', { name: 'Single sign-on URL', exact: true }).inputValue(),
      );
      await wizard.getByText('Upload metadata', { exact: true }).click();
      await wizard.getByLabel('Metadata XML file').setInputFiles({
        name: 'keycloak.xml',
        mimeType: 'application/xml',
        buffer: Buffer.from(await keycloak.metadata(keycloak.realm)),
      });
      await continueUntil(wizard, button(wizard, 'Create test link'));
      await button(wizard, 'Create test link').click();
      const popupPromise = page.waitForEvent('popup');
      await wizard.getByRole('link', { name: 'Open in a new tab', exact: true }).click();
      const popup = await popupPromise;
      await keycloak.signIn(popup);
      await popup.waitForURL('**/v1/enterprise_connections/**/test_runs/**');
      await popup.close();
      await button(wizard, 'Refresh results').click();
      await expect(wizard.getByText('Test passed', { exact: true })).toBeVisible();
      await button(wizard, 'Save changes').click();
      await button(wizard, 'Continue').click();
      await expect(page.getByRole('row').filter({ hasText: name })).toContainText('Active');

      await button(page, 'Add directory').click();
      await button(page, 'Okta Workforce').click();
      await button(page, 'Continue').click();
      const directory = 'Keycloak directory';
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(directory);
      await button(page, 'Generate bearer token').click();
      const endpoint = page.getByRole('textbox', { name: 'SCIM endpoint', exact: true });
      const token = page.getByRole('textbox', { name: 'Bearer token', exact: true });
      await expect(token).not.toHaveValue('');
      const issuedToken = await token.inputValue();
      const issuedEndpoint = await endpoint.inputValue();
      expect(issuedEndpoint).toMatch(/^https:\/\//);

      await page.reload();
      await tab(page, 'Access').click();
      await tab(page, 'Connections').click();
      const ssoRow = page.getByRole('row').filter({ hasText: name });
      await expect(ssoRow).toContainText('Active');
      await openManage(page, name);
      await expect(page.getByRole('heading', { name: 'Manage SSO connection', exact: true })).toBeVisible();
      const connectionName = page.getByRole('textbox', { name: 'Name', exact: true });
      await expect(connectionName).toHaveValue(name);
      const updatedName = 'Keycloak workforce SSO';
      await connectionName.fill(updatedName);
      await button(page, 'Save').click();
      await expect(page.getByRole('row').filter({ hasText: updatedName })).toContainText('Active');
      await page.reload();
      await tab(page, 'Access').click();
      await tab(page, 'Connections').click();
      await expect(page.getByRole('row').filter({ hasText: updatedName })).toContainText('Active');
      await expect(page.getByRole('row').filter({ hasText: directory })).toContainText('Active');
      await openManage(page, directory);
      await expect(page.getByRole('heading', { name: 'Manage Directory Sync', exact: true })).toBeVisible();
      await expect(connectionName).toHaveValue(directory);
      await expect(connectionName).not.toBeEditable();
      await expect(endpoint).toHaveValue(issuedEndpoint);
      await expect(token).toHaveValue('');
      await button(page, 'Generate new token').click();
      await expect(token).not.toHaveValue('');
      expect((await token.inputValue()) === issuedToken, 'Token rotation must issue a different token').toBe(false);
    });
  });
}
