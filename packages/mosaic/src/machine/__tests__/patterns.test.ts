/**
 * Real-world pattern tests.
 *
 * Each describe block proves that a specific Clerk UI coordination pattern
 * works with existing library primitives — no new library code required.
 * Read these as "here's how to do X" documentation, not just regression tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deferred, tick } from '../../__tests__/async';
import { createActor } from '../create-actor';
import { createAsyncLogic, setup } from '../setup';

function routeByStatus(status: string): { target: 'firstFactor' | 'secondFactor' | 'complete' } {
  if (status === 'needs_first_factor') {
    return { target: 'firstFactor' };
  }
  if (status === 'needs_second_factor') {
    return { target: 'secondFactor' };
  }
  return { target: 'complete' };
}

// ─── Pattern 1: Multiple competing entry points (replaces useLoadingStatus + useCardState) ──

/**
 * A card with social OAuth buttons AND an email submit. Clicking any of them
 * should disable the whole card and show a spinner on the clicked control only.
 *
 * Old approach: `card.setLoading(strategy)` + per-button `status.isLoading`
 * Machine approach: `submitting` state + `activeStrategy` in context.
 */
describe('pattern: multi-button loading (social + email)', () => {
  type Strategy = 'google' | 'github';
  type Ctx = { activeStrategy: Strategy | 'email' | null; error: string | null };
  type Evt =
    | { type: 'CLICK_SOCIAL'; strategy: Strategy }
    | { type: 'TYPE_EMAIL'; value: string }
    | { type: 'SUBMIT_EMAIL' };

  const { createMachine, createInvoke } = setup<Ctx, Evt>();

  function makeSignInMachine(socialFn: (strategy: Strategy) => Promise<void>, emailFn: () => Promise<void>) {
    return createMachine({
      initial: 'idle',
      context: { activeStrategy: null, error: null },
      states: {
        idle: {
          on: {
            CLICK_SOCIAL: ({ event }) => ({ target: 'submitting', context: { activeStrategy: event.strategy } }),
            SUBMIT_EMAIL: () => ({ target: 'submitting', context: { activeStrategy: 'email' } }),
          },
        },
        submitting: {
          // All entry points converge here. CLICK_SOCIAL while submitting is a no-op —
          // `idle`'s handlers are inactive, so simultaneous triggers are impossible.
          invoke: createInvoke({
            input: ({ context }) => context.activeStrategy,
            src: ({ input }) => (input === 'email' || input === null ? emailFn() : socialFn(input)),
            onDone: { target: 'success' },
            onError: ({ event }) => ({ target: 'idle', context: { error: String(event.error), activeStrategy: null } }),
          }),
        },
        success: { type: 'final' },
      },
    });
  }

  it('starts idle with no active strategy', () => {
    const actor = createActor(
      makeSignInMachine(
        () => Promise.resolve(),
        () => Promise.resolve(),
      ),
    );
    actor.start();
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.activeStrategy).toBeNull();
  });

  it('enters submitting and records the clicked social strategy', () => {
    const gate = deferred<void>();
    const actor = createActor(
      makeSignInMachine(
        () => gate.promise,
        () => Promise.resolve(),
      ),
    );
    actor.start();
    actor.send({ type: 'CLICK_SOCIAL', strategy: 'google' });
    expect(actor.getSnapshot().value).toBe('submitting');
    expect(actor.getSnapshot().context.activeStrategy).toBe('google');
  });

  it('records email as active strategy when submitting via email', () => {
    const gate = deferred<void>();
    const actor = createActor(
      makeSignInMachine(
        () => Promise.resolve(),
        () => gate.promise,
      ),
    );
    actor.start();
    actor.send({ type: 'SUBMIT_EMAIL' });
    expect(actor.getSnapshot().context.activeStrategy).toBe('email');
  });

  it('ignores a second CLICK_SOCIAL while already submitting', () => {
    const gate = deferred<void>();
    const actor = createActor(
      makeSignInMachine(
        () => gate.promise,
        () => Promise.resolve(),
      ),
    );
    actor.start();
    actor.send({ type: 'CLICK_SOCIAL', strategy: 'google' });
    const before = actor.getSnapshot();
    actor.send({ type: 'CLICK_SOCIAL', strategy: 'github' }); // should be ignored
    expect(actor.getSnapshot()).toBe(before);
    expect(actor.getSnapshot().context.activeStrategy).toBe('google');
  });

  it('returns to idle with error and clears activeStrategy on failure', async () => {
    const actor = createActor(
      makeSignInMachine(
        () => Promise.reject(new Error('OAuth failed')),
        () => Promise.resolve(),
      ),
    );
    actor.start();
    actor.send({ type: 'CLICK_SOCIAL', strategy: 'github' });
    await tick();
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.activeStrategy).toBeNull();
    expect(actor.getSnapshot().context.error).toBe('Error: OAuth failed');
  });

  it('reaches success (final) when the async call resolves', async () => {
    const actor = createActor(
      makeSignInMachine(
        () => Promise.resolve(),
        () => Promise.resolve(),
      ),
    );
    actor.start();
    actor.send({ type: 'CLICK_SOCIAL', strategy: 'google' });
    await tick();
    expect(actor.getSnapshot().value).toBe('success');
    expect(actor.getSnapshot().status).toBe('done');
  });
});

