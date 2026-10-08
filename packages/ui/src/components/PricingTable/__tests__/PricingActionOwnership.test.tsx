import type { BillingPlanResource } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';

import { usePricingTableModel } from '../pricing-table.model';

const state = vi.hoisted(() => ({
  plans: [] as BillingPlanResource[],
  payer: 'user' as 'user' | 'organization',
  refresh: vi.fn(),
}));

vi.mock('../../../contexts', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../contexts')>()),
  usePlans: () => ({ data: state.plans }),
  useSubscription: () => ({ data: { id: 'subscription_1' }, subscriptionItems: [] }),
  usePaymentMethods: () => ({}),
  useSubscriberTypeContext: () => state.payer,
  usePlansContext: () => ({ revalidateAll: state.refresh }),
}));

const { createFixtures } = bindCreateFixtures('PricingTable');
const money = { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' };
function plan(): BillingPlanResource {
  return {
    id: 'plan_1',
    fee: money,
    annualMonthlyFee: money,
    unitPrices: [
      {
        name: 'seats',
        blockSize: 1,
        tiers: [{ id: 'tier_1', startsAtBlock: 1, endsAfterBlock: 10, feePerBlock: money }],
      },
    ],
  } as BillingPlanResource;
}

async function setup() {
  const { wrapper, fixtures, props } = await createFixtures(f => {
    f.withBilling();
    f.withOrganizations();
    f.withUser({
      email_addresses: ['test@clerk.com'],
      organization_memberships: [{ name: 'org_first', members_count: 2, pending_invitations_count: 0 }],
    });
  });
  props.setProps({});
  vi.spyOn(fixtures.clerk.session!, 'checkAuthorization').mockReturnValue(true);
  const hook = renderHook(() => usePricingTableModel({}), { wrapper });
  return { ...hook, fixtures };
}

beforeEach(() => {
  state.plans = [plan()];
  state.payer = 'user';
  state.refresh.mockReset();
});

describe('Pricing action ownership', () => {
  it('opens checkout with the displayed ID and billing period', async () => {
    const { result, fixtures } = await setup();
    act(() => {
      expect(result.current.selectPlan('plan_1', 'annual')).toBe(true);
    });
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ planId: 'plan_1', planPeriod: 'annual', for: 'user' }),
    );
  });

  it('uses the current resource when a retained action runs after refresh', async () => {
    const { result, rerender, fixtures } = await setup();
    const retained = result.current.selectPlan;
    state.plans = [{ ...plan(), annualMonthlyFee: null }];
    rerender();
    act(() => {
      expect(retained('plan_1', 'annual')).toBe(true);
    });
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ planId: 'plan_1', planPeriod: 'month' }),
    );
  });

  it('does not open checkout or details for a removed plan', async () => {
    const { result, rerender, fixtures } = await setup();
    const retained = result.current;
    state.plans = [];
    rerender();
    act(() => {
      expect(retained.selectPlan('plan_1', 'annual')).toBe(false);
      expect(retained.showPlanDetails('plan_1', 'annual')).toBe(false);
    });
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
    expect(fixtures.clerk.__internal_openPlanDetails).not.toHaveBeenCalled();
  });

  it.each(['user', 'session', 'organization'] as const)(
    'rejects actions when the current %s changes before rendering',
    async resource => {
      state.payer = 'organization';
      const { result, fixtures } = await setup();
      const retained = result.current;
      vi.spyOn(fixtures.clerk, resource, 'get').mockReturnValue({
        ...fixtures.clerk[resource]!,
        id: `${resource}_second`,
      } as never);
      act(() => {
        expect(retained.selectPlan('plan_1', 'annual')).toBe(false);
        expect(retained.showPlanDetails('plan_1', 'annual')).toBe(false);
      });
      expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
      expect(fixtures.clerk.__internal_openPlanDetails).not.toHaveBeenCalled();
    },
  );

  it('rejects a retained action after the payer type changes', async () => {
    const { result, rerender, fixtures } = await setup();
    const retained = result.current.selectPlan;
    state.payer = 'organization';
    rerender();
    act(() => {
      expect(retained('plan_1', 'annual')).toBe(false);
    });
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
  });

  it('does not revive old actions or completion after the payer changes away and back', async () => {
    const { result, rerender, fixtures } = await setup();
    const retained = result.current.selectPlan;
    act(() => {
      retained('plan_1', 'annual');
    });
    const options = fixtures.clerk.__internal_openCheckout.mock.calls[0][0];
    fixtures.clerk.__internal_openCheckout.mockClear();
    state.payer = 'organization';
    rerender();
    state.payer = 'user';
    rerender();
    act(() => {
      expect(retained('plan_1', 'annual')).toBe(false);
      options.onSubscriptionComplete?.();
      options.onClose?.();
    });
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
    expect(state.refresh).not.toHaveBeenCalled();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('checks current organization permission before opening checkout', async () => {
    state.payer = 'organization';
    const { result, fixtures } = await setup();
    vi.mocked(fixtures.clerk.session!.checkAuthorization).mockReturnValue(false);
    act(() => {
      expect(result.current.selectPlan('plan_1', 'annual')).toBe(false);
    });
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
  });

  it('checks current seat usage before opening organization checkout', async () => {
    state.payer = 'organization';
    const { result, fixtures } = await setup();
    fixtures.clerk.organization!.membersCount = 11;
    act(() => {
      expect(result.current.selectPlan('plan_1', 'annual')).toBe(false);
    });
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
  });

  it('allows organization checkout at the current seat limit', async () => {
    state.payer = 'organization';
    const { result, fixtures } = await setup();
    fixtures.clerk.organization!.membersCount = 10;
    act(() => {
      expect(result.current.selectPlan('plan_1', 'annual')).toBe(true);
    });
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ for: 'organization' }),
    );
  });

  it('rejects retained actions after unmount', async () => {
    const { result, unmount, fixtures } = await setup();
    const retained = result.current;
    unmount();
    act(() => {
      expect(retained.selectPlan('plan_1', 'annual')).toBe(false);
      expect(retained.showPlanDetails('plan_1', 'annual')).toBe(false);
    });
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
    expect(fixtures.clerk.__internal_openPlanDetails).not.toHaveBeenCalled();
  });

  it('keeps checkout completion valid after the source unmounts and handles it once', async () => {
    const { result, unmount, fixtures } = await setup();
    act(() => {
      result.current.selectPlan('plan_1', 'annual');
    });
    const options = fixtures.clerk.__internal_openCheckout.mock.calls[0][0];
    unmount();
    act(() => {
      options.onSubscriptionComplete?.();
      options.onSubscriptionComplete?.();
      options.onClose?.();
      options.onClose?.();
    });
    expect(state.refresh).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).toHaveBeenCalledExactlyOnceWith({ session: fixtures.clerk.session!.id });
  });

  it.each(['user', 'session', 'organization'] as const)(
    'ignores checkout completion after the %s changes',
    async resource => {
      state.payer = 'organization';
      const { result, fixtures } = await setup();
      act(() => {
        result.current.selectPlan('plan_1', 'annual');
      });
      const options = fixtures.clerk.__internal_openCheckout.mock.calls[0][0];
      vi.spyOn(fixtures.clerk, resource, 'get').mockReturnValue({
        ...fixtures.clerk[resource]!,
        id: `${resource}_second`,
      } as never);
      act(() => {
        options.onSubscriptionComplete?.();
        options.onClose?.();
      });
      expect(state.refresh).not.toHaveBeenCalled();
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    },
  );
});
