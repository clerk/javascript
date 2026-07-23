import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import { organizationBillingPaymentMethodsRemoveMachine } from '../organization-billing-payment-methods-section-remove.machine';

function start() {
  const removePaymentMethod = vi.fn(() => Promise.resolve());
  const actor = createActor(organizationBillingPaymentMethodsRemoveMachine, {
    context: { removePaymentMethod },
  });
  actor.start();
  return { actor, removePaymentMethod };
}

describe('organizationBillingPaymentMethodsRemoveMachine', () => {
  it('opens the confirmation for the chosen payment method', () => {
    const { actor } = start();

    actor.send({ type: 'OPEN', paymentMethod: { id: 'pm_1', label: 'visa ⋯ 4242' } });

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(actor.getSnapshot().context.paymentMethodId).toBe('pm_1');
    expect(actor.getSnapshot().context.paymentMethodLabel).toBe('visa ⋯ 4242');
  });

  it('removes the opened payment method on confirm, then returns to idle', async () => {
    const { actor, removePaymentMethod } = start();

    actor.send({ type: 'OPEN', paymentMethod: { id: 'pm_1', label: 'visa ⋯ 4242' } });
    actor.send({ type: 'CONFIRM' });

    expect(actor.getSnapshot().value).toBe('removing');
    expect(removePaymentMethod).toHaveBeenCalledWith({ paymentMethodId: 'pm_1' });

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('returns to confirming with an error when removal fails', async () => {
    const removePaymentMethod = vi.fn(() => Promise.reject(new Error('nope')));
    const actor = createActor(organizationBillingPaymentMethodsRemoveMachine, {
      context: { removePaymentMethod },
    });
    actor.start();

    actor.send({ type: 'OPEN', paymentMethod: { id: 'pm_1', label: 'visa ⋯ 4242' } });
    actor.send({ type: 'CONFIRM' });

    await tick();

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(actor.getSnapshot().context.error).toBe('nope');
  });

  it('cancels back to idle without removing', () => {
    const { actor, removePaymentMethod } = start();

    actor.send({ type: 'OPEN', paymentMethod: { id: 'pm_1', label: 'visa ⋯ 4242' } });
    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(removePaymentMethod).not.toHaveBeenCalled();
  });
});
