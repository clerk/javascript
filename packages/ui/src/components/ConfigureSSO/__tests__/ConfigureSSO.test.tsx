import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { ConfigureSSO } from '../ConfigureSSO';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

describe('ConfigureSSO', () => {
  describe('within an organization', () => {
    it('shows a warning if the active organization membership lacks the manage enterprise connections permission', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSso: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: [] }],
        });
      });

      fixtures.clerk.user?.getEnterpriseConnections.mockResolvedValue([]);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      await findByText(/you do not have permission to manage enterprise connections/i);
      expect(queryByText(/contact your organization administrator in order to have permissions/i)).toBeInTheDocument();
      expect(queryByText(/select provider/i)).not.toBeInTheDocument();
    });

    it('renders the wizard when the active organization membership has the manage enterprise connections permission', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSso: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_enterprise_connections:manage'] }],
        });
      });

      fixtures.clerk.user?.getEnterpriseConnections.mockResolvedValue([]);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      await waitFor(() => {
        expect(queryByText(/you do not have permission to manage enterprise connections/i)).not.toBeInTheDocument();
      });
      await findByText(/select provider/i);
    });
  });

  describe('in a personal workspace', () => {
    it('renders the wizard without checking the manage enterprise connections permission', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSso: true });
        f.withEmailAddress();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.clerk.user?.getEnterpriseConnections.mockResolvedValue([]);

      const { findByText, queryByText } = render(<ConfigureSSO />, { wrapper });

      await findByText(/select provider/i);
      expect(queryByText(/you do not have permission to manage enterprise connections/i)).not.toBeInTheDocument();
    });
  });
});
