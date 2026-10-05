import { describe, expectTypeOf, test } from 'vitest';

import { createActor } from '../create-actor';
import { createMachine as plainCreateMachine } from '../create-machine';
import { setup } from '../setup';
import type { ActorSrc, DoneInvokeEvent, StateMachine } from '../types';

type Ctx = { value: string; saved: string; error: string | undefined };
type Evt = { type: 'SAVE' } | { type: 'CHANGE'; value: string } | { type: 'RESET' };

const base = setup<Ctx, Evt>();
const { assign } = base;

const { createMachine, fromPromise } = base.extend({
  actors: {
    save: ctx => {
      expectTypeOf(ctx).toEqualTypeOf<Ctx>();
      return Promise.resolve(ctx.value.length);
    },
  },
});

const isSaveable = (ctx: Ctx) => ctx.value !== ctx.saved;
const clearError = assign(() => ({ error: undefined }));
const log = () => {};

const machine = createMachine({
  initial: 'editing',
  context: { value: '', saved: '', error: undefined },
  states: {
    editing: {
      guard: isSaveable,
      entry: log,
      exit: [log, clearError],
      on: { SAVE: { target: 'saving', guard: isSaveable, actions: clearError } },
      always: { guard: isSaveable, actions: [log] },
      after: { 1000: { target: 'idle', guard: isSaveable, actions: log } },
    },
    saving: {
      invoke: {
        src: 'save',
        onDone: { target: 'idle', guard: isSaveable, actions: clearError },
        onError: [{ target: 'editing', guard: isSaveable, actions: [log] }],
      },
    },
    idle: {},
  },
});

describe('named actors', () => {
  test('1. unknown actor names are rejected', () => {
    createMachine({
      initial: 'a',
      states: {
        a: {
          invoke: {
            // @ts-expect-error unknown actor name
            src: 'nope',
          },
        },
      },
    });
  });

  test('1. only `src` accepts a name', () => {
    createMachine({
      initial: 'a',
      states: {
        // @ts-expect-error guards are inline, never named
        a: { guard: 'save' },
        // @ts-expect-error actions are inline, never named
        b: { entry: 'save' },
        c: {
          on: {
            // @ts-expect-error guards are inline in `on` too
            SAVE: { guard: 'save' },
          },
        },
      },
    });
  });

  test('2. valid names compile everywhere (the fixture above)', () => {
    expectTypeOf(machine).toExtend<StateMachine<Ctx, Evt>>();
  });

  test('2. inline guards work inside fromPromise transitions', () => {
    createMachine({
      initial: 'a',
      states: {
        a: {
          invoke: fromPromise(ctx => Promise.resolve(ctx.value), { onDone: { guard: isSaveable, actions: log } }),
        },
      },
    });
  });

  test('3. inline guards under `on` narrow the event', () => {
    createMachine({
      initial: 'a',
      states: {
        a: {
          on: {
            CHANGE: {
              guard: (_, event) => {
                expectTypeOf(event).toEqualTypeOf<{ type: 'CHANGE'; value: string }>();
                return true;
              },
            },
          },
        },
      },
    });
  });

  test('3. actors are checked against Ctx', () => {
    base.extend({
      actors: {
        // @ts-expect-error actors return a promise
        sync: () => 1,
      },
    });
  });

  test('3. a named `src` types `onDone` output from the actor', () => {
    createMachine({
      initial: 'a',
      states: {
        a: {
          invoke: {
            src: 'save',
            onDone: {
              actions: assign((_, event) => {
                expectTypeOf(event).toEqualTypeOf<DoneInvokeEvent<number>>();
                return {};
              }),
            },
          },
        },
      },
    });
  });

  test('3. extend accumulates names across calls', () => {
    const { createMachine: create } = base
      .extend({ actors: { first: () => Promise.resolve(1) } })
      .extend({ actors: { second: () => Promise.resolve('two') } });
    create({
      initial: 'a',
      states: { a: { invoke: { src: 'first', onDone: 'b' } }, b: { invoke: { src: 'second' } } },
    });
  });

  test('5. inline src still works alongside names', () => {
    createMachine({
      initial: 'a',
      states: {
        a: { invoke: { src: 'save', onDone: 'b' } },
        b: { invoke: { src: ctx => Promise.resolve(ctx.value), onDone: 'a' } },
      },
    });
  });

  test('6. machines without implementations reject every name', () => {
    const plain = base.createMachine({
      initial: 'a',
      // @ts-expect-error no actors were registered
      states: { a: { invoke: { src: 'save' } } },
    });
    expectTypeOf(plain).toExtend<StateMachine<Ctx, Evt>>();
  });

  test('6. the non-setup createMachine is unchanged', () => {
    const plain = plainCreateMachine<Ctx, Evt>({
      initial: 'a',
      context: { value: '', saved: '', error: undefined },
      // @ts-expect-error no names without implementations
      states: { a: { invoke: { src: 'save' } } },
    });
    expectTypeOf(plain).toExtend<StateMachine<Ctx, Evt>>();
  });

  test('7. a machine with implementations stays assignable to StateMachine<Ctx, Evt>', () => {
    let ref: StateMachine<Ctx, Evt> | null = null;
    ref = machine;
    expectTypeOf(createActor(ref)).toEqualTypeOf(createActor(machine));
    expectTypeOf(ref.implementations.actors.save).toEqualTypeOf<ActorSrc<Ctx, Evt> | undefined>();
  });
});
