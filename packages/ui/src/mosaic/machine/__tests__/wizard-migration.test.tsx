import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { assign } from '../assign';
import { createActor, mockActor } from '../createActor';
import { createMachine } from '../createMachine';
import type { StateConfig, StateMachine } from '../types';
import { useActor, useMachine, useSelector } from '../useMachine';

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
 *              ref (`=== state`) — load-bearing for React's bail-out and for the
 *              seam's terminal/first "bubble to parent" detection.
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
 * machine. The reducer's three concepts map one-to-one:
 *   - `snapshot.value`          ↔ `state.current`
 *   - `snapshot.context`        ↔ `{ direction, hasNavigated }`
 *   - state-node entry `guard`  ↔ `guardHolds` (gates every transition landing
 *                                  on the step, checked uniformly by the actor)
 *   - derived `initial`         ↔ `initialState` furthest-reachable derivation
 *   - guard-blocked transition  ↔ `takeTransition` returns false → no commit, so
 *     returns false (no commit)    `getSnapshot()` is referentially unchanged AND
 *                                  subscribers are not notified (the reducer's
 *                                  `=== state` no-op, for free)
 *
 * The seam's render-phase boilerplate collapses:
 *   - **re-seat** becomes `actor.recheck()` (re-validates the current entry guard
 *     and re-seats via the initial resolver — demonstrated below);
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

const guardHolds = (d: StepDescriptor): boolean => (d.guard ? d.guard() : true);

/**
 * Build the wizard flow from a runtime `descriptors[]` array (a data-driven graph
 * — the states are not a static literal). The result is a fully introspectable
 * machine: `Object.keys(machine.states)` enumerates the steps in declaration
 * order, and each state node carries its entry guard.
 */
function createWizardMachine(descriptors: StepDescriptor[]): StateMachine<WizardContext, WizardEvent> {
  const ids = descriptors.map(d => d.id);

  // Furthest contiguously-reachable step (mirrors reducer.ts `initialState`):
  // walk forward while the NEXT step's guard holds, stop at the first gate.
  const furthestReachable = (): string => {
    if (descriptors.length === 0) return '';
    let i = 0;
    while (i + 1 < descriptors.length && guardHolds(descriptors[i + 1])) i++;
    return descriptors[i].id;
  };

  const navigated = (direction: 1 | -1 | 0) =>
    assign<WizardContext, WizardEvent>(() => ({ direction, hasNavigated: true }));

  const states: Record<string, StateConfig<WizardContext, WizardEvent>> = {};
  descriptors.forEach((d, i) => {
    const nextId = ids[i + 1];
    const prevId = ids[i - 1];
    states[d.id] = {
      // STATE entry guard — gates EVERY transition that targets this step (NEXT
      // from the predecessor, PREV from the successor, any GOTO). When it fails
      // the transition is a true no-op (same snapshot ref, no notify).
      guard: d.guard,
      on: {
        // One slot forward / back only — positional, never a skip-satisfied walk.
        // No handler at the boundary (terminal NEXT / first PREV) ⇒ ignored event
        // ⇒ same-ref no-op, the exact signal a parent link would bubble on.
        ...(nextId ? { NEXT: { target: nextId, actions: navigated(1) } } : {}),
        ...(prevId ? { PREV: { target: prevId, actions: navigated(-1) } } : {}),
        // One GOTO candidate per OTHER step; the first whose transition guard
        // matches `event.step` wins, then the target's entry guard gates landing.
        // Excluding self makes GOTO-to-current match nothing → no-op.
        GOTO: descriptors
          .filter(t => t.id !== d.id)
          .map(t => ({
            target: t.id,
            guard: (_ctx: WizardContext, e: WizardEvent) => e.type === 'GOTO' && e.step === t.id,
            actions: navigated(0),
          })),
      },
    };
  });

  return createMachine<WizardContext, WizardEvent>({
    id: 'wizard',
    initial: furthestReachable,
    context: { direction: 0, hasNavigated: false },
    states,
  });
}

/**
 * The stepper view (`isCompleted` positional / `isReachable` guard-driven),
 * derived purely by INTROSPECTION — no running instance, just `machine.states` +
 * the current step id. This is the swingset seam: docs can enumerate and render
 * every step without clicking through the flow.
 */
const deriveStepper = (machine: StateMachine<WizardContext, WizardEvent>, current: string) => {
  const ids = Object.keys(machine.states);
  const currentIndex = ids.indexOf(current);
  return ids.map((id, i) => {
    const guard = machine.states[id].guard;
    return {
      id,
      isCompleted: currentIndex >= 0 && i < currentIndex,
      // Same predicate the reducer's `guardHolds` / the stepper's `isReachable`
      // bind to. The guards are nullary closures, so the args are inert.
      isReachable: guard ? guard({ direction: 0, hasNavigated: false }, { type: 'NEXT' }) : true,
    };
  });
};

/** A representative monotonic guard set over 4 steps — mirrors reducer.test.ts. */
const monotonic = (g1: boolean, g2: boolean, g3: boolean): StepDescriptor[] => [
  { id: 'a' },
  { id: 'b', guard: () => g1 },
  { id: 'c', guard: () => g2 },
  { id: 'd', guard: () => g3 },
];

