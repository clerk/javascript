import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { BillingPaymentMethodResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { FormEvent, PropsWithChildren } from 'react';
import { StrictMode, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';
import { SubscriberTypeContext } from '@/ui/contexts';
import { ActionRoot } from '@/ui/elements/Action/ActionRoot';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { AddPaymentMethodForCheckout } from '../../Checkout/checkout-add-payment-method';
import { AddPaymentMethodContext } from '../add-payment-method.context';
import { useAddPaymentMethodFormController } from '../add-payment-method.controller';
import { projectPaymentElementCheckout, useAddPaymentMethodFormModel } from '../add-payment-method.model';
import * as AddPaymentMethod from '../AddPaymentMethod';
import {
  useAddPaymentMethodController,
  usePaymentMethodMenuController,
  usePaymentMethodsController,
} from '../payment-methods.controller';
import { useAddPaymentMethodModel, usePaymentMethodsModel } from '../payment-methods.model';
import { RemovePaymentMethodScreen } from '../payment-methods.parts';
import { PaymentMethods } from '../PaymentMethods';

const state = vi.hoisted(() => ({
  items: [] as BillingPaymentMethodResource[],
  revalidate: vi.fn(),
  submit: vi.fn(),
  reset: vi.fn(),
  completed: vi.fn(),
  provider: vi.fn(),
  providerMount: vi.fn(),
  providerUnmount: vi.fn(),
  isProviderReady: true,
  isFormReady: true,
  checkoutSecret: 'checkout_first',
  checkoutConfirm: vi.fn(),
  checkoutCompleted: vi.fn(),
}));

vi.mock('../../../contexts', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../contexts')>()),
  useCheckoutContext: () => ({ onSubscriptionComplete: state.checkoutCompleted }),
  usePaymentMethods: () => ({ data: state.items, isLoading: false, revalidate: state.revalidate }),
}));

vi.mock('@clerk/shared/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/react')>()),
  __experimental_useCheckout: () => ({
    checkout: {
      status: 'needs_confirmation',
      externalClientSecret: state.checkoutSecret,
      confirm: state.checkoutConfirm,
      plan: { id: 'plan_1', name: 'Plan' },
      planPeriod: 'month',
      totals: { grandTotal: { amount: 0 }, totalDueNow: null },
    },
  }),
  __experimental_usePaymentElement: () => ({
    isProviderReady: state.isProviderReady,
    isFormReady: state.isFormReady,
    submit: state.submit,
    reset: state.reset,
  }),
  __experimental_PaymentElementProvider: function PaymentProviderMock({
    children,
    ...props
  }: PropsWithChildren<Record<string, unknown>>) {
    useEffect(() => {
      state.providerMount();
      return () => {
        state.providerUnmount();
      };
    }, []);
    state.provider(props);
    return children;
  },
  __experimental_PaymentElement: () => <div data-testid='payment-element' />,
}));

const { createFixtures } = bindCreateFixtures('UserProfile');

