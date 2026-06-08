import type { WizardStepDescriptor } from './types';

/**
 * The pure state a generic wizard tracks: where we are, the direction of the
 * last transition (for animation), and whether any navigation has happened.
 *
 * The engine is domain-agnostic — it knows nothing about ConfigureSSO. The step
 * graph (`descriptors`) is passed in; each descriptor carries its own inline
 * entry guard, so the reducer never needs a separate guards record.
 *
 * Navigation is *positional and sequential*: there is no visited history. PREV
 * walks one declaration slot back; the entry guard decides whether navigation
 * may land on the target.
 */
export interface WizardState {
  /**
   * The id of the currently active step.
   */
  current: string;
  /**
   * Direction of the last transition: `1` forward, `-1` back, `0` for jumps /
   * initial mount. Drives enter/exit animation only.
   */
  direction: 1 | -1 | 0;
  /**
   * Latched `true` the first time any navigation event (`NEXT`/`PREV`/`GOTO`)
   * produces a transition, and never flips back to `false`. Lets the host tell
   * "still on the initial mount step" apart from "navigated back to it", which
   * a positional index alone cannot.
   */
  hasNavigated: boolean;
}

export type WizardEvent = { type: 'NEXT' } | { type: 'PREV' } | { type: 'GOTO'; step: string };

/**
 * Everything the pure reducer needs besides its own state. Passed as an
 * argument (not closed over) so the reducer stays pure and the React seam can
 * always feed it the freshest descriptors. Guards live inline on the
 * descriptors — there is no separate guards record.
 */
export interface WizardConfig {
  descriptors: WizardStepDescriptor[];
}

/**
 * Resolve a step's inline entry guard: "may navigation land on this step right
 * now?". A step with no `guard` is always enterable (the entry step). Note the
 * default flips TRUE here — an omitted guard means "no precondition", not
 * "blocked".
 */
export const guardHolds = (step: WizardStepDescriptor): boolean => (step.guard ? step.guard() : true);

const indexOf = (steps: WizardStepDescriptor[], id: string): number => steps.findIndex(s => s.id === id);

// Entry guards are expected to be monotonic across the declared order (a later
// step's guard holding implies every earlier step's guard holds); the
// furthest-reachable init and positional back-navigation rely on that.

/**
 * Where the wizard mounts on (re)load, derived purely from the graph + guards:
 * the FURTHEST step reachable by a contiguous run of holding entry guards from
 * the first step. Walk forward while the *next* step's guard holds; stop at the
 * first gate. With monotonic guards this lands on the deepest step the user has
 * unlocked. Degenerate-safe: an empty graph yields an empty `current`.
 */
export const initialState = (config: WizardConfig): WizardState => {
  const steps = config.descriptors;
  if (steps.length === 0) {
    return { current: '', direction: 0, hasNavigated: false };
  }
  let i = 0;
  while (i + 1 < steps.length && guardHolds(steps[i + 1])) {
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
      if (!guardHolds(next)) {
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
      // Positional back-nav, still guard-gated. With monotonic guards a
      // predecessor's guard holds whenever the current step's does, so this
      // normally passes; an explicit non-monotonic guard can still block it.
      if (!guardHolds(prev)) {
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
      // `isDisabled = !isReachable` to the SAME `guardHolds(target)` predicate,
      // so a disabled breadcrumb item and a blocked GOTO agree.
      if (!guardHolds(target)) {
        return state;
      }
      return advance(target.id, 0);
    }

    default:
      return state;
  }
};
