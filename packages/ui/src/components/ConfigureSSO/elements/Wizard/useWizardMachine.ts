import React from 'react';

import { guardHolds, initialState, reduce, type WizardConfig, type WizardEvent, type WizardState } from './reducer';
import type { WizardActiveStep, WizardContextValue } from './types';

/**
 * Inputs the host wizard wires the machine to. The `config` carries the step
 * descriptors (the body-less `steps` config array, verbatim) — each descriptor
 * holds its own inline entry guard, so there is no separate guards record.
 * `parentWizard` and `initialStepId` support nested sub-flows and resume.
 */
interface UseWizardMachineArgs {
  config: WizardConfig;
  parentWizard: WizardContextValue | null;
  /**
   * Mount on this step instead of the guard-derived initial step. Used by
   * linear nested flows that resume from an externally-decided position.
   */
  initialStepId?: string;
  /**
   * Fired with the new step id from the dispatch handler whenever a transition
   * actually changes the active step. Read from a render-updated ref so
   * `dispatch`'s identity stays stable.
   */
  onStepChange?: (stepId: string) => void;
}

/**
 * Domain-agnostic wizard state machine. `reducer.ts` is the pure
 * `(state, event, config) => state` function; this hook is the React seam that
 * owns the live state and reduces against the current config at dispatch time.
 *
 * Navigation is sequential and entry-guard-gated: a `goNext`/`goPrev` advances
 * exactly one declaration slot iff the target step's entry guard holds. A
 * guard-blocked mid-flow nav is a HARD STOP (a true no-op — never a bubble).
 * Bubbling to `parentWizard` happens ONLY from a scope boundary: the terminal
 * position for `goNext`, the first position for `goPrev`. That is how a nested
 * sub-flow's last step advances the top-level wizard (no completion callback);
 * a top-level wizard treats a boundary nav as a no-op.
 *
 * `configRef`/`stateRef` are mirrored during render (not via `useEffect`) so the
 * stable `dispatch` always sees the freshest config/state. The parent
 * fall-through runs in the handler body, never inside a `setState` updater:
 * calling the parent's `setState` from a child updater triggers React's "cannot
 * update a component while rendering a different component" warning.
 */
