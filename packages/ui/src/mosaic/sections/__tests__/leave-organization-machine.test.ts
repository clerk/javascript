import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { leaveOrgMachine } from '../leave-organization-machine';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('leaveOrgMachine', () => {
  it('guards confirmation until the typed organization name matches', () => {
    const leaveOrganization = vi.fn(() => Promise.resolve());
    const actor = createActor(leaveOrgMachine, {
      context: {
        organizationName: 'Acme Inc',
        leaveOrganization,
      },
    });

    actor.start();
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(leaveOrganization).not.toHaveBeenCalled();
  });

  it('invokes the injected leave function after a valid confirmation', async () => {
    const leaveOrganization = vi.fn(() => Promise.resolve());
    const actor = createActor(leaveOrgMachine, {
      context: {
        organizationName: 'Acme Inc',
        leaveOrganization,
      },
    });

    actor.start();
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM' });

    expect(actor.getSnapshot().value).toBe('leaving');
    expect(leaveOrganization).toHaveBeenCalledTimes(1);

    await tick();

    expect(actor.getSnapshot().value).toBe('left');
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('returns to confirming with an error when leaving fails', async () => {
    const leaveOrganization = vi.fn(() => Promise.reject(new Error('nope')));
    const actor = createActor(leaveOrgMachine, {
      context: {
        organizationName: 'Acme Inc',
        leaveOrganization,
      },
    });

    actor.start();
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM' });

    await tick();

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(actor.getSnapshot().context.error).toBe('nope');
  });
});
