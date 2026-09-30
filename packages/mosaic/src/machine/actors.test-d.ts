import { describe, expectTypeOf, test } from 'vitest';

import { createActor } from './createActor';
import { setup } from './setup';
import type { DoneInvokeEvent } from './types';

type ChildContext = { code: string };
const child = setup<ChildContext, { type: 'SUBMIT' }>().createMachine({
  initial: 'waiting',
  context: { code: '' },
  states: { waiting: {} },
});

type Actors = {
  load: (id: string) => Promise<{ name: string }>;
  verify: typeof child;
};

type Context = { id: string; name: string; code: string };
type Event = { type: 'GO' };

const { createMachine, assign } = setup<Context, Event, Actors>();

const machine = createMachine({
  initial: 'loading',
  context: { id: '', name: '', code: '' },
  states: {
    loading: {
      invoke: {
        src: 'load',
        input: ctx => ctx.id,
        onDone: {
          target: 'verifying',
          actions: assign((_, event) => {
            expectTypeOf(event).toEqualTypeOf<DoneInvokeEvent<{ name: string }>>();
            return { name: event.output.name };
          }),
        },
      },
    },
    verifying: {
      invoke: {
        src: 'verify',
        input: ctx => ({ code: ctx.code }),
        onDone: {
          target: 'done',
          actions: assign((_, event) => ({ code: event.output.code })),
        },
      },
    },
    done: {},
  },
});

const load = (id: string) => Promise.resolve({ name: id });

describe('named invokes', () => {
  test('reject a src that is not in the registry', () => {
    createMachine({
      initial: 'a',
      // @ts-expect-error — 'missing' is not a provided actor
      states: { a: { invoke: { src: 'missing' } } },
    });
  });

  test('reject an input that does not match the actor', () => {
    createMachine({
      initial: 'a',
      // @ts-expect-error — load takes a string
      states: { a: { invoke: { src: 'load', input: () => 42 } } },
    });
  });

  test('reject reading output the actor does not produce', () => {
    createMachine({
      initial: 'a',
      states: {
        a: {
          invoke: {
            src: 'load',
            // @ts-expect-error — load resolves to { name }, not { age }
            onDone: { actions: assign((_, event) => ({ name: event.output.age })) },
          },
        },
      },
    });
  });
});

describe('createActor', () => {
  test('accepts the full registry', () => {
    createActor(machine, { actors: { load, verify: child } });
  });

  test('requires the registry', () => {
    // @ts-expect-error — actors are required
    createActor(machine);
  });

  test('rejects a missing actor', () => {
    // @ts-expect-error — verify is missing
    createActor(machine, { actors: { load } });
  });

  test('rejects an actor with the wrong signature', () => {
    // @ts-expect-error — load must take a string
    createActor(machine, { actors: { load: (id: number) => Promise.resolve({ name: String(id) }), verify: child } });
  });

  test('does not require actors for machines without a registry', () => {
    createActor(child);
  });
});
