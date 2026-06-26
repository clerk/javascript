import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { deleteOrgMachine } from '../delete-organization-machine';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('deleteOrgMachine', () => {
  it('guards confirmation until the typed organization name matches', () => {
    const destroyOrganization = vi.fn(() => Promise.resolve());
    const actor = createActor(deleteOrgMachine, {
      context: {
        organizationName: 'Acme Inc',
        destroyOrganization,
      },
    });

    actor.start();
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'CONFIRM' });

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(destroyOrganization).not.toHaveBeenCalled();
  });

  it('invokes the injected delete function after a valid confirmation', async () => {
    const destroyOrganization = vi.fn(() => Promise.resolve());
    const actor = createActor(deleteOrgMachine, {
      context: {
        organizationName: 'Acme Inc',
        destroyOrganization,
      },
    });

    actor.start();
    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Acme Inc' });
    actor.send({ type: 'CONFIRM' });

    expect(actor.getSnapshot().value).toBe('deleting');
    expect(destroyOrganization).toHaveBeenCalledTimes(1);

    await tick();

    expect(actor.getSnapshot().value).toBe('deleted');
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('returns to confirming with an error when deletion fails', async () => {
    const destroyOrganization = vi.fn(() => Promise.reject(new Error('nope')));
    const actor = createActor(deleteOrgMachine, {
      context: {
        organizationName: 'Acme Inc',
        destroyOrganization,
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