// ─── Pattern 2: Resend + cooldown (replaces TimerButton + useLoadingStatus) ───

/**
 * A "resend code" button that:
 *   1. Calls an API to re-send the code
 *   2. Disables itself for 30 seconds (cooldown)
 *   3. Re-enables after the cooldown
 *
 * Old approach: `setInterval` inside a `useEffect`, with `useLoadingStatus`.
 * Machine approach: `resending` (invoke) → `cooldown` (after 30s) → `verifying`.
 * The timer is managed by the machine; no useEffect or setInterval in the component.
 */
describe('pattern: resend + cooldown timer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  type Ctx = { canResend: boolean; error: string | null };
  type Evt = { type: 'SUBMIT' } | { type: 'RESEND' };

  const { createMachine, createInvoke } = setup<Ctx, Evt>();

  function makeMachine(resendFn: () => Promise<void>) {
    return createMachine({
      initial: 'verifying',
      context: { canResend: true, error: null },
      states: {
        verifying: {
          on: {
            SUBMIT: { target: 'submitting' },
            RESEND: { target: 'resending' },
          },
        },
        submitting: { type: 'final' },
        resending: {
          invoke: createInvoke({
            src: () => resendFn(),
            onDone: () => ({ target: 'cooldown', context: { canResend: false, error: null } }),
            onError: ({ event }) => ({ target: 'verifying', context: { error: String(event.error) } }),
          }),
        },
        cooldown: {
          after: {
            30_000: () => ({ target: 'verifying', context: { canResend: true } }),
          },
        },
      },
    });
  }

  it('starts in verifying with canResend=true', () => {
    const actor = createActor(makeMachine(() => Promise.resolve()));
    actor.start();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.canResend).toBe(true);
  });

  it('enters resending on RESEND', () => {
    const gate = deferred<void>();
    const actor = createActor(makeMachine(() => gate.promise));
    actor.start();
    actor.send({ type: 'RESEND' });
    expect(actor.getSnapshot().value).toBe('resending');
  });

  it('enters cooldown after resend resolves and sets canResend=false', async () => {
    const actor = createActor(makeMachine(() => Promise.resolve()));
    actor.start();
    actor.send({ type: 'RESEND' });
    await vi.runAllTicks();
    expect(actor.getSnapshot().value).toBe('cooldown');
    expect(actor.getSnapshot().context.canResend).toBe(false);
  });

  it('returns to verifying with canResend=true after 30s', async () => {
    const actor = createActor(makeMachine(() => Promise.resolve()));
    actor.start();
    actor.send({ type: 'RESEND' });
    await vi.runAllTicks();
    vi.advanceTimersByTime(30_000);
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.canResend).toBe(true);
  });

  it('cannot RESEND during cooldown — RESEND is not handled in cooldown state', async () => {
    const actor = createActor(makeMachine(() => Promise.resolve()));
    actor.start();
    actor.send({ type: 'RESEND' });
    await vi.runAllTicks(); // → cooldown
    const before = actor.getSnapshot();
    actor.send({ type: 'RESEND' }); // cooldown has no RESEND handler → no-op
    expect(actor.getSnapshot()).toBe(before);
  });

  it('returns to verifying with error if resend fails — no cooldown started', async () => {
    const actor = createActor(makeMachine(() => Promise.reject(new Error('Rate limited'))));
    actor.start();
    actor.send({ type: 'RESEND' });
    await vi.runAllTicks();
    expect(actor.getSnapshot().value).toBe('verifying');
    expect(actor.getSnapshot().context.error).toBe('Error: Rate limited');
  });
});