export const useWizardMachine = ({
  config,
  parentWizard,
  initialStepId,
  onStepChange,
}: UseWizardMachineArgs): WizardContextValue => {
  const isNested = parentWizard !== null;

  // Seed lazily so the wizard mounts on the right step in a single render pass:
  // an explicit `initialStepId` wins (nested resume); otherwise the
  // furthest-reachable guard-derived initial step.
  const [state, setState] = React.useState<WizardState>(() =>
    initialStepId ? { current: initialStepId, direction: 0, hasNavigated: false } : initialState(config),
  );

  // Render-updated mirror of the latest config so the stable dispatch below
  // always reduces against the freshest descriptors/guards.
  const configRef = React.useRef(config);
  configRef.current = config;

  // Read the parent from a ref so dispatch identity stays stable while still
  // bubbling to the freshest parent wizard.
  const parentRef = React.useRef(parentWizard);
  parentRef.current = parentWizard;

  // Render-updated mirror of the `onStepChange` callback so the stable handlers
  // below can fire the freshest callback without taking it as a dependency (which
  // would churn `dispatch`/`goNext`/`goPrev` identity every render).
  const onStepChangeRef = React.useRef(onStepChange);
  onStepChangeRef.current = onStepChange;

  // Render-updated mirror of the live state so the stable handlers below can
  // read the current state in their body (and decide whether a transition is a
  // boundary fall-through) WITHOUT a functional `setState` updater. The parent
  // bubble must happen outside the updater — a `setState` updater has to be pure
  // (no side effects), and calling the parent wizard's `setState` from inside
  // the child's updater triggers a "cannot update a component while rendering a
  // different component" warning.
  const stateRef = React.useRef(state);
  stateRef.current = state;

  // Position of `current` in the static descriptor array — the basis for both
  // first/last detection and the boundary-bubble decision below.
  const indexOfCurrent = (s: WizardState, cfg: WizardConfig): number =>
    cfg.descriptors.findIndex(d => d.id === s.current);

  // Commit a transition: persist the new state and, when the active step
  // actually changed, fire `onStepChange` from the HANDLER (not a `useEffect`,
  // not inside the `setState` updater — a `setState` updater must stay pure).
  // Reads the callback off the render-updated ref so handler identity stays
  // stable.
  const commit = (prev: WizardState, next: WizardState): void => {
    setState(next);
    if (next !== prev && next.current !== prev.current) {
      onStepChangeRef.current?.(next.current);
    }
  };

  const goNext = React.useCallback(() => {
    const prev = stateRef.current;
    const cfg = configRef.current;
    const next = reduce(prev, { type: 'NEXT' }, cfg);
    if (next === prev) {
      // No transition. Distinguish a scope boundary (terminal position — bubble
      // to the parent so a nested sub-flow's last step advances the parent)
      // from a guard-BLOCKED mid-flow next (a hard stop — a true no-op). A
      // blocked next also returns same-ref, so we MUST check the position: only
      // the terminal slot may bubble. The parent's own dispatch fires its
      // `onStepChange`, so a nested terminal advance still notifies the parent.
      const i = indexOfCurrent(prev, cfg);
      const isTerminal = i === cfg.descriptors.length - 1;
      if (isTerminal) {
        parentRef.current?.goNext();
      }
      return;
    }
    commit(prev, next);
  }, []);

  const goPrev = React.useCallback(() => {
    const prev = stateRef.current;
    const cfg = configRef.current;
    const next = reduce(prev, { type: 'PREV' }, cfg);
    if (next === prev) {
      // Mirror of goNext: bubble to the parent ONLY from the first position; a
      // guard-blocked back-nav mid-flow is a hard stop.
      const i = indexOfCurrent(prev, cfg);
      const isFirst = i === 0;
      if (isFirst) {
        parentRef.current?.goPrev();
      }
      return;
    }
    commit(prev, next);
  }, []);

  const dispatch = React.useCallback((event: WizardEvent) => {
    const prev = stateRef.current;
    const next = reduce(prev, event, configRef.current);
    commit(prev, next);
  }, []);

  const goToStep = React.useCallback((id: string) => dispatch({ type: 'GOTO', step: id }), [dispatch]);

  const current = state.current;

  // Breadcrumb-facing active steps: non-hidden descriptors, in declaration
  // order. Derived synchronously from the live descriptors — known before
  // `current` is resolved, so there is no inconsistency window. Each item
  // carries `isCompleted` (POSITIONAL: sits before current in declaration
  // order) and `isReachable` (GUARD-DRIVEN: its entry guard holds now — the
  // single source the stepper binds `isDisabled = !isReachable` to and the same
  // predicate `goToStep` checks).
  const activeSteps = React.useMemo<WizardActiveStep[]>(() => {
    const descriptors = config.descriptors;
    const currentDescriptorIndex = descriptors.findIndex(s => s.id === current);
    return descriptors
      .map((s, descriptorIndex) => ({ s, descriptorIndex }))
      .filter(({ s }) => !s.hidden)
      .map(({ s, descriptorIndex }) => ({
        id: s.id,
        label: s.label,
        isCompleted: currentDescriptorIndex >= 0 && descriptorIndex < currentDescriptorIndex,
        isReachable: guardHolds(s),
      }));
  }, [config, current]);

  const currentIndex = activeSteps.findIndex(s => s.id === current);
  const currentStep = currentIndex >= 0 ? activeSteps[currentIndex] : undefined;

  // Position within the full (navigable) descriptor set, including hidden steps
  // — used for first/last detection so a hidden step still bounds the flow.
  const navigable = config.descriptors;
  const navIndex = navigable.findIndex(s => s.id === current);

  // Initial iff no navigation has happened since mount. Backed by the reducer's
  // latched `hasNavigated` (not a positional index, which a back-step to the
  // mount step would wrongly reset).
  const isInitialStep = !state.hasNavigated;

  return React.useMemo<WizardContextValue>(
    () => ({
      current,
      direction: state.direction,
      activeSteps,
      currentStep,
      currentIndex,
      totalSteps: activeSteps.length,
      isInitialStep,
      isNested,
      isFirstStep: navIndex <= 0 && (!parentWizard || parentWizard.isFirstStep),
      isLastStep: navIndex === navigable.length - 1 && (!parentWizard || parentWizard.isLastStep),
      goNext,
      goPrev,
      goToStep,
    }),
    [
      current,
      state.direction,
      activeSteps,
      currentStep,
      currentIndex,
      isInitialStep,
      isNested,
      navIndex,
      navigable.length,
      parentWizard,
      goNext,
      goPrev,
      goToStep,
    ],
  );
};
