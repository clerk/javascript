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
  onStepChange?: (stepId: string) => void;
}) =>
  renderHook(
    ({ config, parentWizard, initialStepId, onStepChange }) =>
      useWizardMachine({ config, parentWizard: parentWizard ?? null, initialStepId, onStepChange }),
    {
      initialProps: {
        config: args.config,
        parentWizard: args.parentWizard ?? null,
        initialStepId: args.initialStepId,
        onStepChange: args.onStepChange,
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
        onStepChange: undefined,
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
        onStepChange: undefined,
      });
    });
    expect(result.current.current).toBe('a');
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
        onStepChange: undefined,
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
        onStepChange: undefined,
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
        onStepChange: undefined,
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
        onStepChange: undefined,
      });
    });
    // Nested: no clamp. current stays put despite the broken guard.
    expect(result.current.current).toBe('n1');
  });
});

describe('useWizardMachine — onStepChange', () => {
  it('fires with the new step id on a goNext / goPrev / goToStep that changes current', () => {
    const onStepChange = vi.fn();
    const { result } = renderMachine({
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => true }, { id: 'c', guard: () => true }]),
      initialStepId: 'a',
      onStepChange,
    });

    act(() => result.current.goNext()); // a -> b
    expect(onStepChange).toHaveBeenLastCalledWith('b');

    act(() => result.current.goToStep('c')); // b -> c
    expect(onStepChange).toHaveBeenLastCalledWith('c');

    act(() => result.current.goPrev()); // c -> b
    expect(onStepChange).toHaveBeenLastCalledWith('b');

    expect(onStepChange).toHaveBeenCalledTimes(3);
  });

  it('does NOT fire on a guard-blocked no-op (current did not change)', () => {
    const onStepChange = vi.fn();
    const { result } = renderMachine({
      // a is entry, b is gated out. init stays on a; goNext is a hard stop.
      config: cfg([{ id: 'a' }, { id: 'b', guard: () => false }]),
      onStepChange,
    });

    act(() => result.current.goNext()); // blocked
    act(() => result.current.goToStep('b')); // blocked
    act(() => result.current.goToStep('a')); // already current → no-op
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('fires on the parent when a nested terminal goNext bubbles through its dispatch', () => {
    // The parent is a real machine so its dispatch path runs `onStepChange`.
    const parentOnStepChange = vi.fn();
    const { result: parent } = renderMachine({
      config: cfg([{ id: 'p0' }, { id: 'p1', guard: () => true }]),
      initialStepId: 'p0',
      onStepChange: parentOnStepChange,
    });

    // A single-step nested machine: its only step is terminal, so goNext bubbles.
    const { result: nested } = renderMachine({
      config: cfg([{ id: 'only' }]),
      parentWizard: parent.current,
    });

    act(() => nested.current.goNext()); // bubbles to parent.goNext: p0 -> p1
    expect(parentOnStepChange).toHaveBeenLastCalledWith('p1');
  });
});
