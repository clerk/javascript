import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { deferred, tick } from '../../machines/__tests__/test-utils';
import { organizationProfileApiKeysPanelCreateMachine } from '../organization-profile-api-keys-panel-create.machine';

const createdKey = { name: 'CI token', secret: 'sk_test_123' };

function actorWith(createAPIKey = vi.fn(() => Promise.resolve(createdKey))) {
  const actor = createActor(organizationProfileApiKeysPanelCreateMachine, {
    context: { createAPIKey },
  });
  actor.start();
  return { actor, createAPIKey };
}

describe('organizationProfileApiKeysPanelCreateMachine', () => {
  it('opens the create form on OPEN', () => {
    const { actor } = actorWith();

    expect(actor.getSnapshot().value).toBe('closed');
    actor.send({ type: 'OPEN' });
    expect(actor.getSnapshot().value).toBe('editing');
  });

  it('guards SUBMIT until the name is longer than two characters', () => {
    const { actor, createAPIKey } = actorWith();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_NAME', value: 'ab' });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('editing');
    expect(createAPIKey).not.toHaveBeenCalled();
  });

  it('invokes createAPIKey with the drafted values after a valid submit', async () => {
    const { actor, createAPIKey } = actorWith();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_NAME', value: 'CI token' });
    actor.send({ type: 'TYPE_DESCRIPTION', value: 'for CI' });
    actor.send({ type: 'SET_EXPIRATION', secondsUntilExpiration: 86400 });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('creating');
    expect(createAPIKey).toHaveBeenCalledWith({
      name: 'CI token',
      description: 'for CI',
      secondsUntilExpiration: 86400,
    });

    await tick();

    expect(actor.getSnapshot().value).toBe('showingSecret');
    expect(actor.getSnapshot().context.createdKey).toEqual(createdKey);
  });

  it('omits an empty description when submitting', async () => {
    const { actor, createAPIKey } = actorWith();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_NAME', value: 'CI token' });
    actor.send({ type: 'SUBMIT' });

    await tick();

    expect(createAPIKey).toHaveBeenCalledWith({
      name: 'CI token',
      description: undefined,
      secondsUntilExpiration: undefined,
    });
  });

  it('returns to editing with an error message when creation fails', async () => {
    const { actor } = actorWith(vi.fn(() => Promise.reject(new Error('name already exists'))));

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_NAME', value: 'CI token' });
    actor.send({ type: 'SUBMIT' });

    await tick();

    expect(actor.getSnapshot().value).toBe('editing');
    expect(actor.getSnapshot().context.error).toBe('name already exists');
  });

  it('clears the error as soon as the user edits again', async () => {
    const { actor } = actorWith(vi.fn(() => Promise.reject(new Error('boom'))));

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_NAME', value: 'CI token' });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().context.error).toBe('boom');

    actor.send({ type: 'TYPE_NAME', value: 'CI token v2' });
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it('discards drafts on CANCEL and closes', () => {
    const { actor } = actorWith();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_NAME', value: 'CI token' });
    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('closed');
    expect(actor.getSnapshot().context.draftName).toBe('');
  });

  it('resets drafts and the revealed secret when the copy step is closed', async () => {
    const { actor } = actorWith();

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_NAME', value: 'CI token' });
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().value).toBe('showingSecret');

    actor.send({ type: 'CLOSE' });

    expect(actor.getSnapshot().value).toBe('closed');
    expect(actor.getSnapshot().context.createdKey).toBeNull();
    expect(actor.getSnapshot().context.draftName).toBe('');
  });

  it('does not resolve the create promise until it settles', async () => {
    const gate = deferred<typeof createdKey>();
    const { actor } = actorWith(vi.fn(() => gate.promise));

    actor.send({ type: 'OPEN' });
    actor.send({ type: 'TYPE_NAME', value: 'CI token' });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('creating');

    gate.resolve(createdKey);
    await tick();

    expect(actor.getSnapshot().value).toBe('showingSecret');
  });
});