async function createWrapper(subscriberType: 'user' | 'organization' = 'user') {
  const { wrapper: Fixture, fixtures } = await createFixtures(f => {
    f.withUser({
      email_addresses: ['test@clerk.com'],
      organization_memberships: subscriberType === 'organization' ? ['org_first'] : undefined,
    });
    if (subscriberType === 'organization') {
      f.withOrganizations();
    }
    f.withBilling();
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <SubscriberTypeContext.Provider value={subscriberType}>
        <CardStateProvider>
          <AddPaymentMethodContext.Provider
            value={{
              value: {
                headerTitle: undefined,
                headerSubtitle: undefined,
                submitLabel: undefined,
                setHeaderTitle: vi.fn(),
                setHeaderSubtitle: vi.fn(),
                setSubmitLabel: vi.fn(),
                hasCheckout: false,
                cancelAction: undefined,
                onSuccess: state.completed,
              },
            }}
          >
            {children}
          </AddPaymentMethodContext.Provider>
        </CardStateProvider>
      </SubscriberTypeContext.Provider>
    </Fixture>
  );
  return { wrapper, fixtures };
}

function paymentMethod(id: string, isDefault = false): BillingPaymentMethodResource {
  return {
    id,
    paymentType: 'card',
    cardType: 'visa',
    last4: '4242',
    status: 'active',
    isDefault,
    isRemovable: true,
    remove: vi.fn().mockResolvedValue({ id: 'removed', reload: vi.fn() }),
    makeDefault: vi.fn().mockResolvedValue({ id, reload: vi.fn() }),
  } as unknown as BillingPaymentMethodResource;
}

beforeEach(() => {
  state.items = [];
  state.isProviderReady = true;
  state.isFormReady = true;
  state.checkoutSecret = 'checkout_first';
  state.checkoutConfirm.mockReset().mockResolvedValue({ error: null });
  state.checkoutCompleted.mockReset();
  state.providerMount.mockReset();
  state.providerUnmount.mockReset();
  state.provider.mockReset();
  state.revalidate.mockReset().mockResolvedValue({ data: [] });
  state.submit.mockReset().mockResolvedValue({ data: { gateway: 'stripe', paymentToken: 'token_1' }, error: null });
  state.reset.mockReset().mockResolvedValue(undefined);
  state.completed.mockReset().mockResolvedValue(undefined);
});

const submitEvent = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent<HTMLFormElement>;

describe('Payment method commands', () => {
  it('passes a copied checkout snapshot to the provider without SDK methods', async () => {
    const source = {
      plan: { name: 'Plan', reload: vi.fn() },
      totals: { totalDueNow: { amount: 1000, amountFormatted: '10.00' }, grandTotal: { amount: 1200 } },
      planPeriod: 'month' as const,
      confirm: vi.fn(),
    };
    const checkout = projectPaymentElementCheckout(source);
    source.plan.name = 'Changed Plan';
    source.totals.totalDueNow.amount = 9999;
    const { wrapper } = await createWrapper();
    const { getByTestId } = render(
      <AddPaymentMethod.Root
        checkout={checkout}
        onSuccess={state.completed}
      />,
      { wrapper },
    );

    expect(getByTestId('payment-element')).toBeVisible();
    expect(state.provider.mock.lastCall?.[0].checkout).toEqual({
      plan: { name: 'Plan' },
      totals: { totalDueNow: { amount: 1000 }, grandTotal: { amount: 1200 } },
      planPeriod: 'month',
    });
    expect(source.confirm).not.toHaveBeenCalled();
    expect(source.plan.reload).not.toHaveBeenCalled();
  });

  it.each(['remove', 'makeDefault'] as const)('resolves the latest cached resource before %s', async action => {
    const source = paymentMethod('method_1');
    state.items = [source];
    const { wrapper } = await createWrapper();
    const { result, rerender } = renderHook(usePaymentMethodsModel, { wrapper });
    const command = result.current.paymentMethods[0][action];
    const replacement = paymentMethod('method_1');
    state.items = [replacement];
    rerender();
    await expect(command()).resolves.toBe(true);
    expect(source[action]).not.toHaveBeenCalled();
    expect(replacement[action]).toHaveBeenCalledOnce();
    state.items = [];
    rerender();
    await expect(command()).resolves.toBe(false);
    expect(replacement[action]).toHaveBeenCalledOnce();
  });

  it.each(['session', 'client'] as const)('blocks retained list commands after the %s changes', async key => {
    const source = paymentMethod('method_1');
    state.items = [source];
    const { wrapper, fixtures } = await createWrapper();
    const { result } = renderHook(usePaymentMethodsModel, { wrapper });
    vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key]!, id: 'changed' });
    await expect(result.current.paymentMethods[0].remove()).resolves.toBe(false);
    await expect(result.current.paymentMethods[0].makeDefault()).resolves.toBe(false);
    await expect(result.current.revalidate()).resolves.toBe(false);
    expect(source.remove).not.toHaveBeenCalled();
    expect(source.makeDefault).not.toHaveBeenCalled();
    expect(state.revalidate).not.toHaveBeenCalled();
  });

  it.each(['remove', 'makeDefault', 'refresh'] as const)(
    'blocks %s when its caller is already closed',
    async action => {
      const source = paymentMethod('method_1');
      state.items = [source];
      const { wrapper } = await createWrapper();
      const { result } = renderHook(usePaymentMethodsModel, { wrapper });
      const command = action === 'refresh' ? result.current.revalidate : result.current.paymentMethods[0][action];
      await expect(command(() => false)).resolves.toBe(false);
      expect(source.remove).not.toHaveBeenCalled();
      expect(source.makeDefault).not.toHaveBeenCalled();
      expect(state.revalidate).not.toHaveBeenCalled();
    },
  );

  it.each(['session', 'client', 'unmount', 'caller'] as const)(
    'ignores removal success and errors after loss of the %s',
    async loss => {
      const source = paymentMethod('method_1');
      state.items = [source];
      const { wrapper, fixtures } = await createWrapper();
      const { result, unmount } = renderHook(usePaymentMethodsModel, { wrapper });
      const success = createDeferredPromise<BillingPaymentMethodResource>();
      const failure = createDeferredPromise<BillingPaymentMethodResource>();
      vi.mocked(source.remove).mockReturnValueOnce(success.promise).mockReturnValueOnce(failure.promise);
      let open = true;
      const pendingSuccess = result.current.paymentMethods[0].remove(() => open);
      const pendingFailure = result.current.paymentMethods[0].remove(() => open);
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        open = false;
      } else {
        vi.spyOn(fixtures.clerk, loss, 'get').mockReturnValue({ ...fixtures.clerk[loss]!, id: 'changed' });
      }
      success.resolve(source);
      failure.reject(new Error('Old removal failure'));
      await expect(pendingSuccess).resolves.toBe(false);
      await expect(pendingFailure).resolves.toBe(false);
    },
  );

  it('invalidates retained commands when the session changes and changes back', async () => {
    state.items = [paymentMethod('method_1')];
    const { wrapper, fixtures } = await createWrapper();
    const { result, rerender } = renderHook(usePaymentMethodsModel, { wrapper });
    const original = result.current;
    const session = fixtures.clerk.session!;
    const nextSession = { ...session, id: 'session_second' };
    const getter = vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(nextSession);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      session: nextSession,
    };
    rerender();
    getter.mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      session,
    };
    rerender();
    expect(result.current.scope).not.toBe(original.scope);
    await expect(original.paymentMethods[0].remove()).resolves.toBe(false);
    await expect(original.revalidate()).resolves.toBe(false);
    await expect(result.current.paymentMethods[0].remove()).resolves.toBe(true);
    expect(state.items[0].remove).toHaveBeenCalledOnce();
  });

  it.each([false, true])('does not refresh after the removal form alone closes, Strict Mode: %s', async strict => {
    const source = paymentMethod('method_1');
    const completion = createDeferredPromise<BillingPaymentMethodResource>();
    vi.mocked(source.remove).mockReturnValue(completion.promise);
    state.items = [source];
    const { wrapper: Fixture } = await createWrapper();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>{strict ? <StrictMode>{children}</StrictMode> : children}</Fixture>
    );
    const Screen = ({ open }: { open: boolean }) => {
      const model = usePaymentMethodsModel();
      return (
        <ActionRoot
          animate={false}
          onChange={state.completed}
        >
          {open ? (
            <RemovePaymentMethodScreen
              paymentMethod={model.paymentMethods[0]}
              localizationRoot={model.localizationRoot}
              revalidate={model.revalidate}
            />
          ) : null}
        </ActionRoot>
      );
    };
    const { getByRole, userEvent, rerender } = render(<Screen open />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(source.remove).toHaveBeenCalledOnce());
    rerender(<Screen open={false} />);
    await act(async () => {
      completion.resolve(source);
      await completion.promise;
    });
    expect(state.revalidate).not.toHaveBeenCalled();
    expect(state.completed).not.toHaveBeenCalled();
  });

  it('does not release the new list request when an old default request completes', async () => {
    const source = paymentMethod('method_1');
    state.items = [source];
    const first = createDeferredPromise<BillingPaymentMethodResource>();
    const second = createDeferredPromise<BillingPaymentMethodResource>();
    vi.mocked(source.makeDefault).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { wrapper, fixtures } = await createWrapper();
    const { result, rerender } = renderHook(() => usePaymentMethodsController(usePaymentMethodsModel()), { wrapper });
    const oldRow = result.current.paymentMethods[0];
    act(() => oldRow.makeDefault());
    const nextSession = { ...fixtures.clerk.session!, id: 'session_second' };
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(nextSession);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      session: nextSession,
    };
    rerender();
    expect(oldRow.canOpen()).toBe(false);
    expect(result.current.paymentMethods[0].isPending).toBe(false);
    act(() => result.current.paymentMethods[0].makeDefault());
    await act(async () => {
      first.resolve(source);
      await first.promise;
    });
    expect(result.current.paymentMethods[0].isPending).toBe(true);
    expect(state.revalidate).not.toHaveBeenCalled();
    await act(async () => {
      second.resolve(source);
      await second.promise;
    });
    expect(result.current.paymentMethods[0].isPending).toBe(false);
    expect(state.revalidate).toHaveBeenCalledOnce();
  });

  it.each(['session', 'client'] as const)('closes the open payment form when the %s changes', async key => {
    const { wrapper, fixtures } = await createWrapper();
    const { getByRole, getByTestId, queryByTestId, userEvent, rerender } = render(<PaymentMethods />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Add new payment method' }));
    expect(getByTestId('payment-element')).toBeVisible();
    const replacement = { ...fixtures.clerk[key]!, id: 'changed' };
    vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue(replacement);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      [key]: replacement,
    };
    rerender(<PaymentMethods />);
    expect(queryByTestId('payment-element')).not.toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Add new payment method' }));
    expect(getByTestId('payment-element')).toBeVisible();
  });

  it.each(['remove', 'makeDefault', 'refresh'] as const)('blocks a retained %s command after unmount', async action => {
    const source = paymentMethod('method_1');
    state.items = [source];
    const { wrapper } = await createWrapper();
    const { result, unmount } = renderHook(usePaymentMethodsModel, { wrapper });
    const command = action === 'refresh' ? result.current.revalidate : result.current.paymentMethods[0][action];
    unmount();
    await expect(command()).resolves.toBe(false);
    expect(source.remove).not.toHaveBeenCalled();
    expect(source.makeDefault).not.toHaveBeenCalled();
    expect(state.revalidate).not.toHaveBeenCalled();
  });

  it('ignores a refresh error after the form caller closes', async () => {
    const { wrapper } = await createWrapper();
    const failure = createDeferredPromise<unknown>();
    state.revalidate.mockReturnValue(failure.promise);
    const { result } = renderHook(usePaymentMethodsModel, { wrapper });
    let open = true;
    const pending = result.current.revalidate(() => open);
    expect(state.revalidate).toHaveBeenCalledOnce();
    open = false;
    failure.reject(new Error('Old refresh failure'));
    await expect(pending).resolves.toBe(false);
  });

  it.each(['session', 'client', 'unmount', 'caller'] as const)(
    'blocks retained add commands after loss of the %s',
    async loss => {
      const { wrapper, fixtures } = await createWrapper();
      const { result, unmount } = renderHook(useAddPaymentMethodModel, { wrapper });
      if (loss === 'unmount') {
        unmount();
      } else if (loss !== 'caller') {
        vi.spyOn(fixtures.clerk, loss, 'get').mockReturnValue({ ...fixtures.clerk[loss]!, id: 'changed' });
      }
      await expect(
        result.current.addPaymentMethod({ gateway: 'stripe', paymentToken: 'old_token' }, () => loss !== 'caller'),
      ).resolves.toBe(false);
      expect(fixtures.clerk.user!.addPaymentMethod).not.toHaveBeenCalled();
    },
  );

  it.each(['session', 'client', 'unmount', 'caller'] as const)(
    'ignores add success and errors after loss of the %s',
    async loss => {
      const { wrapper, fixtures } = await createWrapper('organization');
      const { result, unmount } = renderHook(useAddPaymentMethodModel, { wrapper });
      const success = createDeferredPromise<unknown>();
      const failure = createDeferredPromise<unknown>();
      fixtures.clerk
        .organization!.addPaymentMethod.mockReturnValueOnce(success.promise)
        .mockReturnValueOnce(failure.promise);
      let open = true;
      const pendingSuccess = result.current.addPaymentMethod({ gateway: 'stripe', paymentToken: 'first' }, () => open);
      const pendingFailure = result.current.addPaymentMethod({ gateway: 'stripe', paymentToken: 'second' }, () => open);
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        open = false;
      } else {
        vi.spyOn(fixtures.clerk, loss, 'get').mockReturnValue({ ...fixtures.clerk[loss]!, id: 'changed' });
      }
      success.resolve(undefined);
      failure.reject(new Error('Old add failure'));
      await expect(pendingSuccess).resolves.toBe(false);
      await expect(pendingFailure).resolves.toBe(false);
      expect(fixtures.clerk.organization!.addPaymentMethod).toHaveBeenCalledTimes(2);
    },
  );

  it('resolves the current billing resource for a retained add command', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const { result } = renderHook(useAddPaymentMethodModel, { wrapper });
    const previous = fixtures.clerk.user!;
    const addPaymentMethod = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...previous, addPaymentMethod });
    const token = { gateway: 'stripe' as const, paymentToken: 'token_1' };
    await expect(result.current.addPaymentMethod(token)).resolves.toBe(true);
    expect(addPaymentMethod).toHaveBeenCalledExactlyOnceWith(token);
    expect(previous.addPaymentMethod).not.toHaveBeenCalled();
  });

  it('invalidates retained add commands when the session changes and changes back', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const { result, rerender } = renderHook(useAddPaymentMethodModel, { wrapper });
    const previous = result.current;
    const session = fixtures.clerk.session!;
    const replacement = { ...session, id: 'session_second' };
    const getter = vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(replacement);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      session: replacement,
    };
    rerender();
    getter.mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources, session };
    rerender();
    const token = { gateway: 'stripe' as const, paymentToken: 'token_1' };
    expect(result.current.scope).not.toBe(previous.scope);
    await expect(previous.addPaymentMethod(token)).resolves.toBe(false);
    await expect(result.current.addPaymentMethod(token)).resolves.toBe(true);
    expect(fixtures.clerk.user!.addPaymentMethod).toHaveBeenCalledOnce();
  });

  it('passes current add errors to the form', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const error = new ClerkAPIResponseError('Add failed', {
      data: [{ code: 'payment_method_invalid', message: 'Add failed' }],
      status: 422,
    });
    fixtures.clerk.user!.addPaymentMethod.mockRejectedValueOnce(error);
    const { result } = renderHook(useAddPaymentMethodModel, { wrapper });
    await expect(result.current.addPaymentMethod({ gateway: 'stripe', paymentToken: 'token_1' })).rejects.toBe(error);
  });

  it.each([false, true])('stops refresh after only the add controller unmounts, Strict Mode: %s', async strict => {
    const { wrapper: Fixture, fixtures } = await createWrapper();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <ActionRoot
          animate={false}
          onChange={state.completed}
        >
          {strict ? <StrictMode>{children}</StrictMode> : children}
        </ActionRoot>
      </Fixture>
    );
    const { result: model } = renderHook(useAddPaymentMethodModel, { wrapper });
    const completion = createDeferredPromise<unknown>();
    fixtures.clerk.user!.addPaymentMethod.mockReturnValue(completion.promise);
    const { result, unmount } = renderHook(() => useAddPaymentMethodController(model.current, state.revalidate), {
      wrapper,
    });
    const pending = result.current.onSuccess({ gateway: 'stripe', paymentToken: 'token_1' });
    expect(fixtures.clerk.user!.addPaymentMethod).toHaveBeenCalledOnce();
    unmount();
    completion.resolve(undefined);
    await pending;
    expect(state.revalidate).not.toHaveBeenCalled();
    expect(state.completed).not.toHaveBeenCalled();
    await expect(model.current.addPaymentMethod({ gateway: 'stripe', paymentToken: 'token_2' })).resolves.toBe(true);
  });

  it('does not close a replacement add action when an old refresh completes', async () => {
    const { wrapper: Fixture } = await createWrapper();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <ActionRoot
          animate={false}
          onChange={state.completed}
        >
          {children}
        </ActionRoot>
      </Fixture>
    );
    const completion = createDeferredPromise<boolean>();
    const addPaymentMethod = vi.fn().mockResolvedValue(true);
    const refresh = vi.fn().mockReturnValueOnce(completion.promise).mockResolvedValue(true);
    const { result, rerender } = renderHook(
      ({ scope }) =>
        useAddPaymentMethodController({ scope, localizationRoot: 'userProfile', addPaymentMethod }, refresh),
      { wrapper, initialProps: { scope: 'first' } },
    );
    const previous = result.current;
    let pending!: Promise<void>;
    await act(async () => {
      pending = previous.onSuccess({ gateway: 'stripe', paymentToken: 'first' });
      await Promise.resolve();
    });
    expect(refresh).toHaveBeenCalledOnce();
    rerender({ scope: 'second' });
    previous.cancel();
    await act(async () => {
      completion.resolve(true);
      await pending;
    });
    expect(state.completed).not.toHaveBeenCalled();
    await act(() => result.current.onSuccess({ gateway: 'stripe', paymentToken: 'second' }));
    expect(state.completed).toHaveBeenCalledExactlyOnceWith(null);
  });

  it('opens removal from the current menu and blocks the retained menu after unmount', async () => {
    state.items = [paymentMethod('method_1')];
    const { wrapper: Fixture } = await createWrapper();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <ActionRoot
          animate={false}
          onChange={state.completed}
        >
          {children}
        </ActionRoot>
      </Fixture>
    );
    const { result, unmount } = renderHook(
      () => {
        const model = usePaymentMethodsModel();
        const data = usePaymentMethodsController(model);
        return usePaymentMethodMenuController(data.paymentMethods[0], data.localizationRoot);
      },
      { wrapper },
    );
    const remove = result.current.actions.find(action => action.isDestructive)!;
    act(() => remove.onClick());
    expect(state.completed).toHaveBeenCalledExactlyOnceWith('remove-method_1');
    state.completed.mockClear();
    unmount();
    remove.onClick();
    expect(state.completed).not.toHaveBeenCalled();
  });

  it('orders the default first without changing the shared query array', async () => {
    const first = paymentMethod('first');
    const second = paymentMethod('second');
    const preferred = paymentMethod('default', true);
    state.items = Object.freeze([first, second, preferred]) as unknown as BillingPaymentMethodResource[];
    const { wrapper } = await createWrapper();
    const { result } = renderHook(usePaymentMethodsModel, { wrapper });

    expect(result.current.paymentMethods.map(item => item.id)).toEqual(['default', 'first', 'second']);
    expect(state.items.map(item => item.id)).toEqual(['first', 'second', 'default']);
  });

  it('does not expose SDK results from remove, default, refresh, or add commands', async () => {
    const source = paymentMethod('method_1');
    state.items = [source];
    const { wrapper, fixtures } = await createWrapper();
    fixtures.clerk.user.addPaymentMethod.mockResolvedValue(source);
    const { result } = renderHook(() => ({ list: usePaymentMethodsModel(), add: useAddPaymentMethodModel() }), {
      wrapper,
    });

    await expect(result.current.list.paymentMethods[0].remove()).resolves.toBe(true);
    await expect(result.current.list.paymentMethods[0].makeDefault()).resolves.toBe(true);
    await expect(result.current.list.revalidate()).resolves.toBe(true);
    await expect(result.current.add.addPaymentMethod({ gateway: 'stripe', paymentToken: 'token_1' })).resolves.toBe(
      true,
    );
    expect(source.remove).toHaveBeenCalledWith({ orgId: undefined });
    expect(source.makeDefault).toHaveBeenCalledWith({ orgId: undefined });
    expect(state.revalidate).toHaveBeenCalledExactlyOnceWith();
  });

  it('updates default ordering when existing payment resources change', async () => {
    const first = paymentMethod('first', true);
    const second = paymentMethod('second');
    state.items = [first, second];
    const { wrapper } = await createWrapper();
    const { result, rerender } = renderHook(usePaymentMethodsModel, { wrapper });

    first.isDefault = false;
    second.isDefault = true;
    rerender();

    expect(result.current.paymentMethods.map(item => item.id)).toEqual(['second', 'first']);
    expect(result.current.paymentMethods[0].isDefault).toBe(true);
    expect(state.items.map(item => item.id)).toEqual(['first', 'second']);
  });

  it('closes the payment form when the active user changes', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const { getByRole, getByTestId, queryByTestId, userEvent, rerender } = render(<PaymentMethods />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Add new payment method' }));
    expect(getByTestId('payment-element')).toBeVisible();

    const nextUser = { ...fixtures.clerk.user!, id: 'user_second', addPaymentMethod: vi.fn() };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(nextUser);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      user: nextUser,
    };
    rerender(<PaymentMethods />);

    expect(queryByTestId('payment-element')).not.toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Add new payment method' }));
    expect(getByTestId('payment-element')).toBeVisible();
  });

  it.each(['user', 'organization'] as const)('rejects retained commands after the active %s changes', async payer => {
    const source = paymentMethod('method_1');
    state.items = [source];
    const { wrapper, fixtures } = await createWrapper(payer);
    const { result } = renderHook(() => ({ list: usePaymentMethodsModel(), add: useAddPaymentMethodModel() }), {
      wrapper,
    });
    const commands = result.current;
    const addToNewSubject = vi.fn();
    const current = payer === 'organization' ? fixtures.clerk.organization! : fixtures.clerk.user!;
    if (payer === 'organization') {
      vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({
        ...fixtures.clerk.organization!,
        id: 'org_second',
        addPaymentMethod: addToNewSubject,
      });
    } else {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({
        ...fixtures.clerk.user!,
        id: 'user_second',
        addPaymentMethod: addToNewSubject,
      });
    }

    await expect(commands.list.paymentMethods[0].remove()).rejects.toMatchObject({ code: 'billing_subject_changed' });
    await expect(commands.list.paymentMethods[0].makeDefault()).rejects.toMatchObject({
      code: 'billing_subject_changed',
    });
    await expect(commands.list.revalidate()).resolves.toBe(false);
    await expect(commands.add.addPaymentMethod({ gateway: 'stripe', paymentToken: 'token_1' })).rejects.toMatchObject({
      code: 'billing_subject_changed',
    });
    expect(source.remove).not.toHaveBeenCalled();
    expect(source.makeDefault).not.toHaveBeenCalled();
    expect(state.revalidate).not.toHaveBeenCalled();
    expect(current.addPaymentMethod).not.toHaveBeenCalled();
    expect(addToNewSubject).not.toHaveBeenCalled();
  });

  it('keeps a failed removal open and closes only after a successful retry', async () => {
    const source = paymentMethod('method_1');
    vi.mocked(source.remove).mockRejectedValueOnce(
      new ClerkAPIResponseError('Cannot remove card', {
        data: [{ code: 'payment_method_invalid', message: 'Cannot remove card' }],
        status: 422,
      }),
    );
    state.items = [source];
    const { wrapper } = await createWrapper();
    const Screen = () => {
      const model = usePaymentMethodsModel();
      return (
        <ActionRoot
          animate={false}
          value='remove-method_1'
          onChange={state.completed}
        >
          <RemovePaymentMethodScreen
            paymentMethod={model.paymentMethods[0]}
            localizationRoot={model.localizationRoot}
            revalidate={model.revalidate}
          />
        </ActionRoot>
      );
    };
    const { getByRole, findByText, userEvent } = render(<Screen />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Remove' }));
    expect(await findByText('Cannot remove card')).toBeVisible();
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.revalidate).not.toHaveBeenCalled();
    await userEvent.click(getByRole('button', { name: 'Remove' }));
    expect(source.remove).toHaveBeenCalledTimes(2);
    expect(state.revalidate).toHaveBeenCalledOnce();
    expect(state.completed).toHaveBeenCalledExactlyOnceWith(null);
  });

  it('retries refresh without removing the card twice after removal succeeds', async () => {
    const source = paymentMethod('method_1');
    state.items = [source];
    state.revalidate.mockRejectedValueOnce(
      new ClerkAPIResponseError('Refresh failed', {
        data: [{ code: 'payment_method_invalid', message: 'Refresh failed' }],
        status: 422,
      }),
    );
    const { wrapper } = await createWrapper();
    const Screen = () => {
      const model = usePaymentMethodsModel();
      return (
        <ActionRoot
          animate={false}
          onChange={state.completed}
        >
          <RemovePaymentMethodScreen
            paymentMethod={model.paymentMethods[0]}
            localizationRoot={model.localizationRoot}
            revalidate={model.revalidate}
          />
        </ActionRoot>
      );
    };
    const { getByRole, findByText, userEvent } = render(<Screen />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Remove' }));
    expect(await findByText('Refresh failed')).toBeVisible();
    expect(state.completed).not.toHaveBeenCalled();
    await userEvent.click(getByRole('button', { name: 'Remove' }));
    expect(source.remove).toHaveBeenCalledOnce();
    expect(state.revalidate).toHaveBeenCalledTimes(2);
    expect(state.completed).toHaveBeenCalledExactlyOnceWith(null);
  });

  it('clears default-action errors on retry and releases the list lock after failure', async () => {
    const source = paymentMethod('method_1');
    vi.mocked(source.makeDefault).mockRejectedValueOnce(
      new ClerkAPIResponseError('Default failed', {
        data: [{ code: 'payment_method_invalid', message: 'Default failed' }],
        status: 422,
      }),
    );
    state.items = [source];
    const { wrapper } = await createWrapper();
    const { result } = renderHook(
      () => ({ data: usePaymentMethodsController(usePaymentMethodsModel()), card: useCardState() }),
      { wrapper },
    );
    await act(async () => {
      result.current.data.paymentMethods[0].makeDefault();
      await Promise.resolve();
    });
    expect(result.current.card.error).toBe('Default failed');
    expect(result.current.data.paymentMethods[0].isPending).toBe(false);
    expect(state.revalidate).not.toHaveBeenCalled();
    await act(async () => {
      result.current.data.paymentMethods[0].makeDefault();
      await Promise.resolve();
    });
    expect(result.current.card.error).toBeUndefined();
    expect(source.makeDefault).toHaveBeenCalledTimes(2);
    expect(state.revalidate).toHaveBeenCalledOnce();
  });

  it('rejects retained organization commands when the user changes within the same organization', async () => {
    const source = paymentMethod('method_1');
    state.items = [source];
    const { wrapper, fixtures } = await createWrapper('organization');
    const { result } = renderHook(() => ({ list: usePaymentMethodsModel(), add: useAddPaymentMethodModel() }), {
      wrapper,
    });
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
    await expect(result.current.list.paymentMethods[0].remove()).rejects.toMatchObject({
      code: 'billing_subject_changed',
    });
    await expect(result.current.list.paymentMethods[0].makeDefault()).rejects.toMatchObject({
      code: 'billing_subject_changed',
    });
    await expect(
      result.current.add.addPaymentMethod({ gateway: 'stripe', paymentToken: 'old_token' }),
    ).rejects.toMatchObject({ code: 'billing_subject_changed' });
    await expect(result.current.list.revalidate()).resolves.toBe(false);
    expect(source.remove).not.toHaveBeenCalled();
    expect(source.makeDefault).not.toHaveBeenCalled();
    expect(state.revalidate).not.toHaveBeenCalled();
    expect(fixtures.clerk.organization!.addPaymentMethod).not.toHaveBeenCalled();
  });

  it('resets organization payment forms when the active user changes', async () => {
    const { wrapper, fixtures } = await createWrapper('organization');
    const { getByRole, getByTestId, queryByTestId, userEvent, rerender } = render(<PaymentMethods />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Add new payment method' }));
    expect(getByTestId('payment-element')).toBeVisible();
    const nextUser = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(nextUser);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      user: nextUser,
    };
    rerender(<PaymentMethods />);
    expect(queryByTestId('payment-element')).not.toBeInTheDocument();
  });

  it.each(['remove', 'makeDefault', 'add', 'refresh'] as const)(
    'does not complete %s after its billing scope changes',
    async action => {
      const deferred = createDeferredPromise();
      const source = paymentMethod('method_1');
      state.items = [source];
      const { wrapper, fixtures } = await createWrapper('organization');
      vi.mocked(source.remove).mockReturnValue(deferred.promise as ReturnType<typeof source.remove>);
      vi.mocked(source.makeDefault).mockReturnValue(deferred.promise as ReturnType<typeof source.makeDefault>);
      fixtures.clerk.organization!.addPaymentMethod.mockReturnValue(deferred.promise);
      state.revalidate.mockReturnValue(deferred.promise);
      const { result } = renderHook(() => ({ list: usePaymentMethodsModel(), add: useAddPaymentMethodModel() }), {
        wrapper,
      });
      const pending =
        action === 'add'
          ? result.current.add.addPaymentMethod({ gateway: 'stripe', paymentToken: 'token_1' })
          : action === 'refresh'
            ? result.current.list.revalidate()
            : result.current.list.paymentMethods[0][action]();
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
      deferred.resolve(source);
      await expect(pending).resolves.toBe(false);
    },
  );

  it('blocks repeated default actions across rows while the list action is pending', async () => {
    const deferred = createDeferredPromise();
    const source = paymentMethod('method_1');
    vi.mocked(source.makeDefault).mockReturnValue(deferred.promise as ReturnType<typeof source.makeDefault>);
    const other = paymentMethod('method_2');
    state.items = [source, other];
    const { wrapper: Fixture } = await createWrapper();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <ActionRoot
          animate={false}
          onChange={state.completed}
        >
          {children}
        </ActionRoot>
      </Fixture>
    );
    const { result } = renderHook(
      () => {
        const model = usePaymentMethodsModel();
        return usePaymentMethodsController(model);
      },
      { wrapper },
    );
    const actions = result.current.paymentMethods;
    act(() => {
      actions[0].makeDefault();
      actions[0].makeDefault();
      actions[1].makeDefault();
    });
    expect(source.makeDefault).toHaveBeenCalledOnce();
    expect(result.current.paymentMethods.every(row => row.isPending)).toBe(true);
    expect(actions[0].canOpen()).toBe(false);
    expect(other.makeDefault).not.toHaveBeenCalled();
    expect(state.completed).not.toHaveBeenCalled();
    await act(async () => {
      deferred.resolve(source);
      await deferred.promise;
    });
    expect(state.revalidate).toHaveBeenCalledOnce();
    expect(result.current.paymentMethods.every(row => row.isPending)).toBe(false);
    expect(actions[0].canOpen()).toBe(true);
  });

  it('does not refresh or open a retained menu after unmount', async () => {
    const deferred = createDeferredPromise();
    const source = paymentMethod('method_1');
    vi.mocked(source.makeDefault).mockReturnValue(deferred.promise as ReturnType<typeof source.makeDefault>);
    state.items = [source];
    const { wrapper: Fixture } = await createWrapper();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <ActionRoot
          animate={false}
          onChange={state.completed}
        >
          {children}
        </ActionRoot>
      </Fixture>
    );
    const { result, unmount } = renderHook(
      () => {
        const model = usePaymentMethodsModel();
        return usePaymentMethodsController(model);
      },
      { wrapper },
    );
    const actions = result.current.paymentMethods;
    act(() => {
      actions[0].makeDefault();
    });
    unmount();
    await act(async () => {
      deferred.resolve(source);
      await deferred.promise;
      actions[0].makeDefault();
      expect(actions[0].canOpen()).toBe(false);
    });
    expect(source.makeDefault).toHaveBeenCalledOnce();
    expect(state.revalidate).not.toHaveBeenCalled();
    expect(state.completed).not.toHaveBeenCalled();
  });

  it('waits for add refresh before closing and does not close a replacement action after unmount', async () => {
    const deferred = createDeferredPromise<boolean>();
    const refresh = vi.fn().mockReturnValue(deferred.promise);
    const add = vi.fn().mockResolvedValue(true);
    const { wrapper: Fixture } = await createWrapper();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Fixture>
        <ActionRoot
          animate={false}
          onChange={state.completed}
        >
          {children}
        </ActionRoot>
      </Fixture>
    );
    const { result, unmount } = renderHook(
      () =>
        useAddPaymentMethodController(
          { scope: 'payment-scope', localizationRoot: 'userProfile', addPaymentMethod: add },
          refresh,
        ),
      { wrapper },
    );
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.onSuccess({ gateway: 'stripe', paymentToken: 'token_1' });
      await Promise.resolve();
    });
    expect(refresh).toHaveBeenCalledOnce();
    expect(state.completed).not.toHaveBeenCalled();
    unmount();
    await act(async () => {
      deferred.resolve(true);
      await pending;
    });
    expect(state.completed).not.toHaveBeenCalled();
  });

  it('keeps provider validation errors inside the payment form', async () => {
    state.submit.mockResolvedValue({ data: null, error: { gateway: 'stripe', error: { type: 'validation_error' } } });
    const { wrapper } = await createWrapper();
    const { result } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), { wrapper });

    await act(() => result.current.onSubmit(submitEvent()));

    expect(state.completed).not.toHaveBeenCalled();
    expect(state.reset).not.toHaveBeenCalled();
    expect(result.current.error).toBeUndefined();
  });

  it('displays provider errors without completing or resetting the form', async () => {
    state.submit.mockResolvedValue({
      data: null,
      error: { gateway: 'stripe', error: { type: 'api_error', message: 'Try again' } },
    });
    const { wrapper } = await createWrapper();
    const { result } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), { wrapper });

    await act(() => result.current.onSubmit(submitEvent()));

    expect(result.current.error).toBe('Try again');
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.reset).not.toHaveBeenCalled();
  });

  it('completes with the plain token and resets after completion fails', async () => {
    state.completed.mockRejectedValue(
      new ClerkAPIResponseError('Cannot add card', {
        data: [{ code: 'payment_method_invalid', message: 'Cannot add card' }],
        status: 422,
      }),
    );
    const { wrapper } = await createWrapper();
    const { result } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), { wrapper });

    await act(() => result.current.onSubmit(submitEvent()));

    expect(state.completed).toHaveBeenCalledExactlyOnceWith(
      { gateway: 'stripe', paymentToken: 'token_1' },
      expect.any(Function),
    );
    expect(state.reset).toHaveBeenCalledOnce();
    expect(result.current.error).toBe('Cannot add card');
  });
  it('delays reset until completion settles', async () => {
    let finish!: () => void;
    state.completed.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          finish = resolve;
        }),
    );
    const { wrapper } = await createWrapper();
    const { result } = renderHook(
      () => ({
        form: useAddPaymentMethodFormController(useAddPaymentMethodFormModel()),
        card: useCardState(),
      }),
      { wrapper },
    );
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.form.onSubmit(submitEvent());
      await Promise.resolve();
    });

    expect(state.reset).not.toHaveBeenCalled();
    await act(async () => {
      finish();
      await pending;
    });
    expect(result.current.card.isLoading).toBe(false);
    expect(state.reset).toHaveBeenCalledOnce();
  });

  it('clears loading when the provider submission rejects', async () => {
    state.submit.mockRejectedValue(
      new ClerkAPIResponseError('Submission failed', {
        data: [{ code: 'payment_method_invalid', message: 'Submission failed' }],
        status: 422,
      }),
    );
    const { wrapper } = await createWrapper();
    const { result } = renderHook(
      () => ({
        form: useAddPaymentMethodFormController(useAddPaymentMethodFormModel()),
        card: useCardState(),
      }),
      { wrapper },
    );

    await act(() => result.current.form.onSubmit(submitEvent()));

    expect(result.current.card.isLoading).toBe(false);
    expect(result.current.form.error).toBe('Submission failed');
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.reset).not.toHaveBeenCalled();
  });

  it('shares one pending provider submission across repeated form submissions', async () => {
    const completion = createDeferredPromise();
    state.completed.mockReturnValue(completion.promise);
    const { wrapper } = await createWrapper();
    const { result } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), { wrapper });
    let first!: Promise<void>;
    let second!: Promise<void>;
    await act(async () => {
      first = result.current.onSubmit(submitEvent());
      second = result.current.onSubmit(submitEvent());
      await Promise.resolve();
    });
    expect(first).toBe(second);
    expect(state.submit).toHaveBeenCalledOnce();
    expect(state.completed).toHaveBeenCalledOnce();
    await act(async () => {
      completion.resolve(undefined);
      await first;
    });
    expect(state.reset).toHaveBeenCalledOnce();
  });

  it('keeps the rendered form busy until payment completion settles', async () => {
    const completion = createDeferredPromise();
    state.completed.mockReturnValue(completion.promise);
    const { wrapper } = await createWrapper();
    const { getByRole, userEvent } = render(<AddPaymentMethod.Root onSuccess={state.completed} />, { wrapper });
    const submit = getByRole('button', { name: 'Add Payment Method' });
    await userEvent.click(submit);

    expect(state.completed).toHaveBeenCalledOnce();
    expect(submit).toBeDisabled();
    expect(state.reset).not.toHaveBeenCalled();
    await act(async () => {
      completion.resolve(undefined);
      await completion.promise;
    });
    expect(submit).not.toBeDisabled();
    expect(state.reset).toHaveBeenCalledOnce();
  });

  it('does not complete a provider submission after the form unmounts', async () => {
    const submission = createDeferredPromise();
    state.submit.mockReturnValue(submission.promise);
    const { wrapper } = await createWrapper();
    const { result, unmount } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), {
      wrapper,
    });
    const retainedSubmit = result.current.onSubmit;
    let pending!: Promise<void>;
    act(() => {
      pending = retainedSubmit(submitEvent());
    });
    unmount();
    await act(async () => {
      submission.resolve({ data: { gateway: 'stripe', paymentToken: 'old_token' }, error: null });
      await pending;
      await retainedSubmit(submitEvent());
    });
    expect(state.submit).toHaveBeenCalledOnce();
    expect(state.completed).not.toHaveBeenCalled();
    expect(state.reset).not.toHaveBeenCalled();
  });

  it('does not reset the payment provider when completion outlives the form', async () => {
    const completion = createDeferredPromise();
    state.completed.mockReturnValue(completion.promise);
    const { wrapper } = await createWrapper();
    const { result, unmount } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), {
      wrapper,
    });
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.onSubmit(submitEvent());
      await Promise.resolve();
    });
    expect(state.completed).toHaveBeenCalledOnce();
    unmount();
    await act(async () => {
      completion.resolve(undefined);
      await pending;
    });
    expect(state.reset).not.toHaveBeenCalled();
  });
});

