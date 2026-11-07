import { describe, expectTypeOf, test } from 'vitest';

import { createActor, restoreActor } from './create-actor';
import { createMachine } from './create-machine';
import { createAsyncLogic, setup } from './setup';
import type { AsyncArgs, RouteEvent, Snapshot, StateMachine } from './types';
import { useActor, useMachine, useSelector } from './use-machine';

// ─── Shared fixture ──────────────────────────────────────────────────────────

type TestContext = { count: number; label: string };

type TestEvent = { type: 'SIMPLE' } | { type: 'WITH_PAYLOAD'; value: string } | { type: 'OPTIONAL'; count?: number };

const machine = setup<TestContext, TestEvent>().createMachine({
  initial: 'idle',
  context: { count: 0, label: '' },
  states: {
    idle: {
      on: {
        SIMPLE: { target: 'idle' },
        WITH_PAYLOAD: { target: 'idle' },
        OPTIONAL: { target: 'idle' },
      },
    },
  },
});

const actor = createActor(machine);

// ─── actor.send — accepted events ────────────────────────────────────────────

describe('actor.send — accepts every member of the event union', () => {
  test('event with no payload', () => {
    actor.send({ type: 'SIMPLE' });
  });

  test('event with required payload', () => {
    actor.send({ type: 'WITH_PAYLOAD', value: 'hello' });
  });

  test('event with optional payload omitted', () => {
    actor.send({ type: 'OPTIONAL' });
  });

  test('event with optional payload provided', () => {
    actor.send({ type: 'OPTIONAL', count: 3 });
  });

  test('route event', () => {
    actor.send({ type: 'machine.route', to: '#idle' });
  });
});

// ─── actor.send — rejected events ────────────────────────────────────────────

describe('actor.send — rejects events outside the union', () => {
  test('unknown event type', () => {
    // @ts-expect-error — 'UNKNOWN' is not in TestEvent
    actor.send({ type: 'UNKNOWN' });
  });

  test('missing required payload field', () => {
    // @ts-expect-error — WITH_PAYLOAD requires `value: string`
    actor.send({ type: 'WITH_PAYLOAD' });
  });

  test('wrong payload field type', () => {
    // @ts-expect-error — `value` must be string, not number
    actor.send({ type: 'WITH_PAYLOAD', value: 123 });
  });

  test('empty object', () => {
    // @ts-expect-error — missing `type`
    actor.send({});
  });

  test('route event without a # id', () => {
    // @ts-expect-error — `to` must start with '#'
    actor.send({ type: 'machine.route', to: 'idle' });
  });
});

// ─── snapshot.can — accepted / rejected ──────────────────────────────────────

describe('snapshot.can — mirrors send type safety', () => {
  test('accepts a valid event', () => {
    const result = actor.getSnapshot().can({ type: 'SIMPLE' });
    expectTypeOf(result).toEqualTypeOf<boolean>();
  });

  test('accepts event with payload', () => {
    actor.getSnapshot().can({ type: 'WITH_PAYLOAD', value: 'x' });
  });

  test('rejects unknown event type', () => {
    // @ts-expect-error — 'NOPE' is not in TestEvent
    actor.getSnapshot().can({ type: 'NOPE' });
  });

  test('rejects missing required payload', () => {
    // @ts-expect-error — WITH_PAYLOAD requires `value`
    actor.getSnapshot().can({ type: 'WITH_PAYLOAD' });
  });
});

// ─── snapshot types ───────────────────────────────────────────────────────────

