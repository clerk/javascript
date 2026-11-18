import type { WizardStepDescriptor } from './types';

/**
 * The pure state a generic, domain-agnostic wizard tracks. The step graph
 * (`descriptors`) is passed in; each descriptor carries its own inline entry
 * reachability predicate, so there is no separate predicates record. Navigation
 * is positional and sequential — no visited history; the reachability predicate
 * decides whether navigation may land on a target.
 */
export interface WizardState {
  current: string;
  /** `1` forward, `-1` back, `0` jump/initial. Drives animation only. */
  direction: 1 | -1 | 0;
  /**
   * Latched `true` on the first transition, never flipped back. Separates "still
   * on the initial mount step" from "navigated back to it" — which a positional
   * index alone cannot.
   */
  hasNavigated: boolean;
}

export type WizardEvent = { type: 'NEXT' } | { type: 'PREV' } | { type: 'GOTO'; step: string };

/**
 * Everything the pure reducer needs besides its own state. Passed as an argument
 * (not closed over) so the reducer stays pure and the React seam can feed it the
 * freshest descriptors.
 */
export interface WizardConfig {
  descriptors: WizardStepDescriptor[];
}

/**
 * Resolve a step's inline reachability predicate. An omitted `isReachable`
 * defaults TRUE — "no precondition" (the entry step), not "blocked".
 */
export const isStepReachable = (step: WizardStepDescriptor): boolean => (step.isReachable ? step.isReachable() : true);

const indexOf = (steps: WizardStepDescriptor[], id: string): number => steps.findIndex(s => s.id === id);

// Reachability predicates are expected to be monotonic across the declared order
// (a later step's predicate holding implies every earlier step's does); the
// furthest-reachable init and positional back-navigation rely on that.

/**
 * Where the wizard mounts on (re)load, derived purely from the graph + reachability:
 * the FURTHEST step reachable by a contiguous run of holding entry predicates from
 * the first step. Walk forward while the *next* step's predicate holds; stop at the
 * first gate. With monotonic predicates this lands on the deepest step the user has
 * unlocked. Degenerate-safe: an empty graph yields an empty `current`.
 */
export const initialState = (config: WizardConfig): WizardState => {
  const steps = config.descriptors;
  if (steps.length === 0) {
    return { current: '', direction: 0, hasNavigated: false };
  }
  let i = 0;
  while (i + 1 < steps.length && isStepReachable(steps[i + 1])) {
    i++;
  }
  return { current: steps[i].id, direction: 0, hasNavigated: false };
};

const advance = (next: string, direction: 1 | -1 | 0): WizardState => ({
  current: next,
  direction,
  hasNavigated: true,
});

/**
 * Reduce a single event into the next {@link WizardState}.
 *
 * Pure: identical (state, event, config) always yields the same result. EVERY
 * no-op path returns the IDENTICAL `state` object (`=== state`) — React's
 * state-bail and the React seam's terminal/blocked fall-through detection both
 * depend on referential identity. A guard-blocked or out-of-bounds transition
 * is a true no-op (same ref), never a silent re-seat.
 *
 * Navigation is positional and sequential: NEXT/PREV move exactly one slot;
 * there is no skip-satisfied walk and no visited history.
 */
export const reduce = (state: WizardState, event: WizardEvent, config: WizardConfig): WizardState => {
  const steps = config.descriptors;

  switch (event.type) {
    case 'NEXT': {
      const i = indexOf(steps, state.current);
      if (i < 0) {
        return state;
      }
      const next = steps[i + 1];
      // Terminal: nothing ahead. Same ref so the host can bubble to a parent.
      if (!next) {
        return state;
      }
      // Blocked: the next step's entry precondition is not met. Hard stop —
      // same ref, NO skip-ahead walk (sequential, one slot only).
      if (!isStepReachable(next)) {
        return state;
      }
      return advance(next.id, 1);
    }

    case 'PREV': {
      const i = indexOf(steps, state.current);
      if (i < 0) {
        return state;
      }
      const prev = steps[i - 1];
      // First position: nothing behind. Same ref so the host can bubble.
      if (!prev) {
        return state;
      }
      // Positional back-nav, still reachability-gated. With monotonic predicates
      // a predecessor's predicate holds whenever the current step's does, so this
      // normally passes; an explicit non-monotonic predicate can still block it.
      if (!isStepReachable(prev)) {
        return state;
      }
      return advance(prev.id, -1);
    }

    case 'GOTO': {
      const target = steps.find(s => s.id === event.step);
      // Unknown id, or already current → no-op (same ref).
      if (!target || target.id === state.current) {
        return state;
      }
      // Blocked: the target's entry precondition is not met. The stepper binds
      // `isDisabled = !isReachable` to the SAME `isStepReachable(target)` predicate,
      // so a disabled breadcrumb item and a blocked GOTO agree.
      if (!isStepReachable(target)) {
        return state;
      }
      return advance(target.id, 0);
    }

    default:
      return state;
  }
};