describe('Payment submission ownership', () => {
  it('keeps copied payment tokens private and consumes each token once', async () => {
    const response = { data: { gateway: 'stripe', paymentToken: 'original_token' }, error: null };
    state.submit.mockResolvedValue(response);
    const { wrapper } = await createWrapper();
    const { result } = renderHook(useAddPaymentMethodFormModel, { wrapper });
    await expect(result.current.submit(() => true)).resolves.toEqual({ status: 'ready' });
    response.data.paymentToken = 'changed_token';
    await expect(result.current.complete(() => true)).resolves.toBe(true);
    await expect(result.current.complete(() => true)).resolves.toBe(false);
    expect(state.completed).toHaveBeenCalledExactlyOnceWith(
      { gateway: 'stripe', paymentToken: 'original_token' },
      expect.any(Function),
    );
    expect(result.current).not.toHaveProperty('token');
  });

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks retained commands when the canonical %s changes without a render',
    async source => {
      const { wrapper, fixtures } = await createWrapper('organization');
      const { result } = renderHook(useAddPaymentMethodFormModel, { wrapper });
      const retained = result.current;
      await retained.submit(() => true);
      const resource = fixtures.clerk[source];
      vi.spyOn(fixtures.clerk, source, 'get').mockReturnValue({ ...resource, id: `${source}_replacement` } as never);
      await expect(retained.complete(() => true)).resolves.toBe(false);
      await expect(retained.submit(() => true)).resolves.toEqual({ status: 'cancelled' });
      await retained.reset(() => true);
      expect(state.submit).toHaveBeenCalledOnce();
      expect(state.completed).not.toHaveBeenCalled();
      expect(state.reset).not.toHaveBeenCalled();
    },
  );

  it('discards a token when the caller changes while provider submission is pending', async () => {
    const submission = createDeferredPromise();
    state.submit.mockReturnValue(submission.promise);
    const { wrapper } = await createWrapper();
    const { result } = renderHook(useAddPaymentMethodFormModel, { wrapper });
    let current = true;
    const pending = result.current.submit(() => current);
    current = false;
    submission.resolve({ data: { gateway: 'stripe', paymentToken: 'old_token' }, error: null });
    await expect(pending).resolves.toEqual({ status: 'cancelled' });
    await expect(result.current.complete(() => true)).resolves.toBe(false);
    expect(state.completed).not.toHaveBeenCalled();
  });

  it('uses the latest completion callback for the same payment source', async () => {
    const { wrapper } = await createWrapper();
    const { result, rerender } = renderHook(useAddPaymentMethodFormModel, { wrapper });
    await result.current.submit(() => true);
    const previous = state.completed;
    state.completed = vi.fn().mockResolvedValue(undefined);
    rerender();
    await result.current.complete(() => true);
    expect(previous).not.toHaveBeenCalled();
    expect(state.completed).toHaveBeenCalledOnce();
  });

  it.each(['resolve', 'reject'] as const)('ignores an old provider %s after replacement', async outcome => {
    const submission = createDeferredPromise();
    state.submit.mockReturnValueOnce(submission.promise);
    const { wrapper } = await createWrapper();
    const { result, rerender } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), {
      wrapper,
    });
    const retained = result.current;
    let pending!: Promise<void>;
    act(() => {
      pending = retained.onSubmit(submitEvent());
    });
    state.submit = vi.fn().mockResolvedValue({ data: { gateway: 'stripe', paymentToken: 'new_token' }, error: null });
    rerender();
    await act(() => result.current.onSubmit(submitEvent()));
    expect(state.completed).toHaveBeenCalledExactlyOnceWith(
      { gateway: 'stripe', paymentToken: 'new_token' },
      expect.any(Function),
    );
    const resetCount = state.reset.mock.calls.length;
    await act(async () => {
      if (outcome === 'resolve') {
        submission.resolve({ data: { gateway: 'stripe', paymentToken: 'old_token' }, error: null });
      } else {
        submission.reject(
          new ClerkAPIResponseError('Old provider failed', {
            data: [{ code: 'payment_method_invalid', message: 'Old provider failed' }],
            status: 422,
          }),
        );
      }
      await pending;
      await retained.onSubmit(submitEvent());
    });
    expect(state.completed).toHaveBeenCalledOnce();
    expect(state.reset).toHaveBeenCalledTimes(resetCount);
    expect(state.submit).toHaveBeenCalledOnce();
    expect(result.current.error).toBeUndefined();
  });

  it('does not reset a replacement provider when old completion settles', async () => {
    const completion = createDeferredPromise();
    state.completed.mockReturnValueOnce(completion.promise);
    const { wrapper } = await createWrapper();
    const { result, rerender } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), {
      wrapper,
    });
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.onSubmit(submitEvent());
      await Promise.resolve();
    });
    const guard = state.completed.mock.calls[0][1] as () => boolean;
    expect(guard()).toBe(true);
    state.reset = vi.fn().mockResolvedValue(undefined);
    rerender();
    expect(guard()).toBe(false);
    await act(async () => {
      completion.resolve(undefined);
      await pending;
    });
    expect(state.reset).not.toHaveBeenCalled();
  });

  it('waits for provider reset before it releases the rendered form request', async () => {
    const reset = createDeferredPromise();
    state.reset.mockReturnValueOnce(reset.promise);
    const { wrapper } = await createWrapper();
    const { getByRole, userEvent } = render(<AddPaymentMethod.Root onSuccess={state.completed} />, { wrapper });
    const button = getByRole('button', { name: 'Add Payment Method' });
    await userEvent.click(button);
    expect(state.reset).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
    fireEvent.submit(button.closest('form')!);
    expect(state.submit).toHaveBeenCalledOnce();
    await act(async () => {
      reset.resolve(undefined);
      await reset.promise;
    });
    expect(button).not.toBeDisabled();
  });

  it('shows reset errors and permits a new submission', async () => {
    state.reset.mockRejectedValueOnce(
      new ClerkAPIResponseError('Reset failed', {
        data: [{ code: 'payment_method_invalid', message: 'Reset failed' }],
        status: 422,
      }),
    );
    const { wrapper } = await createWrapper();
    const { result } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), { wrapper });
    await act(() => result.current.onSubmit(submitEvent()));
    expect(result.current.error).toBe('Reset failed');
    await act(() => result.current.onSubmit(submitEvent()));
    expect(state.submit).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeUndefined();
  });

  it('keeps the completion error when reset also fails', async () => {
    const failure = (message: string) =>
      new ClerkAPIResponseError(message, { data: [{ code: 'payment_method_invalid', message }], status: 422 });
    state.completed.mockRejectedValueOnce(failure('Completion failed'));
    state.reset.mockRejectedValueOnce(failure('Reset failed'));
    const { wrapper } = await createWrapper();
    const { result } = renderHook(() => useAddPaymentMethodFormController(useAddPaymentMethodFormModel()), { wrapper });
    await act(() => result.current.onSubmit(submitEvent()));
    expect(result.current.error).toBe('Completion failed');
  });

  it('defers rendering and submission until the payment provider is ready', async () => {
    state.isProviderReady = false;
    state.isFormReady = false;
    const { wrapper } = await createWrapper();
    const { queryByTestId, queryByRole, rerender, getByRole, userEvent } = render(
      <AddPaymentMethod.Root onSuccess={state.completed} />,
      { wrapper },
    );
    expect(queryByTestId('payment-element')).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Add Payment Method' })).not.toBeInTheDocument();
    state.isProviderReady = true;
    rerender(<AddPaymentMethod.Root onSuccess={state.completed} />);
    const button = getByRole('button', { name: 'Add Payment Method' });
    expect(button).toBeDisabled();
    state.isFormReady = true;
    rerender(<AddPaymentMethod.Root onSuccess={state.completed} />);
    await userEvent.click(button);
    expect(state.submit).toHaveBeenCalledOnce();
  });

  it('remounts the provider for checkout changes but preserves it for equal snapshots', async () => {
    const { wrapper } = await createWrapper();
    const checkout = { plan: { name: 'Plan' }, planPeriod: 'month' as const };
    const { rerender } = render(
      <AddPaymentMethod.Root
        checkout={checkout}
        requestKey='checkout_1'
        onSuccess={state.completed}
      />,
      { wrapper },
    );
    expect(state.providerMount).toHaveBeenCalledOnce();
    rerender(
      <AddPaymentMethod.Root
        checkout={{ ...checkout }}
        requestKey='checkout_1'
        onSuccess={state.completed}
      />,
    );
    expect(state.providerMount).toHaveBeenCalledOnce();
    rerender(
      <AddPaymentMethod.Root
        checkout={checkout}
        requestKey='checkout_2'
        onSuccess={state.completed}
      />,
    );
    expect(state.providerMount).toHaveBeenCalledTimes(2);
    expect(state.providerUnmount).toHaveBeenCalledOnce();
    rerender(
      <AddPaymentMethod.Root
        checkout={{ ...checkout, planPeriod: 'annual' }}
        requestKey='checkout_2'
        onSuccess={state.completed}
      />,
    );
    expect(state.providerMount).toHaveBeenCalledTimes(3);
    expect(state.providerUnmount).toHaveBeenCalledTimes(2);
  });

  it('releases loading on source replacement and keeps a new request busy when the old result arrives', async () => {
    const oldSubmission = createDeferredPromise();
    const newSubmission = createDeferredPromise();
    state.submit.mockReturnValueOnce(oldSubmission.promise).mockReturnValueOnce(newSubmission.promise);
    const { wrapper } = await createWrapper();
    const { getByRole, rerender, userEvent } = render(
      <AddPaymentMethod.Root
        requestKey='old_checkout'
        onSuccess={state.completed}
      />,
      { wrapper },
    );
    const oldButton = getByRole('button', { name: 'Add Payment Method' });
    await userEvent.click(oldButton);
    expect(oldButton).toBeDisabled();
    rerender(
      <AddPaymentMethod.Root
        requestKey='new_checkout'
        onSuccess={state.completed}
      />,
    );
    const button = getByRole('button', { name: 'Add Payment Method' });
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    await act(async () => {
      oldSubmission.resolve({ data: { gateway: 'stripe', paymentToken: 'old_token' }, error: null });
      await oldSubmission.promise;
    });
    expect(button).toBeDisabled();
    expect(state.completed).not.toHaveBeenCalled();
    await act(async () => {
      newSubmission.resolve({ data: { gateway: 'stripe', paymentToken: 'new_token' }, error: null });
      await newSubmission.promise;
    });
    expect(state.completed).toHaveBeenCalledExactlyOnceWith(
      { gateway: 'stripe', paymentToken: 'new_token' },
      expect.any(Function),
    );
    expect(button).not.toBeDisabled();
  });

  it('submits once under StrictMode', async () => {
    const { wrapper } = await createWrapper();
    const { getByRole, userEvent } = render(
      <StrictMode>
        <AddPaymentMethod.Root onSuccess={state.completed} />
      </StrictMode>,
      { wrapper },
    );
    await userEvent.click(getByRole('button', { name: 'Add Payment Method' }));
    expect(state.submit).toHaveBeenCalledOnce();
    expect(state.completed).toHaveBeenCalledOnce();
    expect(state.reset).toHaveBeenCalledOnce();
  });
});

