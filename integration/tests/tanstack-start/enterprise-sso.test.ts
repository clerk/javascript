import { randomBytes } from 'node:crypto';

import type { EnterpriseConnection } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';
import { createMockSamlIdp, mockSamlIdpAttributeMapping } from '../../testUtils/mockSamlIdp';

/**
 * Helper to create and activate a SAML enterprise connection.
 * The Clerk API requires creating the connection first (inactive), then activating via update.
 */
async function createActiveEnterpriseConnection(
  clerk: ReturnType<typeof createTestUtils>['services']['clerk'],
  opts: { name: string; domain: string; idpEntityId: string; idpSsoUrl: string; idpCertificate: string },
): Promise<EnterpriseConnection> {
  const conn = await clerk.enterpriseConnections.createEnterpriseConnection({
    name: opts.name,
    domains: [opts.domain],
    provider: 'saml_custom',
    saml: {
      idpEntityId: opts.idpEntityId,
      idpSsoUrl: opts.idpSsoUrl,
      idpCertificate: opts.idpCertificate,
      allowIdpInitiated: true,
      attributeMapping: mockSamlIdpAttributeMapping,
    },
  });

  return clerk.enterpriseConnections.updateEnterpriseConnection(conn.id, { active: true });
}

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEnterpriseSso] })(
  'enterprise SSO tests for @tanstack-react-start',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    // Per-run suffix so a failed afterAll on a previous run can't brick the shared
    // long-running instance with a duplicate-domain 422 on the next run.
    const runId = randomBytes(4).toString('hex');
    const testDomain = `e2e-enterprise-test-${runId}.dev`;
    const fakeIdpHost = `fake-idp.${testDomain}`;
    const idp = createMockSamlIdp({ host: fakeIdpHost });
    const ssoUserEmail = `testuser+${runId}@${testDomain}`;
    let enterpriseConnection: EnterpriseConnection | undefined;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      enterpriseConnection = await createActiveEnterpriseConnection(u.services.clerk, {
        name: `E2E Test SAML Connection ${runId}`,
        domain: testDomain,
        idpEntityId: idp.entityId,
        idpSsoUrl: idp.ssoUrl,
        idpCertificate: idp.certificate,
      });
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      // Guard against a failed beforeAll: without this, the TypeError here masks
      // the real error from beforeAll in the Playwright report.
      if (enterpriseConnection) {
        await u.services.clerk.enterpriseConnections.deleteEnterpriseConnection(enterpriseConnection.id);
      }
      await u.services.users.deleteIfExists({ email: ssoUserEmail });
      await app.teardown();
    });

    test('sign-in with enterprise domain email initiates SSO redirect', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Capture the redirect to the fake IdP (proves enterprise SSO kicked in)
      const idpRequestPromise = page.waitForRequest(req => req.url().includes(fakeIdpHost));

      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(`testuser@${testDomain}`);
      await u.po.signIn.continue();

      // Verify the browser was redirected to the enterprise IdP
      const idpRequest = await idpRequestPromise;
      expect(idpRequest.url()).toContain(fakeIdpHost);
    });

    test('sign-in completes through the mock SAML IdP', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await idp.signInWith(page, { email: ssoUserEmail, firstName: 'Sso', lastName: 'User' });

      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(ssoUserEmail);
      await u.po.signIn.continue();

      await u.po.expect.toBeSignedIn();
    });

    test('IdP-initiated sign-in completes through the mock SAML IdP', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const acsUrl = enterpriseConnection?.samlConnection?.acsUrl ?? '';
      const audience = enterpriseConnection?.samlConnection?.spEntityId ?? '';
      expect(acsUrl).not.toBe('');
      expect(audience).not.toBe('');

      await idp.postIdpInitiated(page, { acsUrl, audience, email: ssoUserEmail });
      await page.waitForURL(url => !url.href.startsWith(acsUrl));

      await u.page.goToAppHome();
      await u.po.expect.toBeSignedIn();
    });

    test('non-managed domain email does not trigger SSO redirect', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier('testuser@regular-domain.com');
      await u.po.signIn.continue();

      // The sign-in form should remain visible (no redirect to an IdP)
      await u.po.signIn.waitForMounted();

      // URL should still be on the app's sign-in page, not redirected externally
      expect(page.url()).toContain('/sign-in');
    });
  },
);