/** Start an actor teleported to `value` so a parity test can assert from any step. */
const actorAt = (descriptors: StepDescriptor[], value: string) => {
  const actor = createActor(createWizardMachine(descriptors), { snapshot: { value } });
  return actor;
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

describe('Wizard AFTER — stepper view derived by introspection', () => {
  it('isCompleted is positional; isReachable is guard-driven', () => {
    const machine = createWizardMachine([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: () => false }]);
    const view = deriveStepper(machine, 'b');
    expect(view).toEqual([
      { id: 'a', isCompleted: true, isReachable: true }, // before current, no guard
      { id: 'b', isCompleted: false, isReachable: true }, // current, guard holds
      { id: 'c', isCompleted: false, isReachable: false }, // after current, gated out
    ]);
  });

  it('enumerates every step in declaration order without running anything', () => {
    const machine = createWizardMachine([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    expect(Object.keys(machine.states)).toEqual(['a', 'b', 'c']);
  });
});

describe('Wizard AFTER — re-seat replaces the render-phase clamp (via recheck)', () => {
  // The seam's render-phase "clamp" (re-seat off a step whose entry guard broke)
  // becomes a single `actor.recheck()` call when external data changes.
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
    actor.recheck();
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
    actor.recheck();
    expect(actor.getSnapshot().value).toBe('a');
  });

  it('does NOT move when a later guard opens while the current step still holds', () => {
    let bOpen = false;
    const descriptors: StepDescriptor[] = [{ id: 'a' }, { id: 'b', guard: () => bOpen }];
    const actor = createActor(createWizardMachine(descriptors), { snapshot: { value: 'a' } });

    bOpen = true; // b opens, but a still holds → recheck must not yank forward
    actor.recheck();
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
    const actor = createActor(createWizardMachine(descriptors), { snapshot: { value: 'a' } });

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
    expect(actor.can({ type: 'NEXT' })).toBe(false);
    actor.send({ type: 'NEXT' });
    expect(actor.getSnapshot()).toBe(before); // unchanged → a parent would bubble
  });

  it('a guard-blocked mid-flow NEXT is distinguishable from a terminal one by position', () => {
    // Both are same-ref no-ops, but `can` + the step's position in machine.states
    // tell them apart — the seam used the index to decide bubble vs hard-stop.
    const descriptors = [{ id: 'a' }, { id: 'b', guard: () => false }];
    const actor = actorAt(descriptors, 'a');
    expect(actor.can({ type: 'NEXT' })).toBe(false); // blocked, but...
    const ids = Object.keys(createWizardMachine(descriptors).states);
    expect(ids.indexOf('a')).not.toBe(ids.length - 1); // ...not terminal → hard stop, not bubble
  });
});

// ── Driven through the React hooks (mirrors useMachine.test.tsx patterns) ──────

const STEP_LABEL: Record<string, string> = { intro: 'Welcome', details: 'Your details', review: 'Review & submit' };

describe('Wizard AFTER — driven through useMachine', () => {
  it('advances and retreats the displayed step on NEXT/PREV and no-ops at the terminal', () => {
    const descriptors: StepDescriptor[] = [
      { id: 'intro' },
      { id: 'details', guard: () => true },
      { id: 'review', guard: () => true },
    ];
    const machine = createWizardMachine(descriptors);

    function Wizard() {
      // Seed at the first step (the seam's `initialStepId`). A guardless wizard's
      // furthest-reachable derivation would otherwise mount on the LAST step — so
      // a linear "click through" demo starts the actor at the head explicitly.
      const [snapshot, send] = useMachine(machine, { snapshot: { value: 'intro' } });
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
    const machine = createWizardMachine([{ id: 'intro' }, { id: 'details', guard: () => true }]);
    // Seed at 'intro' (furthest-reachable would land on 'details' otherwise).
    const actor = createActor(machine, { snapshot: { value: 'intro' } });
    actor.start();

    const renders = vi.fn();
    function StepIndicator() {
      const current = useSelector(actor, s => s.value);
      renders();
      return <output data-testid='current'>{current}</output>;
    }

    render(<StepIndicator />);
    expect(renders).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('current')).toHaveTextContent('intro');

    // A GOTO to the current step is a no-op → no notify → no re-render.
    act(() => actor.send({ type: 'GOTO', step: 'intro' }));
    expect(renders).toHaveBeenCalledTimes(1);

    // A real navigation changes the selected slice → exactly one re-render.
    act(() => actor.send({ type: 'NEXT' }));
    expect(renders).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('current')).toHaveTextContent('details');
  });
});

describe('Wizard AFTER — mockActor teleports into an otherwise-unreachable step', () => {
  it('renders a gated step the user could never click into (the swingset seam)', () => {
    // `locked` is gated out, so no sequence of NEXT/GOTO reaches it. Teleport in to
    // snapshot its content — exactly the docs use case.
    const machine = createWizardMachine([{ id: 'intro' }, { id: 'locked', guard: () => false }]);
    const actor = mockActor(machine, { value: 'locked' });

    function Step() {
      const [snapshot] = useActor(actor);
      return <div>{snapshot.value === 'locked' ? 'Locked step content' : snapshot.value}</div>;
    }

    render(<Step />);
    expect(screen.getByText('Locked step content')).toBeInTheDocument();
    expect(actor.getSnapshot().value).toBe('locked');
  });
});
