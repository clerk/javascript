import type { CustomPage } from '@clerk/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { OrganizationProfile } from '../';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('OrganizationProfile', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('includes buttons for the bigger sections', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: ['Org1'] });
    });

    const { getByText } = render(<OrganizationProfile />, { wrapper });
    expect(getByText('General')).toBeDefined();
    expect(getByText('Members')).toBeDefined();
  });

  it('includes custom nav items', async () => {
    const { wrapper, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: ['Org1'] });
    });

    const customPages: CustomPage[] = [
      {
        label: 'Custom1',
        url: 'custom1',
        mount: () => undefined,
        unmount: () => undefined,
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
      {
        label: 'ExternalLink',
        url: '/link',
        mountIcon: () => undefined,
        unmountIcon: () => undefined,
      },
    ];

    props.setProps({ customPages });

    const { getByText } = render(<OrganizationProfile />, { wrapper });
    expect(getByText('Members')).toBeDefined();
    expect(getByText('General')).toBeDefined();
    expect(getByText('Custom1')).toBeDefined();
    expect(getByText('ExternalLink')).toBeDefined();
  });

  describe('Billing visibility', () => {
    it('does not include Billing when missing billing permission even with non-free subscription', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: [],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = false;

      (fixtures.clerk.billing.getSubscription as any).mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [
          {
            id: 'sub_item_1',
            plan: { hasBaseFee: true },
          },
        ],
      } as any);

      render(<OrganizationProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByText('Billing')).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('does not include Billing when missing billing permission even with paid plans', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: [],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = true;

      render(<OrganizationProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByText('Billing')).toBeNull());
    });
    it('does not include Billing when organization billing is disabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = false;

      render(<OrganizationProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByText('Billing')).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).not.toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).not.toHaveBeenCalled();
    });

    it('does not include Billing when disabled even if instance has paid plans', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = false;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = true;

      render(<OrganizationProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByText('Billing')).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).not.toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).not.toHaveBeenCalled();
    });

    it('includes Billing when enabled and instance has paid plans', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = true;

      render(<OrganizationProfile />, { wrapper });
      expect(await screen.findByText('Billing')).toBeDefined();
    });

    it('does not include Billing in organization when user billing has paid plans but organization billing is disabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = false;
      fixtures.environment.commerceSettings.billing.user.enabled = true;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = true;

      render(<OrganizationProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByText('Billing')).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).not.toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).not.toHaveBeenCalled();
    });

    it('includes Billing when enabled and organization has a non-free subscription', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = false;

      (fixtures.clerk.billing.getSubscription as any).mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [
          {
            id: 'sub_item_1',
            plan: { hasBaseFee: true },
          },
        ],
      } as any);

      render(<OrganizationProfile />, { wrapper });
      expect(await screen.findByText('Billing')).toBeDefined();
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('includes Billing when enabled and organization has past statements', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = false;

      (fixtures.clerk.billing.getSubscription as any).mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [],
      } as any);
      (fixtures.clerk.billing.getStatements as any).mockResolvedValue({ data: [{}], total_count: 1 } as any);

      render(<OrganizationProfile />, { wrapper });
      expect(await screen.findByText('Billing')).toBeDefined();
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('does not include Billing when enabled but no paid plans, no subscription, and no statements', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = false;

      (fixtures.clerk.billing.getSubscription as any).mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [],
      } as any);
      (fixtures.clerk.billing.getStatements as any).mockResolvedValue({ data: [], total_count: 0 } as any);

      render(<OrganizationProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByText('Billing')).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('does not include Billing in organization when organization has no paid plans, no subscription, and no statements even if user billing has paid plans', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = false;
      fixtures.environment.commerceSettings.billing.user.enabled = true;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = true;

      (fixtures.clerk.billing.getSubscription as any).mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [],
      } as any);
      (fixtures.clerk.billing.getStatements as any).mockResolvedValue({ data: [], total_count: 0 } as any);

      render(<OrganizationProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByText('Billing')).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('does not include Billing when enabled, no paid plans, subscription is null, and no statements', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = false;

      (fixtures.clerk.billing.getSubscription as any).mockResolvedValue(null);
      (fixtures.clerk.billing.getStatements as any).mockResolvedValue({ data: [], total_count: 0 } as any);

      render(<OrganizationProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByText('Billing')).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('does not include Billing when enabled, no paid plans, subscription is free-only, and no statements', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            {
              name: 'Org1',
              permissions: ['org:sys_billing:read'],
            },
          ],
        });
      });

      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = false;

      (fixtures.clerk.billing.getSubscription as any).mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [
          {
            id: 'sub_item_1',
            plan: { hasBaseFee: false },
          },
        ],
      } as any);
      (fixtures.clerk.billing.getStatements as any).mockResolvedValue({ data: [], total_count: 0 } as any);

      render(<OrganizationProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByText('Billing')).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });
  });
  it('removes member nav item if user is lacking permissions', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [
          {
            name: 'Org1',
            permissions: [],
          },
        ],
      });
    });

    const { queryByText } = render(<OrganizationProfile />, { wrapper });
    expect(queryByText('Members')).not.toBeInTheDocument();
    expect(queryByText('General')).toBeInTheDocument();
  });
});
