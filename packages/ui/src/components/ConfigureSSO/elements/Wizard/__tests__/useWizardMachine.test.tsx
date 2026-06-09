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
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: () => false }]),
    });
    expect(result.current.current).toBe('b');
    expect(result.current.isInitialStep).toBe(true);
  });

  it('an explicit initialStepId wins over the guard-derived step', () => {
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');
  });

  it('falls back to the guard-derived step when initialStepId names no descriptor', () => {
    // An invalid seed must NOT park the machine on a step outside the graph
    // (which would dead-lock NEXT/PREV). resolveInitial rejects it and falls
    // back to initialState — here the furthest contiguously-reachable step.
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: () => false }]),
      initialStepId: 'does-not-exist',
    });
    expect(result.current.current).toBe('b');
  });

  it('seats on a nested-style valid initialStepId (the guard-less first inner step)', () => {
    // Nested SAML/verify sub-wizards resume on their first inner step, which is
    // guard-less so guardHolds is true — resolveInitial honors it verbatim, no
    // fallback. Guards regressing nested mounts back to initialState.
    const { result } = renderMachine({
      config: cfg([{ id: 'n0' }, { id: 'n1', guard: () => true }]),
      parentWizard: makeParent(),
      initialStepId: 'n0',
    });
    expect(result.current.current).toBe('n0');
  });
});

describe('useWizardMachine — sequential guard-gated navigation', () => {
  it('goNext advances one slot when the next guard holds and clears isInitialStep', () => {
    const { result } = renderMachine({
      // Seed on 'a' so there is forward room within scope.
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }]),
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
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: () => cOpen }]),
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

describe('useWizardMachine — SEAM: terminal-position bubble vs guard-blocked hard stop', () => {
  it('a TERMINAL goNext DOES bubble to parent.goNext', () => {
    const parent = makeParent();
    const { result } = renderMachine({
      config: cfg([{ id: 'only' }]), // single step => current is terminal
      parentWizard: parent,
    });
    act(() => result.current.goNext());
    expect(parent.goNext).toHaveBeenCalledTimes(1);
  });

  it('a guard-BLOCKED mid-flow goNext does NOT bubble to parent.goNext', () => {
    const parent = makeParent();
    const { result } = renderMachine({
      // a is entry (reachable), b is gated out. init stays on a (not terminal).
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => false }]),
      parentWizard: parent,
    });
    expect(result.current.current).toBe('a');
    act(() => result.current.goNext()); // blocked by b's guard, a is NOT terminal
    expect(result.current.current).toBe('a');
    expect(parent.goNext).not.toHaveBeenCalled();
  });

  it('a FIRST-position goPrev bubbles to parent.goPrev; a mid-flow blocked goPrev does not', () => {
    const parent = makeParent();
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }]),
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
    const { result } = renderMachine({ config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }]) });
    // init -> b. Not first.
    expect(result.current.isFirstStep).toBe(false);
    act(() => result.current.goPrev()); // -> a
    expect(result.current.current).toBe('a');
    expect(result.current.isFirstStep).toBe(true);
  });

  it('isLastStep is true exactly at the terminal slot', () => {
    const { result } = renderMachine({ config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }]) });
    // init -> b (terminal).
    expect(result.current.isLastStep).toBe(true);
    act(() => result.current.goPrev());
    expect(result.current.isLastStep).toBe(false);
  });

  it('activeSteps.isReachable equals guardHolds(step) for each non-hidden step', () => {
    const open = () => true;
    const closed = () => false;
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: open }, { id: 'c', guard: closed }]),
    });
    const byId = Object.fromEntries(result.current.activeSteps.map(s => [s.id, s.isReachable]));
    expect(byId.a).toBe(true); // no guard -> always reachable
    expect(byId.b).toBe(true); // open
    expect(byId.c).toBe(false); // closed
  });

  it('hidden steps are excluded from activeSteps but still bound first/last', () => {
    const { result } = renderMachine({
      config: cfg([{ id: 'hidden', hidden: true }, { id: 'a' }, { id: 'b', guard: () => true }]),
    });
    expect(result.current.activeSteps.map(s => s.id)).toEqual(['a', 'b']);
  });

  it('isCompleted is positional (steps before current in declaration order)', () => {
    const { result } = renderMachine({ config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }]) });
    // init -> b. a sits before b.
    const byId = Object.fromEntries(result.current.activeSteps.map(s => [s.id, s.isCompleted]));
    expect(byId.a).toBe(true);
    expect(byId.b).toBe(false);
  });
});