// ─── Pattern 3: Error cleared on new input ────────────────────────────────────

/**
 * An error set by a failed submission should clear as soon as the user types.
 * Old approach: `card.setError(undefined)` in the onChange handler.
 * Machine approach: the `TYPE` transition returns a context patch that clears `error`.
 */
describe('pattern: error cleared on new input', () => {
  type Ctx = { value: string; error: string | null };
  type Evt = { type: 'TYPE'; value: string } | { type: 'SUBMIT' };

  const { createMachine, createInvoke } = setup<Ctx, Evt>();

  function makeMachine(submitFn: (value: string) => Promise<void>) {
    return createMachine({
      initial: 'idle',
      context: { value: '', error: null },
      states: {
        idle: {
          on: {
            TYPE: ({ event }) => ({ context: { value: event.value, error: null } }),
            SUBMIT: { target: 'submitting' },
          },
        },
        submitting: {
          invoke: createInvoke({
            input: ({ context }) => context.value,
            src: ({ input }) => submitFn(input),
            onDone: { target: 'success' },
            onError: ({ event }) => ({ target: 'idle', context: { error: String(event.error) } }),
          }),
        },
        success: { type: 'final' },
      },
    });
  }

  it('error is set on failed submit', async () => {
    const actor = createActor(makeMachine(() => Promise.reject(new Error('Invalid'))));
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    expect(actor.getSnapshot().context.error).toBe('Error: Invalid');
  });

  it('error is cleared immediately when user types after a failed submit', async () => {
    const actor = createActor(makeMachine(() => Promise.reject(new Error('Invalid'))));
    actor.start();
    actor.send({ type: 'SUBMIT' });
    await tick();
    actor.send({ type: 'TYPE', value: 'corrected' });
    expect(actor.getSnapshot().context.error).toBeNull();
    expect(actor.getSnapshot().context.value).toBe('corrected');
  });
});

// ─── Pattern 4: Conditional initial state via a choice state ─────────────────

/**
 * A factor verification screen where:
 * - Code-based factors (email_code, phone_code) call prepareFirstFactor on entry
 * - Password goes straight to the input field
 * - Switching strategies routes back through the same logic
 *
 * Old approach: `if (needsPrepare) { prepare() }` in a useEffect.
 * Machine approach: a `choice` initial state, reused after every strategy switch.
 */
