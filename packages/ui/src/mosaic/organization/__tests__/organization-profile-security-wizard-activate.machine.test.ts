import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import type { OrganizationProfileSecurityWizardActivateContext } from '../organization-profile-security-wizard-activate.machine';
import { organizationProfileSecurityWizardActivateMachine } from '../organization-profile-security-wizard-activate.machine';

function start(context: Partial<OrganizationProfileSecurityWizardActivateContext> = {}) {
  const activateConnection = vi.fn(() => Promise.resolve());
  const actor = createActor(organizationProfileSecurityWizardActivateMachine, {
    context: { activateConnection, ...context },
  });
  actor.start();
  return { actor, activateConnection };
}

describe('organizationProfileSecurityWizardActivateMachine', () => {
  it('seeds at idle', () => {
    const { actor } = start();
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('activates the connection and lands on activated', async () => {
    const { actor, activateConnection } = start({ isActive: false });

    actor.send({ type: 'ACTIVATE' });
    expect(actor.getSnapshot().value).toBe('activating');
    expect(activateConnection).toHaveBeenCalledTimes(1);

    await tick();
    expect(actor.getSnapshot().value).toBe('activated');
  });

  it('surfaces the error and returns to idle when activation fails', async () => {
    const activateConnection = vi.fn(() => Promise.reject(new Error('Activation failed')));
    const { actor } = start({ isActive: false, activateConnection });

    actor.send({ type: 'ACTIVATE' });
    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBe('Activation failed');
  });

  it('resets back to idle and clears the error on ENTER', async () => {
    const activateConnection = vi.fn(() => Promise.reject(new Error('Activation failed')));
    const { actor } = start({ isActive: false, activateConnection });
    actor.send({ type: 'ACTIVATE' });
    await tick();
    expect(actor.getSnapshot().context.error).toBe('Activation failed');

    actor.send({ type: 'ENTER' });
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBeNull();
  });
});