describe('useWizardMachine — deferred goNext (submit-then-advance race)', () => {
  it('advances immediately when the next guard already holds (no defer)', () => {
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');
    act(() => result.current.goNext());
    // Guard held at call time → advanced in the same tick, nothing pending.
    expect(result.current.current).toBe('b');
  });

  it('does NOT advance while the next guard is unmet, then advances once the guard updates between renders (deferred resolution)', () => {
    // Models the create/submit → advance race: `goNext` fires while the next
    // step's guard still reads false (React has not re-rendered with the fresh
    // config yet). It must NOT no-op — it parks a pending advance and resolves it
    // on a later render once the guard flips true.
    let bOpen = false;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');

    // goNext while b is gated out: a is NOT terminal, so it defers (does not
    // bubble, does not advance yet).
    act(() => result.current.goNext());
    expect(result.current.current).toBe('a');

    // The awaited mutation lands: b's guard now holds. A re-render with a fresh
    // config object lets the render-phase resolver re-reduce NEXT and advance.
    bOpen = true;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('keeps a pending advance across an intermediate render where the guard is still unmet', () => {
    // The resolver must NOT clear a pending advance just because it could not
    // advance this render — clearing early would re-open the race. It stays
    // pending until the guard finally holds.
    let bOpen = false;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }]),
      initialStepId: 'a',
    });
    act(() => result.current.goNext()); // defers, b still gated out
    expect(result.current.current).toBe('a');

    // An unrelated re-render while b is STILL gated out: pending must survive.
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    expect(result.current.current).toBe('a');

    // Now the guard opens → the still-pending advance resolves.
    bOpen = true;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('abandons a pending advance when the user goPrev before it resolves', () => {
    let bOpen = false;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      // Seed on b so there is room to step back to a, then defer forward from a.
      config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }, { id: 'c', guard: () => false }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');

    // Open b so goNext lands on b; then defer the b→c advance (c gated out).
    bOpen = true;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }, { id: 'c', guard: () => false }]),
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

    // Even if c later opens, the abandoned pending must NOT yank the user forward.
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }, { id: 'c', guard: () => true }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    expect(result.current.current).toBe('a');
  });

  it('abandons a pending advance when the user goToStep before it resolves', () => {
    const { result } = renderMachine({
      // a entry, b gated out (defer target), c reachable for the jump.
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => false }, { id: 'c', guard: () => true }]),
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
    // parent. The parent's next guard (test) has not caught up to the just-
    // resolved updateConnection yet, so the PARENT defers and resolves on its
    // own next render.
    let testOpen = false;
    const testGuard = () => testOpen;
    const { result: parent, rerender: rerenderParent } = renderMachine({
      config: cfg([{ id: 'configure' }, { id: 'test', guard: testGuard }]),
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

    // The revalidate lands: `test` guard now holds. The parent's resolver
    // advances on its next render.
    testOpen = true;
    act(() => {
      rerenderParent({
        config: cfg([{ id: 'configure' }, { id: 'test', guard: testGuard }]),
        parentWizard: null,
        initialStepId: 'configure',
      });
    });
    expect(parent.current.current).toBe('test');
  });

  it('the clamp and the deferred resolver coexist: a pending advance clears when the active step becomes unreachable', () => {
    // While a forward advance is pending, the connection backing the current step
    // is deleted (its guard breaks). The clamp re-seats current to the furthest-
    // reachable step; the deferred resolver then sees `pendingNextFrom !==
    // state.current` and abandons the pending advance — no double-setState fight,
    // no stale forward jump.
    let bOpen = true;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      // Seed on b (furthest reachable); c gated out so a forward goNext defers.
      config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }, { id: 'c', guard: () => false }]),
    });
    expect(result.current.current).toBe('b');

    act(() => result.current.goNext()); // b -> c blocked → defers from b
    expect(result.current.current).toBe('b');

    // b's guard breaks: the clamp re-seats to a, and the pending advance (parked
    // at b) is abandoned because current no longer equals b.
    bOpen = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }, { id: 'c', guard: () => false }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('a');

    // A further render does not resurrect the abandoned advance (c still gated).
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }, { id: 'c', guard: () => false }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('a');
  });
});

