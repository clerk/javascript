import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { deferred, tick } from '../../machines/__tests__/test-utils';
import { organizationBillingPaymentMethodsMakeDefaultMachine } from '../organization-billing-payment-methods-section-make-default.machine';

function start(makeDefault = vi.fn(() => Promise.resolve())) {
  const actor = createActor(organizationBillingPaymentMethodsMakeDefaultMachine, {
    context: { makeDefault },
  });
  actor.start();
  return { actor, makeDefault };
}

describe('organizationBillingPaymentMethodsMakeDefaultMachine', () => {
  it('marks the chosen method pending while the mutation is in flight', () => {
    const gate = deferred<void>();
    const { actor, makeDefault } = start(vi.fn(() => gate.promise));

    actor.send({ type: 'MAKE_DEFAULT', paymentMethodId: 'pm_1' });

    expect(actor.getSnapshot().value).toBe('submitting');
    expect(actor.getSnapshot().context.pendingId).toBe('pm_1');
    expect(makeDefault).toHaveBeenCalledWith({ paymentMethodId: 'pm_1' });
  });

  it('clears the pending id and returns to idle on success', async () => {
    const { actor } = start();

    actor.send({ type: 'MAKE_DEFAULT', paymentMethodId: 'pm_1' });
    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.pendingId).toBe('');
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('records the error and clears the pending id on failure', async () => {
    const { actor } = start(vi.fn(() => Promise.reject(new Error('declined'))));

    actor.send({ type: 'MAKE_DEFAULT', paymentMethodId: 'pm_1' });
    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.pendingId).toBe('');
    expect(actor.getSnapshot().context.error).toBe('declined');
  });
});
