import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import type { OrganizationProfileDomainsSectionAddVerifyContext } from '../organization-profile-domains-section-add-verify.machine';
import { organizationProfileDomainsSectionAddVerifyMachine } from '../organization-profile-domains-section-add-verify.machine';

function start(overrides: Partial<OrganizationProfileDomainsSectionAddVerifyContext> = {}) {
  const createDomain = vi.fn(() => Promise.resolve({ id: 'dmn_1', name: 'clerk.com', verified: false }));
  const prepareVerification = vi.fn(() => Promise.resolve());
  const attemptVerification = vi.fn(() => Promise.resolve({ verified: true }));
  const updateEnrollmentMode = vi.fn(() => Promise.resolve());
  const actor = createActor(organizationProfileDomainsSectionAddVerifyMachine, {
    context: { createDomain, prepareVerification, attemptVerification, updateEnrollmentMode, ...overrides },
  });
  actor.start();
  return { actor, createDomain, prepareVerification, attemptVerification, updateEnrollmentMode };
}

describe('organizationProfileDomainsSectionAddVerifyMachine', () => {
  it('OPEN_ADD starts at the name step', () => {
    const { actor } = start();
    actor.send({ type: 'OPEN_ADD' });
    expect(actor.getSnapshot().value).toBe('enteringName');
  });

  it('guards the name step until a name is entered', () => {
    const { actor } = start();
    actor.send({ type: 'OPEN_ADD' });
    expect(actor.can({ type: 'SUBMIT_NAME' })).toBe(false);
    actor.send({ type: 'TYPE_NAME', value: 'clerk.com' });
    expect(actor.can({ type: 'SUBMIT_NAME' })).toBe(true);
  });

  it('creates the domain, then moves to the email step when not yet verified', async () => {
    const { actor, createDomain } = start();
    actor.send({ type: 'OPEN_ADD' });
    actor.send({ type: 'TYPE_NAME', value: 'clerk.com' });
    actor.send({ type: 'SUBMIT_NAME' });

    expect(actor.getSnapshot().value).toBe('creating');
    expect(createDomain).toHaveBeenCalledWith('clerk.com');

    await tick();

    expect(actor.getSnapshot().value).toBe('enteringEmail');
    expect(actor.getSnapshot().context.domainId).toBe('dmn_1');
    expect(actor.getSnapshot().context.domainName).toBe('clerk.com');
  });

  it('skips straight to enrollment when the created domain is already verified', async () => {
    const createDomain = vi.fn(() => Promise.resolve({ id: 'dmn_1', name: 'clerk.com', verified: true }));
    const { actor } = start({ createDomain });
    actor.send({ type: 'OPEN_ADD' });
    actor.send({ type: 'TYPE_NAME', value: 'clerk.com' });
    actor.send({ type: 'SUBMIT_NAME' });

    await tick();

    expect(actor.getSnapshot().value).toBe('selectingEnrollment');
  });

  it('OPEN_VERIFY enters at the email step for an existing domain', () => {
    const { actor } = start();
    actor.send({ type: 'OPEN_VERIFY', domain: { id: 'dmn_9', name: 'clerk.dev' } });
    expect(actor.getSnapshot().value).toBe('enteringEmail');
    expect(actor.getSnapshot().context.domainId).toBe('dmn_9');
    expect(actor.getSnapshot().context.domainName).toBe('clerk.dev');
  });

  it('prepares verification with the affiliation email built from the local part and domain', async () => {
    const { actor, prepareVerification } = start();
    actor.send({ type: 'OPEN_VERIFY', domain: { id: 'dmn_9', name: 'clerk.dev' } });
    actor.send({ type: 'TYPE_EMAIL', value: 'alex' });
    actor.send({ type: 'SUBMIT_EMAIL' });

    expect(actor.getSnapshot().value).toBe('preparing');
    expect(prepareVerification).toHaveBeenCalledWith({ domainId: 'dmn_9', affiliationEmailAddress: 'alex@clerk.dev' });

    await tick();

    expect(actor.getSnapshot().value).toBe('enteringCode');
  });

  it('attempts verification and moves to enrollment on success', async () => {
    const { actor, attemptVerification } = start();
    actor.send({ type: 'OPEN_VERIFY', domain: { id: 'dmn_9', name: 'clerk.dev' } });
    actor.send({ type: 'TYPE_EMAIL', value: 'alex' });
    actor.send({ type: 'SUBMIT_EMAIL' });
    await tick();
    actor.send({ type: 'TYPE_CODE', value: '424242' });
    actor.send({ type: 'SUBMIT_CODE' });

    expect(actor.getSnapshot().value).toBe('attempting');
    expect(attemptVerification).toHaveBeenCalledWith({ domainId: 'dmn_9', code: '424242' });

    await tick();

    expect(actor.getSnapshot().value).toBe('selectingEnrollment');
  });

  it('surfaces an error and stays on the code step when the attempt does not verify', async () => {
    const attemptVerification = vi.fn(() => Promise.resolve({ verified: false }));
    const { actor } = start({ attemptVerification });
    actor.send({ type: 'OPEN_VERIFY', domain: { id: 'dmn_9', name: 'clerk.dev' } });
    actor.send({ type: 'TYPE_EMAIL', value: 'alex' });
    actor.send({ type: 'SUBMIT_EMAIL' });
    await tick();
    actor.send({ type: 'TYPE_CODE', value: '424242' });
    actor.send({ type: 'SUBMIT_CODE' });
    await tick();

    expect(actor.getSnapshot().value).toBe('enteringCode');
    expect(actor.getSnapshot().context.error).not.toBeNull();
  });

  it('resends by re-preparing verification from the code step', async () => {
    const { actor, prepareVerification } = start();
    actor.send({ type: 'OPEN_VERIFY', domain: { id: 'dmn_9', name: 'clerk.dev' } });
    actor.send({ type: 'TYPE_EMAIL', value: 'alex' });
    actor.send({ type: 'SUBMIT_EMAIL' });
    await tick();
    expect(actor.getSnapshot().value).toBe('enteringCode');

    actor.send({ type: 'RESEND' });
    expect(actor.getSnapshot().value).toBe('preparing');
    await tick();
    expect(actor.getSnapshot().value).toBe('enteringCode');
    expect(prepareVerification).toHaveBeenCalledTimes(2);
  });

  it('goes back to the email step from the code step', async () => {
    const { actor } = start();
    actor.send({ type: 'OPEN_VERIFY', domain: { id: 'dmn_9', name: 'clerk.dev' } });
    actor.send({ type: 'TYPE_EMAIL', value: 'alex' });
    actor.send({ type: 'SUBMIT_EMAIL' });
    await tick();

    actor.send({ type: 'BACK' });
    expect(actor.getSnapshot().value).toBe('enteringEmail');
  });

  it('saves the selected enrollment mode and closes', async () => {
    const { actor, updateEnrollmentMode } = start();
    actor.send({ type: 'OPEN_VERIFY', domain: { id: 'dmn_9', name: 'clerk.dev' } });
    actor.send({ type: 'TYPE_EMAIL', value: 'alex' });
    actor.send({ type: 'SUBMIT_EMAIL' });
    await tick();
    actor.send({ type: 'TYPE_CODE', value: '424242' });
    actor.send({ type: 'SUBMIT_CODE' });
    await tick();

    expect(actor.getSnapshot().value).toBe('selectingEnrollment');
    expect(actor.can({ type: 'SUBMIT_ENROLLMENT' })).toBe(false);

    actor.send({ type: 'SELECT_MODE', value: 'automatic_invitation' });
    actor.send({ type: 'SUBMIT_ENROLLMENT' });

    expect(actor.getSnapshot().value).toBe('savingEnrollment');
    expect(updateEnrollmentMode).toHaveBeenCalledWith({
      domainId: 'dmn_9',
      enrollmentMode: 'automatic_invitation',
      deletePending: false,
    });

    await tick();
    expect(actor.getSnapshot().value).toBe('closed');
  });

  it('surfaces an error and stays on the name step when create fails', async () => {
    const createDomain = vi.fn(() => Promise.reject(new Error('taken')));
    const { actor } = start({ createDomain });
    actor.send({ type: 'OPEN_ADD' });
    actor.send({ type: 'TYPE_NAME', value: 'clerk.com' });
    actor.send({ type: 'SUBMIT_NAME' });
    await tick();

    expect(actor.getSnapshot().value).toBe('enteringName');
    expect(actor.getSnapshot().context.error).toBe('taken');
  });

  it('cancels back to closed', () => {
    const { actor } = start();
    actor.send({ type: 'OPEN_ADD' });
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('closed');
  });
});