describe('useWizardMachine — reachability clamp (self-correct on a broken guard)', () => {
  it('re-seats to the furthest-reachable step when the active step guard breaks between renders', () => {
    // Start with c reachable; the machine seeds on c (furthest reachable).
    let cOpen = true;
    const open = () => cOpen;
    const config = cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: open }]);
    const { result, rerender } = renderMachine({ config });
    expect(result.current.current).toBe('c');

    // The connection backing c is deleted: c's guard now breaks. Re-render with a
    // fresh config object so the memo sees new descriptors. The machine notices
    // its active step is impossible and re-seats to the furthest-reachable step
    // (b — a + b still reachable, c gated out).
    cOpen = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: open }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('re-seats all the way to the entry step when every later guard breaks', () => {
    let unlocked = true;
    const gate = () => unlocked;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: gate }, { id: 'c', guard: gate }]),
    });
    expect(result.current.current).toBe('c');

    unlocked = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: gate }, { id: 'c', guard: gate }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('a');
  });

  it('re-seats to the furthest-reachable step when the active step id is no longer in the descriptors', () => {
    // Seed (validly) on 'c'. The step is then removed from the graph entirely, so
    // `current` names no descriptor — an impossible position the guard check alone
    // (which only fires when the descriptor EXISTS) would miss, dead-locking the
    // machine. The widened clamp (`!currentDescriptor || !guardHolds`) catches the
    // missing id and re-seats to the furthest-reachable surviving step (b).
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: () => true }]),
      initialStepId: 'c',
    });
    expect(result.current.current).toBe('c');

    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }]), // 'c' removed
        parentWizard: null,
        initialStepId: 'c',
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('does NOT move when a guard goes TRUE while the active step still holds (create-style change)', () => {
    // Seed on a; b is gated out. Opening b later (a guard going TRUE) must not
    // yank the user forward — a's guard still holds, so there is nothing to fix.
    let bOpen = false;
    const bGuard = () => bOpen;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }]),
      initialStepId: 'a',
    });
    expect(result.current.current).toBe('a');

    bOpen = true;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: bGuard }]),
        parentWizard: null,
        initialStepId: 'a',
      });
    });
    // a still holds — no clamp. The user advances only via an explicit goNext.
    expect(result.current.current).toBe('a');
  });

  it('is a provably one-shot: the clamp re-seats to a guard-passing step and does not loop or re-fire', () => {
    let cOpen = true;
    const open = () => cOpen;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: open }]),
    });
    expect(result.current.current).toBe('c');

    cOpen = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: open }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    // Lands on a guard-passing step (b). A subsequent render with the same broken
    // config does NOT move it again — b's guard holds, so the clamp is inert.
    expect(result.current.current).toBe('b');
    act(() => {
      rerender({
        config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: open }]),
        parentWizard: null,
        initialStepId: undefined,
      });
    });
    expect(result.current.current).toBe('b');
  });

  it('does not clamp a nested wizard (isNested) even when its active guard breaks', () => {
    // A nested machine is guard-less in practice, but the clamp is gated on
    // !isNested regardless: a nested wizard never re-seats, it bubbles instead.
    let open = true;
    const gate = () => open;
    const { result, rerender } = renderMachine({
      config: cfg([{ id: 'n0' }, { id: 'n1', guard: gate }]),
      parentWizard: makeParent(),
    });
    expect(result.current.current).toBe('n1');

    open = false;
    act(() => {
      rerender({
        config: cfg([{ id: 'n0' }, { id: 'n1', guard: gate }]),
        parentWizard: makeParent(),
        initialStepId: undefined,
      });
    });
    // Nested: no clamp. current stays put despite the broken guard.
    expect(result.current.current).toBe('n1');
  });
});
