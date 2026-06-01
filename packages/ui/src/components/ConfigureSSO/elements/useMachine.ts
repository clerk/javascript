import React from 'react';

import type { WizardFacts } from '../data/deriveFacts';
import { initialState, type MachineEvent, type MachineState, reduce } from '../machine/reducer';

/**
 * React owner of the pure ConfigureSSO state machine.
 *
 * The reducer in `machine/reducer.ts` is a pure `(state, event, facts) =>
 * state` function. `useMachine` is the single React seam that owns the live
 * `MachineState` and feeds the reducer the CURRENT facts at dispatch time.
 *
 * ## Why a ref instead of a `useEffect`
 *
 * The reducer needs the latest `facts` whenever an event is dispatched — not
 * the facts captured when `dispatch` was created. Two ways to keep them
 * current are possible:
 *
 *   1. Recreate `dispatch` on every facts change (`useCallback(..., [facts])`).
 *   2. Keep a render-updated ref the dispatch wrapper reads.
 *
 * Option 1 churns the `dispatch` identity on every server-state refetch, which
 * would invalidate every memo/effect that depends on it downstream. Option 2
 * keeps `dispatch` stable while always reading fresh facts. We take option 2:
 * `factsRef` is assigned during render (NOT inside a `useEffect` — syncing
 * external values via effects is disallowed here), so by the time any event
 * fires the ref already holds the facts from the most recent render.
 */
export interface Machine {
  /**
   * The currently active step.
   */
  current: MachineState['current'];
  /**
   * Direction of the last transition (`1` forward, `-1` back, `0` jump/reset).
   * Drives enter/exit animation only.
   */
  direction: MachineState['direction'];
  /**
   * Reduce an event against the live state using the latest facts. Stable
   * identity across renders.
   */
  dispatch: (event: MachineEvent) => void;
}

export const useMachine = (facts: WizardFacts): Machine => {
  // Seed lazily from the initial facts so the wizard mounts on the right step.
  const [state, setState] = React.useState<MachineState>(() => initialState(facts));

  // Render-updated mirror of the latest facts. Assigning during render (not in
  // an effect) guarantees the dispatch wrapper below always reduces against the
  // facts from the most recent commit.
  const factsRef = React.useRef(facts);
  factsRef.current = facts;

  const dispatch = React.useCallback((event: MachineEvent) => {
    setState(prev => reduce(prev, event, factsRef.current));
  }, []);

  return { current: state.current, direction: state.direction, dispatch };
};
