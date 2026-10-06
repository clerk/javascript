import type { OrganizationResource } from '@clerk/shared/types';

import { expect, ssoSuite, test } from '../../sso/fixtures';
import { createTestUtils } from '../../testUtils';

ssoSuite('Directory token controls', ({ app }) => {
  test('generates and copies a token and hides it after reload', async ({
    page,
    createConnection,
    directoryIds,
    context,
    organization,
    keycloak,
  }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();

    await u.po.signIn.setIdentifier(`admin+clerk_test@admin-${keycloak.realm}.clerk.test`);
    await u.po.signIn.continue();

    await u.po.signIn.enterTestOtpCode();

    await u.po.expect.toBeSignedIn();
    await u.page.waitForAppUrl('/');
    await u.po.organizationSwitcher.goTo();

    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await expect(page.locator('.cl-organizationSwitcherTrigger')).toContainText(organization.name);

    const connection = await createConnection(page);

    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: app.serverUrl });
    await u.po.organizationProfile.goTo();

    await u.po.organizationProfile.switchToSecurityTab();

    await page
      .locator('.cl-profileSection__directorySync')
      .getByRole('button', { name: 'Configure', exact: true })
      .click();

    const token = page.locator('.cl-configureDirectorySyncTokenInput');
    await expect(token).not.toHaveValue('');

    const directory = await page.evaluate(
      async id => (await (window.Clerk.organization as OrganizationResource).getDirectorySync(id)).id,
      connection.id,
    );
    directoryIds.add(directory);

    const original = await token.inputValue();
    await page.getByRole('button', { name: 'Generate new token', exact: true }).click();

    await expect(token).not.toHaveValue(original);
    await expect(token).not.toHaveValue('');

    await token.locator('..').locator('.cl-formFieldInputCopyToClipboardButton').click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await token.inputValue());

    await page.reload();

    await page.locator('.cl-profileSection__directorySync').getByRole('button', { name: /menu/i }).click();
    await page.getByRole('menuitem', { name: 'Edit', exact: true }).click();

    await expect(token).toHaveValue('');

    await page.getByRole('button', { name: 'Generate new token', exact: true }).click();

    await expect(token).not.toHaveValue('');
  });
});