describe('pattern: conditional initial state + choice routing on strategy switch', () => {
  const CODE_STRATEGIES = new Set(['email_code', 'phone_code']);
  const needsPrepare = (strategy: string) => CODE_STRATEGIES.has(strategy);

  type Ctx = { strategy: string; value: string; error: string | null };
  type Evt = { type: 'TYPE'; value: string } | { type: 'SUBMIT' } | { type: 'SELECT'; strategy: string };

  const { createMachine, createInvoke } = setup<Ctx, Evt, { strategy: string } | undefined>();

  function makeMachine(prepareFn: () => Promise<void>) {
    return createMachine({
      initial: 'routing',
      context: ({ input }) => ({ strategy: input?.strategy ?? 'password', value: '', error: null }),
      states: {
        preparing: {
          on: {
            SELECT: ({ event }) => ({
              target: 'routing',
              context: { strategy: event.strategy, value: '', error: null },
            }),
          },
          invoke: createInvoke({
            src: () => prepareFn(),
            onDone: { target: 'verifying' },
            onError: ({ event }) => ({ target: 'verifying', context: { error: String(event.error) } }),
          }),
        },
        verifying: {
          on: {
            TYPE: ({ event }) => ({ context: { value: event.value, error: null } }),
            SUBMIT: { target: 'submitting' },
            SELECT: ({ event }) => ({
              target: 'routing',
              context: { strategy: event.strategy, value: '', error: null },
            }),
          },
        },
        routing: {
          type: 'choice',
          choice: ({ context }) => (needsPrepare(context.strategy) ? { target: 'preparing' } : { target: 'verifying' }),
        },
        submitting: { type: 'final' },
      },
    });
  }

  it('starts in verifying for password strategy', () => {
    const actor = createActor(
      makeMachine(() => Promise.resolve()),
      { input: { strategy: 'password' } },
    );
    actor.start();
    expect(actor.getSnapshot().value).toBe('verifying');
  });

  it('starts in preparing for email_code strategy', () => {
    const gate = deferred<void>();
    const actor = createActor(
      makeMachine(() => gate.promise),
      { input: { strategy: 'email_code' } },
    );
    actor.start();
    expect(actor.getSnapshot().value).toBe('preparing');
  });

  it('transitions from preparing to verifying once prepare resolves', async () => {
    const actor = createActor(
      makeMachine(() => Promise.resolve()),
      { input: { strategy: 'email_code' } },
    );
    actor.start();
    await tick();
    expect(actor.getSnapshot().value).toBe('verifying');
  });

  it('routes to preparing when switching to a code strategy', () => {
    const gate = deferred<void>();
    const actor = createActor(makeMachine(() => gate.promise));
    actor.start(); // starts in verifying (password)
    actor.send({ type: 'SELECT', strategy: 'phone_code' });
    expect(actor.getSnapshot().value).toBe('preparing');
    expect(actor.getSnapshot().context.strategy).toBe('phone_code');
  });

  it('routes to verifying when switching to password strategy', () => {
    const gate = deferred<void>();
    const actor = createActor(
      makeMachine(() => gate.promise),
      { input: { strategy: 'email_code' } },
    );
    actor.start(); // starts in preparing
    // Simulate switching to password while prepare is in-flight
    actor.send({ type: 'SELECT', strategy: 'password' });
    expect(actor.getSnapshot().value).toBe('verifying');
  });
});

// ─── Pattern 5: Post-invoke routing via a choice state ────────────────────────

/**
 * After an async call resolves, route to one of several states based on the
 * returned status string. The status is stored in context; a `choice` state
 * fans out immediately.
 *
 * Old approach: `if (status === 'x') { wizard.goto('x') }` chains in then/catch.
 * Machine approach: `onDone` stores the status; the `choice` state reads it from context.
 */
describe('pattern: post-invoke routing via a choice state', () => {
  type Ctx = { pendingStatus: string };
  type Evt = { type: 'START' };

  const { createMachine, createInvoke } = setup<Ctx, Evt>();

  function makeMachine(asyncFn: () => Promise<{ status: string }>) {
    return createMachine({
      initial: 'idle',
      context: { pendingStatus: '' },
      states: {
        idle: { on: { START: { target: 'loading' } } },
        loading: {
          invoke: createInvoke({
            src: () => asyncFn(),
            onDone: ({ event }) => ({ target: 'routing', context: { pendingStatus: event.output.status } }),
            onError: { target: 'idle' },
          }),
        },
        routing: {
          type: 'choice',
          choice: ({ context }) => routeByStatus(context.pendingStatus),
        },
        firstFactor: {},
        secondFactor: {},
        complete: { type: 'final' },
      },
    });
  }

  it('routes to firstFactor when status is needs_first_factor', async () => {
    const actor = createActor(makeMachine(() => Promise.resolve({ status: 'needs_first_factor' })));
    actor.start();
    actor.send({ type: 'START' });
    await tick();
    expect(actor.getSnapshot().value).toBe('firstFactor');
  });

  it('routes to secondFactor when status is needs_second_factor', async () => {
    const actor = createActor(makeMachine(() => Promise.resolve({ status: 'needs_second_factor' })));
    actor.start();
    actor.send({ type: 'START' });
    await tick();
    expect(actor.getSnapshot().value).toBe('secondFactor');
  });

  it('routes to complete as the fallback when no status matches', async () => {
    const actor = createActor(makeMachine(() => Promise.resolve({ status: 'complete' })));
    actor.start();
    actor.send({ type: 'START' });
    await tick();
    expect(actor.getSnapshot().value).toBe('complete');
    expect(actor.getSnapshot().status).toBe('done');
  });
});

