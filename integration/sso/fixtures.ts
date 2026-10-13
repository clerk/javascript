import type { EnterpriseConnection, Organization } from '@clerk/backend';
import type { OrganizationResource } from '@clerk/shared/types';
import { clerkSetup, setupClerkTestingToken } from '@clerk/testing/playwright';
import { type BrowserContext, expect, type Page, test as base } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { Keycloak } from './keycloak';

async function prepareContext(context: BrowserContext) {
  await setupClerkTestingToken({ context });
  await context.route('**/v1/saml/acs/**', route => route.continue());
  await context.route('**/v1/enterprise_connections/*/init_test_run?**', route => route.continue());
}

export const test = base.extend<{
  app: Application;
  keycloak: Keycloak;
  organization: Organization;
  createConnection: (page: Page) => Promise<EnterpriseConnection>;
  directoryIds: Set<string>;
}>({
  app: [undefined as unknown as Application, { option: true }],
  keycloak: async ({ browserName: _browserName }, provide) => {
    const url = process.env.E2E_KEYCLOAK_URL;
    const password = process.env.E2E_KEYCLOAK_ADMIN_PASSWORD;
    if (!url || !password) {
      throw new Error('Run these tests with pnpm test:integration:sso.');
    }
    const keycloak = new Keycloak(url, password);
    try {
      await keycloak.createRealm(keycloak.realm);
      await keycloak.createUser(keycloak.realm, keycloak.email, keycloak.password);
      await provide(keycloak);
    } finally {
      await keycloak.deleteRealm(keycloak.realm);
    }
  },
  context: async ({ context, app }, provide) => {
    await clerkSetup({
      publishableKey: app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY'),
      secretKey: app.env.privateVariables.get('CLERK_SECRET_KEY'),
      dotenv: false,
    });
    await prepareContext(context);
    await provide(context);
  },
  organization: async ({ app, keycloak }, provide) => {
    const u = createTestUtils({ app });
    const fakeAdmin = {
      ...u.services.users.createFakeUser(test, { withPassword: false }),
      email: `admin+clerk_test@admin-${keycloak.realm}.clerk.test`,
    };
    const admin = await u.services.users.createBapiUser(fakeAdmin);
    let organization: Organization | undefined;
    try {
      organization = await u.services.clerk.organizations.createOrganization({
        name: 'Keycloak Test Organization',
        createdBy: admin.id,
      });
      await u.services.clerk.organizations.updateOrganization(organization.id, { selfServeSsoEnabled: true });
      await provide(organization);
    } finally {
      try {
        if (organization) {
          await u.services.clerk.organizations.deleteOrganization(organization.id);
        }
      } finally {
        const users = await u.services.clerk.users.getUserList({ query: keycloak.realm, limit: 100 });
        await Promise.all(users.data.map(user => u.services.clerk.users.deleteUser(user.id)));
      }
    }
  },
  createConnection: async ({ app, organization, keycloak }, provide) => {
    const u = createTestUtils({ app });
    let connection: EnterpriseConnection | undefined;
    try {
      await provide(async page => {
        await page.evaluate(async name => {
          const organization = window.Clerk.organization as OrganizationResource;
          const domain = await organization.createDomain(name, { enrollmentMode: 'enterprise_sso' });
          await organization.prepareOwnershipVerification([domain.id]);
          const result = await organization.attemptOwnershipVerification([domain.id]);
          if (result.errors.length || result.data[0]?.ownershipVerification?.status !== 'verified') {
            throw new Error('Test domain ownership verification failed.');
          }
        }, keycloak.domain);
        connection = await u.services.clerk.enterpriseConnections.createEnterpriseConnection({
          provider: 'saml_custom',
          name: `Private Keycloak ${keycloak.domain}`,
          organizationId: organization.id,
          domains: [keycloak.domain],
          saml: {
            idpMetadata: await keycloak.metadata(keycloak.realm),
          },
        });
        await keycloak.createSamlClient(
          keycloak.realm,
          connection.samlConnection?.spEntityId,
          connection.samlConnection?.acsUrl,
        );
        await u.services.clerk.enterpriseConnections.updateEnterpriseConnection(connection.id, { active: true });
        return connection;
      });
    } finally {
      if (connection) {
        await u.services.clerk.enterpriseConnections.deleteEnterpriseConnection(connection.id).catch(error => {
          if (error.status !== 404) {
            throw error;
          }
        });
      }
    }
  },
  directoryIds: async ({ app, request, organization: _organization }, provide) => {
    const ids = new Set<string>();
    try {
      await provide(ids);
    } finally {
      for (const id of ids) {
        const response = await request.delete(
          `${app.env.privateVariables.get('CLERK_API_URL') || 'https://api.clerk.com'}/v1/directories/${id}`,
          {
            headers: { Authorization: `Bearer ${app.env.privateVariables.get('CLERK_SECRET_KEY')}` },
          },
        );
        expect(response.ok() || response.status() === 404, `Directory cleanup failed (${response.status()}).`).toBe(
          true,
        );
        await response.dispose();
      }
    }
  },
});

export function ssoSuite(title: string, define: (args: { app: Application }) => void) {
  if (process.env.E2E_KEYCLOAK_URL) {
    testAgainstRunningApps({ withEnv: [appConfigs.envs.withSelfServeSso] })(`${title} @sso`, ({ app }) => {
      test.use({ app });
      test.setTimeout(120_000);
      define({ app });
    });
  }
}

export { expect };
