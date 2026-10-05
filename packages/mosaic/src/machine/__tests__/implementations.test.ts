import { describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../__tests__/async';
import { createActor, mockActor } from '../create-actor';
import { setup } from '../setup';

type Ctx = { value: string; log: string[] };
type Evt = { type: 'SAVE' } | { type: 'TYPE'; value: string };

const base = setup<Ctx, Evt>();
const { assign } = base;

function createSaveMachine({ save = () => Promise.resolve('default') }: { save?: () => Promise<string> } = {}) {
  return base.extend({ actors: { save } }).createMachine({
    initial: 'editing',
    context: { value: '', log: [] },
    states: {
      editing: {
        on: {
          TYPE: { actions: assign((_, event) => ({ value: event.value })) },
          SAVE: { target: 'saving', guard: ctx => ctx.value !== '' },
        },
      },
      saving: {
        invoke: {
          src: 'save',
          onDone: { target: 'saved', actions: assign(ctx => ({ log: [...ctx.log, `saved ${ctx.value}`] })) },
          onError: 'editing',
        },
      },
      saved: {},
    },
  });
}

describe('named actors', () => {
  it('resolves a named src from the implementations', async () => {
    const actor = createActor(createSaveMachine()).start();
    actor.send({ type: 'TYPE', value: 'Acme' });
    actor.send({ type: 'SAVE' });
    expect(actor.getSnapshot().value).toBe('saving');

    await tick();
    expect(actor.getSnapshot().value).toBe('saved');
    expect(actor.getSnapshot().context.log).toEqual(['saved Acme']);
  });

  it('throws when a named src is not implemented', () => {
    const actor = createActor(createSaveMachine()).start();
    actor.send({ type: 'TYPE', value: 'Acme' });
    actor.logic.implementations = { actors: {} };

    expect(() => actor.send({ type: 'SAVE' })).toThrow("Actor 'save' is not implemented.");
  });

  it('reads the implementations swapped onto actor.logic at evaluation time', async () => {
    const actor = createActor(createSaveMachine()).start();
    actor.send({ type: 'TYPE', value: 'Acme' });

    actor.logic.implementations = createSaveMachine({
      save: () => Promise.reject(new Error('offline')),
    }).implementations;
    actor.send({ type: 'SAVE' });
    await tick();

    expect(actor.getSnapshot().value).toBe('editing');
  });

  it('keeps the src an invoke started with when the implementations are swapped mid-flight', async () => {
    const started = deferred<string>();
    const swapped = vi.fn(() => Promise.resolve('swapped'));
    const actor = createActor(createSaveMachine({ save: () => started.promise })).start();
    actor.send({ type: 'TYPE', value: 'Acme' });
    actor.send({ type: 'SAVE' });

    actor.logic.implementations = createSaveMachine({ save: swapped }).implementations;
    started.resolve('first');
    await tick();

    expect(swapped).not.toHaveBeenCalled();
    expect(actor.getSnapshot().value).toBe('saved');
  });

  it('resolves names from the implementations of a teleported machine', () => {
    const save = vi.fn(() => Promise.resolve('saved'));
    const actor = mockActor(createSaveMachine({ save }), { value: 'editing', context: { value: 'Acme' } });

    actor.send({ type: 'SAVE' });

    expect(save).toHaveBeenCalledOnce();
  });
});
