import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';
import { CheckoutContext, SubscriberTypeContext } from '@/ui/contexts';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useCheckoutMutationsController } from '../checkout-mutations.controller';
import { useCheckoutMutationsModel } from '../checkout-mutations.model';
import * as CheckoutPage from '../CheckoutPage';

const { createFixtures } = bindCreateFixtures('Checkout');

const Confirmation = () => {
  const controller = useCheckoutMutationsController(useCheckoutMutationsModel());
  return (
    <button
      type='button'
      onClick={() => void controller.confirmCheckout({})}
    >
      Confirm
    </button>
  );
};

const Status = () => {
  const { checkout } = useCheckout();
  return <span>{checkout.status}</span>;
};

async function setup(planId: string, strict = false, initialStatus = 'needs_confirmation') {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withUser({ email_addresses: ['test@clerk.com'] });
    f.withBilling();
  });
  const completed = vi.fn();
  const resource = {
    id: `checkout_${planId}`,
    status: initialStatus,
    externalClientSecret: `secret_${planId}`,
    externalGatewayId: 'gateway_1',
    plan: { id: planId, name: 'Plan' },
    planPeriod: 'month',
    payer: { id: 'payer_1', userId: fixtures.clerk.user!.id, organizationId: null },
    totals: { grandTotal: { amount: 0 }, totalDueNow: null },
    confirm: vi.fn(() => {
      resource.status = 'completed';
      return Promise.resolve();
    }),
  };
  fixtures.clerk.billing.startCheckout.mockResolvedValue(resource as never);
  const content = (
    <SubscriberTypeContext.Provider value='user'>
      <CheckoutContext.Provider
        value={{ componentName: 'Checkout', planId, planPeriod: 'month', onSubscriptionComplete: completed }}
      >
        <CardStateProvider>
          <CheckoutPage.Root>
            <Status />
            <CheckoutPage.Stage name='needs_confirmation'>
              <Confirmation />
            </CheckoutPage.Stage>
          </CheckoutPage.Root>
        </CardStateProvider>
      </CheckoutContext.Provider>
    </SubscriberTypeContext.Provider>
  );
  const ui = render(strict ? <StrictMode>{content}</StrictMode> : content, { wrapper });
  await waitFor(() => expect(ui.getByText(initialStatus)).toBeVisible());
  return { ...ui, completed, resource, fixtures };
}

describe('Checkout lifecycle ownership', () => {
  it.each([false, true])(
    'notifies once after the real checkout signal removes the form, StrictMode=%s',
    async strict => {
      const { getByRole, queryByRole, getByText, completed, resource, userEvent, fixtures } = await setup(
        `plan_lifecycle_${strict}`,
        strict,
      );
      const flow = fixtures.clerk.__experimental_checkout({
        planId: `plan_lifecycle_${strict}`,
        planPeriod: 'month',
      }).checkout;
      const confirm = flow.confirm.bind(flow);
      const tail = createDeferredPromise();
      vi.spyOn(flow, 'confirm').mockImplementation(async params => {
        const result = await confirm(params);
        await tail.promise;
        return result;
      });
      await userEvent.click(getByRole('button', { name: 'Confirm' }));
      await waitFor(() => expect(getByText('completed')).toBeVisible());
      expect(queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
      expect(resource.confirm).toHaveBeenCalledOnce();
      expect(completed).toHaveBeenCalledOnce();
      await act(async () => {
        tail.resolve(undefined);
        await tail.promise;
      });
      expect(completed).toHaveBeenCalledOnce();
    },
  );

  it('does not report a completion when the initial checkout is already complete', async () => {
    const { completed, resource } = await setup('plan_lifecycle_initial_complete', false, 'completed');
    expect(completed).not.toHaveBeenCalled();
    expect(resource.confirm).not.toHaveBeenCalled();
  });

  it('does not notify after the checkout closes while confirmation is pending', async () => {
    const { getByRole, completed, resource, userEvent, unmount } = await setup('plan_lifecycle_closed');
    let finish!: () => void;
    resource.confirm.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          finish = () => {
            resource.status = 'completed';
            resolve();
          };
        }),
    );
    await userEvent.click(getByRole('button', { name: 'Confirm' }));
    unmount();
    await act(async () => {
      finish();
      await Promise.resolve();
    });
    expect(completed).not.toHaveBeenCalled();
  });
});
