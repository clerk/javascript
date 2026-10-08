import type { BillingSubscriptionItemResource, BillingSubscriptionResource } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, renderHook } from '@/test/utils';
import { OptionsProvider } from '@/ui/contexts';
import { localizationKeys } from '@/ui/customizables';

import { useSubscriptionsListModel } from '../subscriptions-list.model';
import { SubscriptionsList } from '../SubscriptionsList';

const state = vi.hoisted(() => ({
  items: [] as BillingSubscriptionItemResource[],
  subscription: null as BillingSubscriptionResource | null,
  openDetails: vi.fn(),
  captionDate: new Date('2027-01-01'),
}));

vi.mock('../../../contexts', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../contexts')>()),
  useSubscription: () => ({ subscriptionItems: state.items, data: state.subscription, isLoading: false }),
  usePlansContext: () => ({
    openSubscriptionDetails: state.openDetails,
    captionForSubscription: () => localizationKeys('badge__renewsAt', { date: state.captionDate }),
  }),
}));

const { createFixtures } = bindCreateFixtures('UserProfile');

async function createWrapper() {
  return createFixtures(f => {
    f.withUser({ email_addresses: ['test@clerk.com'] });
    f.withBilling();
  });
}

function subscriptionItem(
  id: string,
  status: BillingSubscriptionItemResource['status'],
  isDefault = false,
): BillingSubscriptionItemResource {
  return {
    id,
    status,
    planPeriod: 'month',
    isFreeTrial: false,
    canceledAt: null,
    plan: {
      id: `plan_${id}`,
      name: id,
      isDefault,
      fee: { amount: 1000, amountFormatted: '10.00', currencySymbol: '$', currency: 'USD' },
    },
    cancel: vi.fn(),
    reload: vi.fn(),
  } as unknown as BillingSubscriptionItemResource;
}

beforeEach(() => {
  state.items = [];
  state.subscription = null;
  state.captionDate = new Date('2027-01-01');
  state.openDetails.mockReset();
});

describe('subscription list model', () => {
  it('puts active rows first without mutating the source or changing order within each group', async () => {
    const { wrapper } = await createWrapper();
    state.items = [
      subscriptionItem('upcoming_1', 'upcoming'),
      subscriptionItem('active_1', 'active'),
      subscriptionItem('past_due', 'past_due'),
      subscriptionItem('active_2', 'active'),
      subscriptionItem('upcoming_2', 'upcoming'),
    ];
    const sourceOrder = state.items.map(item => item.id);
    Object.freeze(state.items);

    const { result } = renderHook(useSubscriptionsListModel, { wrapper });

    expect(result.current.items.map(item => item.id)).toEqual([
      'active_1',
      'active_2',
      'upcoming_1',
      'past_due',
      'upcoming_2',
    ]);
    expect(state.items.map(item => item.id)).toEqual(sourceOrder);
    expect(result.current.items[0]).not.toHaveProperty('plan');
    expect(result.current.items[0]).not.toHaveProperty('cancel');
    expect(result.current.items[0]).not.toHaveProperty('reload');
  });

  it('refreshes row order, display values, and management eligibility after in-place resource updates', async () => {
    const { wrapper } = await createWrapper();
    const first = subscriptionItem('first', 'upcoming', true);
    const second = subscriptionItem('second', 'active', true);
    state.items = [first, second];
    const source = state.items;
    const { result, rerender } = renderHook(useSubscriptionsListModel, { wrapper });
    const before = result.current;

    expect(before.items.map(item => item.id)).toEqual(['second', 'first']);
    expect(before.isManageButtonVisible).toBe(false);

    first.status = 'active';
    first.plan.isDefault = false;
    first.plan.name = 'Updated plan';
    first.plan.fee.amount = 2000;
    first.plan.fee.amountFormatted = '20.00';
    second.status = 'past_due';
    rerender();

    expect(state.items).toBe(source);
    expect(result.current.items.map(item => item.id)).toEqual(['first', 'second']);
    expect(result.current.isManageButtonVisible).toBe(true);
    expect(result.current.items[0]).toMatchObject({ name: 'Updated plan', feeText: '$20' });
    expect(before.items.find(item => item.id === 'first')).toMatchObject({ name: 'first', feeText: '$10' });

    first.plan.isDefault = true;
    rerender();
    expect(result.current.isManageButtonVisible).toBe(false);
  });

  it('copies renewal and caption dates without exposing mutable resource dates', async () => {
    const { wrapper } = await createWrapper();
    const date = state.captionDate;
    state.items = [subscriptionItem('paid', 'active')];
    state.subscription = {
      nextPayment: {
        date,
        totals: { grandTotal: { amount: 1000, amountFormatted: '10.00', currencySymbol: '$', currency: 'USD' } },
      },
    } as unknown as BillingSubscriptionResource;
    const { result, rerender } = renderHook(useSubscriptionsListModel, { wrapper });
    const before = result.current.overview;
    const beforeCaption = result.current.items[0].caption;

    expect(before).toEqual({ amount: '$10.00', date: new Date('2027-01-01') });
    expect(before?.date).not.toBe(date);
    expect(result.current.items[0].caption).toEqual(
      localizationKeys('badge__renewsAt', { date: new Date('2027-01-01') }),
    );

    date.setUTCFullYear(2028);
    rerender();

    expect(result.current.overview?.date).toEqual(new Date('2028-01-01'));
    expect(before?.date).toEqual(new Date('2027-01-01'));
    expect(beforeCaption?.params?.date).not.toBe(date);
    expect(beforeCaption?.params?.date).toEqual(new Date('2027-01-01'));
    expect(result.current.items[0].caption?.params?.date).toEqual(new Date('2028-01-01'));
  });

  it('preserves translation markup and localization attributes in subscription captions', async () => {
    const { wrapper: Fixture } = await createWrapper();
    state.items = [subscriptionItem('paid', 'active')];
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <OptionsProvider value={{ localization: { badge__renewsAt: 'Renews <bold>{{date, date}}</bold>' } }}>
          {children}
        </OptionsProvider>
      </Fixture>
    );
    const { container } = render(
      <SubscriptionsList
        title={localizationKeys('userProfile.billingPage.subscriptionsListSection.title')}
        switchPlansLabel={localizationKeys('userProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan')}
        newSubscriptionLabel={localizationKeys(
          'userProfile.billingPage.subscriptionsListSection.actionLabel__newSubscription',
        )}
        manageSubscriptionLabel={localizationKeys(
          'userProfile.billingPage.subscriptionsListSection.actionLabel__manageSubscription',
        )}
      />,
      { wrapper },
    );

    expect(container.querySelector('[data-localization-key="badge__renewsAt"] strong')).not.toBeNull();
  });
});