describe('Payment form checkout completion', () => {
  it('reports confirmation errors through the form owner and permits retry', async () => {
    state.checkoutConfirm.mockResolvedValueOnce({
      error: new ClerkAPIResponseError('Payment declined', {
        data: [{ code: 'checkout_failed', message: 'Payment declined' }],
        status: 422,
      }),
    });
    const { wrapper } = await createWrapper();
    const { getByRole, getByText, queryAllByText, rerender, userEvent } = render(<AddPaymentMethodForCheckout />, {
      wrapper,
    });
    const button = getByRole('button', { name: 'Subscribe' });
    await userEvent.click(button);
    expect(getByText('Payment declined')).toBeVisible();
    expect(queryAllByText('Payment declined')).toHaveLength(1);
    expect(button).not.toBeDisabled();
    expect(state.checkoutCompleted).not.toHaveBeenCalled();
    expect(state.reset).toHaveBeenCalledOnce();
    state.checkoutSecret = 'checkout_second';
    rerender(<AddPaymentMethodForCheckout />);
    expect(queryAllByText('Payment declined')).toHaveLength(0);
    await userEvent.click(getByRole('button', { name: 'Subscribe' }));
    expect(state.checkoutCompleted).not.toHaveBeenCalled();
    expect(state.checkoutConfirm).toHaveBeenCalledTimes(2);
    expect(state.checkoutConfirm.mock.calls[0][0]).toEqual({ gateway: 'stripe', paymentToken: 'token_1' });
  });

  it.each(['success', 'error'] as const)('ignores old checkout %s after checkout replacement', async outcome => {
    const confirmation = createDeferredPromise();
    state.checkoutConfirm.mockReturnValueOnce(confirmation.promise);
    const { wrapper } = await createWrapper();
    const { getByRole, queryByText, rerender, userEvent } = render(<AddPaymentMethodForCheckout />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Subscribe' }));
    expect(state.checkoutConfirm).toHaveBeenCalledOnce();
    state.checkoutSecret = 'checkout_second';
    rerender(<AddPaymentMethodForCheckout />);
    const button = getByRole('button', { name: 'Subscribe' });
    expect(button).not.toBeDisabled();
    await act(async () => {
      confirmation.resolve(
        outcome === 'success'
          ? { error: null }
          : {
              error: new ClerkAPIResponseError('Old checkout failed', {
                data: [{ code: 'checkout_failed', message: 'Old checkout failed' }],
                status: 422,
              }),
            },
      );
      await confirmation.promise;
    });
    expect(state.checkoutCompleted).not.toHaveBeenCalled();
    expect(state.reset).not.toHaveBeenCalled();
    expect(queryByText('Old checkout failed')).not.toBeInTheDocument();
    await userEvent.click(button);
    expect(state.checkoutCompleted).not.toHaveBeenCalled();
    expect(state.reset).toHaveBeenCalledOnce();
  });

  it('does not refresh or close the payment action after the form caller changes', async () => {
    const addition = createDeferredPromise<() => Promise<boolean>>();
    const add = vi.fn(() => addition.promise);
    const refresh = vi.fn().mockResolvedValue(true);
    const { wrapper } = await createWrapper();
    const ActionWrapper = ({ children }: PropsWithChildren) => (
      <ActionRoot onChange={state.completed}>{children}</ActionRoot>
    );
    const { result } = renderHook(
      () =>
        useAddPaymentMethodController(
          { scope: 'payment-scope', localizationRoot: 'userProfile', addPaymentMethod: add },
          refresh,
        ),
      { wrapper: ({ children }) => wrapper({ children: <ActionWrapper>{children}</ActionWrapper> }) },
    );
    let current = true;
    const pending = result.current.onSuccess({ gateway: 'stripe', paymentToken: 'token_1' }, () => current);
    current = false;
    addition.resolve(true);
    await pending;
    expect(refresh).not.toHaveBeenCalled();
    expect(state.completed).not.toHaveBeenCalled();
  });
});
