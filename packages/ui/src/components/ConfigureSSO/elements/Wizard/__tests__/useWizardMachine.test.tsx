import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WizardConfig } from '../reducer';
import type { WizardContextValue, WizardStepConfig } from '../types';
import { useWizardMachine } from '../useWizardMachine';

const cfg = (descriptors: WizardStepConfig[]): WizardConfig => ({ descriptors });

/** A no-op parent stub whose nav methods we can spy on. */
const makeParent = (overrides: Partial<WizardContextValue> = {}): WizardContextValue => ({
  current: 'parent',
  activeSteps: [],
  currentStep: undefined,
  currentIndex: 0,
  direction: 0,
  totalSteps: 0,
  isInitialStep: true,
  isNested: false,
  isFirstStep: true,
  isLastStep: true,
  goNext: vi.fn(),
  goPrev: vi.fn(),
  goToStep: vi.fn(),
  ...overrides,
});

const renderMachine = (args: {
  config: WizardConfig;
  parentWizard?: WizardContextValue | null;
  initialStepId?: string;
}) =>
  renderHook(
    ({ config, parentWizard, initialStepId }) =>
      useWizardMachine({ config, parentWizard: parentWizard ?? null, initialStepId }),
    {
      initialProps: {
        config: args.config,
        parentWizard: args.parentWizard ?? null,
        initialStepId: args.initialStepId,
      },
    },
  );

describe('useWizardMachine — initial seeding', () => {
  it('mounts on the furthest contiguously-reachable step', () => {
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }, { id: 'c', isReachable: () => false }]),
    });
    expect(result.current.current).toBe('b');
    expect(result.current.isInitialStep).toBe(true);
  });

  it('an explicit initialStepId wins over the reachability-derived step', () => {
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');
  });

  it('falls back to the reachability-derived step when initialStepId names no descriptor', () => {
    // An invalid seed must NOT park the machine on a step outside the graph
    // (which would dead-lock NEXT/PREV). resolveInitial rejects it and falls
    // back to initialState — here the furthest contiguously-reachable step.
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }, { id: 'c', isReachable: () => false }]),
      initialStepId: 'does-not-exist',
    });
    expect(result.current.current).toBe('b');
  });

  it('seats on a nested-style valid initialStepId (the first inner step with no isReachable)', () => {
    // Nested SAML/verify sub-wizards resume on their first inner step, which has
    // no isReachable predicate so isStepReachable is true — resolveInitial honors
    // it verbatim, no fallback. Reachability predicates regressing nested mounts
    // back to initialState.
    const { result } = renderMachine({
      config: cfg([{ id: 'n0' }, { id: 'n1', isReachable: () => true }]),
      parentWizard: makeParent(),
      initialStepId: 'n0',
    });
    expect(result.current.current).toBe('n0');
  });
});

describe('useWizardMachine — sequential isReachable-gated navigation', () => {
  it('goNext advances one slot when the next isReachable holds and clears isInitialStep', () => {
    const { result } = renderMachine({
      // Seed on 'a' so there is forward room within scope.
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');
    expect(result.current.isInitialStep).toBe(true);
    act(() => result.current.goNext());
    expect(result.current.current).toBe('b');
    expect(result.current.direction).toBe(1);
    expect(result.current.isInitialStep).toBe(false);
  });

  it('goToStep jumps to a reachable target and blocks an unreachable one', () => {
    let cOpen = false;
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }, { id: 'c', isReachable: () => cOpen }]),
    });
    // init lands on b (furthest reachable). Jump back to a.
    act(() => result.current.goToStep('a'));
    expect(result.current.current).toBe('a');
    expect(result.current.isInitialStep).toBe(false);
    // c is gated out -> blocked.
    act(() => result.current.goToStep('c'));
    expect(result.current.current).toBe('a');
    // open c, now reachable.
    cOpen = true;
    act(() => result.current.goToStep('c'));
    expect(result.current.current).toBe('c');
  });
});

