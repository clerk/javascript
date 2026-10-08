import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';
import { Drawer } from '@/ui/elements/Drawer';

import { SubscriptionDetails } from '..';

const { createFixtures } = bindCreateFixtures('SubscriptionDetails');

function subscription(name: string, suffix: string) {
  const fee = { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' };
  return {
    id: `subscription_${suffix}`,
    nextPayment: null,
    status: 'active',
    subscriptionItems: [
      {
        id: `item_${suffix}`,
        plan: { id: `plan_${suffix}`, name, fee, annualFee: fee, annualMonthlyFee: fee, isDefault: false },
        createdAt: new Date('2026-10-01'),
        periodStart: new Date('2026-10-01'),
        periodEnd: new Date('2026-11-01'),
        canceledAt: null,
        planPeriod: 'month',
        status: 'active',
      },
    ],
  };
}

describe('Subscription details query ownership', () => {
  it.each(['user', 'organization'] as const)('hides previous %s actions while the new account loads', async payer => {
    const deferred = createDeferredPromise();
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: payer === 'organization' ? ['org_first'] : undefined,
      });
      if (payer === 'organization') {
        f.withOrganizations();
      }
      f.withBilling();
    });
    if (payer === 'organization') {
      vi.spyOn(fixtures.clerk.session!, 'checkAuthorization').mockReturnValue(true);
    }
    fixtures.clerk.billing.getSubscription
      .mockResolvedValueOnce(subscription('First Plan', 'first'))
      .mockReturnValue(deferred.promise);
    const close = vi.fn();
    const screen = () => (
      <Drawer.Root
        open
        onOpenChange={close}
      >
        <SubscriptionDetails for={payer} />
      </Drawer.Root>
    );
    const { findByText, getByRole, queryByText, queryByRole, rerender, userEvent } = render(screen(), { wrapper });
    expect(await findByText('First Plan')).toBeVisible();
    expect(getByRole('button', { name: /Switch to annual/ })).toBeVisible();
    const nextUser = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(nextUser);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      user: nextUser,
    };
    rerender(screen());
    await waitFor(() => {
      expect(queryByText('First Plan')).not.toBeInTheDocument();
    });
    expect(queryByRole('button', { name: /Switch to annual/ })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Cancel subscription' })).not.toBeInTheDocument();
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve(subscription('Second Plan', 'second'));
      await deferred.promise;
    });
    expect(await findByText('Second Plan')).toBeVisible();
    await userEvent.click(getByRole('button', { name: /Switch to annual/ }));
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ planId: 'plan_second', for: payer }),
    );
  });
});
