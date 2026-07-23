import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import {
  isValidDomain,
  organizationProfileSecurityWizardDomainsAddMachine,
} from '../organization-profile-security-wizard-domains-add.machine';

function start(createDomain = vi.fn(() => Promise.resolve())) {
  const actor = createActor(organizationProfileSecurityWizardDomainsAddMachine, {
    context: { createDomain },
  });
  actor.start();
  return { actor, createDomain };
}

describe('isValidDomain', () => {
  it('accepts bare domains and rejects protocols / single labels / spaces', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('sub.example.co.uk')).toBe(true);
    expect(isValidDomain('EXAMPLE.COM')).toBe(true);
    expect(isValidDomain('https://example.com')).toBe(false);
    expect(isValidDomain('localhost')).toBe(false);
    expect(isValidDomain('example .com')).toBe(false);
  });
});

describe('organizationProfileSecurityWizardDomainsAddMachine', () => {
  it('tracks the draft as the user types', () => {
    const { actor } = start();

    actor.send({ type: 'TYPE_NAME', value: 'clerk.com' });

    expect(actor.getSnapshot().context.draftName).toBe('clerk.com');
  });

  it('creates the submitted domain, then clears the draft on success', async () => {
    const { actor, createDomain } = start();

    actor.send({ type: 'TYPE_NAME', value: 'clerk.com' });
    actor.send({ type: 'SUBMIT', name: 'clerk.com' });

    expect(actor.getSnapshot().value).toBe('creating');
    expect(createDomain).toHaveBeenCalledWith('clerk.com');

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.draftName).toBe('');
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('keeps the draft and surfaces the error when creation fails', async () => {
    const createDomain = vi.fn(() => Promise.reject(new Error('Domain already exists')));
    const { actor } = start(createDomain);

    actor.send({ type: 'TYPE_NAME', value: 'clerk.com' });
    actor.send({ type: 'SUBMIT', name: 'clerk.com' });

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.draftName).toBe('clerk.com');
    expect(actor.getSnapshot().context.error).toBe('Domain already exists');
  });

  it('creates a suggested domain without touching the draft', async () => {
    const { actor, createDomain } = start();

    actor.send({ type: 'TYPE_NAME', value: 'typed.com' });
    actor.send({ type: 'SUBMIT', name: 'suggested.com' });

    expect(createDomain).toHaveBeenCalledWith('suggested.com');

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('refuses to submit an invalid domain', () => {
    const { actor, createDomain } = start();

    actor.send({ type: 'SUBMIT', name: 'not a domain' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(createDomain).not.toHaveBeenCalled();
  });
});