describe('snapshot — context and value are correctly typed', () => {
  test('context matches TContext', () => {
    expectTypeOf(actor.getSnapshot().context).toEqualTypeOf<TestContext>();
  });

  test('value is the union of state names', () => {
    expectTypeOf(actor.getSnapshot().value).toEqualTypeOf<'idle'>();
  });

  test('full snapshot matches Snapshot<TContext, TStates, TEvent>', () => {
    expectTypeOf(actor.getSnapshot()).toEqualTypeOf<Snapshot<TestContext, 'idle', TestEvent>>();
  });

  test('value is the union of state names for a machine built through setup', () => {
    const m = setup<TestContext, TestEvent>().createMachine({
      initial: 'a',
      context: { count: 0, label: '' },
      states: { a: {}, b: {} },
    });
    expectTypeOf(createActor(m).getSnapshot().value).toEqualTypeOf<'a' | 'b'>();
  });

  test('useMachine, useActor and useSelector keep the union of state names', () => {
    expectTypeOf(useMachine(machine)[0].value).toEqualTypeOf<'idle'>();
    expectTypeOf(useActor(actor)[0].value).toEqualTypeOf<'idle'>();
    expectTypeOf(useSelector(actor, snap => snap.value)).toEqualTypeOf<'idle'>();
  });

  test('resolveState rejects a value that is not a state', () => {
    // @ts-expect-error — 'missing' is not a state
    machine.resolveState({ value: 'missing', context: { count: 0, label: '' } });
  });

  test('restoreActor keeps the union of state names', () => {
    const restored = restoreActor(machine, machine.resolveState({ value: 'idle', context: { count: 0, label: '' } }));
    expectTypeOf(restored.getSnapshot().value).toEqualTypeOf<'idle'>();
  });
});

// ─── Actor.send signature ─────────────────────────────────────────────────────

describe('Actor.send — signature is (event: TEvent | RouteEvent) => void, not AnyEventObject', () => {
  test('send is typed to TEvent', () => {
    expectTypeOf(actor.send).toEqualTypeOf<(event: TestEvent | RouteEvent) => void>();
  });

  test('send does not widen to Record<string, unknown>', () => {
    expectTypeOf(actor.send).not.toExtend<(event: Record<string, unknown>) => void>();
  });
});

// ─── input — lazy context ─────────────────────────────────────────────────────

describe('input — typed from setup and checked by createActor', () => {
  const withInput = setup<TestContext, TestEvent, { label: string }>().createMachine({
    initial: 'idle',
    context: ({ input }) => {
      expectTypeOf(input).toEqualTypeOf<{ label: string }>();
      return { count: 0, label: input.label };
    },
    states: { idle: {} },
  });

  test('accepts the declared input', () => {
    createActor(withInput, { input: { label: 'x' } });
  });

  test('rejects an input of the wrong shape', () => {
    // @ts-expect-error — `label` must be a string
    createActor(withInput, { input: { label: 1 } });
  });
});

// ─── createMachine — on key and target type safety ───────────────────────────

describe('createMachine — on keys are constrained to TEvent types', () => {
  type S = 'idle';

  test('valid event type in on compiles', () => {
    createMachine<TestContext, TestEvent, S>({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: { idle: { on: { SIMPLE: { target: 'idle' } } } },
    });
  });

  test('unknown event type in on is rejected', () => {
    createMachine<TestContext, TestEvent, S>({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        // @ts-expect-error — 'UNKNOWN_EVENT' is not in TestEvent['type']
        idle: { on: { UNKNOWN_EVENT: { target: 'idle' } } },
      },
    });
  });

  test('a bare string target is rejected', () => {
    createMachine<TestContext, TestEvent, S>({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        idle: {
          // @ts-expect-error — targets are written as { target }
          on: { SIMPLE: 'idle' },
        },
      },
    });
  });
});

describe('createMachine — TStates constrains initial and transition targets', () => {
  type S = 'idle' | 'active';

  test('valid initial compiles', () => {
    createMachine<TestContext, TestEvent, S>({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: { idle: { on: { SIMPLE: { target: 'active' } } }, active: {} },
    });
  });

  test('invalid initial is rejected', () => {
    createMachine<TestContext, TestEvent, S>({
      // @ts-expect-error — 'missing' is not in 'idle' | 'active'
      initial: 'missing',
      context: { count: 0, label: '' },
      states: { idle: {}, active: {} },
    });
  });

  test('invalid transition target is rejected', () => {
    createMachine<TestContext, TestEvent, S>({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        idle: {
          // @ts-expect-error — 'nonexistent' is not in 'idle' | 'active'
          on: { SIMPLE: { target: 'nonexistent' } },
        },
        active: {},
      },
    });
  });
});

// ─── setup — pre-binds TContext and TEvent ───────────────────────────────────

