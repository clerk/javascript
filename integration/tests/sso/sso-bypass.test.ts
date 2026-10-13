import type { ClerkClient } from '@clerk/backend';
import type { Page } from '@playwright/test';

import { expect, ssoSuite, test } from '../../sso/fixtures';
import { createTestUtils } from '../../testUtils';
import type { UserService } from '../../testUtils/usersService';

async function createMember(
  services: { clerk: ClerkClient; users: UserService },
  organizationId: string,
  email: string,
  mfa = false,
) {
  const fakeMember = {
    ...services.users.createFakeUser(test, { withPassword: false }),
    email,
  };
  const member = mfa
    ? await services.clerk.users.createUser({
        emailAddress: [email],
        firstName: fakeMember.firstName,
        lastName: fakeMember.lastName,
        privateMetadata: fakeMember.privateMetadata,
        skipPasswordRequirement: true,
        totpSecret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['backup-code-12345'],
      })
    : await services.users.createBapiUser(fakeMember);
  await services.clerk.organizations.createOrganizationMembership({
    organizationId,
    userId: member.id,
    role: 'org:member',
  });
}

async function addByEmail(page: Page, email: string) {
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  await page.getByPlaceholder("Enter the member's email address").fill(email);
  await page.getByRole('button', { name: 'Add members', exact: true }).click();
}

ssoSuite('SSO bypass components', ({ app }) => {
  test('adds a member by email, shows validation errors, searches, and removes the member', async ({
    page,
    createConnection,
    organization,
    keycloak,
    context,
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

    await createMember(u.services, organization.id, keycloak.email);

    await u.po.organizationProfile.goTo();

    await u.po.organizationProfile.switchToSecurityTab();

    await page.locator('.cl-profileSection__ssoBypass').getByRole('button', { name: /menu/i }).click();
    await page.getByRole('menuitem', { name: 'Manage', exact: true }).click();

    await addByEmail(page, `unknown@${keycloak.domain}`);

    await expect(page.locator('.cl-organizationProfileSecuritySsoBypassFailure')).toBeVisible();

    await page.getByPlaceholder("Enter the member's email address").fill(keycloak.email);
    await page.getByRole('button', { name: 'Add members', exact: true }).click();

    await page.getByRole('button', { name: 'Finish', exact: true }).click();

    await addByEmail(page, keycloak.email);

    await expect(page.locator('.cl-organizationProfileSecuritySsoBypassFailure')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel', exact: true }).click();

    await page.getByRole('searchbox', { name: 'Search users', exact: true }).fill('absent');
    await expect(page.getByRole('row').filter({ hasText: keycloak.email })).toHaveCount(0);

    await page.getByRole('searchbox', { name: 'Search users', exact: true }).fill(keycloak.email);
    const row = page.getByRole('row').filter({ hasText: keycloak.email });
    await row.getByRole('button', { name: /menu/i }).click();
    await page.getByRole('menuitem', { name: 'Remove', exact: true }).click();

    await expect(row).toHaveCount(0);

    await page.getByRole('searchbox', { name: 'Search users', exact: true }).fill('');
    await expect(row).toHaveCount(0);
  });

  test('adds members by role and reports members outside the connection domain', async ({
    page,
    createConnection,
    organization,
    keycloak,
    context,
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

    for (const email of [keycloak.email, `other@outside-${keycloak.realm}.clerk.test`]) {
      await createMember(u.services, organization.id, email);
    }

    await u.po.organizationProfile.goTo();

    await u.po.organizationProfile.switchToSecurityTab();

    await page.locator('.cl-profileSection__ssoBypass').getByRole('button', { name: /menu/i }).click();
    await page.getByRole('menuitem', { name: 'Manage', exact: true }).click();

    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await page.getByRole('radio', { name: 'Role', exact: true }).check();

    await page.getByRole('button', { name: 'Select role', exact: true }).click();
    await page.getByRole('option', { name: 'Member (2)', exact: true }).click();
    await page.getByRole('button', { name: 'Add members', exact: true }).click();

    await expect(page.locator('.cl-organizationProfileSecuritySsoBypassBulkResult')).toContainText(/Added 1 member/);
    await expect(page.locator('.cl-organizationProfileSecuritySsoBypassBulkResult')).toContainText(
      /1 member could not be added/,
    );

    await page.getByRole('button', { name: 'Finish', exact: true }).click();

    await expect(page.getByRole('row').filter({ hasText: keycloak.email })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: `other@outside-${keycloak.realm}.clerk.test` })).toHaveCount(
      0,
    );
  });

  for (const mfa of [false, true]) {
    test(`signs in with an email code through the bypass controls${mfa ? ' and MFA' : ''}`, async ({
      page,
      context,
      createConnection,
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

      const email = `bypass+clerk_test@${keycloak.domain}`;
      await createMember(u.services, organization.id, email, mfa);

      await u.po.organizationProfile.goTo();

      await u.po.organizationProfile.switchToSecurityTab();

      await page.locator('.cl-profileSection__ssoBypass').getByRole('button', { name: /menu/i }).click();
      await page.getByRole('menuitem', { name: 'Manage', exact: true }).click();

      await addByEmail(page, email);

      await page.getByRole('button', { name: 'Finish', exact: true }).click();

      await u.page.goToAppHome();

      await u.po.userButton.toggleTrigger();

      await u.po.userButton.triggerSignOut();

      await u.po.expect.toBeSignedOut();

      await u.po.signIn.goTo();

      await u.po.signIn.setIdentifier(email);
      await u.po.signIn.continue();

      await page.getByRole('link', { name: "Can't use SSO?", exact: true }).click();

      await u.po.signIn.enterTestOtpCode();

      if (mfa) {
        await page.waitForURL(url => url.pathname.includes('/factor-two') || url.hash.includes('/factor-two'));

        await u.po.signIn.getUseAnotherMethodLink().click();

        await page.getByRole('button', { name: /backup code/i }).click();

        await page.getByLabel('Backup code', { exact: true }).fill('backup-code-12345');
        await u.po.signIn.continue();
      }

      await u.po.expect.toBeSignedIn();
      await u.page.waitForAppUrl('/');

      await u.po.userButton.toggleTrigger();

      await u.po.userButton.waitForPopover();
      await expect(page.getByText(email, { exact: true })).toBeVisible();
    });
  }
});
