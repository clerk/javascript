import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { ConfigureSSO } from '../ConfigureSSO';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

const verifiedDomain = {
  id: 'dmn_verified',
  name: 'clerk.com',
  organizationId: 'Org1',
  enrollmentMode: 'enterprise_sso',
  ownershipVerification: { status: 'verified', strategy: 'txt' },
} as any;

const unverifiedDomain = {
  id: 'dmn_unverified',
  name: 'clerk.com',
  organizationId: 'Org1',
  enrollmentMode: 'enterprise_sso',
  ownershipVerification: { status: 'unverified', strategy: 'txt' },
} as any;

const mockOrganizationDomains = (fixtures: any, domains: any[]) =>
  fixtures.clerk.organization?.getDomains.mockResolvedValue({ data: domains, total_count: domains.length } as any);

describe('ConfigureSSO', () => {
  describe('within an organization', () => {
    it('shows a warning if the active organization membership lacks the manage enterprise connections permission', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: [] }],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      await findByText(/you do not have permission to manage single sign-on/i);
      expect(queryByText(/contact your organization.*administrator to upgrade your permissions/i)).toBeInTheDocument();
      expect(queryByText(/select your identity provider/i)).not.toBeInTheDocument();
    });

    it('renders the wizard when the active organization membership has the manage enterprise connections permission', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);
      mockOrganizationDomains(fixtures, [verifiedDomain]);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      await waitFor(() => {
        expect(queryByText(/you do not have permission to manage single sign-on/i)).not.toBeInTheDocument();
      });
      await findByText(/select your identity provider/i);
    });
  });

  describe('in a personal workspace', () => {
    it('renders the wizard without checking the manage enterprise connections permission', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      // No active organization ⇒ no organization domains to verify, so the wizard
      // renders its first step (verify-domain). The point of this test is that the
      // wizard renders at all without the manage-permission gate.
      await findByText(/add and verify ownership of the domains/i);
      expect(queryByText(/you do not have permission to manage single sign-on/i)).not.toBeInTheDocument();
    });
  });

  describe('state machine mounts on the right step', () => {
    it('mounts on select-provider when all organization domains are verified and there is no connection', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);
      mockOrganizationDomains(fixtures, [verifiedDomain]);

      const { findByText } = render(<ConfigureSSO />, { wrapper });

      // verify-domain is fulfilled by the verified domains, so the machine skips
      // it and lands on select-provider — the first non-fulfilled enabled step.
      await findByText(/select your identity provider/i);
    });

    it('stays on verify-domain when not all organization domains are verified', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);
      mockOrganizationDomains(fixtures, [unverifiedDomain]);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      await findByText(/add and verify ownership of the domains/i);
      expect(queryByText(/select your identity provider/i)).not.toBeInTheDocument();
    });

    it('short-circuits to the confirmation step for an active connection', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
        {
          id: 'ent_active',
          name: 'clerk.com',
          provider: 'saml_okta',
          active: true,
          // Owned by the active organization (matches the membership above), so
          // the domain is not "taken by another org" and the machine can
          // short-circuit to confirmation.
          organizationId: 'Org1',
          domains: ['clerk.com'],
          samlConnection: {
            idpSsoUrl: 'https://idp.example.com/sso',
            idpEntityId: 'https://idp.example.com/entity',
            idpCertificate: 'CERT',
          },
        } as any,
      ]);
      mockOrganizationDomains(fixtures, [verifiedDomain]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      // An active connection lands on confirmation even if never tested.
      await findByText(/configuration/i);
      expect(queryByText(/select your identity provider/i)).not.toBeInTheDocument();
    });

    it('mounts on the test step for a configured-but-inactive connection with no successful test run', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
        {
          id: 'ent_configured',
          name: 'clerk.com',
          provider: 'saml_okta',
          // Configured (idp SSO URL + entity id ⇒ hasMinimumConfiguration) but
          // not yet activated, so the test step's guard holds.
          active: false,
          organizationId: 'Org1',
          domains: ['clerk.com'],
          samlConnection: {
            idpSsoUrl: 'https://idp.example.com/sso',
            idpEntityId: 'https://idp.example.com/entity',
            idpCertificate: 'CERT',
          },
        } as any,
      ]);
      mockOrganizationDomains(fixtures, [verifiedDomain]);
      // No successful run yet, so the confirmation guard fails and the
      // furthest-reachable step is `test`.
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      // Configured + inactive + no successful run ⇒ lands on the test step, not
      // confirmation.
      await findByText(/test your sso connection/i);
      expect(queryByText(/configuration details/i)).not.toBeInTheDocument();
    });

    it('mounts on confirmation for a configured-but-inactive connection that has a successful test run', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
        {
          id: 'ent_tested',
          name: 'clerk.com',
          provider: 'saml_okta',
          // Configured (idp SSO URL + entity id) but never activated.
          active: false,
          organizationId: 'Org1',
          domains: ['clerk.com'],
          samlConnection: {
            idpSsoUrl: 'https://idp.example.com/sso',
            idpEntityId: 'https://idp.example.com/entity',
            idpCertificate: 'CERT',
          },
        } as any,
      ]);
      mockOrganizationDomains(fixtures, [verifiedDomain]);
      // A successful run satisfies the confirmation guard (`hasSuccessfulTestRun`)
      // even though the connection is still inactive — the success-filtered probe
      // returns a row, so the furthest-reachable step clears `test` and lands on
      // confirmation. Distinct from the active short-circuit above (here
      // `active: false`, so it is the test run — not activation — that carries the
      // wizard past the test step).
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      // Lands on confirmation (the inactive badge + configuration details render),
      // not the test step.
      await findByText(/configuration details/i);
      expect(queryByText(/test your sso connection/i)).not.toBeInTheDocument();
    });
  });
});