describe('setup — eliminates repetitive generic params', () => {
  const { createMachine: make } = setup<TestContext, TestEvent>();

  test('createMachine compiles without explicit type parameters', () => {
    const m = make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: { idle: { on: { SIMPLE: { target: 'idle' } } } },
    });
    expectTypeOf(m).toExtend<StateMachine<TestContext, TestEvent, 'idle'>>();
  });

  test('a transition function sees typed context and the narrowed event', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        idle: {
          on: {
            WITH_PAYLOAD: ({ context, event }) => {
              expectTypeOf(context).toEqualTypeOf<TestContext>();
              expectTypeOf(event).toEqualTypeOf<{ type: 'WITH_PAYLOAD'; value: string }>();
              return { context: { label: event.value } };
            },
          },
        },
      },
    });
  });

  test('a context patch rejects unknown keys', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        idle: {
          on: {
            // @ts-expect-error — 'unknown_key' is not in TestContext
            SIMPLE: () => ({ context: { unknown_key: true } }),
          },
        },
      },
    });
  });

  test('a transition function rejects an unknown target', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        idle: {
          on: {
            // @ts-expect-error — 'nonexistent' is not a state
            SIMPLE: () => ({ target: 'nonexistent' }),
          },
        },
      },
    });
  });

  test('returning undefined from a transition function is allowed', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: { idle: { on: { SIMPLE: () => undefined } } },
    });
  });

  test('invalid initial is rejected', () => {
    make({
      // @ts-expect-error — 'missing' is not a state
      initial: 'missing',
      context: { count: 0, label: '' },
      states: { idle: {}, active: {} },
    });
  });

  test('a choice state rejects an unknown target', () => {
    make({
      initial: 'pick',
      context: { count: 0, label: '' },
      states: {
        // @ts-expect-error — 'nonexistent' is not a state
        pick: { type: 'choice', choice: () => ({ target: 'nonexistent' }) },
        idle: {},
      },
    });
  });

  test('on key constraint still holds — unknown event types are rejected', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        // @ts-expect-error — 'UNKNOWN_EVENT' is not in TestEvent['type']
        idle: { on: { UNKNOWN_EVENT: { target: 'idle' } } },
      },
    });
  });
});

// ─── named actions ────────────────────────────────────────────────────────────

describe('named actions — enq checks their arguments', () => {
  const { createMachine: make } = setup<TestContext, TestEvent>();

  test('enq accepts a named action with its arguments', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      actions: { log: (_message: string) => {} },
      states: {
        idle: {
          on: {
            SIMPLE: ({ actions }, enq) => {
              enq(actions.log, 'hello');
            },
          },
        },
      },
    });
  });

  test('enq rejects wrong arguments for a named action', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      actions: { log: (_message: string) => {} },
      states: {
        idle: {
          on: {
            SIMPLE: ({ actions }, enq) => {
              // @ts-expect-error — `log` takes a string
              enq(actions.log, 1);
            },
          },
        },
      },
    });
  });
});

// ─── invoke — typed output ────────────────────────────────────────────────────

type FetchContext = { url: string; data: string | null; error: string | null };
type FetchEvent = { type: 'FETCH' } | { type: 'RESET' };

interface FetchResult {
  body: string;
  status: number;
}

const fakeFetch = (url: string): Promise<FetchResult> => Promise.resolve({ body: url, status: 200 });

