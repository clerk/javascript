import type { BillingSubscriptionItemResource } from '@clerk/shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook } from '@/test/utils';

import { useSubscriptionDetailsActionsController } from '../subscription-details-actions.controller';
import { useSubscriptionDetailsActionsModel } from '../subscription-details-actions.model';
import { SubscriptionDetailsActionsView } from '../subscription-details-actions.view';

const state = vi.hoisted(() => ({
  items: [] as BillingSubscriptionItemResource[],
  payer: 'user' as 'user' | 'organization',
  close: vi.fn(),
  select: vi.fn(),
  refresh: vi.fn(),
  isOpen: true,
}));

vi.mock('../../../contexts', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../contexts')>()),
  useSubscription: () => ({ subscriptionItems: state.items }),
  useSubscriberTypeContext: () => state.payer,
  usePlansContext: () => ({ revalidateAll: state.refresh }),
}));

const { createFixtures } = bindCreateFixtures('SubscriptionDetails');

async function createWrapper() {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withUser({
      email_addresses: ['test@clerk.com'],
      organization_memberships: state.payer === 'organization' ? ['org_first'] : undefined,
    });
    if (state.payer === 'organization') {
      f.withOrganizations();
    }
    f.withBilling();
  });
  if (state.payer === 'organization') {
    vi.spyOn(fixtures.clerk.session!, 'checkAuthorization').mockReturnValue(true);
  }
  return { wrapper, fixtures };
}

