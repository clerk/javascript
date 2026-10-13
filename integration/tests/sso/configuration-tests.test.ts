import { expect, ssoSuite, test } from '../../sso/fixtures';
import { createTestUtils } from '../../testUtils';

ssoSuite('SSO configuration results', ({ app }) => {
  test('shows failure details, blocks continuation, and continues after a successful retry', async ({
    page,
    organization,
    keycloak,
    context,
  }) => {
    test.setTimeout(180_000);

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

    await u.po.organizationProfile.goTo();

    await u.po.organizationProfile.switchToSecurityTab();

    await u.po.configureSSO.configureSaml({
      domain: keycloak.domain,
      metadata: await keycloak.metadata(keycloak.realm),
      issuer: `${keycloak.baseUrl}/realms/${keycloak.realm}`,
      signOnUrl: `${keycloak.baseUrl}/realms/${keycloak.realm}/protocol/saml`,
    });

    const {
      data: [connection],
    } = await u.services.clerk.enterpriseConnections.getEnterpriseConnectionList({ organizationId: organization.id });
    await keycloak.createSamlClient(
      keycloak.realm,
      connection.samlConnection?.spEntityId,
      connection.samlConnection?.acsUrl,
    );

    const outsideEmail = `outside@outside-${keycloak.realm}.clerk.test`;
    await keycloak.createUser(keycloak.realm, outsideEmail, keycloak.password);

    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.locator('.cl-configureSSOTestError')).toBeVisible();

    const failedPopup = await u.po.configureSSO.openTest();

    await keycloak.signIn(failedPopup, outsideEmail);

    await failedPopup.waitForURL('**/v1/enterprise_connections/**/test_runs/**');
    await failedPopup.close();

    await page.getByRole('button', { name: 'Refresh logs', exact: true }).click();

    const failed = page.locator('.cl-configureSSOTestResultsRow').filter({ hasText: 'Failed' });
    await failed.click();

    await expect(page.locator('.cl-drawerBody')).toContainText('saml_email_address_domain_mismatch');
    await expect(page.getByRole('button', { name: 'Activate SSO', exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Close drawer', exact: true }).click();

    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.locator('.cl-configureSSOTestError')).toBeVisible();

    await context.clearCookies({ domain: new URL(keycloak.baseUrl).hostname });
    const successPopup = await u.po.configureSSO.openTest();

    await keycloak.signIn(successPopup);

    await successPopup.waitForURL('**/v1/enterprise_connections/**/test_runs/**');
    await successPopup.close();

    await page.getByRole('button', { name: 'Refresh logs', exact: true }).click();

    await page.locator('.cl-configureSSOTestResultsRow').filter({ hasText: 'Success' }).click();

    await expect(
      page.locator('.cl-configureSSOTestRunParsedUserInfo').getByText(keycloak.email, { exact: true }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close drawer', exact: true }).click();

    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Activate SSO', exact: true })).toBeVisible();
  });
});