// ─── Pattern 6: Typed invoke output via a named actor ─────────────────────────

/**
 * A named actor carries its resolved type to `onDone`, so the full resource is
 * available as `event.output`. `machine.provide` swaps the actor per caller.
 */
describe('pattern: typed invoke output via a named actor', () => {
  interface Resource {
    status: string;
    id: string;
  }

  type Ctx = { resource: Resource | null; error: string | null };
  type Evt = { type: 'FETCH' };

  const { createMachine } = setup<Ctx, Evt>();

  const machine = createMachine({
    initial: 'idle',
    context: { resource: null, error: null },
    actors: { fetch: createAsyncLogic(() => Promise.resolve<Resource>({ status: '', id: '' })) },
    states: {
      idle: { on: { FETCH: { target: 'loading' } } },
      loading: {
        invoke: {
          src: 'fetch',
          onDone: ({ event }) => ({ target: 'done', context: { resource: event.output } }),
          onError: ({ event }) => ({ target: 'idle', context: { error: String(event.error) } }),
        },
      },
      done: { type: 'final' },
    },
  });

  it('stores the full resolved resource in context', async () => {
    const resource: Resource = { status: 'complete', id: 'res_123' };
    const actor = createActor(
      machine.provide({ actors: { fetch: createAsyncLogic(() => Promise.resolve(resource)) } }),
    );
    actor.start();
    actor.send({ type: 'FETCH' });
    await tick();
    expect(actor.getSnapshot().context.resource).toEqual(resource);
    expect(actor.getSnapshot().context.resource?.id).toBe('res_123');
  });

  it('stores the full resource including non-status fields', async () => {
    const resource: Resource = { status: 'needs_first_factor', id: 'si_abc' };
    const actor = createActor(
      machine.provide({ actors: { fetch: createAsyncLogic(() => Promise.resolve(resource)) } }),
    );
    actor.start();
    actor.send({ type: 'FETCH' });
    await tick();
    // The full object is available — not just the primitive we had to extract before
    expect(actor.getSnapshot().context.resource?.status).toBe('needs_first_factor');
    expect(actor.getSnapshot().context.resource?.id).toBe('si_abc');
  });
});

// ─── Pattern 7: On-mount async (replaces useEffect(fn, [])) ──────────────────

/**
 * A component that must perform async work immediately on mount and route
 * based on the result. The classic implementation is:
 *
 *   useEffect(() => {
 *     signIn.create({ strategy: 'ticket', ticket }).then(res => {
 *       if (res.status === 'needs_first_factor') navigate('factor-one');
 *       ...
 *     });
 *   }, []);
 *
 * Machine approach: make the async work the INITIAL state. actor.start() fires
 * the invoke — no useEffect in the component, no imperative navigate calls.
 *
 * The component renders a loading indicator while in `redeeming`, and never
 * needs to know what "needs_first_factor" means — it just reads snapshot.value.
 */
