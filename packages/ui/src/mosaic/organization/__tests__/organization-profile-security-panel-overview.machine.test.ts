import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import type { OrganizationProfileSecurityPanelOverviewContext } from '../organization-profile-security-panel-overview.machine';
import { organizationProfileSecurityPanelOverviewMachine } from '../organization-profile-security-panel-overview.machine';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const startActor = (context: Partial<OrganizationProfileSecurityPanelOverviewContext>) => {
  const actor = createActor(organizationProfileSecurityPanelOverviewMachine, { context });
  actor.start();
  return actor;
};

describe('organizationProfileSecurityPanelOverviewMachine', () => {
  it('starts idle', () => {
    const actor = startActor({});
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('activates via the injected mutation and returns to idle', async () => {
    const activateConnection = vi.fn(() => Promise.resolve());
    const actor = startActor({ activateConnection });

    actor.send({ type: 'ACTIVATE' });
    expect(actor.getSnapshot().value).toBe('activating');
    expect(activateConnection).toHaveBeenCalledTimes(1);

    await tick();
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('deactivates via the injected mutation and returns to idle', async () => {
    const deactivateConnection = vi.fn(() => Promise.resolve());
    const actor = startActor({ deactivateConnection });

    actor.send({ type: 'DEACTIVATE' });
    expect(actor.getSnapshot().value).toBe('deactivating');
    expect(deactivateConnection).toHaveBeenCalledTimes(1);

    await tick();
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('surfaces the global error message and returns to idle when activate fails', async () => {
    const activateConnection = vi.fn(() => Promise.reject(new Error('boom')));
    const actor = startActor({ activateConnection });

    actor.send({ type: 'ACTIVATE' });
    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBe('boom');
  });

  it('guards remove until the typed org name matches', () => {
    const removeConnection = vi.fn(() => Promise.resolve());
    const actor = startActor({ organizationName: 'Acme Inc', removeConnection });

    actor.send({ type: 'OPEN_REMOVE' });
    actor.send({ type: 'CONFIRM_REMOVE' });

    expect(actor.getSnapshot().value).toBe('confirmingRemove');
    expect(removeConnection).not.toHaveBeenCalled();
  });

  it('removes the connection after a valid confirmation, then returns to idle cleared', async () => {
    const removeConnection = vi.fn(() => Promise.resolve());
    const actor = startActor({ organizationName: 'Acme Inc', removeConnection });

    actor.send({ type: 'OPEN_REMOVE' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM_REMOVE' });

    expect(actor.getSnapshot().value).toBe('removing');
    expect(removeConnection).toHaveBeenCalledTimes(1);

    await tick();
    // Not a final state — the overview stays live so the user can reconfigure.
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().status).toBe('active');
    expect(actor.getSnapshot().context.confirmationValue).toBe('');
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('returns to confirmingRemove with an error when removal fails', async () => {
    const removeConnection = vi.fn(() => Promise.reject(new Error('cannot delete')));
    const actor = startActor({ organizationName: 'Acme Inc', removeConnection });

    actor.send({ type: 'OPEN_REMOVE' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM_REMOVE' });

    await tick();
    expect(actor.getSnapshot().value).toBe('confirmingRemove');
    expect(actor.getSnapshot().context.error).toBe('cannot delete');
  });

  it('clears the typed confirmation + error when the remove dialog is cancelled (reset-on-close)', () => {
    const actor = startActor({ organizationName: 'Acme Inc' });

    actor.send({ type: 'OPEN_REMOVE' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'partial' });
    actor.send({ type: 'CANCEL_REMOVE' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.confirmationValue).toBe('');
    expect(actor.getSnapshot().context.error).toBeNull();
  });
});
