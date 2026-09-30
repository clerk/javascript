import { ClerkRuntimeError } from '@clerk/shared/error';
import { describe, expect, it, vi } from 'vitest';

import { childActor, createActor } from '../../machine/createActor';
import { createMachine } from '../../machine/createMachine';
import { destructiveMachine } from './destructive.machine';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

type StepEvent = { type: 'NEXT' } | { type: 'FAIL' };

const pausingAction = createMachine<object, StepEvent>({
  initial: 'waiting',
  states: {
    waiting: { tags: ['cancellable'], on: { NEXT: 'working', FAIL: 'cancelled' } },
    working: { on: { NEXT: 'done' } },
    done: { type: 'final' },
    cancelled: {
      type: 'final',
      error: () => new ClerkRuntimeError('cancelled', { code: 'reverification_cancelled' }),
    },
  },
});

function open(action: (() => Promise<unknown>) | typeof pausingAction) {
  const spy = typeof action === 'function' ? vi.fn(action) : action;
  const actor = createActor(destructiveMachine, { actors: { action: spy } }).start();
  actor.send({ type: 'OPEN' });
  return { actor, action: spy };
}

describe('destructive flow', () => {
  it('closes after the action succeeds', async () => {
    const { actor, action } = open(() => Promise.resolve());

    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('open.running');
    await tick();

    expect(action).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().value).toBe('closed');
  });

  it('cannot be closed while the action runs', () => {
    const { actor } = open(() => new Promise(() => {}));

    actor.send({ type: 'CONFIRM' });
    actor.send({ type: 'CLOSE' });

    expect(actor.getSnapshot().value).toBe('open.running');
  });

  it('shows an error when the action fails and lets the user try again', async () => {
    const { actor, action } = open(() => Promise.reject(new Error('boom')));

    actor.send({ type: 'CONFIRM' });
    await tick();
    expect(actor.getSnapshot().value).toBe('open.failed');
    expect(actor.getSnapshot().context.errorMessage).toBe('Something went wrong');

    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('open.running');
    expect(action).toHaveBeenCalledTimes(2);
  });

  describe('with an action that pauses for the user', () => {
    const child = (actor: ReturnType<typeof open>['actor']) =>
      childActor(actor.getSnapshot().children.action, pausingAction);

    it('can be closed while the action is cancellable, stopping it', () => {
      const { actor } = open(pausingAction);
      actor.send({ type: 'CONFIRM' });
      const running = child(actor);

      actor.send({ type: 'CLOSE' });

      expect(actor.getSnapshot().value).toBe('closed');
      expect(running?.getSnapshot().status).toBe('stopped');
    });

    it('cannot be closed once the action stops being cancellable', () => {
      const { actor } = open(pausingAction);
      actor.send({ type: 'CONFIRM' });

      child(actor)?.send({ type: 'NEXT' });
      actor.send({ type: 'CLOSE' });

      expect(actor.getSnapshot().value).toBe('open.running');
    });

    it('closes when the action finishes', async () => {
      const { actor } = open(pausingAction);
      actor.send({ type: 'CONFIRM' });

      child(actor)?.send({ type: 'NEXT' });
      child(actor)?.send({ type: 'NEXT' });
      await tick();

      expect(actor.getSnapshot().value).toBe('closed');
    });

    it('closes without an error when the action is cancelled', async () => {
      const { actor } = open(pausingAction);
      actor.send({ type: 'CONFIRM' });

      child(actor)?.send({ type: 'FAIL' });
      await tick();

      expect(actor.getSnapshot().value).toBe('closed');
      expect(actor.getSnapshot().context.errorMessage).toBeUndefined();
    });
  });
});
