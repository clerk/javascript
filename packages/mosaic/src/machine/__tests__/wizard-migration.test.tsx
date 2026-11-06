import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createActor, restoreActor } from '../create-actor';
import { setup } from '../setup';
import type { Actor, StateConfig, StateMachine } from '../types';
import { useActor, useMachine, useSelector } from '../use-machine';

/**
 * Wizard migration: before → after.
 *
 * This suite doubles as the migration guide for porting a hand-rolled reducer
 * flow onto the Mosaic state-machine library. It re-expresses the ConfigureSSO
 * Wizard — today a pure `reduce(state, event, config)` reducer plus a React seam
 * — as a `createMachine` + `createActor` definition, and asserts equivalence with
 * every behavior pinned in
 * `components/ConfigureSSO/elements/Wizard/__tests__/reducer.test.ts`.
 *
 * ── BEFORE (the shape that exists today; see the live files, not copied here) ──
 *
 * `ConfigureSSO/elements/Wizard/reducer.ts`
 *   - state:   `{ current, direction, hasNavigated }`
 *   - events:  `NEXT | PREV | GOTO` (a hand-written discriminated union)
 *   - guards:  `guardHolds(step)` — each step carries an inline `() => boolean`
 *              entry precondition; an omitted guard defaults TRUE.
 *   - init:    `initialState(config)` walks forward while the *next* step's guard
 *              holds → the furthest contiguously-reachable step.
 *   - no-op:   EVERY blocked / out-of-bounds path returns the IDENTICAL `state`
 *              ref (`=== state`).
 *
 * `ConfigureSSO/elements/Wizard/useWizardMachine.ts` (the React seam)
 *   - mirrors `state`/`config` into refs during render so the stable handlers see
 *     fresh values;
 *   - a render-phase **re-seat**: if the active step's entry guard stops holding,
 *     jump to the furthest-reachable step;
 *   - a render-phase **deferred advance** (`pendingNextFrom`): a parked `NEXT`
 *     that resolves once an awaited mutation's revalidation makes the next guard
 *     hold.
 *
 * ── AFTER (this file) ──────────────────────────────────────────────────────────
 *
 * `createWizardMachine(descriptors)` builds the same flow as an introspectable
 * machine. The reducer's concepts map one-to-one:
 *   - `snapshot.value`          ↔ `state.current`
 *   - `snapshot.context`        ↔ `{ direction, hasNavigated }`
 *   - a transition function     ↔ `guardHolds` on the target step; it returns
 *     that checks the target       `undefined` when the guard fails
 *   - the `seat` choice state   ↔ `initialState` furthest-reachable derivation
 *   - an unhandled event        ↔ no commit, so `getSnapshot()` is referentially
 *                                  unchanged AND subscribers are not notified (the
 *                                  reducer's `=== state` no-op, for free)
 *
 * The seam's render-phase boilerplate collapses:
 *   - **re-seat** becomes routing to `#seat` when the current step's guard stops
 *     holding (demonstrated below);
 *   - **deferred advance** disappears: it only existed to paper over React's
 *     render-phase staleness (a stale `configRef` within one tick). An actor
 *     holds live state OUTSIDE React, so `send` reads live guards synchronously —
 *     the "click twice" race never arises. The caller `await`s then `send`s NEXT
 *     (demonstrated below). Parent/child bubbling is left to a follow-up; the
 *     boundary signal it would hook (terminal NEXT = same-ref no-op) is asserted.
 */

interface StepDescriptor {
  id: string;
  /** Inline entry precondition. Omitted ⇒ always enterable (the entry step). */
  guard?: () => boolean;
}

interface WizardContext {
  /** `1` forward, `-1` back, `0` jump/initial. Mirrors the reducer's field. */
  direction: 1 | -1 | 0;
  /** Latched true on the first navigation; backs `isInitialStep`. */
  hasNavigated: boolean;
}

type WizardEvent = { type: 'NEXT' } | { type: 'PREV' } | { type: 'GOTO'; step: string };

const SEAT = 'seat';

const INITIAL_CONTEXT: WizardContext = { direction: 0, hasNavigated: false };

const guardHolds = (d: StepDescriptor): boolean => (d.guard ? d.guard() : true);

const wizard = setup<WizardContext, WizardEvent>();

/**
 * Build the wizard flow from a runtime `descriptors[]` array (a data-driven graph
 * — the states are not a static literal). The result is introspectable:
 * `machine.states` lists the steps in declaration order, after the `seat` choice
 * state that picks where the wizard starts.
 */
