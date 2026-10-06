import { expect, ssoSuite, test } from '../../sso/fixtures';
import { createTestUtils } from '../../testUtils';

ssoSuite('SSO access control', ({ app }) => {
  test('requires permission and enabled self-serve SSO for connection setup', async ({
    page,
    context,
    organization,
    keycloak,
  }) => {
    const u = createTestUtils({ app, page, context });
    const fakeMember = {
      ...u.services.users.createFakeUser(test, { withPassword: false }),
      email: `member+clerk_test@member-${keycloak.realm}.clerk.test`,
    };
    const member = await u.services.users.createBapiUser(fakeMember);
    await u.services.clerk.organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId: member.id,
      role: 'org:member',
    });
    await u.po.signIn.goTo();

    await u.po.signIn.setIdentifier(fakeMember.email);
    await u.po.signIn.continue();

    await u.po.signIn.enterTestOtpCode();

    await u.po.expect.toBeSignedIn();
    await u.page.waitForAppUrl('/');
    await u.po.organizationSwitcher.goTo();

    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await expect(page.locator('.cl-organizationSwitcherTrigger')).toContainText(organization.name);

    await u.po.organizationProfile.goTo();

    expect(await page.evaluate(() => window.Clerk.organization?.selfServeSSOEnabled)).toBe(true);
    expect(
      await page.evaluate(() => window.Clerk.session?.checkAuthorization({ permission: 'org:sys_entconns:manage' })),
    ).toBe(false);
    await expect(page.getByRole('button', { name: 'Security', exact: true })).toHaveCount(0);

    await u.services.clerk.organizations.updateOrganizationMembership({
      organizationId: organization.id,
      userId: member.id,
      role: 'org:admin',
    });
    await u.po.organizationProfile.goTo();

    expect(await page.evaluate(() => window.Clerk.organization?.selfServeSSOEnabled)).toBe(true);
    expect(
      await page.evaluate(() => window.Clerk.session?.checkAuthorization({ permission: 'org:sys_entconns:manage' })),
    ).toBe(true);
    await expect(page.getByRole('button', { name: 'Security', exact: true })).toBeVisible();

    await u.po.organizationProfile.switchToSecurityTab();

    await expect(
      page.locator('.cl-profileSection__sso').getByRole('button', { name: 'Configure', exact: true }),
    ).toBeVisible();

    await u.services.clerk.organizations.updateOrganization(organization.id, { selfServeSsoEnabled: false });
    await u.po.organizationProfile.goTo();

    expect(await page.evaluate(() => window.Clerk.organization?.selfServeSSOEnabled)).toBe(false);
    expect(
      await page.evaluate(() => window.Clerk.session?.checkAuthorization({ permission: 'org:sys_entconns:manage' })),
    ).toBe(true);
    await expect(page.getByRole('button', { name: 'Security', exact: true })).toHaveCount(0);
  });
});
