import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { BillingSubscriptionItemResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';
import { Drawer } from '@/ui/elements/Drawer';

import { SubscriptionDetails } from '..';
import { SubscriptionForCancellationContext } from '../subscription-details.context';
import { useSubscriptionDetailsFooterController } from '../subscription-details-footer.controller';
import { useSubscriptionDetailsFooterModel } from '../subscription-details-footer.model';

const state = vi.hoisted(() => ({
  items: [] as BillingSubscriptionItemResource[],
  close: vi.fn(),
  completed: vi.fn(),
  setOpen: vi.fn(),
  selectedId: 'item_1' as string | null,
  payer: 'user' as 'user' | 'organization',
}));

vi.mock('../../../contexts', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../contexts')>()),
  useSubscription: () => ({
    subscriptionItems: state.items,
    data: {
      nextPayment: {
        date: new Date('2026-11-01'),
        amount: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
      },
    },
  }),
  useSubscriberTypeContext: () => state.payer,
}));

vi.mock('@/ui/elements/Drawer', async importOriginal => ({
  ...(await importOriginal<typeof import('@/ui/elements/Drawer')>()),
  useDrawerContext: () => ({ setIsOpen: state.close }),
}));

vi.mock('@/ui/contexts/components/SubscriptionDetails', async importOriginal => ({
  ...(await importOriginal<typeof import('@/ui/contexts/components/SubscriptionDetails')>()),
  useSubscriptionDetailsContext: () => ({ onSubscriptionCancel: state.completed }),
}));

const { createFixtures } = bindCreateFixtures('SubscriptionDetails');

