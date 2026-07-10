import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { organizationProfileMembersPanelMachine } from '../organization-profile-members-panel.machine';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('organizationProfileMembersPanelMachine', () => {
  it('holds the search value uncommitted until SEARCH_SUBMIT', () => {
    const actor = createActor(organizationProfileMembersPanelMachine);
    actor.start();

    actor.send({ type: 'SEARCH_CHANGE', value: 'alice' });
    expect(actor.getSnapshot().context.search).toBe('alice');
    // The committed query the controller keys off is unchanged until submit.
    expect(actor.getSnapshot().context.query).toBe('');

    actor.send({ type: 'SEARCH_SUBMIT' });
    expect(actor.getSnapshot().context.query).toBe('alice');
  });

  it('invokes the injected remove effect and returns to ready on success', async () => {
    const run = vi.fn(() => Promise.resolve());
    const actor = createActor(organizationProfileMembersPanelMachine);
    actor.start();

    actor.send({ type: 'REMOVE_MEMBER', membershipId: 'mem_1', run });

    expect(actor.getSnapshot().value).toBe('removing');
    expect(actor.getSnapshot().context.pendingMembershipId).toBe('mem_1');
    expect(run).toHaveBeenCalledTimes(1);

    await tick();

    expect(actor.getSnapshot().value).toBe('ready');
    expect(actor.getSnapshot().context.pendingMembershipId).toBeNull();
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('returns to ready with an error message when removal fails', async () => {
    const run = vi.fn(() => Promise.reject(new Error('cannot remove')));
    const actor = createActor(organizationProfileMembersPanelMachine);
    actor.start();

    actor.send({ type: 'REMOVE_MEMBER', membershipId: 'mem_1', run });
    await tick();

    expect(actor.getSnapshot().value).toBe('ready');
    expect(actor.getSnapshot().context.pendingMembershipId).toBeNull();
    expect(actor.getSnapshot().context.error).toBe('cannot remove');
  });

  it('clears a prior error when a new removal starts', async () => {
    const actor = createActor(organizationProfileMembersPanelMachine);
    actor.start();

    actor.send({ type: 'REMOVE_MEMBER', membershipId: 'mem_1', run: () => Promise.reject(new Error('boom')) });
    await tick();
    expect(actor.getSnapshot().context.error).toBe('boom');

    actor.send({ type: 'REMOVE_MEMBER', membershipId: 'mem_2', run: () => Promise.resolve() });
    expect(actor.getSnapshot().context.error).toBeNull();
  });
});
