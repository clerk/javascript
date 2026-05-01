import type { EnterpriseConnection } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

// Self-signed certificate for the fake SAML IdP (required to activate enterprise connections)
const FAKE_IDP_CERTIFICATE =
  'MIIDNzCCAh+gAwIBAgIUEWQRRTEkpHDPMS2f0JS+4L8yD2YwDQYJKoZIhvcNAQELBQAwKzEpMCcGA1UEAwwgZmFrZS1pZHAuZTJlLWVudGVycHJpc2UtdGVzdC5kZXYwHhcNMjYwMzE2MjIwNzMyWhcNMjcwMzE2MjIwNzMyWjArMSkwJwYDVQQDDCBmYWtlLWlkcC5lMmUtZW50ZXJwcmlzZS10ZXN0LmRldjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANIQpOAr5IaiOfx31RRcvQkejoMHldBbxF1hi9boiqqjhlZ+xvuWabmho5JDX5nIJkg31eOkfpFl1TBbMc6IvjvGLgFYinNlPZDArH3/WEw2hRD5f+FhHEBfaqSF+Ol/K4GtZ55lKtyMWI1Xv4avvGhRGbx1kKnMQAXayulmet49azGziJ7B7QwteZOuf6c1XxcQ/VFnIiIYQtN9cngA62pbv/InoZx762504HrlGtmDYxsoCmmDkTw/TXGi2p1X5OHETZV5UXI63mHLFlHdBXqvZDON5mt78p1iTAC1Bnnyd5b8CI6GVEzaMjXnMecKEV67w3HPdO9OcBCuFTqy7dcCAwEAAaNTMFEwHQYDVR0OBBYEFNJxwtOoHamUx+PKBexfDbAaazyVMB8GA1UdIwQYMBaAFNJxwtOoHamUx+PKBexfDbAaazyVMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAG4PLtYjntt/cl3QitAAZBdygmp5sBkxvrS1lWVBBpgH/++hUZ9YEk8AeVi8bnpBKYUXMRTJvqzDoM+xxZEpmNtxm5rb5jp5Pz2mFmmORlD5nOGGB+xZI7BxLfqwjXdfb9zsB3b6nBdFkJKK85KpynNlsx1CfaEVyovTBxzELfW51o666DMCje07rdngckhQLwJ+Rxk3f2AGfjown/TSa/v6Cz7ZK51fpiQwAI+JIwElohmhB8pwghw45+nknSWV7rggbmejJM/RoAKZDNYGt48X3VrnvWSoGfOL9ny/xf1AJ+bdlEheOpigtMq9dE81b0EigWJ8luLHGT5wKaKrqtk=';

/**
 * Helper to create and activate a SAML enterprise connection.
 * The Clerk API requires creating the connection first (inactive), then activating via update.
 * The `provider` field is required by the API but missing from the SDK types, so we cast.
 */
async function createActiveEnterpriseConnection(
  clerk: ReturnType<typeof createTestUtils>['services']['clerk'],
  opts: { name: string; domain: string; idpEntityId: string; idpSsoUrl: string },
): Promise<EnterpriseConnection> {
  const conn = await clerk.enterpriseConnections.createEnterpriseConnection({
    name: opts.name,
    domains: [opts.domain],
    provider: 'saml_custom',
    saml: {
      idpEntityId: opts.idpEntityId,
      idpSsoUrl: opts.idpSsoUrl,
      idpCertificate: FAKE_IDP_CERTIFICATE,
    },
  } as Parameters<typeof clerk.enterpriseConnections.createEnterpriseConnection>[0]);

  return clerk.enterpriseConnections.updateEnterpriseConnection(conn.id, { active: true });
}

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEnterpriseSso] })(
  'enterprise SSO tests for @tanstack-react-start',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    const testDomain = 'e2e-enterprise-test.dev';
    const fakeIdpHost = `fake-idp.${testDomain}`;
    let enterpriseConnection: EnterpriseConnection;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      enterpriseConnection = await createActiveEnterpriseConnection(u.services.clerk, {
        name: 'E2E Test SAML Connection',
        domain: testDomain,
        idpEntityId: `https://${fakeIdpHost}`,
        idpSsoUrl: `https://${fakeIdpHost}/sso`,
      });
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      await u.services.clerk.enterpriseConnections.deleteEnterpriseConnection(enterpriseConnection.id);
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
