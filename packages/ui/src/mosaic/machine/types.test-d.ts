import { describe, expectTypeOf, test } from 'vitest';

import { assign } from './assign';
import { createActor } from './createActor';
import { createMachine } from './createMachine';
import { setup } from './setup';
import type { Snapshot, StateMachine } from './types';

// ─── Shared fixture ──────────────────────────────────────────────────────────

type TestContext = { count: number; label: string };

type TestEvent = { type: 'SIMPLE' } | { type: 'WITH_PAYLOAD'; value: string } | { type: 'OPTIONAL'; count?: number };

const machine = createMachine<TestContext, TestEvent>({
  initial: 'idle',
  context: { count: 0, label: '' },
  states: {
    idle: {
      on: {
        SIMPLE: 'idle',
        WITH_PAYLOAD: 'idle',
        OPTIONAL: 'idle',
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
});

// ─── actor.can — accepted / rejected ─────────────────────────────────────────

describe('actor.can — mirrors send type safety', () => {
  test('accepts a valid event', () => {
    const result = actor.can({ type: 'SIMPLE' });
    expectTypeOf(result).toEqualTypeOf<boolean>();
  });

  test('accepts event with payload', () => {
    actor.can({ type: 'WITH_PAYLOAD', value: 'x' });
  });

  test('rejects unknown event type', () => {
    // @ts-expect-error — 'NOPE' is not in TestEvent
    actor.can({ type: 'NOPE' });
  });

  test('rejects missing required payload', () => {
    // @ts-expect-error — WITH_PAYLOAD requires `value`
    actor.can({ type: 'WITH_PAYLOAD' });
  });
});

// ─── snapshot types ───────────────────────────────────────────────────────────

describe('snapshot — context and value are correctly typed', () => {
  test('context matches TContext', () => {
    const snap = actor.getSnapshot();
    expectTypeOf(snap.context).toEqualTypeOf<TestContext>();
  });

  test('value is string', () => {
    const snap = actor.getSnapshot();
    expectTypeOf(snap.value).toEqualTypeOf<string>();
  });

  test('full snapshot matches Snapshot<TContext>', () => {
    const snap = actor.getSnapshot();
    expectTypeOf(snap).toEqualTypeOf<Snapshot<TestContext>>();
  });
});

// ─── assign — updater types ───────────────────────────────────────────────────

describe('assign — updater receives typed context and event', () => {
  test('context parameter is TContext', () => {
    assign<TestContext, TestEvent>(ctx => {
      expectTypeOf(ctx).toEqualTypeOf<TestContext>();
      return {};
    });
  });

  test('event parameter is TEvent', () => {
    assign<TestContext, TestEvent>((_, event) => {
      expectTypeOf(event).toEqualTypeOf<TestEvent>();
      return {};
    });
  });

  test('return must be Partial<TContext> — rejects unknown keys', () => {
    // @ts-expect-error — 'unknown_key' is not in TestContext
    assign<TestContext, TestEvent>(() => ({ unknown_key: true }));
  });
});

// ─── Actor.send signature ─────────────────────────────────────────────────────

describe('Actor.send — signature is (event: TEvent) => void, not AnyEventObject', () => {
  test('send is typed to TEvent', () => {
    expectTypeOf(actor.send).toEqualTypeOf<(event: TestEvent) => void>();
  });

  test('send does not widen to Record<string, unknown>', () => {
    expectTypeOf(actor.send).not.toMatchTypeOf<(event: Record<string, unknown>) => void>();
  });
});

// ─── createMachine — on key and target type safety ───────────────────────────

describe('createMachine — on keys are constrained to TEvent types', () => {
  test('valid event type in on compiles', () => {
    createMachine<TestContext, TestEvent>({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: { idle: { on: { SIMPLE: 'idle' } } },
    });
  });

  test('unknown event type in on is rejected', () => {
    createMachine<TestContext, TestEvent>({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        // @ts-expect-error — 'UNKNOWN_EVENT' is not in TestEvent['type']
        idle: { on: { UNKNOWN_EVENT: 'idle' } },
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
      states: { idle: { on: { SIMPLE: 'active' } }, active: {} },
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
          on: { SIMPLE: 'nonexistent' },
        },
        active: {},
      },
    });
  });
});

// ─── setup — pre-binds TContext and TEvent ───────────────────────────────────

describe('setup — eliminates repetitive generic params', () => {
  const { createMachine: make, assign: a } = setup<TestContext, TestEvent>();

  test('createMachine compiles without explicit type parameters', () => {
    const m = make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: { idle: { on: { SIMPLE: 'idle' } } },
    });
    expectTypeOf(m).toMatchTypeOf<StateMachine<TestContext, TestEvent>>();
  });

  test('assign in on handler infers the narrowed event type — no Extract<> needed', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        idle: {
          on: {
            WITH_PAYLOAD: {
              // e should be { type: 'WITH_PAYLOAD'; value: string }, not the full union
              actions: a((_, e) => {
                expectTypeOf(e).toEqualTypeOf<{ type: 'WITH_PAYLOAD'; value: string }>();
                return { label: e.value };
              }),
            },
          },
        },
      },
    });
  });

  test('assign context return type is enforced — rejects unknown keys', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        idle: {
          on: {
            SIMPLE: {
              // @ts-expect-error — 'unknown_key' is not in TestContext
              actions: a(() => ({ unknown_key: true })),
            },
          },
        },
      },
    });
  });

  test('on key constraint still holds — unknown event types are rejected', () => {
    make({
      initial: 'idle',
      context: { count: 0, label: '' },
      states: {
        // @ts-expect-error — 'UNKNOWN_EVENT' is not in TestEvent['type']
        idle: { on: { UNKNOWN_EVENT: 'idle' } },
      },
    });
  });
});
