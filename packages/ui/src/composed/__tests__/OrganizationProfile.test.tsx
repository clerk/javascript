import type { ClerkPaginatedResponse, OrganizationMembershipResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { OrganizationGeneralPage } from '../../components/OrganizationProfile/OrganizationGeneralPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('Experimental OrganizationProfile', () => {
  describe('General page', () => {
    it('renders the organization general page', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(
        Promise.resolve({
          data: [],
          total_count: 0,
        }),
      );

      render(<OrganizationGeneralPage />, { wrapper });
      screen.getByText('General');
    });

    it('shows organization name', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(
        Promise.resolve({
          data: [],
          total_count: 0,
        }),
      );

      render(<OrganizationGeneralPage />, { wrapper });
      screen.getByText('TestOrg');
    });
  });
});
