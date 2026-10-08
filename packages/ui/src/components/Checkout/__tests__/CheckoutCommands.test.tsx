import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook } from '@/test/utils';
import { SubscriberTypeContext } from '@/ui/contexts';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useExistingPaymentMethodFormController } from '../checkout-existing-payment-method.controller';
import { useExistingPaymentMethodFormModel } from '../checkout-existing-payment-method.model';
import { useCheckoutMutationsController } from '../checkout-mutations.controller';
import { useCheckoutMutationsModel } from '../checkout-mutations.model';

const state = vi.hoisted(() => ({
  confirm: vi.fn(),
  completed: vi.fn(),
  secret: 'checkout_1',
  subscriberType: 'user' as 'user' | 'organization',
  items: [] as Array<{
    id: string;
    paymentType: 'card';
    cardType: string;
    last4: string;
    status: string;
    isDefault: boolean;
  }>,
}));

vi.mock('@clerk/shared/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/react')>()),
  __experimental_useCheckout: () => ({
    checkout: {
      status: 'needs_confirmation',
      externalClientSecret: state.secret,
      confirm: state.confirm,
      isImmediatePlanChange: true,
      needsPaymentMethod: true,
    },
  }),
}));

vi.mock('../../../contexts', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../contexts')>()),
  useCheckoutContext: () => ({ onSubscriptionComplete: state.completed }),
  usePaymentMethods: () => ({ data: state.items }),
}));

const { createFixtures } = bindCreateFixtures('Checkout');

async function renderCommands(subscriberType: 'user' | 'organization' = 'user') {
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
        <CardStateProvider>{children}</CardStateProvider>
      </SubscriberTypeContext.Provider>
    </Fixture>
  );
  const hook = renderHook(
    () => ({
      card: useCardState(),
      model: useCheckoutMutationsModel(),
      controller: useCheckoutMutationsController(useCheckoutMutationsModel()),
      selection: useExistingPaymentMethodFormController(useExistingPaymentMethodFormModel()),
    }),
    { wrapper },
  );
  return { ...hook, fixtures, wrapper };
}

beforeEach(() => {
  state.items = [];
  state.secret = 'checkout_1';
  state.confirm.mockReset().mockResolvedValue({ error: null, resource: { reload: vi.fn() } });
  state.completed.mockReset();
});

function apiError(message: string) {
  return new ClerkAPIResponseError(message, {
    data: [{ code: 'checkout_failed', message }],
    status: 422,
  });
}

describe('Checkout commands', () => {
  it('does not return SDK results or require a UI error setter', async () => {
    const { result } = await renderCommands();

    await expect(result.current.model.confirmCheckout({ paymentMethodId: 'method_1' })).resolves.toBeUndefined();

    expect(state.confirm).toHaveBeenCalledExactlyOnceWith({ paymentMethodId: 'method_1' });
    expect(state.completed).not.toHaveBeenCalled();
  });

  it('keeps loading until confirmation settles', async () => {
    let finish!: () => void;
    state.confirm.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = () => resolve({ error: null });
        }),
    );
    const { result } = await renderCommands();
    let pending!: Promise<void>;

    await act(async () => {
      pending = result.current.controller.confirmCheckout({ gateway: 'stripe', useTestCard: true });
      await Promise.resolve();
    });
    expect(result.current.controller.isLoading).toBe(true);
    expect(state.completed).not.toHaveBeenCalled();

    await act(async () => {
      finish();
      await pending;
    });
    expect(result.current.controller.isLoading).toBe(false);
    expect(state.completed).not.toHaveBeenCalled();
  });

  it('shows returned errors without reporting completion', async () => {
    state.confirm.mockResolvedValue({ error: apiError('Payment declined') });
    const { result } = await renderCommands();

    await act(() => result.current.controller.confirmCheckout({ gateway: 'stripe', useTestCard: true }));

    expect(result.current.controller.error).toBe('Payment declined');
    expect(result.current.controller.isLoading).toBe(false);
    expect(state.completed).not.toHaveBeenCalled();
  });

  it('clears loading when confirmation rejects', async () => {
    state.confirm.mockRejectedValue(apiError('Confirmation failed'));
    const { result } = await renderCommands();

    await act(() => result.current.controller.confirmCheckout({ gateway: 'stripe', paymentToken: 'token_1' }));

    expect(state.confirm).toHaveBeenCalledExactlyOnceWith({ gateway: 'stripe', paymentToken: 'token_1' });
    expect(result.current.controller.error).toBe('Confirmation failed');
    expect(result.current.controller.isLoading).toBe(false);
    expect(state.completed).not.toHaveBeenCalled();
  });

  it('preserves unknown failures while clearing loading', async () => {
    const failure = new Error('Unexpected failure');
    state.confirm.mockRejectedValue(failure);
    const { result } = await renderCommands();

    await act(async () => {
      await expect(result.current.controller.confirmCheckout({ gateway: 'stripe', useTestCard: true })).rejects.toBe(
        failure,
      );
    });

    expect(result.current.controller.isLoading).toBe(false);
    expect(state.completed).not.toHaveBeenCalled();
  });
  it('refreshes the selected preview while retaining the selected ID', async () => {
    const selected = {
      id: 'method_1',
      paymentType: 'card' as const,
      cardType: 'visa',
      last4: '4242',
      status: 'active',
      isDefault: true,
    };
    state.items = [selected];
    const { result, rerender } = await renderCommands();
    expect(result.current.selection.selectedPaymentMethodId).toBe('method_1');
    expect(result.current.selection.selectedPaymentMethodPreview?.last4Text).toBe('⋯ 4242');

    state.items = [{ ...selected, last4: '5555' }];
    rerender();

    expect(result.current.selection.selectedPaymentMethodId).toBe('method_1');
    expect(result.current.selection.selectedPaymentMethodPreview?.last4Text).toBe('⋯ 5555');

    state.items[0].last4 = '6666';
    rerender();
    expect(result.current.selection.selectedPaymentMethodPreview?.last4Text).toBe('⋯ 6666');
  });
});