describe('createInvoke — event.output is typed from src', () => {
  const { createMachine: make, createInvoke } = setup<FetchContext, FetchEvent>();
  const initialContext: FetchContext = { url: '', data: null, error: null };

  test('input is typed from the input mapper', () => {
    make({
      initial: 'loading',
      context: initialContext,
      states: {
        loading: {
          invoke: createInvoke({
            input: ({ context }) => context.url,
            src: ({ input }) => {
              expectTypeOf(input).toEqualTypeOf<string>();
              return fakeFetch(input);
            },
          }),
        },
      },
    });
  });

  test('onDone sees the typed output', () => {
    make({
      initial: 'loading',
      context: initialContext,
      states: {
        loading: {
          invoke: createInvoke({
            input: ({ context }) => context.url,
            src: ({ input }) => fakeFetch(input),
            onDone: ({ event }) => {
              expectTypeOf(event.output).toEqualTypeOf<FetchResult>();
              return { target: 'done', context: { data: event.output.body } };
            },
          }),
        },
        done: {},
      },
    });
  });

  test('a context patch in onDone rejects unknown keys', () => {
    make({
      initial: 'loading',
      context: initialContext,
      states: {
        loading: {
          invoke: createInvoke({
            src: () => fakeFetch(''),
            // @ts-expect-error — 'unknown_key' is not in FetchContext
            onDone: () => ({ context: { unknown_key: true } }),
          }),
        },
      },
    });
  });

  test('unknown targets are rejected and known ones accepted', () => {
    make({
      initial: 'idle',
      context: initialContext,
      states: {
        idle: {},
        // @ts-expect-error — 'nope' is not a state
        done: { invoke: createInvoke({ src: () => fakeFetch(''), onDone: { target: 'nope' } }) },
        // @ts-expect-error — 'nope' is not a state
        failed: { invoke: createInvoke({ src: () => fakeFetch(''), onError: () => ({ target: 'nope' }) }) },
        loading: {
          invoke: createInvoke({
            src: () => fakeFetch(''),
            onDone: { target: 'done' },
            onError: { target: 'failed' },
          }),
        },
      },
    });
  });

  test('a shared invoke state is checked against the machine it joins', () => {
    const known = { invoke: createInvoke({ src: () => fakeFetch(''), onDone: () => ({ target: 'idle' }) }) };
    const stays = { invoke: createInvoke({ src: () => fakeFetch(''), onError: () => ({ context: { error: 'x' } }) }) };
    const unhandled = { invoke: createInvoke({ src: () => fakeFetch(''), onDone: () => undefined }) };
    const unknownTarget = { invoke: createInvoke({ src: () => fakeFetch(''), onDone: { target: 'nope' } }) };

    make({
      initial: 'idle',
      context: initialContext,
      states: {
        idle: {},
        known,
        stays,
        unhandled,
        // @ts-expect-error — 'nope' is not a state
        unknownTarget,
      },
    });
  });

  test('the machine keeps its state names as a union', () => {
    const fetching = make({
      initial: 'idle',
      context: initialContext,
      states: {
        idle: {},
        loading: { invoke: createInvoke({ src: () => fakeFetch(''), onDone: { target: 'idle' } }) },
      },
    });

    expectTypeOf(createActor(fetching).getSnapshot().value).toEqualTypeOf<'idle' | 'loading'>();
  });
});

describe('named actors — input and output are typed from the logic', () => {
  const { createMachine: make } = setup<FetchContext, FetchEvent>();
  const initialContext: FetchContext = { url: '', data: null, error: null };
  const fetchLogic = createAsyncLogic(({ input }: AsyncArgs<string>) => fakeFetch(input));

  test('onDone sees the logic output', () => {
    make({
      initial: 'loading',
      context: initialContext,
      actors: { fetch: fetchLogic },
      states: {
        loading: {
          invoke: {
            src: 'fetch',
            input: ({ context }) => context.url,
            onDone: ({ event }) => {
              expectTypeOf(event.output).toEqualTypeOf<FetchResult>();
              return { target: 'loading' };
            },
          },
        },
      },
    });
  });

  test('a logic that needs input requires an input mapper', () => {
    make({
      initial: 'loading',
      context: initialContext,
      actors: { fetch: fetchLogic },
      states: {
        // @ts-expect-error — 'fetch' needs a string input
        loading: { invoke: { src: 'fetch' } },
      },
    });
  });

  test('an unknown src is rejected', () => {
    make({
      initial: 'loading',
      context: initialContext,
      actors: { fetch: fetchLogic },
      states: {
        // @ts-expect-error — 'missing' is not a named actor
        loading: { invoke: { src: 'missing' } },
      },
    });
  });

  test('provide checks replacement logic against the declared actor', () => {
    const m = make({
      initial: 'loading',
      context: initialContext,
      actors: { fetch: fetchLogic },
      states: { loading: { invoke: { src: 'fetch', input: ({ context }) => context.url } } },
    });
    m.provide({ actors: { fetch: createAsyncLogic(({ input }: AsyncArgs<string>) => fakeFetch(input)) } });
    // @ts-expect-error — the replacement must resolve to FetchResult
    m.provide({ actors: { fetch: createAsyncLogic(({ input }: AsyncArgs<string>) => Promise.resolve(input)) } });
  });
});

// ─── always ───────────────────────────────────────────────────────────────────

describe('always — accepts a transition function', () => {
  test('sees typed context', () => {
    setup<TestContext, TestEvent>().createMachine({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        idle: {
          always: ({ context }) => {
            expectTypeOf(context).toEqualTypeOf<TestContext>();
            return undefined;
          },
        },
      },
    });
  });
});