describe('useWizardMachine — SEAM: terminal-position bubble vs isReachable-blocked hard stop', () => {
  it('a TERMINAL goNext DOES bubble to parent.goNext', () => {
    const parent = makeParent();
    const { result } = renderMachine({
      config: cfg([{ id: 'only' }]), // single step => current is terminal
      parentWizard: parent,
    });
    act(() => result.current.goNext());
    expect(parent.goNext).toHaveBeenCalledTimes(1);
  });

  it('an isReachable-BLOCKED mid-flow goNext does NOT bubble to parent.goNext', () => {
    const parent = makeParent();
    const { result } = renderMachine({
      // a is entry (reachable), b is gated out. init stays on a (not terminal).
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => false }]),
      parentWizard: parent,
    });
    expect(result.current.current).toBe('a');
    act(() => result.current.goNext()); // blocked by b's isReachable, a is NOT terminal
    expect(result.current.current).toBe('a');
    expect(parent.goNext).not.toHaveBeenCalled();
  });

  it('a FIRST-position goPrev bubbles to parent.goPrev; a mid-flow blocked goPrev does not', () => {
    const parent = makeParent();
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }]),
      parentWizard: parent,
    });
    // init walks to furthest reachable -> b. goPrev to a (positional).
    expect(result.current.current).toBe('b');
    act(() => result.current.goPrev());
    expect(result.current.current).toBe('a');
    expect(parent.goPrev).not.toHaveBeenCalled();
    // now at first position -> goPrev bubbles.
    act(() => result.current.goPrev());
    expect(parent.goPrev).toHaveBeenCalledTimes(1);
  });
});

describe('useWizardMachine — first/last and reachability derivations', () => {
  it('isFirstStep agrees with goPrev (true exactly when goPrev cannot move within scope)', () => {
    const { result } = renderMachine({ config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }]) });
    // init -> b. Not first.
    expect(result.current.isFirstStep).toBe(false);
    act(() => result.current.goPrev()); // -> a
    expect(result.current.current).toBe('a');
    expect(result.current.isFirstStep).toBe(true);
  });

  it('isLastStep is true exactly at the terminal slot', () => {
    const { result } = renderMachine({ config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }]) });
    // init -> b (terminal).
    expect(result.current.isLastStep).toBe(true);
    act(() => result.current.goPrev());
    expect(result.current.isLastStep).toBe(false);
  });

  it('activeSteps.isReachable equals isStepReachable(step) for each step', () => {
    const open = () => true;
    const closed = () => false;
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: open }, { id: 'c', isReachable: closed }]),
    });
    const byId = Object.fromEntries(result.current.activeSteps.map(s => [s.id, s.isReachable]));
    expect(byId.a).toBe(true); // no isReachable -> always reachable
    expect(byId.b).toBe(true); // open
    expect(byId.c).toBe(false); // closed
  });

  it('activeSteps contains every descriptor in declaration order', () => {
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b' }, { id: 'c', isReachable: () => true }]),
    });
    expect(result.current.activeSteps.map(s => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('isCompleted is positional (steps before current in declaration order)', () => {
    const { result } = renderMachine({ config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }]) });
    // init -> b. a sits before b.
    const byId = Object.fromEntries(result.current.activeSteps.map(s => [s.id, s.isCompleted]));
    expect(byId.a).toBe(true);
    expect(byId.b).toBe(false);
  });

  it('isComplete predicate overrides the positional default (position-independent completion)', () => {
    // 'a' declares its work UNdone and 'c' declares it DONE — independent of where
    // current sits. Seed on 'b' (the middle): positionally 'a' would read complete
    // and 'c' incomplete, but the predicates flip both, proving `isComplete` wins.
    const { result } = renderMachine({
      config: cfg([
        { id: 'a', isComplete: () => false },
        { id: 'b', isReachable: () => true },
        { id: 'c', isReachable: () => true, isComplete: () => true },
      ]),
      initialStepId: 'b',
    });
    expect(result.current.current).toBe('b');
    const byId = Object.fromEntries(result.current.activeSteps.map(s => [s.id, s.isCompleted]));
    expect(byId.a).toBe(false); // predicate overrides "before current" → not complete
    expect(byId.b).toBe(false); // no predicate, positional: not before itself
    expect(byId.c).toBe(true); // predicate overrides "after current" → complete
  });
});

