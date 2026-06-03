import { beforeEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { assertContextExists } from '../../contexts/utils';
import { clearFetchCache } from '../../hooks';
import { General } from '../OrganizationProfile/General';
import { GeneralDeleteOrganization } from '../OrganizationProfile/GeneralDeleteOrganization';
import { GeneralLeaveOrganization } from '../OrganizationProfile/GeneralLeaveOrganization';
import { GeneralOrganizationProfile } from '../OrganizationProfile/GeneralOrganizationProfile';
import { GeneralVerifiedDomains } from '../OrganizationProfile/GeneralVerifiedDomains';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('OrganizationProfile composed sections', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  describe('General — passthrough mode', () => {
    it('renders org name', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

      render(<General />, { wrapper });
      screen.getByText('TestOrg');
    });

    it('renders domains section when enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationDomains();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

      render(<General />, { wrapper });
      await waitFor(() => screen.getByText(/verified domains/i));
    });

    it('hides domains section when disabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

      const { queryByText } = render(<General />, { wrapper });
      expect(queryByText(/verified domains/i)).not.toBeInTheDocument();
    });
  });

  describe('General — section composition mode', () => {
    it('renders only declared sections', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationDomains();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

      const { queryByText } = render(
        <General>
          <GeneralOrganizationProfile />
        </General>,
        { wrapper },
      );

      screen.getByText('TestOrg');
      expect(queryByText(/verified domains/i)).not.toBeInTheDocument();
    });

    it('renders header', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

      render(
        <General>
          <GeneralOrganizationProfile />
        </General>,
        { wrapper },
      );

      screen.getByText('General');
    });

    it('GeneralVerifiedDomains renders when domains enabled and user has permission', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationDomains();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

      render(
        <General>
          <GeneralVerifiedDomains />
        </General>,
        { wrapper },
      );

      await waitFor(() => screen.getByText(/verified domains/i));
    });

    it('GeneralDeleteOrganization renders null when adminDeleteEnabled is false', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

      const { queryByText } = render(
        <General>
          <GeneralOrganizationProfile />
          <GeneralDeleteOrganization />
        </General>,
        { wrapper },
      );

      screen.getByText('TestOrg');
      expect(queryByText(/delete organization/i)).not.toBeInTheDocument();
    });

    it('GeneralLeaveOrganization renders leave button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

      render(
        <General>
          <GeneralLeaveOrganization />
        </General>,
        { wrapper },
      );

      expect(screen.getAllByText(/leave organization/i).length).toBeGreaterThan(0);
    });

    it('renders custom content between sections', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'TestOrg' }] });
      });

      fixtures.clerk.organization?.getDomains.mockReturnValue(Promise.resolve({ data: [], total_count: 0 }));

      render(
        <General>
          <GeneralOrganizationProfile />
          <div data-testid='custom-banner'>Custom org content</div>
          <GeneralLeaveOrganization />
        </General>,
        { wrapper },
      );

      expect(screen.getByTestId('custom-banner')).toBeInTheDocument();
      screen.getByText('Custom org content');
    });
  });

  describe('General — section outside page', () => {
    it('assertContextExists throws when context is missing', () => {
      expect(() => assertContextExists(null, 'GeneralOrganizationProfile')).toThrow();
    });
  });
});