function createWizardMachine(
  descriptors: StepDescriptor[],
  options: { initial?: string } = {},
): StateMachine<WizardContext, WizardEvent> {
  const furthestReachable = (): string => {
    let i = 0;
    while (i + 1 < descriptors.length && guardHolds(descriptors[i + 1])) {
      i++;
    }
    return descriptors[i].id;
  };

  const enter = (step: StepDescriptor | undefined, direction: 1 | -1 | 0) =>
    step && guardHolds(step) ? { target: step.id, context: { direction, hasNavigated: true } } : undefined;

  const states: Record<string, StateConfig<WizardContext, WizardEvent>> = {};
  if (descriptors.length > 0) {
    states[SEAT] = { id: SEAT, route: {}, type: 'choice', choice: () => ({ target: furthestReachable() }) };
  }
  descriptors.forEach((d, i) => {
    const next = descriptors[i + 1];
    const prev = descriptors[i - 1];
    states[d.id] = {
      on: {
        // One slot forward / back only — positional, never a skip-satisfied walk.
        // No handler at the boundary (terminal NEXT / first PREV) ⇒ ignored event
        // ⇒ same-ref no-op, the exact signal a parent link would bubble on.
        ...(next ? { NEXT: () => enter(next, 1) } : {}),
        ...(prev ? { PREV: () => enter(prev, -1) } : {}),
        // Excluding self makes GOTO-to-current match nothing → no-op.
        GOTO: ({ event }) =>
          enter(
            descriptors.find(t => t.id === event.step && t.id !== d.id),
            0,
          ),
      },
    };
  });

  return wizard.createMachine({
    id: 'wizard',
    initial: options.initial ?? (descriptors.length > 0 ? SEAT : ''),
    context: INITIAL_CONTEXT,
    states,
  });
}

/**
 * The stepper view (`isCompleted` positional / `isReachable` guard-driven),
 * derived from the descriptors and the current step id — no running instance.
 * This is the swingset seam: docs can enumerate and render every step without
 * clicking through the flow.
 */
const deriveStepper = (descriptors: StepDescriptor[], current: string) => {
  const currentIndex = descriptors.findIndex(d => d.id === current);
  return descriptors.map((d, i) => ({
    id: d.id,
    isCompleted: currentIndex >= 0 && i < currentIndex,
    isReachable: guardHolds(d),
  }));
};

/** Re-seat when the current step's guard stops holding (the seam's render-phase clamp). */
const reseat = (actor: Actor<WizardContext, WizardEvent>, descriptors: StepDescriptor[]) => {
  const current = descriptors.find(d => d.id === actor.getSnapshot().value);
  if (current && !guardHolds(current)) {
    actor.send({ type: 'machine.route', to: `#${SEAT}` });
  }
};

/** A representative monotonic guard set over 4 steps — mirrors reducer.test.ts. */
const monotonic = (g1: boolean, g2: boolean, g3: boolean): StepDescriptor[] => [
  { id: 'a' },
  { id: 'b', guard: () => g1 },
  { id: 'c', guard: () => g2 },
  { id: 'd', guard: () => g3 },
];

/** Start an actor restored at `value` so a parity test can assert from any step. */
const actorAt = (descriptors: StepDescriptor[], value: string) => {
  const machine = createWizardMachine(descriptors);
  return restoreActor(machine, machine.resolveState({ value, context: INITIAL_CONTEXT })).start();
};

describe('Wizard AFTER — derived initial (furthest contiguously-reachable step)', () => {
  // Parity with reducer.test.ts › "initialState — furthest contiguously-reachable step".
  const initialOf = (descriptors: StepDescriptor[]) => {
    const actor = createActor(createWizardMachine(descriptors));
    actor.start();
    return actor.getSnapshot();
  };

  it('all guards false but entry → step 0', () => {
    expect(initialOf(monotonic(false, false, false)).value).toBe('a');
  });

  it('entry + next reachable → that step', () => {
    expect(initialOf(monotonic(true, false, false)).value).toBe('b');
  });

  it('two steps reachable → the second gate', () => {
    expect(initialOf(monotonic(true, true, false)).value).toBe('c');
  });

  it('everything reachable → last step', () => {
    expect(initialOf(monotonic(true, true, true)).value).toBe('d');
  });

  it('stops at the first gate (does not jump a closed guard)', () => {
    expect(initialOf(monotonic(true, false, true)).value).toBe('b');
  });

  it('seeds direction 0 and hasNavigated false', () => {
    const snap = initialOf(monotonic(true, false, false));
    expect(snap.context.direction).toBe(0);
    expect(snap.context.hasNavigated).toBe(false);
  });

  it('degenerate empty graph → empty value, no crash (with or without start)', () => {
    expect(createActor(createWizardMachine([])).getSnapshot().value).toBe('');
    const started = createActor(createWizardMachine([]));
    started.start();
    expect(started.getSnapshot().value).toBe('');
  });
});

