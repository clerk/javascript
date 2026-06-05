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
      initialProps: { config: args.config, parentWizard: args.parentWizard ?? null, initialStepId: args.initialStepId },
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
