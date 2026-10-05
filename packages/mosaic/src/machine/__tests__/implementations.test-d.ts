import { describe, expectTypeOf, test } from 'vitest';

import { createActor } from '../create-actor';
import { createMachine as plainCreateMachine } from '../create-machine';
import { setup } from '../setup';
import type { ActorSrc, DoneInvokeEvent, ErrorInvokeEvent, Guard, StateMachine } from '../types';

type Ctx = { value: string; saved: string; error: string | undefined };
type Evt = { type: 'SAVE' } | { type: 'CHANGE'; value: string } | { type: 'RESET' };

const base = setup<Ctx, Evt>();
const { assign } = base;

const { createMachine, fromPromise } = base.extend({
  guards: {
    isSaveable: (ctx, event) => {
      expectTypeOf(ctx).toEqualTypeOf<Ctx>();
      expectTypeOf(event).toEqualTypeOf<Evt>();
      return ctx.value !== ctx.saved;
    },
  },
  actions: {
    clearError: assign(() => ({ error: undefined })),
    log: (ctx, event) => {
      expectTypeOf(ctx).toEqualTypeOf<Ctx>();
      expectTypeOf(event).toEqualTypeOf<Evt>();
    },
  },
  actors: {
    save: ctx => {
      expectTypeOf(ctx).toEqualTypeOf<Ctx>();
      return Promise.resolve(ctx.value.length);
    },
  },
});

const machine = createMachine({
  initial: 'editing',
  context: { value: '', saved: '', error: undefined },
  states: {
    editing: {
      guard: 'isSaveable',
      entry: 'log',
      exit: ['log', 'clearError'],
      on: { SAVE: { target: 'saving', guard: 'isSaveable', actions: 'clearError' } },
      always: { guard: 'isSaveable', actions: ['log'] },
      after: { 1000: { target: 'idle', guard: 'isSaveable', actions: 'log' } },
    },
    saving: {
      invoke: {
        src: 'save',
        onDone: { target: 'idle', guard: 'isSaveable', actions: 'clearError' },
        onError: [{ target: 'editing', guard: 'isSaveable', actions: ['log'] }],
      },
    },
    idle: {},
  },
});

