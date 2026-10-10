import { expect, ssoSuite, test } from '../../sso/fixtures';
import { createTestUtils } from '../../testUtils';

ssoSuite('SSO connection management', ({ app }) => {
  test('edits the name, changes status, and requires confirmation before removal', async ({
    page,
    createConnection,
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

    await createConnection(page);

    const section = page.locator('.cl-profileSection__sso');

    await u.po.organizationProfile.goTo();

    await u.po.organizationProfile.switchToSecurityTab();

    await section.getByRole('button', { name: /menu/i }).click();
    await page.getByRole('menuitem', { name: 'Edit', exact: true }).click();

    await page
      .locator('.cl-profileSection__ssoConnectionName')
      .getByRole('button', { name: 'Edit', exact: true })
      .click();

    await expect(
      page.locator('.cl-profileSection__ssoConnectionName').getByRole('button', { name: 'Save', exact: true }),
    ).toBeDisabled();

    await page.getByLabel('Name', { exact: true }).fill('Office SSO');
    await page
      .locator('.cl-profileSection__ssoConnectionName')
      .getByRole('button', { name: 'Save', exact: true })
      .click();

    await page.locator('.cl-configureSSOHeaderBackButton').click();

    await expect(section.getByText('Office SSO', { exact: true })).toBeVisible();

    for (const [action, status] of [
      ['Deactivate', 'Inactive'],
      ['Activate', 'Active'],
    ] as const) {
      await section.getByRole('button', { name: /menu/i }).click();
      await page.getByRole('menuitem', { name: action, exact: true }).click();

      await expect(section.getByText(status, { exact: true })).toBeVisible();
    }

    await section.getByRole('button', { name: /menu/i }).click();
    await page.getByRole('menuitem', { name: 'Remove', exact: true }).click();

    const remove = page.getByRole('button', { name: 'Remove connection', exact: true });
    await expect(remove).toBeDisabled();

    await page.getByPlaceholder(organization.name).fill('Wrong name');
    await expect(remove).toBeDisabled();

    await page.getByRole('button', { name: 'Cancel', exact: true }).click();

    await expect(section.getByText('Office SSO', { exact: true })).toBeVisible();

    await section.getByRole('button', { name: /menu/i }).click();
    await page.getByRole('menuitem', { name: 'Remove', exact: true }).click();

    await page.getByPlaceholder(organization.name).fill(organization.name);
    await remove.click();

    await expect(section.getByText('Office SSO', { exact: true })).toHaveCount(0);
  });
});
