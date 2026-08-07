import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { tick } from '../../machines/__tests__/test-utils';
import { organizationProfileApiKeysPanelRevokeMachine } from '../organization-profile-api-keys-panel-revoke.machine';

function actorWith(revokeAPIKey = vi.fn(() => Promise.resolve())) {
  const actor = createActor(organizationProfileApiKeysPanelRevokeMachine, {
    context: { revokeAPIKey, confirmationText: 'Revoke' },
  });
  actor.start();
  return { actor, revokeAPIKey };
}

describe('organizationProfileApiKeysPanelRevokeMachine', () => {
  it('moves to confirming and records the selected key on REQUEST', () => {
    const { actor } = actorWith();

    expect(actor.getSnapshot().value).toBe('idle');
    actor.send({ type: 'REQUEST', keyId: 'ak_1', keyName: 'CI token' });

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(actor.getSnapshot().context.selectedKeyId).toBe('ak_1');
    expect(actor.getSnapshot().context.selectedKeyName).toBe('CI token');
  });

  it('guards CONFIRM until the confirmation text matches', () => {
    const { actor, revokeAPIKey } = actorWith();

    actor.send({ type: 'REQUEST', keyId: 'ak_1', keyName: 'CI token' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'nope' });
    actor.send({ type: 'CONFIRM' });

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(revokeAPIKey).not.toHaveBeenCalled();
  });

  it('invokes revokeAPIKey with the selected id after a valid confirmation', async () => {
    const { actor, revokeAPIKey } = actorWith();

    actor.send({ type: 'REQUEST', keyId: 'ak_1', keyName: 'CI token' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Revoke' });
    actor.send({ type: 'CONFIRM' });

    expect(actor.getSnapshot().value).toBe('revoking');
    expect(revokeAPIKey).toHaveBeenCalledWith('ak_1');

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.selectedKeyId).toBe('');
  });

  it('returns to confirming with an error when revocation fails', async () => {
    const { actor } = actorWith(vi.fn(() => Promise.reject(new Error('cannot revoke'))));

    actor.send({ type: 'REQUEST', keyId: 'ak_1', keyName: 'CI token' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Revoke' });
    actor.send({ type: 'CONFIRM' });

    await tick();

    expect(actor.getSnapshot().value).toBe('confirming');
    expect(actor.getSnapshot().context.error).toBe('cannot revoke');
  });

  it('resets the selection on CANCEL', () => {
    const { actor } = actorWith();

    actor.send({ type: 'REQUEST', keyId: 'ak_1', keyName: 'CI token' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Rev' });
    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.selectedKeyId).toBe('');
    expect(actor.getSnapshot().context.confirmationValue).toBe('');
  });

  it('clears the error as the user retypes the confirmation', async () => {
    const { actor } = actorWith(vi.fn(() => Promise.reject(new Error('boom'))));

    actor.send({ type: 'REQUEST', keyId: 'ak_1', keyName: 'CI token' });
    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Revoke' });
    actor.send({ type: 'CONFIRM' });
    await tick();
    expect(actor.getSnapshot().context.error).toBe('boom');

    actor.send({ type: 'TYPE_CONFIRMATION', value: 'Revok' });
    expect(actor.getSnapshot().context.error).toBeNull();
  });
});