describe('pattern: on-mount async — initial state invokes immediately', () => {
  type Ctx = { ticket: string; pendingStatus: string };
  type Evt = { type: 'CANCEL' };

  const { createMachine, createInvoke } = setup<Ctx, Evt, { ticket: string }>();

  function makeMachine(redeemFn: (ticket: string) => Promise<{ status: string }>) {
    return createMachine({
      initial: 'redeeming',
      context: ({ input }) => ({ ticket: input.ticket, pendingStatus: '' }),
      states: {
        redeeming: {
          invoke: createInvoke({
            input: ({ context }) => context.ticket,
            src: ({ input }) => redeemFn(input),
            onDone: ({ event }) => ({ target: 'routing', context: { pendingStatus: event.output.status } }),
            onError: { target: 'failed' },
          }),
          on: { CANCEL: { target: 'cancelled' } },
        },
        routing: {
          type: 'choice',
          choice: ({ context }) => routeByStatus(context.pendingStatus),
        },
        firstFactor: {},
        secondFactor: {},
        complete: { type: 'final' },
        failed: {},
        cancelled: {},
      },
    });
  }

  it('fires the async call immediately on start — no useEffect in the component', () => {
    const redeemFn = vi.fn(() => Promise.resolve({ status: 'needs_first_factor' }));
    const actor = createActor(makeMachine(redeemFn), { input: { ticket: 'org_ticket_123' } });
    actor.start();
    expect(actor.getSnapshot().value).toBe('redeeming');
    expect(redeemFn).toHaveBeenCalledWith('org_ticket_123');
  });

  it('routes to firstFactor when the ticket resolves to needs_first_factor', async () => {
    const actor = createActor(
      makeMachine(() => Promise.resolve({ status: 'needs_first_factor' })),
      { input: { ticket: 'tk' } },
    );
    actor.start();
    await tick();
    expect(actor.getSnapshot().value).toBe('firstFactor');
  });

  it('routes to secondFactor when the ticket resolves to needs_second_factor', async () => {
    const actor = createActor(
      makeMachine(() => Promise.resolve({ status: 'needs_second_factor' })),
      { input: { ticket: 'tk' } },
    );
    actor.start();
    await tick();
    expect(actor.getSnapshot().value).toBe('secondFactor');
  });

  it('routes to complete as the fallback', async () => {
    const actor = createActor(
      makeMachine(() => Promise.resolve({ status: 'complete' })),
      { input: { ticket: 'tk' } },
    );
    actor.start();
    await tick();
    expect(actor.getSnapshot().value).toBe('complete');
    expect(actor.getSnapshot().status).toBe('done');
  });

  it('transitions to failed on error', async () => {
    const actor = createActor(
      makeMachine(() => Promise.reject(new Error('Invalid ticket'))),
      { input: { ticket: 'bad' } },
    );
    actor.start();
    await tick();
    expect(actor.getSnapshot().value).toBe('failed');
  });

  it('can be cancelled while the invoke is in-flight — late resolve is a no-op', async () => {
    const gate = deferred<{ status: string }>();
    const actor = createActor(
      makeMachine(() => gate.promise),
      { input: { ticket: 'tk' } },
    );
    actor.start();
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().value).toBe('cancelled');
    gate.resolve({ status: 'complete' });
    await tick();
    // Machine stays in cancelled — the in-flight invoke was abandoned
    expect(actor.getSnapshot().value).toBe('cancelled');
  });
});

// ─── Pattern 8: Reactive value → auto-switch (replaces useLayoutEffect) ───────

/**
 * A sign-in identifier field that auto-switches to phone input when the user
 * types (or a browser autofills) a value starting with "+".
 *
 * Old approach:
 *   const [hasSwitchedByAutofill, setHasSwitchedByAutofill] = useState(false);
 *   useLayoutEffect(() => {
 *     if (value.startsWith('+') && phoneEnabled && fieldType !== 'phone' && !hasSwitchedByAutofill) {
 *       switchToPhone(value);
 *       setHasSwitchedByAutofill(true); // prevent re-triggering on subsequent autofills
 *     }
 *   }, [value]);
 *
 * Machine approach: the TYPE event handler applies the same guard atomically.
 * `hasAutoSwitched` lives in context alongside the value — no separate useState,
 * no useLayoutEffect, no risk of the effect firing after unmount.
 *
 * The loop-prevention guard (hasAutoSwitched) works the same way; a manual
 * SWITCH_FIELD event resets it so autofill can trigger once more.
 */
