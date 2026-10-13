import { expect, ssoSuite, test } from '../../sso/fixtures';
import { createTestUtils } from '../../testUtils';

ssoSuite('SAML sign-in', ({ app }) => {
  test('signs in through the SAML redirect and signs out through the user menu', async ({
    page,
    context,
    keycloak,
    createConnection,
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

    await createConnection(page);

    await u.page.goToAppHome();

    await u.po.userButton.toggleTrigger();

    await u.po.userButton.triggerSignOut();

    await u.po.expect.toBeSignedOut();

    await u.po.signIn.goTo();

    await u.po.signIn.setIdentifier(keycloak.email);
    await u.po.signIn.continue();

    await keycloak.signIn(page);

    await u.po.expect.toBeSignedIn();
    await u.page.waitForAppUrl('/');

    await u.po.userButton.toggleTrigger();

    await u.po.userButton.waitForPopover();
    await expect(page.getByText(keycloak.email, { exact: true })).toBeVisible();

    await u.po.userButton.triggerSignOut();

    await u.po.expect.toBeSignedOut();
  });
});
