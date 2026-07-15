import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import { organizationBillingPaymentMethodsAddMachine } from '../organization-billing-payment-methods-section-add.machine';

function start() {
  const addPaymentMethod = vi.fn(() => Promise.resolve());
  const actor = createActor(organizationBillingPaymentMethodsAddMachine, {
    context: { addPaymentMethod },
  });
  actor.start();
  return { actor, addPaymentMethod };
}

describe('organizationBillingPaymentMethodsAddMachine', () => {
  it('opens the add form', () => {
    const { actor } = start();

    actor.send({ type: 'OPEN' });

    expect(actor.getSnapshot().value).toBe('open');
  });

  it('adds the captured payment token on submit, then returns to idle', async () => {
    const { actor, addPaymentMethod } = start();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'SUBMIT', gateway: 'stripe', paymentToken: 'pm_token_123' });

    expect(actor.getSnapshot().value).toBe('submitting');
    expect(addPaymentMethod).toHaveBeenCalledWith({ gateway: 'stripe', paymentToken: 'pm_token_123' });

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('returns to the open form with an error when the add fails', async () => {
    const addPaymentMethod = vi.fn(() => Promise.reject(new Error('card declined')));
    const actor = createActor(organizationBillingPaymentMethodsAddMachine, {
      context: { addPaymentMethod },
    });
    actor.start();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'SUBMIT', gateway: 'stripe', paymentToken: 'pm_token_123' });

    await tick();

    expect(actor.getSnapshot().value).toBe('open');
    expect(actor.getSnapshot().context.error).toBe('card declined');
  });

  it('cancels back to idle without adding', () => {
    const { actor, addPaymentMethod } = start();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(addPaymentMethod).not.toHaveBeenCalled();
  });
});