describe('Checkout caller ownership', () => {
  it('does not confirm for an inactive caller', async () => {
    const { result } = await renderCommands();
    await result.current.model.confirmCheckout({ paymentMethodId: 'method_1' }, () => false);
    expect(state.confirm).not.toHaveBeenCalled();
    expect(state.completed).not.toHaveBeenCalled();
  });

  it.each([false, true])('ignores late checkout completion with returned error=%s', async hasError => {
    let finish!: (value: unknown) => void;
    state.confirm.mockReturnValue(
      new Promise(resolve => {
        finish = resolve;
      }),
    );
    const { result } = await renderCommands();
    let current = true;
    const pending = result.current.model.confirmCheckout({ paymentMethodId: 'method_1' }, () => current);
    current = false;
    finish({ error: hasError ? apiError('Old checkout failed') : null });
    await expect(pending).resolves.toBeUndefined();
    expect(state.completed).not.toHaveBeenCalled();
  });
});

describe('Checkout request ownership', () => {
  it('shares one pending confirmation across duplicate submissions and renders', async () => {
    const confirmation = createDeferredPromise();
    state.confirm.mockReturnValueOnce(confirmation.promise);
    const { result, rerender } = await renderCommands();
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.controller.confirmCheckout({ gateway: 'stripe', useTestCard: true });
      second = result.current.controller.confirmCheckout({});
    });
    expect(first).toBe(second);
    rerender();
    act(() => {
      second = result.current.controller.confirmCheckout({});
    });
    expect(second).toBe(first);
    expect(state.confirm).toHaveBeenCalledOnce();
    await act(async () => {
      confirmation.resolve({ error: null });
      await first;
    });
    expect(result.current.controller.isLoading).toBe(false);
  });

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks retained commands after canonical %s drift',
    async source => {
      const { result, fixtures } = await renderCommands('organization');
      const retained = result.current.controller;
      vi.spyOn(fixtures.clerk, source, 'get').mockReturnValue({
        ...fixtures.clerk[source],
        id: `${source}_replacement`,
      } as never);
      await act(() => retained.confirmCheckout({}));
      await expect(result.current.model.confirmCheckout({})).resolves.toBeUndefined();
      expect(state.confirm).not.toHaveBeenCalled();
      expect(result.current.controller.isLoading).toBe(false);
    },
  );

  it.each(['success', 'error', 'reject'] as const)(
    'ignores an old %s and keeps the replacement request busy',
    async outcome => {
      const old = createDeferredPromise();
      const next = createDeferredPromise();
      state.confirm.mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);
      const { result, rerender } = await renderCommands();
      const retained = result.current.controller;
      let pending!: Promise<void>;
      act(() => {
        pending = retained.confirmCheckout({});
      });
      expect(result.current.controller.isLoading).toBe(true);
      state.secret = 'checkout_2';
      rerender();
      expect(result.current.controller.isLoading).toBe(false);
      let current!: Promise<void>;
      act(() => {
        current = result.current.controller.confirmCheckout({});
      });
      await act(async () => {
        if (outcome === 'reject') {
          old.reject(apiError('Old checkout failed'));
        } else {
          old.resolve({ error: outcome === 'error' ? apiError('Old checkout failed') : null });
        }
        await pending;
        await retained.confirmCheckout({});
      });
      expect(state.confirm).toHaveBeenCalledTimes(2);
      expect(result.current.controller.isLoading).toBe(true);
      expect(result.current.controller.error).toBeUndefined();
      await act(async () => {
        next.resolve({ error: null });
        await current;
      });
      expect(result.current.controller.isLoading).toBe(false);
    },
  );

  it('blocks retained model and controller commands after unmount', async () => {
    const { result, unmount } = await renderCommands();
    const retained = result.current;
    unmount();
    await retained.model.confirmCheckout({});
    await retained.controller.confirmCheckout({});
    expect(state.confirm).not.toHaveBeenCalled();
  });

  it('does not revive a retained command when the previous checkout returns', async () => {
    const { result, rerender } = await renderCommands();
    const retained = result.current.controller;
    state.secret = 'checkout_2';
    rerender();
    state.secret = 'checkout_1';
    rerender();
    await act(() => retained.confirmCheckout({}));
    expect(state.confirm).not.toHaveBeenCalled();
    await act(() => result.current.controller.confirmCheckout({}));
    expect(state.confirm).toHaveBeenCalledOnce();
  });

  it('clears old errors when the checkout changes', async () => {
    state.confirm.mockResolvedValueOnce({ error: apiError('Old error') });
    const { result, rerender } = await renderCommands();
    await act(() => result.current.controller.confirmCheckout({}));
    expect(result.current.controller.error).toBe('Old error');
    state.secret = 'checkout_2';
    rerender();
    expect(result.current.controller.error).toBeUndefined();
  });

  it('preserves a parent Card error when a nested checkout controller mounts', async () => {
    const { wrapper } = await renderCommands();
    const Child = () => {
      useCheckoutMutationsController(useCheckoutMutationsModel());
      return null;
    };
    const Host = () => {
      const card = useCardState();
      const [show, setShow] = useState(false);
      return (
        <>
          <span>{card.error}</span>
          <button
            type='button'
            onClick={() => {
              card.setError('Parent failure');
              setShow(true);
            }}
          >
            Mount
          </button>
          {show && <Child />}
        </>
      );
    };
    const { getByRole, getByText, userEvent } = render(<Host />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Mount' }));
    expect(getByText('Parent failure')).toBeVisible();
  });

  it('does not start while a different Card request owns loading', async () => {
    const { result } = await renderCommands();
    let release!: () => void;
    act(() => {
      release = result.current.card.beginRequest()!;
    });
    await act(() => result.current.controller.confirmCheckout({}));
    expect(state.confirm).not.toHaveBeenCalled();
    expect(result.current.card.isLoading).toBe(true);
    act(() => {
      release();
    });
  });

  it('resets the selected payment method for a replacement checkout', async () => {
    const method = (id: string) => ({
      id,
      paymentType: 'card' as const,
      cardType: 'visa',
      last4: '4242',
      status: 'active',
      isDefault: id === 'default',
    });
    state.items = [method('default'), method('chosen')];
    const { result, rerender } = await renderCommands();
    act(() => result.current.selection.selectPaymentMethod('chosen'));
    expect(result.current.selection.selectedPaymentMethodId).toBe('chosen');
    state.secret = 'checkout_2';
    rerender();
    expect(result.current.selection.selectedPaymentMethodId).toBe('default');
  });

  it('submits the selected method from controller state and blocks a removed selection', async () => {
    const method = (id: string) => ({
      id,
      paymentType: 'card' as const,
      cardType: 'visa',
      last4: '4242',
      status: 'active',
      isDefault: id === 'default',
    });
    state.items = [method('default'), method('chosen')];
    const { result, rerender } = await renderCommands();
    act(() => result.current.selection.selectPaymentMethod('chosen'));
    const event = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;
    await act(() => result.current.selection.payWithExistingPaymentMethod(event));
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(state.confirm).toHaveBeenCalledExactlyOnceWith({ paymentMethodId: 'chosen' });
    state.items = [method('default')];
    rerender();
    await act(() => result.current.selection.payWithExistingPaymentMethod(event));
    expect(state.confirm).toHaveBeenCalledOnce();
  });
});