describe('useWizardMachine — deferred goNext (submit-then-advance race)', () => {
  it('advances immediately when the next isReachable already holds (no defer)', () => {
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');
    act(() => result.current.goNext());
    // isReachable held at call time → advanced in the same tick, nothing pending.
    expect(result.current.current).toBe('b');
  });

  it('does NOT advance while the next isReachable is unmet, then advances once it updates between renders (deferred resolution)', () => {
    // Models the create/submit → advance race: `goNext` fires while the next
    // step's isReachable still reads false (React has not re-rendered with the
    // fresh config yet). It must NOT no-op — it parks a pending advance and
    // resolves it on a later render once isReachable flips true.
    let bOpen = false;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');

    // goNext while b is gated out: a is NOT terminal, so it defers (does not
    // bubble, does not advance yet).
    act(() => result.current.goNext());
    expect(result.current.current).toBe('a');

    // The awaited mutation lands: b's isReachable now holds. A re-render with a
    // fresh config object lets the render-phase resolver re-reduce NEXT and advance.
    bOpen = true;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('keeps a pending advance across an intermediate render where isReachable is still unmet', () => {
    // The resolver must NOT clear a pending advance just because it could not
    // advance this render — clearing early would re-open the race. It stays
    // pending until isReachable finally holds.
    let bOpen = false;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }]),
      initialStepId: 'a',
    });
    act(() => result.current.goNext()); // defers, b still gated out
    expect(result.current.current).toBe('a');

    // An unrelated re-render while b's isReachable is STILL false: pending must survive.
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    expect(result.current.current).toBe('a');

    // Now isReachable opens → the still-pending advance resolves.
    bOpen = true;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('abandons a pending advance when the user goPrev before the isReachable resolves', () => {
    let bOpen = false;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      // Seed on b so there is room to step back to a, then defer forward from a.
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }, { id: 'c', isReachable: () => false }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');

    // Open b so goNext lands on b; then defer the b→c advance (c's isReachable is false).
    bOpen = true;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }, { id: 'c', isReachable: () => false }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    act(() => result.current.goNext()); // a -> b (immediate)
    expect(result.current.current).toBe('b');
    act(() => result.current.goNext()); // b -> c blocked → defers (b not terminal)
    expect(result.current.current).toBe('b');

    // User steps back BEFORE the pending advance could resolve: it is abandoned.
    act(() => result.current.goPrev()); // b -> a
    expect(result.current.current).toBe('a');

    // Even if c's isReachable later opens, the abandoned pending must NOT yank the user forward.
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }, { id: 'c', isReachable: () => true }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    expect(result.current.current).toBe('a');
  });

  it('abandons a pending advance when the user goToStep before the isReachable resolves', () => {
    const { result } = renderMachine({
      // a entry, b gated out (defer target), c reachable for the jump.
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => false }, { id: 'c', isReachable: () => true }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');
    act(() => result.current.goNext()); // a -> b blocked → defers
    expect(result.current.current).toBe('a');
    // An explicit jump abandons the pending advance.
    act(() => result.current.goToStep('c'));
    expect(result.current.current).toBe('c');
  });

  it('a nested TERMINAL goNext bubbles and the PARENT defers, then resolves (configure→test case)', () => {
    // The nested SAML metadata step is terminal: its goNext bubbles to the
    // parent. The parent's next isReachable (test) has not caught up to the
    // just-resolved updateConnection yet, so the PARENT defers and resolves on
    // its own next render.
    let testOpen = false;
    const testGuard = () => testOpen;
    const { result: parent, rerender: rerenderParent } = renderMachine({
      config: cfg([{ id: 'configure' }, { id: 'test', isReachable: testGuard }]),
      initialStepId: 'configure',
    });
    expect(parent.current.current).toBe('configure');

    // Single-step nested machine: its only step is terminal, so goNext bubbles.
    const { result: nested } = renderMachine({
      config: cfg([{ id: 'idp-metadata' }]),
      parentWizard: parent.current,
    });

    // Nested terminal goNext bubbles to parent.goNext while `test` is still gated
    // out → the parent defers (does not advance yet).
    act(() => nested.current.goNext());
    expect(parent.current.current).toBe('configure');

    // The revalidate lands: `test` isReachable now holds. The parent's resolver
    // advances on its next render.
    testOpen = true;
    act(() => {
      rerenderParent({
        config: cfg([{ id: 'configure' }, { id: 'test', isReachable: testGuard }]),
        parentWizard: null,
        initialStepId: 'configure',
      });
    });
    expect(parent.current.current).toBe('test');
  });

  it('the clamp and the deferred resolver coexist: a pending advance clears when the active step becomes unreachable', () => {
    // While a forward advance is pending, the connection backing the current step
    // is deleted (its isReachable breaks). The clamp re-seats current to the
    // furthest-reachable step; the deferred resolver then sees `pendingNextFrom
    // !== state.current` and abandons the pending advance — no double-setState
    // fight, no stale forward jump.
    let bOpen = true;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      // Seed on b (furthest reachable); c gated out so a forward goNext defers.
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }, { id: 'c', isReachable: () => false }]),
    });
    expect(result.current.current).toBe('b');

    act(() => result.current.goNext()); // b -> c blocked → defers from b
    expect(result.current.current).toBe('b');

    // b's isReachable breaks: the clamp re-seats to a, and the pending advance
    // (parked at b) is abandoned because current no longer equals b.
    bOpen = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }, { id: 'c', isReachable: () => false }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('a');

    // A further render does not resurrect the abandoned advance (c still gated).
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }, { id: 'c', isReachable: () => false }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('a');
  });
});