describe('Wizard AFTER — referential identity + no notify on every no-op path', () => {
  // Parity with reducer.test.ts › "reduce — referential identity on every no-op
  // path". The reducer asserts `=== state`; the actor's stronger equivalent is
  // "getSnapshot() unchanged AND subscribers not notified".
  const expectNoOp = (descriptors: StepDescriptor[], from: string, event: WizardEvent) => {
    const actor = actorAt(descriptors, from);
    const before = actor.getSnapshot();
    const seen: string[] = [];
    actor.subscribe(s => seen.push(s.value));
    actor.send(event);
    expect(actor.getSnapshot()).toBe(before); // referentially unchanged
    expect(seen).toEqual([]); // subscribers NOT notified
  };

  it('NEXT at terminal → same ref, no notify', () => {
    expectNoOp(monotonic(true, true, true), 'd', { type: 'NEXT' });
  });

  it('NEXT blocked by next guard → same ref, no notify', () => {
    expectNoOp(monotonic(false, false, false), 'a', { type: 'NEXT' });
  });

  it('a hard stop mid-flow does not skip ahead to a later open guard', () => {
    // b open, c closed, d open. From b, NEXT targets c (closed) → no-op.
    expectNoOp(monotonic(true, false, true), 'b', { type: 'NEXT' });
  });

  it('PREV at first position → same ref, no notify', () => {
    expectNoOp(monotonic(true, true, true), 'a', { type: 'PREV' });
  });

  it('PREV blocked by predecessor guard (non-monotonic) → same ref, no notify', () => {
    const steps: StepDescriptor[] = [{ id: 'a' }, { id: 'b', guard: () => false }, { id: 'c', guard: () => true }];
    expectNoOp(steps, 'c', { type: 'PREV' });
  });

  it('GOTO unknown id → same ref, no notify', () => {
    expectNoOp(monotonic(true, true, true), 'a', { type: 'GOTO', step: 'zzz' });
  });

  it('GOTO current id → same ref, no notify', () => {
    expectNoOp(monotonic(true, true, true), 'a', { type: 'GOTO', step: 'a' });
  });

  it('GOTO blocked by target guard → same ref, no notify', () => {
    expectNoOp(monotonic(true, true, false), 'a', { type: 'GOTO', step: 'd' });
  });

  it('unknown event type → same ref, no notify', () => {
    // @ts-expect-error exercising an event the machine does not handle
    expectNoOp(monotonic(true, true, true), 'a', { type: 'NOPE' });
  });

  // NOTE: reducer.test.ts also pins "NEXT/PREV on unknown current → same ref".
  // That case is structurally impossible in the actor model — an actor only ever
  // occupies a real state — so it needs no test. The machine REMOVES that failure
  // mode rather than guarding against it.
});

describe('Wizard AFTER — NEXT sequential + guard-gated', () => {
  // Parity with reducer.test.ts › "reduce — NEXT sequential + guard-gated".
  it('advances exactly one slot when the next guard holds', () => {
    const actor = actorAt(monotonic(true, false, false), 'a');
    actor.send({ type: 'NEXT' });
    const snap = actor.getSnapshot();
    expect(snap.value).toBe('b');
    expect(snap.context.direction).toBe(1);
    expect(snap.context.hasNavigated).toBe(true);
  });

  it('does NOT skip a satisfied step — one slot only (a → b, not d)', () => {
    const actor = actorAt(monotonic(true, true, true), 'a');
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot().value).toBe('b');
  });
});

describe('Wizard AFTER — PREV positional + guard-gated', () => {
  // Parity with reducer.test.ts › "reduce — PREV positional + guard-gated".
  it('walks exactly one declaration slot back', () => {
    const actor = actorAt(monotonic(true, true, true), 'c');
    actor.send({ type: 'PREV' });
    const snap = actor.getSnapshot();
    expect(snap.value).toBe('b');
    expect(snap.context.direction).toBe(-1);
    expect(snap.context.hasNavigated).toBe(true);
  });

  it('is positional, not history-based (from d → c regardless of arrival path)', () => {
    const actor = actorAt(monotonic(true, true, true), 'd');
    actor.send({ type: 'PREV' });
    expect(actor.getSnapshot().value).toBe('c');
  });
});

