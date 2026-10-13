import type { OrganizationResource } from '@clerk/shared/types';

import { expect, ssoSuite, test } from '../../sso/fixtures';
import { patchPayload, Scim, userPayload } from '../../sso/scim';
import { createTestUtils } from '../../testUtils';

ssoSuite('Self-serve setup wizards', ({ app }) => {
  for (const mode of ['manual', 'metadata file'] as const) {
    test(`configures and activates SAML through the ${mode} wizard`, async ({
      page,
      context,
      organization,
      keycloak,
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

      await u.po.configureSSO.configureSaml(
        {
          domain: keycloak.domain,
          metadata: await keycloak.metadata(keycloak.realm),
          issuer: `${keycloak.baseUrl}/realms/${keycloak.realm}`,
          signOnUrl: `${keycloak.baseUrl}/realms/${keycloak.realm}/protocol/saml`,
        },
        mode,
      );

      const {
        data: [connection],
      } = await u.services.clerk.enterpriseConnections.getEnterpriseConnectionList({ organizationId: organization.id });
      await keycloak.createSamlClient(
        keycloak.realm,
        connection.samlConnection?.spEntityId,
        connection.samlConnection?.acsUrl,
      );

      const popup = await u.po.configureSSO.openTest();

      await keycloak.signIn(popup);

      await popup.waitForURL('**/v1/enterprise_connections/**/test_runs/**');
      await popup.close();

      await page.getByRole('button', { name: 'Refresh logs', exact: true }).click();

      await page.getByRole('button', { name: 'Continue', exact: true }).click();

      await page.getByRole('button', { name: 'Activate SSO', exact: true }).click();

      await expect(page.locator('.cl-profileSection__sso').getByText('Active', { exact: true })).toBeVisible();

      await u.page.goToAppHome();

      await u.po.userButton.toggleTrigger();

      await u.po.userButton.triggerSignOut();

      await u.po.expect.toBeSignedOut();
      await context.clearCookies({ domain: new URL(keycloak.baseUrl).hostname });

      await u.po.signIn.goTo();

      await u.po.signIn.setIdentifier(keycloak.email);
      await u.po.signIn.continue();

      await keycloak.signIn(page);

      await u.po.expect.toBeSignedIn();
      await u.page.waitForAppUrl('/');
    });
  }

  test('configures SCIM, shows provisioning activity, and hides the token after reload', async ({
    page,
    createConnection,
    directoryIds,
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

    const connection = await createConnection(page);

    await u.po.organizationProfile.goTo();

    await u.po.organizationProfile.switchToSecurityTab();

    await page
      .locator('.cl-profileSection__directorySync')
      .getByRole('button', { name: 'Configure', exact: true })
      .click();

    const endpoint = page.locator('.cl-configureDirectorySyncEndpointUrlInput');
    const bearer = page.locator('.cl-configureDirectorySyncTokenInput');
    await expect(endpoint).not.toHaveValue('');
    await expect(bearer).not.toHaveValue('');

    const directory = await page.evaluate(
      async id => (await (window.Clerk.organization as OrganizationResource).getDirectorySync(id)).id,
      connection.id,
    );
    directoryIds.add(directory);

    const scim = new Scim(await endpoint.inputValue(), await bearer.inputValue());

    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    const created = await scim.request('Users', 'POST', userPayload(keycloak.email));

    const provisioned = page.locator('.cl-configureDirectorySyncUsersRow').filter({ hasText: keycloak.email });
    await expect(provisioned).toContainText('Active', { timeout: 60_000 });

    await scim.request(
      `Users/${created.body.id}`,
      'PATCH',
      patchPayload([{ op: 'replace', path: 'active', value: false }]),
    );

    await expect(provisioned).toContainText('Deprovisioned', { timeout: 60_000 });

    await page.getByRole('button', { name: 'Complete', exact: true }).click();

    await page.reload();

    await page.locator('.cl-profileSection__directorySync').getByRole('button', { name: /menu/i }).click();
    await page.getByRole('menuitem', { name: 'Edit', exact: true }).click();

    await expect(page.locator('.cl-configureDirectorySyncTokenInput')).toHaveValue('');
  });
});