function subscription(): BillingSubscriptionItemResource {
  const fee = { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' };
  return {
    id: 'item_1',
    plan: {
      id: 'plan_1',
      name: 'Test Plan',
      fee,
      annualFee: fee,
      annualMonthlyFee: fee,
      isDefault: false,
      reload: vi.fn(),
    },
    canceledAt: null,
    planPeriod: 'month',
    status: 'active',
    cancel: vi.fn(),
  } as unknown as BillingSubscriptionItemResource;
}

function useActions(id = 'item_1') {
  const model = useSubscriptionDetailsActionsModel(id);
  return {
    model,
    controller: useSubscriptionDetailsActionsController(model, {
      isOpen: state.isOpen,
      closeDrawer: state.close,
      selectForCancellation: state.select,
    }),
  };
}

beforeEach(() => {
  state.items = [subscription()];
  state.payer = 'user';
  state.isOpen = true;
  state.close.mockReset();
  state.select.mockReset();
  state.refresh.mockReset();
});

describe('Subscription action ownership', () => {
  it('closes the source drawer before opening checkout with plain plan fields', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const portalRoot = document.createElement('div');
    const { result } = renderHook(
      () => {
        const model = useSubscriptionDetailsActionsModel('item_1', portalRoot);
        return useSubscriptionDetailsActionsController(model, {
          isOpen: true,
          closeDrawer: state.close,
          selectForCancellation: state.select,
        });
      },
      { wrapper },
    );
    act(() => {
      result.current.actions.find(action => action.key === 'switch')!.onClick();
    });
    expect(state.close).toHaveBeenCalledOnce();
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledExactlyOnceWith({
      planId: 'plan_1',
      planPeriod: 'annual',
      for: 'user',
      portalRoot,
      onSubscriptionComplete: expect.any(Function),
    });
    expect(state.close.mock.invocationCallOrder[0]).toBeLessThan(
      fixtures.clerk.__internal_openCheckout.mock.invocationCallOrder[0],
    );
    expect(state.select).not.toHaveBeenCalled();
  });

  it('selects cancellation through the controller and leaves SDK effects unused', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const { result } = renderHook(() => useActions(), { wrapper });
    act(() => {
      result.current.controller.actions.find(action => action.key === 'cancel')!.onClick();
    });
    expect(state.select).toHaveBeenCalledExactlyOnceWith('item_1');
    expect(state.close).not.toHaveBeenCalled();
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
    expect(state.items[0].cancel).not.toHaveBeenCalled();
  });

  it('uses the current private subscription when retained checkout actions run', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const { result, rerender } = renderHook(() => useActions(), { wrapper });
    const retained = result.current.controller.actions.find(action => action.key === 'switch')!.onClick;
    const next = subscription();
    next.plan.id = 'plan_refreshed';
    next.planPeriod = 'annual';
    state.items = [next];
    rerender();
    act(retained);
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ planId: 'plan_refreshed', planPeriod: 'month' }),
    );
  });

  it.each(['removed', 'default', 'past_due'] as const)(
    'does not close or open checkout when the selected subscription becomes %s',
    async change => {
      const { wrapper, fixtures } = await createWrapper();
      const { result, rerender } = renderHook(() => useActions(), { wrapper });
      const retained = result.current.controller.actions.find(action => action.key === 'switch')!.onClick;
      if (change === 'removed') {
        state.items = [];
      } else if (change === 'default') {
        state.items[0].plan.isDefault = true;
      } else {
        state.items[0].status = 'past_due';
      }
      rerender();
      act(retained);
      expect(state.close).not.toHaveBeenCalled();
      expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
    },
  );

  it('prevents a retained cancel action after cancellation eligibility changes', async () => {
    const { wrapper } = await createWrapper();
    const { result } = renderHook(() => useActions(), { wrapper });
    const retained = result.current.controller.actions.find(action => action.key === 'cancel')!.onClick;
    state.items[0].canceledAt = new Date();
    act(retained);
    expect(state.select).not.toHaveBeenCalled();
  });

  it('opens resubscription with the current period and prevents duplicate checkout opens', async () => {
    state.items[0].canceledAt = new Date();
    state.items[0].planPeriod = 'annual';
    const { wrapper, fixtures } = await createWrapper();
    const { result } = renderHook(() => useActions(), { wrapper });
    const retained = result.current.controller.actions.find(action => action.key === 'resubscribe')!.onClick;
    act(() => {
      retained();
      retained();
    });
    expect(state.close).toHaveBeenCalledOnce();
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ planId: 'plan_1', planPeriod: 'annual', for: 'user' }),
    );
  });

  it.each(['user', 'organization'] as const)(
    'does not use retained actions after the billing %s changes',
    async payer => {
      state.payer = payer;
      const { wrapper, fixtures } = await createWrapper();
      const { result } = renderHook(() => useActions(), { wrapper });
      const retained = result.current.controller.actions;
      if (payer === 'organization') {
        vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({
          ...fixtures.clerk.organization!,
          id: 'org_second',
        });
      } else {
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
      }
      act(() => {
        retained.forEach(action => action.onClick());
      });
      expect(state.close).not.toHaveBeenCalled();
      expect(state.select).not.toHaveBeenCalled();
      expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
    },
  );

  it('rejects organization actions after the actor or billing permission changes', async () => {
    state.payer = 'organization';
    const { wrapper, fixtures } = await createWrapper();
    const { result } = renderHook(() => useActions(), { wrapper });
    const retained = result.current.controller.actions;
    vi.mocked(fixtures.clerk.session!.checkAuthorization).mockReturnValue(false);
    act(() => {
      retained.forEach(action => action.onClick());
    });
    vi.mocked(fixtures.clerk.session!.checkAuthorization).mockReturnValue(true);
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
    act(() => {
      retained.forEach(action => action.onClick());
    });
    expect(state.close).not.toHaveBeenCalled();
    expect(state.select).not.toHaveBeenCalled();
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
  });

  it('ignores retained actions when the surface closes or unmounts', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const { result, rerender, unmount } = renderHook(() => useActions(), { wrapper });
    const retained = result.current.controller.actions;
    state.isOpen = false;
    rerender();
    act(() => {
      retained.forEach(action => action.onClick());
    });
    unmount();
    act(() => {
      retained.forEach(action => action.onClick());
    });
    expect(state.close).not.toHaveBeenCalled();
    expect(state.select).not.toHaveBeenCalled();
    expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
  });

  it('ignores retained callbacks when the component now displays a different subscription', async () => {
    const second = subscription();
    second.id = 'item_2';
    state.items.push(second);
    const { wrapper } = await createWrapper();
    const { result, rerender } = renderHook(({ id }) => useActions(id), { wrapper, initialProps: { id: 'item_1' } });
    const retained = result.current.controller.actions;
    rerender({ id: 'item_2' });
    act(() => {
      retained.forEach(action => action.onClick());
    });
    expect(state.select).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });

  it('refreshes once after checkout, including after the source controller unmounts', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const { result, unmount } = renderHook(() => useActions(), { wrapper });
    act(() => {
      result.current.controller.actions.find(action => action.key === 'switch')!.onClick();
    });
    const complete = fixtures.clerk.__internal_openCheckout.mock.lastCall![0]!.onSubscriptionComplete!;
    unmount();
    complete();
    complete();
    expect(state.refresh).toHaveBeenCalledOnce();
  });

  it('does not refresh another account after checkout completion', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const { result } = renderHook(() => useActions(), { wrapper });
    act(() => {
      result.current.controller.actions.find(action => action.key === 'switch')!.onClick();
    });
    const complete = fixtures.clerk.__internal_openCheckout.mock.lastCall![0]!.onSubscriptionComplete!;
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
    complete();
    expect(state.refresh).not.toHaveBeenCalled();
  });

  it('renders cancellation and checkout actions through the real model and controller', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const Screen = () => <SubscriptionDetailsActionsView controller={useActions().controller} />;
    const { getByRole, userEvent } = render(<Screen />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Cancel subscription' }));
    expect(state.select).toHaveBeenCalledExactlyOnceWith('item_1');
    await userEvent.click(getByRole('button', { name: /Switch to annual/ }));
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledOnce();
  });
  it('allows a new checkout when the same surface reopens', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const { result, rerender } = renderHook(() => useActions(), { wrapper });
    act(() => {
      result.current.controller.actions.find(action => action.key === 'switch')!.onClick();
    });
    state.isOpen = false;
    rerender();
    state.isOpen = true;
    rerender();
    act(() => {
      result.current.controller.actions.find(action => action.key === 'switch')!.onClick();
    });
    expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledTimes(2);
  });
});