describe('Wizard AFTER — GOTO guard-gated', () => {
  // Parity with reducer.test.ts › "reduce — GOTO guard-gated".
  it('jumps to a reachable target', () => {
    const actor = actorAt(monotonic(true, true, true), 'a');
    actor.send({ type: 'GOTO', step: 'c' });
    const snap = actor.getSnapshot();
    expect(snap.value).toBe('c');
    expect(snap.context.direction).toBe(0);
    expect(snap.context.hasNavigated).toBe(true);
  });

  it('jumps backward to a reachable target', () => {
    const actor = actorAt(monotonic(true, true, true), 'd');
    actor.send({ type: 'GOTO', step: 'a' });
    expect(actor.getSnapshot().value).toBe('a');
  });
});

describe('Wizard AFTER — stepper view derived without running the machine', () => {
  it('isCompleted is positional; isReachable is guard-driven', () => {
    const view = deriveStepper([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: () => false }], 'b');
    expect(view).toEqual([
      { id: 'a', isCompleted: true, isReachable: true }, // before current, no guard
      { id: 'b', isCompleted: false, isReachable: true }, // current, guard holds
      { id: 'c', isCompleted: false, isReachable: false }, // after current, gated out
    ]);
  });

  it('enumerates every step in declaration order without running anything', () => {
    const machine = createWizardMachine([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    expect(Object.keys(machine.states)).toEqual([SEAT, 'a', 'b', 'c']);
  });
});

describe('Wizard AFTER — re-seat replaces the render-phase clamp (via the seat route)', () => {
  // The seam's render-phase "clamp" (re-seat off a step whose entry guard broke)
  // becomes a route to `#seat` when external data changes.
  it('re-seats to the furthest-reachable step when the active guard breaks', () => {
    let cOpen = true;
    const descriptors: StepDescriptor[] = [
      { id: 'a' },
      { id: 'b', guard: () => true },
      { id: 'c', guard: () => cOpen },
    ];
    const actor = createActor(createWizardMachine(descriptors));
    actor.start();
    expect(actor.getSnapshot().value).toBe('c'); // furthest reachable

    cOpen = false; // the connection backing c is deleted elsewhere
    reseat(actor, descriptors);
    expect(actor.getSnapshot().value).toBe('b'); // re-seated to furthest reachable
  });

  it('re-seats all the way to the entry step when every later guard breaks', () => {
    let unlocked = true;
    const descriptors: StepDescriptor[] = [
      { id: 'a' },
      { id: 'b', guard: () => unlocked },
      { id: 'c', guard: () => unlocked },
    ];
    const actor = createActor(createWizardMachine(descriptors));
    actor.start();
    expect(actor.getSnapshot().value).toBe('c');

    unlocked = false;
    reseat(actor, descriptors);
    expect(actor.getSnapshot().value).toBe('a');
  });

  it('does NOT move when a later guard opens while the current step still holds', () => {
    let bOpen = false;
    const descriptors: StepDescriptor[] = [{ id: 'a' }, { id: 'b', guard: () => bOpen }];
    const actor = actorAt(descriptors, 'a');

    bOpen = true; // b opens, but a still holds → re-seat must not yank forward
    reseat(actor, descriptors);
    expect(actor.getSnapshot().value).toBe('a');
  });
});

describe('Wizard AFTER — deferred advance is unnecessary outside React', () => {
  // The seam's `pendingNextFrom` parked a NEXT to survive React's render-phase
  // staleness. The actor holds live state, so `send` reads the live guard
  // synchronously: await the mutation, then send NEXT — it advances at once. No
  // parking, no "click twice".
  it('a NEXT blocked by an unmet guard advances on the next send once data lands', () => {
    let bReady = false;
    const descriptors: StepDescriptor[] = [{ id: 'a' }, { id: 'b', guard: () => bReady }];
    const actor = actorAt(descriptors, 'a');

    actor.send({ type: 'NEXT' }); // b not ready → blocked no-op
    expect(actor.getSnapshot().value).toBe('a');

    bReady = true; // the awaited mutation + revalidate landed
    actor.send({ type: 'NEXT' }); // same call site, now advances immediately
    expect(actor.getSnapshot().value).toBe('b');
  });
});

describe('Wizard AFTER — scope-boundary signal (the seam parent-link would hook)', () => {
  // Parent/child bubbling is scoped to a follow-up PR. The boundary signal it
  // would forward on is exactly the terminal/first same-ref no-op, asserted here.
  it('terminal NEXT is a no-op AND `can` reports false (the bubble trigger)', () => {
    const actor = actorAt([{ id: 'only' }], 'only'); // single step ⇒ terminal
    const before = actor.getSnapshot();
    expect(before.can({ type: 'NEXT' })).toBe(false);
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot()).toBe(before); // unchanged → a parent would bubble
  });

  it('a guard-blocked mid-flow NEXT is distinguishable from a terminal one by position', () => {
    // Both are same-ref no-ops, but `can` + the step's position in machine.states
    // tell them apart — the seam used the index to decide bubble vs hard-stop.
    const descriptors = [{ id: 'a' }, { id: 'b', guard: () => false }];
    const actor = actorAt(descriptors, 'a');
    expect(actor.getSnapshot().can({ type: 'NEXT' })).toBe(false); // blocked, but...
    const ids = Object.keys(createWizardMachine(descriptors).states);
    expect(ids.indexOf('a')).not.toBe(ids.length - 1); // ...not terminal → hard stop, not bubble
  });
});

