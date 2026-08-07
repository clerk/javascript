import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import { organizationProfileSecurityWizardDomainsPrepareMachine } from '../organization-profile-security-wizard-domains-prepare.machine';

function start(prepareVerification = vi.fn(() => Promise.resolve())) {
  const actor = createActor(organizationProfileSecurityWizardDomainsPrepareMachine, {
    context: { prepareVerification },
  });
  actor.start();
  return { actor, prepareVerification };
}

describe('organizationProfileSecurityWizardDomainsPrepareMachine', () => {
  it('re-prepares the chosen domain, then returns to idle', async () => {
    const { actor, prepareVerification } = start();

    actor.send({ type: 'PREPARE', domainId: 'dmn_1' });

    expect(actor.getSnapshot().value).toBe('preparing');
    expect(actor.getSnapshot().context.pendingDomainId).toBe('dmn_1');
    expect(prepareVerification).toHaveBeenCalledWith('dmn_1');

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.pendingDomainId).toBe('');
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('surfaces the error and clears the pending domain when prepare fails', async () => {
    const prepareVerification = vi.fn(() => Promise.reject(new Error('DNS lookup failed')));
    const { actor } = start(prepareVerification);

    actor.send({ type: 'PREPARE', domainId: 'dmn_1' });

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.pendingDomainId).toBe('');
    expect(actor.getSnapshot().context.error).toBe('DNS lookup failed');
  });
});
