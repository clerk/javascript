import type { CustomPage } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { UserProfile } from '../';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('UserProfile', () => {
  describe('Navigation', () => {
    it('includes buttons for the bigger sections', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      render(<UserProfile />, { wrapper });
      const profileElements = screen.getAllByRole('button', { name: /Profile/i });
      expect(profileElements.length).toBeGreaterThan(0);
      const securityElements = screen.getAllByRole('button', { name: /Security/i });
      expect(securityElements.length).toBeGreaterThan(0);
    });

    it('includes custom nav items', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.dev'] });
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
      render(<UserProfile />, { wrapper });
      const profileElements = screen.getAllByRole('button', { name: /Profile/i });
      expect(profileElements.length).toBeGreaterThan(0);
      const securityElements = screen.getAllByRole('button', { name: /Security/i });
      expect(securityElements.length).toBeGreaterThan(0);
      const customElements = screen.getAllByRole('button', { name: /Custom1/i });
      expect(customElements.length).toBeGreaterThan(0);
      const externalElements = screen.getAllByRole('button', { name: /ExternalLink/i });
      expect(externalElements.length).toBeGreaterThan(0);
    });

    it('does not include Billing when user billing is disabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = false;

      render(<UserProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByRole('button', { name: /Billing/i })).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).not.toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).not.toHaveBeenCalled();
    });

    it('does not include Billing when user billing is disabled even if organization billing has paid plans', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = false;
      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = true;

      render(<UserProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByRole('button', { name: /Billing/i })).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).not.toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).not.toHaveBeenCalled();
    });

    it('does not include Billing when disabled even if instance has paid plans', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = false;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = true;

      render(<UserProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByRole('button', { name: /Billing/i })).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).not.toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).not.toHaveBeenCalled();
    });

    it('includes Billing when enabled and instance has paid plans', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = true;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = true;

      render(<UserProfile />, { wrapper });
      const billingElements = await screen.findAllByRole('button', { name: /Billing/i });
      expect(billingElements.length).toBeGreaterThan(0);
    });

    it('includes Billing when enabled and user has a non-free subscription', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = true;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = false;

      fixtures.clerk.billing.getSubscription.mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [
          {
            id: 'sub_item_1',
            plan: { hasBaseFee: true },
          },
        ],
      } as any);

      render(<UserProfile />, { wrapper });
      const billingElements = await screen.findAllByRole('button', { name: /Billing/i });
      expect(billingElements.length).toBeGreaterThan(0);
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('includes Billing when enabled and user has past statements', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = true;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = false;

      fixtures.clerk.billing.getSubscription.mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [],
      } as any);
      fixtures.clerk.billing.getStatements.mockResolvedValue({ data: [{}], total_count: 1 } as any);

      render(<UserProfile />, { wrapper });
      const billingElements = await screen.findAllByRole('button', { name: /Billing/i });
      expect(billingElements.length).toBeGreaterThan(0);
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('does not include Billing when enabled but no paid plans, no subscription, and no statements', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = true;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = false;

      fixtures.clerk.billing.getSubscription.mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [],
      } as any);
      fixtures.clerk.billing.getStatements.mockResolvedValue({ data: [], total_count: 0 } as any);

      render(<UserProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByRole('button', { name: /Billing/i })).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('does not include Billing when user has no user-paid plans, no subscription, and no statements even if organization billing has paid plans', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = true;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = false;
      fixtures.environment.commerceSettings.billing.organization.enabled = true;
      fixtures.environment.commerceSettings.billing.organization.hasPaidPlans = true;

      fixtures.clerk.billing.getSubscription.mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [],
      } as any);
      fixtures.clerk.billing.getStatements.mockResolvedValue({ data: [], total_count: 0 } as any);

      render(<UserProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByRole('button', { name: /Billing/i })).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('does not include Billing when enabled, no paid plans, subscription is null, and no statements', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = true;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = false;

      fixtures.clerk.billing.getSubscription.mockResolvedValue(null);
      fixtures.clerk.billing.getStatements.mockResolvedValue({ data: [], total_count: 0 } as any);

      render(<UserProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByRole('button', { name: /Billing/i })).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });

    it('does not include Billing when enabled, no paid plans, subscription is free-only, and no statements', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.commerceSettings.billing.user.enabled = true;
      fixtures.environment.commerceSettings.billing.user.hasPaidPlans = false;

      fixtures.clerk.billing.getSubscription.mockResolvedValue({
        id: 'sub_top',
        subscriptionItems: [
          {
            id: 'sub_item_1',
            plan: { hasBaseFee: false },
          },
        ],
      } as any);
      fixtures.clerk.billing.getStatements.mockResolvedValue({ data: [], total_count: 0 } as any);

      render(<UserProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByRole('button', { name: /Billing/i })).toBeNull());
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
      expect(fixtures.clerk.billing.getStatements).toHaveBeenCalled();
    });
  });

  describe('API Keys visibility', () => {
    it('does not include API Keys when hide prop is true', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.apiKeysSettings.user_api_keys_enabled = true;
      props.setProps({ apiKeysProps: { hide: true } });

      render(<UserProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByRole('button', { name: /API keys/i })).toBeNull());
    });

    it('includes API Keys when hide prop is false and user_api_keys_enabled is true', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.apiKeysSettings.user_api_keys_enabled = true;
      props.setProps({ apiKeysProps: { hide: false } });

      render(<UserProfile />, { wrapper });
      const apiKeysElements = await screen.findAllByRole('button', { name: /API keys/i });
      expect(apiKeysElements.length).toBeGreaterThan(0);
    });

    it('includes API Keys when hide prop is not set and user_api_keys_enabled is true', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.apiKeysSettings.user_api_keys_enabled = true;

      render(<UserProfile />, { wrapper });
      const apiKeysElements = await screen.findAllByRole('button', { name: /API keys/i });
      expect(apiKeysElements.length).toBeGreaterThan(0);
    });

    it('does not include API Keys when user_api_keys_enabled is false even if hide is false', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      fixtures.environment.apiKeysSettings.user_api_keys_enabled = false;
      props.setProps({ apiKeysProps: { hide: false } });

      render(<UserProfile />, { wrapper });
      await waitFor(() => expect(screen.queryByRole('button', { name: /API keys/i })).toBeNull());
    });
  });
});
