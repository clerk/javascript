import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import { organizationProfileSecurityWizardDomainsRemoveMachine } from '../organization-profile-security-wizard-domains-remove.machine';

function start(removeDomain = vi.fn(() => Promise.resolve())) {
  const actor = createActor(organizationProfileSecurityWizardDomainsRemoveMachine, {
    context: { removeDomain },
  });
  actor.start();
  return { actor, removeDomain };
}

describe('organizationProfileSecurityWizardDomainsRemoveMachine', () => {
  it('opens the confirmation for the chosen domain, carrying the active flag', () => {
    const { actor } = start();

    actor.send({ type: 'OPEN', domainName: 'clerk.com', isConnectionActive: true });

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(actor.getSnapshot().context.domainName).toBe('clerk.com');
    expect(actor.getSnapshot().context.isConnectionActive).toBe(true);
  });

  it('removes the opened domain on confirm, then returns to idle', async () => {
    const { actor, removeDomain } = start();

    actor.send({ type: 'OPEN', domainName: 'clerk.com', isConnectionActive: false });
    actor.send({ type: 'CONFIRM' });

    expect(actor.getSnapshot().value).toBe('deleting');
    expect(removeDomain).toHaveBeenCalledWith('clerk.com');

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('returns to confirming with an error when removal fails', async () => {
    const removeDomain = vi.fn(() => Promise.reject(new Error('nope')));
    const { actor } = start(removeDomain);

    actor.send({ type: 'OPEN', domainName: 'clerk.com', isConnectionActive: false });
    actor.send({ type: 'CONFIRM' });

    await tick();

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(actor.getSnapshot().context.error).toBe('nope');
  });

  it('cancels back to idle without removing', () => {
    const { actor, removeDomain } = start();

    actor.send({ type: 'OPEN', domainName: 'clerk.com', isConnectionActive: false });
    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(removeDomain).not.toHaveBeenCalled();
  });
});
