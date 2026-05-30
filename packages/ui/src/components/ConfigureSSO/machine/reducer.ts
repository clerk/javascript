import type { WizardFacts } from '../data/deriveFacts';
import type { WizardStepId } from '../types';
import { type StepConfig, STEPS } from './steps.config';

/**
 * The pure state the ConfigureSSO machine tracks. No React, no resources — just
 * where we are, which direction the last transition went (for animation), and
 * the path taken so BACK can pop it.
 */
export interface MachineState {
  /**
   * The currently active step.
   */
  current: WizardStepId;
  /**
   * Direction of the last transition: `1` forward, `-1` back, `0` for jumps /
   * resets / initial mount. Drives enter/exit animation only.
   */
  direction: 1 | -1 | 0;
  /**
   * The ordered path of steps visited, oldest first. The last entry is always
   * `current`; BACK pops to the second-to-last.
   */
  history: WizardStepId[];
}

/**
 * Events the machine reduces.
 */
export type MachineEvent =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GOTO'; step: WizardStepId }
  | { type: 'RESET' };

/**
 * The steps in scope for the given facts: every step whose `enabled` predicate
 * passes (steps without an `enabled` predicate are always in scope).
 */
const enabledSteps = (facts: WizardFacts): StepConfig[] => STEPS.filter(s => s.enabled?.(facts) ?? true);

const isFulfilled = (step: StepConfig, facts: WizardFacts): boolean => step.fulfilled?.(facts) ?? false;

/**
 * Reduce a single event into the next {@link MachineState}.
 *
 * Pure: identical (state, event, facts) always yields the same result. Unknown
 * or impossible transitions (e.g. NEXT past the last step) return the state
 * unchanged.
 */
export const reduce = (state: MachineState, event: MachineEvent, facts: WizardFacts): MachineState => {
  switch (event.type) {
    case 'NEXT': {
      const steps = enabledSteps(facts);
      const currentIndex = steps.findIndex(s => s.id === state.current);
      if (currentIndex < 0) {
        return state;
      }
      // Walk forward over the enabled steps, skipping any already fulfilled,
      // and land on the first non-fulfilled step ahead.
      for (let i = currentIndex + 1; i < steps.length; i++) {
        if (!isFulfilled(steps[i], facts)) {
          return advance(state, steps[i].id, 1);
        }
      }
      // Nothing non-fulfilled ahead — stay put.
      return state;
    }

    case 'BACK': {
      if (state.history.length < 2) {
        return state;
      }
      const history = state.history.slice(0, -1);
      const previous = history[history.length - 1];
      return { current: previous, direction: -1, history };
    }

    case 'GOTO': {
      const steps = enabledSteps(facts);
      const target = steps.find(s => s.id === event.step);
      // GOTO jumps to any enabled step, ignoring `fulfilled`. No-op if the
      // target isn't enabled or is already current.
      if (!target || target.id === state.current) {
        return state;
      }
      return advance(state, target.id, 0);
    }

    case 'RESET': {
      // Always return to select-provider, force-enabling it: `facts.hasConnection`
      // won't have refetched after the delete that precedes a reset, so gating on
      // it here would wrongly keep the step disabled.
      const target: WizardStepId = 'select-provider';
      return { current: target, direction: 0, history: [target] };
    }

    default:
      return state;
  }
};

/**
 * Push a forward/jump transition onto history. BACK is handled inline because
 * it pops rather than pushes.
 */
const advance = (state: MachineState, next: WizardStepId, direction: 1 | 0): MachineState => ({
  current: next,
  direction,
  history: [...state.history, next],
});

/**
 * Where the wizard mounts on (re)load, derived purely from facts. Mirrors the
 * precedence of the legacy `deriveInitialStep`:
 *   1. `isDomainTakenByOtherOrg` → `verify-domain` (terminal warning).
 *   2. Otherwise the first enabled, non-fulfilled step.
 *   3. Otherwise the last enabled step (everything fulfilled → confirmation).
 */
export const initialState = (facts: WizardFacts): MachineState => {
  const steps = enabledSteps(facts);

  let target: WizardStepId;
  if (facts.isDomainTakenByOtherOrg) {
    target = 'verify-domain';
  } else {
    const firstUnfulfilled = steps.find(s => !isFulfilled(s, facts));
    target = (firstUnfulfilled ?? steps[steps.length - 1]).id;
  }

  return { current: target, direction: 0, history: [target] };
};