// ── Driven through the React hooks (mirrors use-machine.test.tsx patterns) ──────

const STEP_LABEL: Record<string, string> = { intro: 'Welcome', details: 'Your details', review: 'Review & submit' };

describe('Wizard AFTER — driven through useMachine', () => {
  it('advances and retreats the displayed step on NEXT/PREV and no-ops at the terminal', () => {
    const descriptors: StepDescriptor[] = [
      { id: 'intro' },
      { id: 'details', guard: () => true },
      { id: 'review', guard: () => true },
    ];
    // Seed at the first step (the seam's `initialStepId`). A guardless wizard's
    // furthest-reachable derivation would otherwise mount on the LAST step — so
    // a linear "click through" demo starts the machine at the head explicitly.
    const machine = createWizardMachine(descriptors, { initial: 'intro' });

    function Wizard() {
      const [snapshot, send] = useMachine(machine);
      return (
        <div>
          <output data-testid='step'>{STEP_LABEL[snapshot.value]}</output>
          <button onClick={() => send({ type: 'PREV' })}>Back</button>
          <button onClick={() => send({ type: 'NEXT' })}>Next</button>
        </div>
      );
    }

    render(<Wizard />);
    expect(screen.getByTestId('step')).toHaveTextContent('Welcome');

    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByTestId('step')).toHaveTextContent('Your details');

    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByTestId('step')).toHaveTextContent('Review & submit');

    // Terminal: NEXT is a no-op, the step does not change.
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByTestId('step')).toHaveTextContent('Review & submit');

    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByTestId('step')).toHaveTextContent('Your details');
  });
});

describe('Wizard AFTER — useSelector scopes re-renders to the step slice', () => {
  it('a stepper re-renders on navigation but not on an unrelated context change', () => {
    // Seed at 'intro' (furthest-reachable would land on 'details' otherwise).
    const actor = actorAt([{ id: 'intro' }, { id: 'details', guard: () => true }], 'intro');

    const renders = vi.fn();
    function StepIndicator() {
      const current = useSelector(actor, s => s.value);
      renders();
      return <output data-testid='current'>{current}</output>;
    }

    render(<StepIndicator />);
    expect(screen.getByTestId('current')).toHaveTextContent('intro');
    renders.mockClear();

    // A GOTO to the current step is a no-op → no notify → no re-render.
    act(() => actor.send({ type: 'GOTO', step: 'intro' }));
    expect(renders).not.toHaveBeenCalled();

    // A real navigation changes the selected slice → re-render.
    act(() => actor.send({ type: 'NEXT' }));
    expect(renders).toHaveBeenCalled();
    expect(screen.getByTestId('current')).toHaveTextContent('details');
  });
});

describe('Wizard AFTER — restoreActor seats an otherwise-unreachable step', () => {
  it('renders a gated step the user could never click into (the swingset seam)', () => {
    // `locked` is gated out, so no sequence of NEXT/GOTO reaches it. Restore it to
    // snapshot its content — exactly the docs use case.
    const machine = createWizardMachine([{ id: 'intro' }, { id: 'locked', guard: () => false }]);
    const actor = restoreActor(machine, machine.resolveState({ value: 'locked', context: INITIAL_CONTEXT }));

    function Step() {
      const [snapshot] = useActor(actor);
      return <div>{snapshot.value === 'locked' ? 'Locked step content' : snapshot.value}</div>;
    }

    render(<Step />);
    expect(screen.getByText('Locked step content')).toBeInTheDocument();
    expect(actor.getSnapshot().value).toBe('locked');
  });
});
