import type { BillingPlanResource, BillingSubscriptionResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';

import { PricingTable } from '..';

const { createFixtures } = bindCreateFixtures('PricingTable');
const fee = { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' };
const plan = {
  id: 'plan_1',
  name: 'Public plan',
  slug: 'public',
  description: null,
  fee,
  annualFee: fee,
  annualMonthlyFee: fee,
  hasBaseFee: true,
  isRecurring: true,
  isDefault: false,
  avatarUrl: null,
  publiclyVisible: true,
  features: [],
  freeTrialEnabled: false,
  unitPrices: [],
} as unknown as BillingPlanResource;
const subscription = {
  id: 'subscription_1',
  status: 'active',
  subscriptionItems: [],
  nextPayment: null,
} as unknown as BillingSubscriptionResource;

describe('Pricing account query ownership', () => {
  it.each(['user', 'organization'] as const)('hides previous %s actions while the next account loads', async payer => {
    const deferred = createDeferredPromise<BillingSubscriptionResource>();
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withBilling();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: payer === 'organization' ? ['org_first'] : undefined,
      });
      if (payer === 'organization') {
        f.withOrganizations();
      }
    });
    props.setProps({ for: payer });
    if (payer === 'organization') {
      vi.spyOn(fixtures.clerk.session!, 'checkAuthorization').mockReturnValue(true);
    }
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [plan], total_count: 1 });
    fixtures.clerk.billing.getSubscription.mockResolvedValueOnce(subscription).mockReturnValue(deferred.promise);
    const screen = () => <PricingTable for={payer} />;
    const { findByRole, queryByRole, getByRole, rerender, userEvent } = render(screen(), { wrapper });
    await findByRole('button', { name: 'Subscribe' });
    await userEvent.click(getByRole('switch', { name: /Billed annually/i }));
    const nextUser = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(nextUser);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      user: nextUser,
    };
    rerender(screen());
    await waitFor(() => {
      expect(queryByRole('button', { name: 'Subscribe' })).not.toBeInTheDocument();
    });
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve({ ...subscription, id: 'subscription_second' });
      await deferred.promise;
    });
    await findByRole('button', { name: 'Subscribe' });
    await userEvent.click(getByRole('button', { name: 'Subscribe' }));
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ planId: 'plan_1', for: payer, planPeriod: 'annual' }),
    );
  });
});