describe('pattern: reactive value auto-switch (replaces useLayoutEffect + hasSwitchedByAutofill)', () => {
  type FieldType = 'text' | 'phone';
  type Ctx = { value: string; fieldType: FieldType; hasAutoSwitched: boolean };
  type Evt = { type: 'TYPE'; value: string } | { type: 'SWITCH_FIELD' } | { type: 'SUBMIT' };

  const { createMachine } = setup<Ctx, Evt>();

  function makeMachine(phoneEnabled: boolean) {
    return createMachine({
      initial: 'idle',
      context: { value: '', fieldType: 'text', hasAutoSwitched: false },
      states: {
        idle: {
          on: {
            TYPE: ({ context, event }) => {
              const shouldSwitch =
                phoneEnabled &&
                event.value.startsWith('+') &&
                context.fieldType !== 'phone' &&
                !context.hasAutoSwitched;
              if (shouldSwitch) {
                return { context: { value: event.value, fieldType: 'phone', hasAutoSwitched: true } };
              }
              return { context: { value: event.value } };
            },
            SWITCH_FIELD: ({ context }) => ({
              context: { fieldType: context.fieldType === 'text' ? 'phone' : 'text', hasAutoSwitched: false },
            }),
            SUBMIT: { target: 'submitting' },
          },
        },
        submitting: { type: 'final' },
      },
    });
  }

  it('switches to phone when value starts with +', () => {
    const actor = createActor(makeMachine(true));
    actor.start();
    actor.send({ type: 'TYPE', value: '+1 555 123 4567' });
    expect(actor.getSnapshot().context.fieldType).toBe('phone');
    expect(actor.getSnapshot().context.hasAutoSwitched).toBe(true);
  });

  it('does not switch again on subsequent autofills — loop prevention', () => {
    const actor = createActor(makeMachine(true));
    actor.start();
    actor.send({ type: 'TYPE', value: '+1 555 123 4567' }); // auto-switches, marks guard
    actor.send({ type: 'TYPE', value: '+1 999 000 0000' }); // should NOT switch again
    expect(actor.getSnapshot().context.fieldType).toBe('phone');
    expect(actor.getSnapshot().context.value).toBe('+1 999 000 0000'); // value still updates
  });

  it('does not switch when phone is not enabled', () => {
    const actor = createActor(makeMachine(false));
    actor.start();
    actor.send({ type: 'TYPE', value: '+44 20 1234 5678' });
    expect(actor.getSnapshot().context.fieldType).toBe('text');
  });

  it('manual SWITCH_FIELD resets the guard so autofill can trigger once more', () => {
    const actor = createActor(makeMachine(true));
    actor.start();
    actor.send({ type: 'TYPE', value: '+1 555' }); // auto-switches to phone, hasAutoSwitched = true
    actor.send({ type: 'SWITCH_FIELD' }); // user manually switches back to text, resets guard
    expect(actor.getSnapshot().context.fieldType).toBe('text');
    expect(actor.getSnapshot().context.hasAutoSwitched).toBe(false);
    actor.send({ type: 'TYPE', value: '+44 777' }); // autofill can trigger once more
    expect(actor.getSnapshot().context.fieldType).toBe('phone');
  });

  it('does not switch when already in phone mode', () => {
    const actor = createActor(makeMachine(true));
    actor.start();
    actor.send({ type: 'SWITCH_FIELD' }); // manually switch to phone
    const before = actor.getSnapshot();
    actor.send({ type: 'TYPE', value: '+1 555' }); // already phone — no change to fieldType
    expect(actor.getSnapshot().context.fieldType).toBe('phone');
    expect(actor.getSnapshot().context.hasAutoSwitched).toBe(before.context.hasAutoSwitched);
  });
});
