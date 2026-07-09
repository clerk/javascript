import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import { organizationProfileDomainsSectionEnrollmentMachine } from '../organization-profile-domains-section-enrollment.machine';

function open(
  overrides: Partial<{ enrollmentMode: string; totalPendingInvitations: number; totalPendingSuggestions: number }> = {},
) {
  const updateEnrollmentMode = vi.fn(() => Promise.resolve());
  const actor = createActor(organizationProfileDomainsSectionEnrollmentMachine, {
    context: { updateEnrollmentMode },
  });
  actor.start();
  actor.send({
    type: 'OPEN',
    domain: {
      id: 'dmn_1',
      name: 'clerk.com',
      enrollmentMode: 'manual_invitation',
      totalPendingInvitations: 0,
      totalPendingSuggestions: 0,
      ...overrides,
    },
  });
  return { actor, updateEnrollmentMode };
}

describe('organizationProfileDomainsSectionEnrollmentMachine', () => {
  it('seeds the committed mode and counts when opened', () => {
    const { actor } = open({
      enrollmentMode: 'automatic_suggestion',
      totalPendingInvitations: 3,
      totalPendingSuggestions: 2,
    });

    const { context, value } = actor.getSnapshot();
    expect(value).toBe('editing');
    expect(context.domainId).toBe('dmn_1');
    expect(context.committedEnrollmentMode).toBe('automatic_suggestion');
    expect(context.totalPendingInvitations).toBe(3);
    expect(context.totalPendingSuggestions).toBe(2);
    expect(context.draftEnrollmentMode).toBeNull();
  });

  it('cannot submit while the selection still matches the committed mode', () => {
    const { actor } = open();
    expect(actor.can({ type: 'SUBMIT' })).toBe(false);
  });

  it('can submit once the mode changes', () => {
    const { actor } = open();
    actor.send({ type: 'SELECT_MODE', value: 'automatic_invitation' });
    expect(actor.can({ type: 'SUBMIT' })).toBe(true);
  });

  it('can submit when only deletePending is toggled', () => {
    const { actor } = open();
    actor.send({ type: 'TOGGLE_DELETE_PENDING', checked: true });
    expect(actor.can({ type: 'SUBMIT' })).toBe(true);
  });

  it('resets deletePending when the mode selection changes', () => {
    const { actor } = open();
    actor.send({ type: 'TOGGLE_DELETE_PENDING', checked: true });
    expect(actor.getSnapshot().context.deletePending).toBe(true);

    // Switching the mode hides the delete-pending checkbox; it must not carry a
    // stale value back into SUBMIT when the user returns to the committed mode.
    actor.send({ type: 'SELECT_MODE', value: 'automatic_invitation' });
    expect(actor.getSnapshot().context.deletePending).toBe(false);

    actor.send({ type: 'SELECT_MODE', value: 'manual_invitation' });
    expect(actor.can({ type: 'SUBMIT' })).toBe(false);
  });

  it('saves the effective mode and deletePending, then closes', async () => {
    const { actor, updateEnrollmentMode } = open();

    actor.send({ type: 'SELECT_MODE', value: 'automatic_invitation' });
    actor.send({ type: 'TOGGLE_DELETE_PENDING', checked: true });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('saving');
    expect(updateEnrollmentMode).toHaveBeenCalledWith({
      domainId: 'dmn_1',
      enrollmentMode: 'automatic_invitation',
      deletePending: true,
    });

    await tick();

    expect(actor.getSnapshot().value).toBe('closed');
    expect(actor.getSnapshot().context.draftEnrollmentMode).toBeNull();
  });

  it('returns to editing with an error when saving fails', async () => {
    const updateEnrollmentMode = vi.fn(() => Promise.reject(new Error('nope')));
    const actor = createActor(organizationProfileDomainsSectionEnrollmentMachine, {
      context: { updateEnrollmentMode },
    });
    actor.start();
    actor.send({
      type: 'OPEN',
      domain: {
        id: 'dmn_1',
        name: 'clerk.com',
        enrollmentMode: 'manual_invitation',
        totalPendingInvitations: 0,
        totalPendingSuggestions: 0,
      },
    });
    actor.send({ type: 'SELECT_MODE', value: 'automatic_invitation' });
    actor.send({ type: 'SUBMIT' });

    await tick();

    expect(actor.getSnapshot().value).toBe('editing');
    expect(actor.getSnapshot().context.error).toBe('nope');
  });

  it('cancels back to closed and clears drafts', () => {
    const { actor, updateEnrollmentMode } = open();
    actor.send({ type: 'SELECT_MODE', value: 'automatic_invitation' });
    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('closed');
    expect(actor.getSnapshot().context.draftEnrollmentMode).toBeNull();
    expect(updateEnrollmentMode).not.toHaveBeenCalled();
  });
});
