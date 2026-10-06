import { describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../__tests__/async';
import { createActor, mockActor } from '../create-actor';
import { setup } from '../setup';

type Ctx = { value: string; log: string[] };
type Evt = { type: 'SAVE' } | { type: 'TYPE'; value: string };

const base = setup<Ctx, Evt>();
const { assign } = base;

const { createMachine } = base.extend({
  guards: { isSaveable: ctx => ctx.value !== '' },
  actions: {
    record: assign(ctx => ({ log: [...ctx.log, `saved ${ctx.value}`] })),
    type: assign((_, event) => ({ value: event.type === 'TYPE' ? event.value : '' })),
  },
  actors: { save: () => Promise.resolve('default') },
});

const machine = createMachine({
  initial: 'editing',
  context: { value: '', log: [] },
  states: {
    editing: {
      on: {
        TYPE: { actions: 'type' },
        SAVE: { target: 'saving', guard: 'isSaveable' },
      },
    },
    saving: {
      invoke: { src: 'save', onDone: { target: 'saved', actions: 'record' }, onError: 'editing' },
    },
    saved: {},
  },
});

const noImplementations = { guards: {}, actions: {}, actors: {} };

describe('named implementations', () => {
  it('resolves a named guard, action and src from the default implementations', async () => {
    const actor = createActor(machine).start();

    actor.send({ type: 'SAVE' });
    expect(actor.getSnapshot().value).toBe('editing');

    actor.send({ type: 'TYPE', value: 'Acme' });
    actor.send({ type: 'SAVE' });
    expect(actor.getSnapshot().value).toBe('saving');

    await tick();
    expect(actor.getSnapshot().value).toBe('saved');
    expect(actor.getSnapshot().context.log).toEqual(['saved Acme']);
  });

  it('overrides one kind through provide and keeps the other defaults', async () => {
    const save = vi.fn(() => Promise.resolve('provided'));
    const provided = machine.provide({ actors: { save } });
    const actor = createActor(provided).start();

    actor.send({ type: 'TYPE', value: 'Acme' });
    actor.send({ type: 'SAVE' });
    await tick();

    expect(save).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().context.log).toEqual(['saved Acme']);
  });

  it('leaves the original machine untouched by provide', () => {
    const save = () => Promise.resolve('provided');
    const provided = machine.provide({ actors: { save } });

    expect(provided.implementations.actors.save).toBe(save);
    expect(machine.implementations.actors.save).not.toBe(save);
    expect(provided.config).toBe(machine.config);
  });

  it('throws when a named guard is not implemented', () => {
    const actor = createActor(machine.provide({})).start();
    actor.logic.implementations = noImplementations;

    expect(() => actor.send({ type: 'SAVE' })).toThrow("Guard 'isSaveable' is not implemented.");
  });

  it('throws when a named action is not implemented', () => {
    const actor = createActor(machine.provide({})).start();
    actor.logic.implementations = noImplementations;

    expect(() => actor.send({ type: 'TYPE', value: 'Acme' })).toThrow("Action 'type' is not implemented.");
  });

  it('throws when a named src is not implemented', () => {
    const actor = createActor(machine.provide({})).start();
    actor.send({ type: 'TYPE', value: 'Acme' });
    actor.logic.implementations = { ...machine.implementations, actors: {} };

    expect(() => actor.send({ type: 'SAVE' })).toThrow("Actor 'save' is not implemented.");
  });

  it('reads the implementations swapped onto actor.logic at evaluation time', () => {
    const actor = createActor(machine.provide({})).start();
    actor.send({ type: 'TYPE', value: 'Acme' });

    actor.logic.implementations = machine.provide({ guards: { isSaveable: () => false } }).implementations;
    actor.send({ type: 'SAVE' });

    expect(actor.getSnapshot().value).toBe('editing');
  });

  it('keeps the src an invoke started with when the implementations are swapped mid-flight', async () => {
    const started = deferred<string>();
    const swapped = vi.fn(() => Promise.resolve('swapped'));
    const actor = createActor(machine.provide({ actors: { save: () => started.promise } })).start();
    actor.send({ type: 'TYPE', value: 'Acme' });
    actor.send({ type: 'SAVE' });

    actor.logic.implementations = machine.provide({ actors: { save: swapped } }).implementations;
    started.resolve('first');
    await tick();

    expect(swapped).not.toHaveBeenCalled();
    expect(actor.getSnapshot().value).toBe('saved');
  });

  it('passes static params to a named action', () => {
    const record = vi.fn();
    const actor = createActor(
      base.extend({ actions: { record } }).createMachine({
        initial: 'a',
        context: { value: '', log: [] },
        states: { a: { entry: { type: 'record', params: { label: 'entered' } } } },
      }),
    ).start();

    expect(record).toHaveBeenCalledWith(actor.getSnapshot().context, { type: 'machine.init' }, { label: 'entered' });
  });

  it('resolves dynamic params from the context and event the action runs with', async () => {
    const actor = createActor(
      base
        .extend({
          actions: {
            logError: assign((ctx, _event, params: { message: string }) => ({ log: [...ctx.log, params.message] })),
          },
          actors: { save: () => Promise.reject(new Error('offline')) },
        })
        .createMachine({
          initial: 'saving',
          context: { value: 'Acme', log: [] },
          states: {
            saving: {
              invoke: {
                src: 'save',
                onError: {
                  target: 'editing',
                  actions: {
                    type: 'logError',
                    params: (ctx, event) => ({ message: `${ctx.value}: ${String(event.error)}` }),
                  },
                },
              },
            },
            editing: {},
          },
        }),
    ).start();

    await tick();

    expect(actor.getSnapshot().context.log).toEqual(['Acme: Error: offline']);
  });

  it('resolves names from the implementations of a teleported machine', () => {
    const actor = mockActor(machine.provide({ guards: { isSaveable: () => false } }), {
      value: 'editing',
      context: { value: 'Acme' },
    });

    actor.send({ type: 'SAVE' });

    expect(actor.getSnapshot().value).toBe('editing');
  });
});