describe('named implementations', () => {
  test('1. unknown names are rejected', () => {
    createMachine({
      initial: 'a',
      states: {
        a: {
          // @ts-expect-error unknown guard name
          guard: 'nope',
          // @ts-expect-error unknown action name
          entry: 'nope',
          // @ts-expect-error unknown action name in an array
          exit: ['log', 'nope'],
          on: {
            // @ts-expect-error unknown guard name in `on`
            SAVE: { target: 'b', guard: 'nope' },
            // @ts-expect-error unknown action name in `on`
            RESET: { actions: 'nope' },
          },
          // @ts-expect-error unknown guard name in `always`
          always: { guard: 'nope' },
          // @ts-expect-error unknown action name in `after`
          after: { 10: { actions: 'nope' } },
        },
        b: {
          invoke: {
            // @ts-expect-error unknown actor name
            src: 'nope',
            // @ts-expect-error unknown action name in `onDone`
            onDone: { actions: 'nope' },
          },
        },
      },
    });
  });

  test('1. a name of one kind is not accepted for another kind', () => {
    createMachine({
      initial: 'a',
      states: {
        // @ts-expect-error `isSaveable` is a guard, not an action
        a: { entry: 'isSaveable' },
        // @ts-expect-error `clearError` is an action, not an actor
        b: { invoke: { src: 'clearError' } },
      },
    });
  });

  test('2. valid names compile everywhere (the fixture above)', () => {
    expectTypeOf(machine).toExtend<StateMachine<Ctx, Evt>>();
  });

  test('2. names work inside fromPromise transitions', () => {
    createMachine({
      initial: 'a',
      states: {
        a: {
          invoke: fromPromise(ctx => Promise.resolve(ctx.value), { onDone: { guard: 'isSaveable', actions: 'log' } }),
        },
      },
    });
  });

  test('3. implementations see the full event union, not the narrowed `on` member', () => {
    base
      .extend({
        guards: {
          isChange: (_, event) => {
            expectTypeOf(event).toEqualTypeOf<Evt>();
            return event.type === 'CHANGE' && event.value.length > 0;
          },
        },
      })
      .createMachine({ initial: 'a', states: { a: { on: { CHANGE: { guard: 'isChange' } } } } });
  });

  test('3. inline functions under `on` still narrow the event', () => {
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

  test('3. implementations are checked against Ctx and Evt', () => {
    base.extend({
      guards: {
        // @ts-expect-error guards return boolean
        bad: () => 'yes',
      },
      actors: {
        // @ts-expect-error actors return a promise
        sync: () => 1,
      },
    });
  });

  test('3. a named `src` does not type `onDone` output (raw `src` behaviour)', () => {
    createMachine({
      initial: 'a',
      states: {
        a: {
          invoke: {
            src: 'save',
            onDone: {
              actions: assign((_, event) => {
                expectTypeOf(event).toExtend<DoneInvokeEvent>();
                expectTypeOf(event.output).toBeAny();
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
      .extend({ guards: { first: () => true } })
      .extend({ guards: { second: () => true } });
    create({ initial: 'a', states: { a: { guard: 'first', always: { guard: 'second' } } } });
  });

  test('4. provide accepts a partial subset of the default names', () => {
    const provided = machine.provide({ actors: { save: ctx => Promise.resolve(ctx.saved.length) } });
    expectTypeOf(provided).toEqualTypeOf(machine);
    machine.provide({});
    machine.provide({ guards: { isSaveable: () => true } });
    machine.provide({ actions: { log: () => {}, clearError: assign(() => ({ error: 'x' })) } });
  });

  test('4. provide rejects unknown names', () => {
    // @ts-expect-error unknown guard name
    machine.provide({ guards: { nope: () => true } });
    // @ts-expect-error unknown actor name
    machine.provide({ actors: { nope: () => Promise.resolve(1) } });
  });

  test('4. provide rejects mismatched signatures', () => {
    // @ts-expect-error guards return boolean
    machine.provide({ guards: { isSaveable: () => 'yes' } });
    // @ts-expect-error `save` resolves with a number in the defaults
    machine.provide({ actors: { save: () => Promise.resolve('x') } });
    // @ts-expect-error implementations receive Ctx
    machine.provide({ guards: { isSaveable: (ctx: { other: number }) => ctx.other > 0 } });
  });

  test('8. action params are typed by the implementation', () => {
    const { createMachine: create } = base.extend({
      actions: {
        setError: assign((_, _event, params: { message: string }) => ({ error: params.message })),
        log: () => {},
      },
      actors: { save: () => Promise.resolve(1) },
    });
    create({
      initial: 'a',
      states: {
        a: {
          entry: [{ type: 'setError', params: { message: 'x' } }, 'log', { type: 'log', params: undefined }],
          invoke: {
            src: 'save',
            onError: {
              actions: {
                type: 'setError',
                params: (ctx, event) => {
                  expectTypeOf(ctx).toEqualTypeOf<Ctx>();
                  expectTypeOf(event).toEqualTypeOf<ErrorInvokeEvent>();
                  return { message: String(event.error) };
                },
              },
            },
          },
        },
      },
    });
  });

  test('8. action params are required and checked against the implementation', () => {
    const { createMachine: create } = base.extend({
      actions: { setError: assign((_, _event, params: { message: string }) => ({ error: params.message })) },
    });
    create({
      initial: 'a',
      states: {
        a: {
          // @ts-expect-error params are required
          entry: 'setError',
          // @ts-expect-error params have the wrong shape
          exit: { type: 'setError', params: { message: 1 } },
        },
      },
    });
  });

  test('8. provide keeps the params type of each action', () => {
    const provided = base.extend({
      actions: { setError: assign((_, _event, params: { message: string }) => ({ error: params.message })) },
    });
    const machineWithParams = provided.createMachine({ initial: 'a', states: { a: {} } });
    machineWithParams.provide({
      actions: { setError: assign((_, _event, params: { message: string }) => ({ error: params.message })) },
    });
    machineWithParams.provide({
      // @ts-expect-error the implementation expects different params
      actions: { setError: assign((_, _event, params: { code: number }) => ({ error: String(params.code) })) },
    });
  });

  test('5. inline functions still work alongside names', () => {
    createMachine({
      initial: 'a',
      states: {
        a: {
          entry: ['log', () => {}],
          on: {
            SAVE: [
              { guard: 'isSaveable', target: 'b' },
              { guard: () => true, actions: ['clearError'] },
            ],
          },
        },
        b: { invoke: { src: ctx => Promise.resolve(ctx.value), onDone: 'a' } },
      },
    });
  });

  test('6. machines without implementations reject every name', () => {
    const plain = base.createMachine({
      initial: 'a',
      // @ts-expect-error no guards were registered
      states: { a: { guard: 'isSaveable' } },
    });
    expectTypeOf(plain).toExtend<StateMachine<Ctx, Evt>>();
    // @ts-expect-error no guards to override
    plain.provide({ guards: { isSaveable: () => true } });
  });

  test('6. the non-setup createMachine is unchanged', () => {
    const plain = plainCreateMachine<Ctx, Evt>({
      initial: 'a',
      context: { value: '', saved: '', error: undefined },
      // @ts-expect-error no names without implementations
      states: { a: { entry: 'log' } },
    });
    expectTypeOf(plain).toExtend<StateMachine<Ctx, Evt>>();
  });

  test('7. a machine with implementations stays assignable to StateMachine<Ctx, Evt>', () => {
    let ref: StateMachine<Ctx, Evt> | null = null;
    ref = machine;
    expectTypeOf(createActor(ref)).toEqualTypeOf(createActor(machine));
    expectTypeOf(ref.implementations.guards.isSaveable).toEqualTypeOf<Guard<Ctx, Evt> | undefined>();
    expectTypeOf(ref.implementations.actors.save).toEqualTypeOf<ActorSrc<Ctx, Evt> | undefined>();
  });
});