describe('useWizardMachine — reachability clamp (self-correct on a broken isReachable)', () => {
  it('re-seats to the furthest-reachable step when the active step isReachable breaks between renders', () => {
    // Start with c reachable; the machine seeds on c (furthest reachable).
    let cOpen = true;
    const open = () => cOpen;
    const config = cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }, { id: 'c', isReachable: open }]);
    const { result, rerender } = renderMachine({ config });
    expect(result.current.current).toBe('c');

    // The connection backing c is deleted: c's isReachable now breaks. Re-render
    // with a fresh config object so the memo sees new descriptors. The machine
    // notices its active step is impossible and re-seats to the furthest-reachable
    // step (b — a + b still reachable, c gated out).
    cOpen = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }, { id: 'c', isReachable: open }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('re-seats all the way to the entry step when every later isReachable breaks', () => {
    let unlocked = true;
    const gate = () => unlocked;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: gate }, { id: 'c', isReachable: gate }]),
    });
    expect(result.current.current).toBe('c');

    unlocked = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: gate }, { id: 'c', isReachable: gate }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('a');
  });

  it('re-seats to the furthest-reachable step when the active step id is no longer in the descriptors', () => {
    // Seed (validly) on 'c'. The step is then removed from the graph entirely, so
    // `current` names no descriptor — an impossible position the isReachable check
    // alone (which only fires when the descriptor EXISTS) would miss, dead-locking
    // the machine. The widened clamp (`!currentDescriptor || !isStepReachable`)
    // catches the missing id and re-seats to the furthest-reachable surviving step (b).
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }, { id: 'c', isReachable: () => true }]),
      initialStepId: 'c',
    });
    expect(result.current.current).toBe('c');

    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }]), // 'c' removed
        parentWizard: null,
        initialStepId: 'c',
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('does NOT move when an isReachable goes TRUE while the active step still holds (create-style change)', () => {
    // Seed on a; b is gated out. Opening b later (a isReachable going TRUE) must
    // not yank the user forward — a's isReachable still holds, nothing to fix.
    let bOpen = false;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');

    bOpen = true;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: bGuard }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    // a's isReachable still holds — no clamp. The user advances only via an explicit goNext.
    expect(result.current.current).toBe('a');
  });

  it('is a provably one-shot: the clamp re-seats to a reachable step and does not loop or re-fire', () => {
    let cOpen = true;
    const open = () => cOpen;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }, { id: 'c', isReachable: open }]),
    });
    expect(result.current.current).toBe('c');

    cOpen = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }, { id: 'c', isReachable: open }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    // Lands on a reachable step (b). A subsequent render with the same broken
    // config does NOT move it again — b's isReachable holds, so the clamp is inert.
    expect(result.current.current).toBe('b');
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', isReachable: () => true }, { id: 'c', isReachable: open }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('re-seats a nested wizard in place when its active isReachable breaks (does not bubble)', () => {
    // ConfigureSSO's middle wizard is nested AND has a guarded step
    // (`configure-provider`, reachable only while a connection exists). When that
    // connection is deleted from inside the flow, the guard breaks; the clamp must
    // re-seat to the furthest LOCAL reachable step (n0 here, select-provider in the
    // app) IN PLACE rather than bubbling to the parent — otherwise the nested
    // wizard strands on an impossible step (the ORGS-1675 blank pane).
    const parent = makeParent();
    let open = true;
    const gate = () => open;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'n0' }, { id: 'n1', isReachable: gate }]),
      parentWizard: parent,
    });
    expect(result.current.current).toBe('n1');

    open = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'n0' }, { id: 'n1', isReachable: gate }]),
        parentWizard: parent,
        initialStepId: undefined,
      });
    });
    // Nested clamp: re-seats to the furthest LOCAL reachable step (n0), in place.
    expect(result.current.current).toBe('n0');
    // The re-seat is a local setState — it must NOT bubble to the parent.
    expect(parent.goNext).not.toHaveBeenCalled();
    expect(parent.goPrev).not.toHaveBeenCalled();
    expect(parent.goToStep).not.toHaveBeenCalled();
  });
});
