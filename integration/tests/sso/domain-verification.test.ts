import { expect, ssoSuite, test } from '../../sso/fixtures';
import { createTestUtils } from '../../testUtils';

ssoSuite('SSO domain verification', ({ app }) => {
  test('shows DNS instructions for an unverified domain and permits a verified test domain', async ({
    page,
    keycloak,
    context,
    organization,
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

    const pendingDomain = `${keycloak.realm}.invalid`;

    await u.po.organizationProfile.goTo();

    await u.po.organizationProfile.switchToSecurityTab();

    await page.locator('.cl-profileSection__sso').getByRole('button', { name: 'Configure', exact: true }).click();

    await page.getByLabel('Domain', { exact: true }).fill(pendingDomain);
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    const pending = page.locator('.cl-configureSSOVerifyDomainCard').filter({ hasText: pendingDomain });
    await expect(pending.locator('.cl-configureSSOVerifyDomainCardTxtRecordValue')).not.toHaveValue('');
    await expect(pending.getByRole('checkbox')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();

    await page.getByLabel('Domain', { exact: true }).fill(keycloak.domain);
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    const verified = page.locator('.cl-configureSSOVerifyDomainCard').filter({ hasText: keycloak.domain });
    await expect(verified.getByRole('checkbox')).toBeChecked({ timeout: 60_000 });

    await verified.getByRole('checkbox').uncheck();
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();

    await verified.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await page.getByText('Custom SAML Provider', { exact: true }).click();
  });
});
