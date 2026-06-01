import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { ConfigureSSO } from '../ConfigureSSO';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

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

      fixtures.clerk.user?.getEnterpriseConnections.mockResolvedValue([]);

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

      fixtures.clerk.user?.getEnterpriseConnections.mockResolvedValue([]);

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

      fixtures.clerk.user?.getEnterpriseConnections.mockResolvedValue([]);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      await findByText(/select your identity provider/i);
      expect(queryByText(/you do not have permission to manage single sign-on/i)).not.toBeInTheDocument();
    });
  });

  describe('state machine mounts on the right step', () => {
    it('mounts on select-provider with a verified email and no connection', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.clerk.user?.getEnterpriseConnections.mockResolvedValue([]);

      const { findByText } = render(<ConfigureSSO />, { wrapper });

      // Verified primary email fulfills verify-domain, so the machine skips it
      // and lands on select-provider — the first non-fulfilled enabled step.
      await findByText(/select your identity provider/i);
    });

    it('short-circuits to the confirmation step for an active connection', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.clerk.user?.getEnterpriseConnections.mockResolvedValue([
        {
          id: 'ent_active',
          name: 'clerk.com',
          provider: 'saml_okta',
          active: true,
          organizationId: null,
          domains: ['clerk.com'],
          samlConnection: {
            idpSsoUrl: 'https://idp.example.com/sso',
            idpEntityId: 'https://idp.example.com/entity',
            idpCertificate: 'CERT',
          },
        } as any,
      ]);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      // An active connection lands on confirmation even if never tested.
      await findByText(/configuration/i);
      expect(queryByText(/select your identity provider/i)).not.toBeInTheDocument();
    });
  });
});
