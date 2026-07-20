import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import { organizationProfileDomainsSectionRemoveMachine } from '../organization-profile-domains-section-remove.machine';

function start() {
  const deleteDomain = vi.fn(() => Promise.resolve());
  const actor = createActor(organizationProfileDomainsSectionRemoveMachine, {
    context: { deleteDomain },
  });
  actor.start();
  return { actor, deleteDomain };
}

describe('organizationProfileDomainsSectionRemoveMachine', () => {
  it('opens the confirmation for the chosen domain', () => {
    const { actor } = start();

    actor.send({ type: 'OPEN', domain: { id: 'dmn_1', name: 'clerk.com' } });

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(actor.getSnapshot().context.domainId).toBe('dmn_1');
    expect(actor.getSnapshot().context.domainName).toBe('clerk.com');
  });

  it('deletes the opened domain on confirm, then returns to idle', async () => {
    const { actor, deleteDomain } = start();

    actor.send({ type: 'OPEN', domain: { id: 'dmn_1', name: 'clerk.com' } });
    actor.send({ type: 'CONFIRM' });

    expect(actor.getSnapshot().value).toBe('deleting');
    expect(deleteDomain).toHaveBeenCalledWith({ domainId: 'dmn_1' });

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('returns to confirming with an error when deletion fails', async () => {
    const deleteDomain = vi.fn(() => Promise.reject(new Error('nope')));
    const actor = createActor(organizationProfileDomainsSectionRemoveMachine, {
      context: { deleteDomain },
    });
    actor.start();

    actor.send({ type: 'OPEN', domain: { id: 'dmn_1', name: 'clerk.com' } });
    actor.send({ type: 'CONFIRM' });

    await tick();

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(actor.getSnapshot().context.error).toBe('nope');
  });

  it('cancels back to idle', () => {
    const { actor, deleteDomain } = start();

    actor.send({ type: 'OPEN', domain: { id: 'dmn_1', name: 'clerk.com' } });
    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(deleteDomain).not.toHaveBeenCalled();
  });
});
