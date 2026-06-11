import { describe, expect, it } from 'vitest';

import { guardHolds, initialState, reduce, type WizardConfig, type WizardState } from '../reducer';
import type { WizardStepDescriptor } from '../types';

const cfg = (descriptors: WizardStepDescriptor[]): WizardConfig => ({ descriptors });

/**
 * A representative monotonic guard set over 4 steps:
 *   a — entry (no guard, always enterable)
 *   b — guard: g1
 *   c — guard: g2
 *   d — guard: g3
 * Toggling g1..g3 from all-false to all-true walks the furthest-reachable
 * boundary one step at a time. Monotonic by construction (g3 ⇒ g2 ⇒ g1).
 */
const monotonic = (g1: boolean, g2: boolean, g3: boolean): WizardStepDescriptor[] => [
  { id: 'a' },
  { id: 'b', guard: () => g1 },
  { id: 'c', guard: () => g2 },
  { id: 'd', guard: () => g3 },
];

const at = (current: string): WizardState => ({ current, direction: 0, hasNavigated: false });

describe('guardHolds', () => {
  it('resolves TRUE when no guard (entry step default flip)', () => {
    expect(guardHolds({ id: 'a' })).toBe(true);
  });

  it('delegates to the inline predicate', () => {
    expect(guardHolds({ id: 'b', guard: () => true })).toBe(true);
    expect(guardHolds({ id: 'b', guard: () => false })).toBe(false);
  });
});

describe('initialState — furthest contiguously-reachable step', () => {
  it('all guards false but entry → step 0', () => {
    expect(initialState(cfg(monotonic(false, false, false))).current).toBe('a');
  });

  it('entry + next reachable → that step', () => {
    expect(initialState(cfg(monotonic(true, false, false))).current).toBe('b');
  });

  it('two steps reachable → the second gate', () => {
    expect(initialState(cfg(monotonic(true, true, false))).current).toBe('c');
  });

  it('everything reachable → last step', () => {
    expect(initialState(cfg(monotonic(true, true, true))).current).toBe('d');
  });

  it('stops at the first gate (does not jump a closed guard)', () => {
    // b open, c closed, d open: contiguous run stops at b.
    expect(initialState(cfg(monotonic(true, false, true))).current).toBe('b');
  });

  it('degenerate empty graph → empty current, no crash', () => {
    const s = initialState(cfg([]));
    expect(s.current).toBe('');
    expect(s.hasNavigated).toBe(false);
  });

  it('seeds direction 0 and hasNavigated false', () => {
    const s = initialState(cfg(monotonic(true, false, false)));
    expect(s.direction).toBe(0);
    expect(s.hasNavigated).toBe(false);
  });
});

describe('reduce — referential identity on every no-op path', () => {
  it('NEXT on unknown current → same ref', () => {
    const s = at('zzz');
    expect(reduce(s, { type: 'NEXT' }, cfg(monotonic(true, true, true)))).toBe(s);
  });

  it('NEXT at terminal → same ref', () => {
    const s = at('d');
    expect(reduce(s, { type: 'NEXT' }, cfg(monotonic(true, true, true)))).toBe(s);
  });

  it('NEXT blocked by next guard → same ref', () => {
    const s = at('a');
    // b's guard is false → cannot advance.
    expect(reduce(s, { type: 'NEXT' }, cfg(monotonic(false, false, false)))).toBe(s);
  });

  it('PREV on unknown current → same ref', () => {
    const s = at('zzz');
    expect(reduce(s, { type: 'PREV' }, cfg(monotonic(true, true, true)))).toBe(s);
  });

  it('PREV at first position → same ref', () => {
    const s = at('a');
    expect(reduce(s, { type: 'PREV' }, cfg(monotonic(true, true, true)))).toBe(s);
  });

  it('PREV blocked by predecessor guard → same ref', () => {
    // Non-monotonic on purpose: at c, b's guard is false.
    const steps: WizardStepDescriptor[] = [
      { id: 'a' },
      { id: 'b', guard: () => false },
      { id: 'c', guard: () => true },
    ];
    const s = at('c');
    expect(reduce(s, { type: 'PREV' }, cfg(steps))).toBe(s);
  });

  it('GOTO unknown id → same ref', () => {
    const s = at('a');
    expect(reduce(s, { type: 'GOTO', step: 'zzz' }, cfg(monotonic(true, true, true)))).toBe(s);
  });

  it('GOTO current id → same ref', () => {
    const s = at('a');
    expect(reduce(s, { type: 'GOTO', step: 'a' }, cfg(monotonic(true, true, true)))).toBe(s);
  });

  it('GOTO blocked by target guard → same ref', () => {
    const s = at('a');
    // d's guard is false → cannot jump.
    expect(reduce(s, { type: 'GOTO', step: 'd' }, cfg(monotonic(true, true, false)))).toBe(s);
  });

  it('unknown event type → same ref', () => {
    const s = at('a');
    // @ts-expect-error exercising the default branch
    expect(reduce(s, { type: 'NOPE' }, cfg(monotonic(true, true, true)))).toBe(s);
  });
});

describe('reduce — NEXT sequential + guard-gated', () => {
  it('advances exactly one slot when the next guard holds', () => {
    const next = reduce(at('a'), { type: 'NEXT' }, cfg(monotonic(true, false, false)));
    expect(next.current).toBe('b');
    expect(next.direction).toBe(1);
    expect(next.hasNavigated).toBe(true);
  });

  it('does NOT skip a satisfied step — one slot only', () => {
    // Even with everything reachable, NEXT from a lands on b (not d).
    const next = reduce(at('a'), { type: 'NEXT' }, cfg(monotonic(true, true, true)));
    expect(next.current).toBe('b');
  });

  it('a hard stop mid-flow does not skip ahead to a later open guard', () => {
    // b open, c closed, d open. From b, NEXT targets c (closed) → no-op.
    const s = at('b');
    expect(reduce(s, { type: 'NEXT' }, cfg(monotonic(true, false, true)))).toBe(s);
  });
});

describe('reduce — PREV positional + guard-gated', () => {
  it('walks exactly one declaration slot back', () => {
    const prev = reduce(at('c'), { type: 'PREV' }, cfg(monotonic(true, true, true)));
    expect(prev.current).toBe('b');
    expect(prev.direction).toBe(-1);
    expect(prev.hasNavigated).toBe(true);
  });

  it('is positional, not history-based (from d → c regardless of arrival path)', () => {
    const prev = reduce(at('d'), { type: 'PREV' }, cfg(monotonic(true, true, true)));
    expect(prev.current).toBe('c');
  });
});

describe('reduce — GOTO guard-gated', () => {
  it('jumps to a reachable target', () => {
    const goto = reduce(at('a'), { type: 'GOTO', step: 'c' }, cfg(monotonic(true, true, true)));
    expect(goto.current).toBe('c');
    expect(goto.direction).toBe(0);
    expect(goto.hasNavigated).toBe(true);
  });

  it('jumps backward to a reachable target', () => {
    const goto = reduce(at('d'), { type: 'GOTO', step: 'a' }, cfg(monotonic(true, true, true)));
    expect(goto.current).toBe('a');
  });
});