async function renderCancellation() {
  const { wrapper: Fixture, fixtures } = await createFixtures(f => {
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
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>
        <SubscriptionForCancellationContext.Provider
          value={{
            subscriptionId: state.selectedId,
            setSubscriptionId: vi.fn(),
            confirmationOpen: true,
            setConfirmationOpen: state.setOpen,
          }}
        >
          {children}
        </SubscriptionForCancellationContext.Provider>
      </CardStateProvider>
    </Fixture>
  );
  return {
    ...renderHook(
      () => {
        const model = useSubscriptionDetailsFooterModel(state.selectedId);
        return {
          ...useSubscriptionDetailsFooterController(model, {
            confirmationOpen: true,
            setConfirmationOpen: state.setOpen,
            onComplete: state.completed,
            closeDrawer: () => state.close(false),
          }),
          model,
        };
      },
      { wrapper },
    ),
    fixtures,
  };
}

function subscription(cancel: BillingSubscriptionItemResource['cancel']): BillingSubscriptionItemResource {
  return {
    id: 'item_1',
    plan: {
      id: 'plan_1',
      name: 'Test Plan',
      fee: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
      isDefault: false,
    },
    createdAt: new Date('2026-10-01'),
    periodStart: new Date('2026-10-01'),
    canceledAt: null,
    planPeriod: 'month',
    status: 'active',
    periodEnd: new Date('2026-11-01'),
    cancel,
  } as BillingSubscriptionItemResource;
}

beforeEach(() => {
  state.items = [];
  state.close.mockReset();
  state.completed.mockReset();
  state.setOpen.mockReset();
  state.selectedId = 'item_1';
  state.payer = 'user';
});

describe('Subscription cancellation commands', () => {
  it('cancels the refreshed resource for the selected ID', async () => {
    const oldCancel = vi.fn();
    const currentCancel = vi.fn().mockResolvedValue(undefined);
    state.items = [subscription(oldCancel)];
    const { result, rerender } = await renderCancellation();

    state.items = [subscription(currentCancel)];
    rerender();
    await act(() => result.current.cancelSubscription());

    expect(oldCancel).not.toHaveBeenCalled();
    expect(currentCancel).toHaveBeenCalledExactlyOnceWith({ orgId: undefined });
    expect(state.completed).toHaveBeenCalledOnce();
    expect(state.close).toHaveBeenCalledWith(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not cancel a removed selection or report completion', async () => {
    const cancel = vi.fn();
    state.items = [subscription(cancel)];
    const { result, rerender } = await renderCancellation();

    state.items = [];
    rerender();
    await act(() => result.current.cancelSubscription());

    expect(result.current.hasSelection).toBe(false);
    expect(cancel).not.toHaveBeenCalled();
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });

  it('keeps the drawer open and clears pending state when cancellation fails', async () => {
    state.items = [
      subscription(
        vi.fn().mockRejectedValue(
          new ClerkAPIResponseError('Cancellation failed', {
            data: [{ code: 'billing_subscription_cancel_failed', message: 'Cancellation failed' }],
            status: 422,
          }),
        ),
      ),
    ];
    const { result } = await renderCancellation();

    await act(() => result.current.cancelSubscription());

    expect(state.completed).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
  it('shares one cancellation request and keeps confirmation open while pending', async () => {
    const deferred = createDeferredPromise();
    const cancel = vi.fn().mockReturnValue(deferred.promise);
    state.items = [subscription(cancel)];
    const { result } = await renderCancellation();
    const retained = result.current.cancelSubscription;
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = retained();
      second = retained();
      result.current.keepSubscription();
      result.current.onOpenChange(false);
    });
    expect(first).toBe(second);
    expect(cancel).toHaveBeenCalledOnce();
    expect(result.current.isLoading).toBe(true);
    expect(state.setOpen).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve({ id: 'resource', reload: vi.fn() });
      await first;
    });
    expect(state.completed).toHaveBeenCalledOnce();
    expect(state.close).toHaveBeenCalledExactlyOnceWith(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('keeps SDK results inside the model and lets the controller own completion', async () => {
    const resource = { id: 'resource', reload: vi.fn() };
    state.items = [subscription(vi.fn().mockResolvedValue(resource))];
    const { result } = await renderCancellation();
    await expect(result.current.model.cancelSubscription()).resolves.toBe(true);
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });

  it.each(['user', 'organization'] as const)(
    'rejects retained cancellation when the billing %s changes',
    async payer => {
      state.payer = payer;
      const cancel = vi.fn();
      state.items = [subscription(cancel)];
      const { result, fixtures } = await renderCancellation();
      if (payer === 'organization') {
        vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({
          ...fixtures.clerk.organization!,
          id: 'org_second',
        });
      } else {
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
      }
      await act(() => result.current.cancelSubscription());
      expect(cancel).not.toHaveBeenCalled();
      expect(state.completed).not.toHaveBeenCalled();
      expect(state.close).not.toHaveBeenCalled();
    },
  );

  it('rejects retained organization cancellation after its actor changes', async () => {
    state.payer = 'organization';
    const cancel = vi.fn();
    state.items = [subscription(cancel)];
    const { result, fixtures } = await renderCancellation();
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
    await act(() => result.current.cancelSubscription());
    expect(cancel).not.toHaveBeenCalled();
  });

  it('does not complete a cancellation after the active actor changes', async () => {
    const deferred = createDeferredPromise();
    state.items = [subscription(vi.fn().mockReturnValue(deferred.promise))];
    const { result, fixtures } = await renderCancellation();
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.cancelSubscription();
    });
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
    await act(async () => {
      deferred.resolve(undefined);
      await pending;
    });
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('does not close a new selection when an old cancellation completes', async () => {
    const deferred = createDeferredPromise();
    const firstCancel = vi.fn().mockReturnValue(deferred.promise);
    const secondCancel = vi.fn();
    state.items = [subscription(firstCancel), { ...subscription(secondCancel), id: 'item_2' }];
    const { result, rerender } = await renderCancellation();
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.cancelSubscription();
    });
    state.selectedId = 'item_2';
    rerender();
    await act(async () => {
      deferred.resolve(undefined);
      await pending;
    });
    expect(firstCancel).toHaveBeenCalledOnce();
    expect(secondCancel).not.toHaveBeenCalled();
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });

  it('does not cancel or report completion after unmount', async () => {
    const deferred = createDeferredPromise();
    const cancel = vi.fn().mockReturnValue(deferred.promise);
    state.items = [subscription(cancel)];
    const { result, unmount } = await renderCancellation();
    const retained = result.current.cancelSubscription;
    let pending!: Promise<void>;
    act(() => {
      pending = retained();
    });
    unmount();
    await act(async () => {
      deferred.resolve(undefined);
      await pending;
      await retained();
    });
    expect(cancel).toHaveBeenCalledOnce();
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });

  it('clears errors before retry and permits dismissal after failure', async () => {
    const deferred = createDeferredPromise();
    const cancel = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Cancellation failed', {
          data: [{ code: 'billing_subscription_cancel_failed', message: 'Cancellation failed' }],
          status: 422,
        }),
      )
      .mockReturnValueOnce(deferred.promise);
    state.items = [subscription(cancel)];
    const { result } = await renderCancellation();
    await act(() => result.current.cancelSubscription());
    expect(result.current.error).toBe('Cancellation failed');
    act(() => {
      result.current.keepSubscription();
    });
    expect(state.setOpen).toHaveBeenCalledExactlyOnceWith(false);
    expect(result.current.error).toBeUndefined();
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.cancelSubscription();
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      deferred.resolve(undefined);
      await pending;
    });
    expect(state.completed).toHaveBeenCalledOnce();
    expect(state.close).toHaveBeenCalledExactlyOnceWith(false);
  });
  it('cancels for the active organization and suppresses late completion after that organization changes', async () => {
    state.payer = 'organization';
    const deferred = createDeferredPromise();
    const cancel = vi.fn().mockReturnValue(deferred.promise);
    state.items = [subscription(cancel)];
    const { result, fixtures } = await renderCancellation();
    const organizationId = fixtures.clerk.organization!.id;
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.cancelSubscription();
    });
    expect(cancel).toHaveBeenCalledExactlyOnceWith({ orgId: organizationId });
    vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({
      ...fixtures.clerk.organization!,
      id: 'org_second',
    });
    await act(async () => {
      deferred.resolve(undefined);
      await pending;
    });
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });

  it('resolves retained model commands against the refreshed private resource list', async () => {
    const oldCancel = vi.fn();
    const currentCancel = vi.fn().mockResolvedValue({ id: 'resource', reload: vi.fn() });
    state.items = [subscription(oldCancel)];
    const { result, rerender } = await renderCancellation();
    const retained = result.current.model.cancelSubscription;
    state.items = [subscription(currentCancel)];
    rerender();
    await expect(retained()).resolves.toBe(true);
    expect(oldCancel).not.toHaveBeenCalled();
    expect(currentCancel).toHaveBeenCalledExactlyOnceWith({ orgId: undefined });
  });

  it('keeps a new account confirmation open when an old account request completes', async () => {
    const deferred = createDeferredPromise();
    state.items = [subscription(vi.fn().mockReturnValue(deferred.promise))];
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });
    const element = (
      <Drawer.Root
        open
        onOpenChange={state.close}
      >
        <SubscriptionDetails for='user' />
      </Drawer.Root>
    );
    const { getByRole, findByRole, userEvent, rerender } = render(element, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Cancel subscription' }));
    expect(await findByRole('heading', { name: 'Cancel Test Plan Subscription?' })).toBeVisible();
    await userEvent.click(getByRole('button', { name: 'Cancel subscription' }));
    const nextUser = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(nextUser);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      user: nextUser,
    };
    rerender(
      <Drawer.Root
        open
        onOpenChange={state.close}
      >
        <SubscriptionDetails for='user' />
      </Drawer.Root>,
    );
    await userEvent.click(getByRole('button', { name: 'Cancel subscription' }));
    expect(await findByRole('heading', { name: 'Cancel Test Plan Subscription?' })).toBeVisible();
    await act(async () => {
      deferred.resolve(undefined);
      await deferred.promise;
    });
    expect(getByRole('heading', { name: 'Cancel Test Plan Subscription?' })).toBeVisible();
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.close).not.toHaveBeenCalled();
  });
  it('clears the old selection error when another subscription is selected', async () => {
    const cancel = vi.fn().mockRejectedValue(
      new ClerkAPIResponseError('Cancellation failed', {
        data: [{ code: 'billing_subscription_cancel_failed', message: 'Cancellation failed' }],
        status: 422,
      }),
    );
    state.items = [subscription(cancel), { ...subscription(vi.fn()), id: 'item_2' }];
    const { result, rerender } = await renderCancellation();
    await act(() => result.current.cancelSubscription());
    expect(result.current.error).toBe('Cancellation failed');
    state.selectedId = 'item_2';
    rerender();
    expect(result.current.error).toBeUndefined();
  });

  it('rejects retained commands when organization billing permission is removed', async () => {
    state.payer = 'organization';
    const cancel = vi.fn();
    state.items = [subscription(cancel)];
    const { result, fixtures } = await renderCancellation();
    const retained = result.current.model.cancelSubscription;
    vi.mocked(fixtures.clerk.session!.checkAuthorization).mockReturnValue(false);
    await expect(retained()).resolves.toBe(false);
    expect(cancel).not.toHaveBeenCalled();
  });

  it('does not close the drawer if the completion callback changes the active account', async () => {
    state.items = [subscription(vi.fn().mockResolvedValue(undefined))];
    const { result, fixtures } = await renderCancellation();
    state.completed.mockImplementationOnce(() => {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
    });
    await act(() => result.current.cancelSubscription());
    expect(state.completed).toHaveBeenCalledOnce();
    expect(state.close).not.toHaveBeenCalled();
  });
});
