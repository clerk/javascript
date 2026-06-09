import React from 'react';

import { guardHolds, initialState, reduce, type WizardConfig, type WizardEvent, type WizardState } from './reducer';
import type { WizardActiveStep, WizardContextValue } from './types';

/**
 * Resolve the seed step: honor an explicit `preferred` id (nested resume) only
 * when it names a real descriptor whose entry guard holds; otherwise fall back
 * to the guard-derived furthest-reachable initial step. Guards against an
 * invalid `initialStepId` seeding the machine onto a step that isn't in the
 * graph (which would dead-lock NEXT/PREV with no clamp to recover).
 */
const resolveInitial = (cfg: WizardConfig, preferred?: string): WizardState => {
  if (preferred) {
    const target = cfg.descriptors.find(d => d.id === preferred);
    if (target && guardHolds(target)) {
      return { current: preferred, direction: 0, hasNavigated: false };
    }
  }
  return initialState(cfg);
};

interface UseWizardMachineArgs {
  config: WizardConfig;
  parentWizard: WizardContextValue | null;
  /** Mount here instead of the guard-derived initial step (nested resume). */
  initialStepId?: string;
  /**
   * Fired from the dispatch handler when a transition changes the active step.
   * Read from a render-updated ref so `dispatch`'s identity stays stable.
   */
  onStepChange?: (stepId: string) => void;
}

/**
 * Domain-agnostic wizard state machine. `reducer.ts` is the pure
 * `(state, event, config) => state`; this hook is the React seam that owns the
 * live state and reduces against the current config at dispatch time.
 *
 * Navigation is sequential and entry-guard-gated: `goNext`/`goPrev` advances one
 * slot iff the target's guard holds; a guard-blocked mid-flow nav is a HARD STOP
 * (true no-op, never a bubble). Bubbling to `parentWizard` happens ONLY from a
 * scope boundary — terminal position for `goNext`, first for `goPrev` — which is
 * how a nested sub-flow's last step advances the parent. A top-level wizard
 * treats a boundary nav as a no-op.
 *
 * `configRef`/`stateRef` are mirrored during render (not a `useEffect`) so the
 * stable `dispatch` always sees the freshest config/state. The parent
 * fall-through runs in the handler body, NEVER inside a `setState` updater:
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
  // a VALID explicit `initialStepId` wins (nested resume); otherwise the
  // furthest-reachable guard-derived initial step. `resolveInitial` rejects an
  // id that names no descriptor (or whose guard is false) so an invalid seed
  // can't park the machine on a step outside the graph.
  const [state, setState] = React.useState<WizardState>(() => resolveInitial(config, initialStepId));

  // Seam state for a DEFERRED forward advance. A submit-then-advance step
  // (`await createConnection(); goNext()`) resolves its await with the cache
  // already fresh, but React has not re-rendered yet, so `goNext`'s
  // `configRef.current` is the PRIOR render's config and the next step's guard
  // still reads false. Rather than no-op (the old race — the user had to click
  // twice), `goNext` records the position it tried to advance FROM here, and the
  // render-phase resolver below re-reduces NEXT against the FRESH `config` once
  // the awaited revalidate lands (typically the very next render). `null` ⇒ no
  // pending advance.
  const [pendingNextFrom, setPendingNextFrom] = React.useState<string | null>(null);

  // Render-updated mirrors so the stable handlers below always see the freshest
  // config / parent / callback without taking them as deps (which would churn
  // `dispatch`/`goNext`/`goPrev` identity every render).
  const configRef = React.useRef(config);
  configRef.current = config;

  const parentRef = React.useRef(parentWizard);
  parentRef.current = parentWizard;

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

  // Reachability invariant (adjust-state-during-render — NOT a useEffect): if the
  // active step's entry guard no longer holds (e.g. the connection backing it was
  // deleted from a footer reset, or revoked elsewhere), OR the active id names no
  // descriptor at all (an invalid seed, or a step removed from the graph), the
  // wizard is sitting on an impossible step. Re-seat to the furthest-reachable
  // step — the SAME derivation used on mount (initialState). React discards this
  // render and re-renders before paint, so the impossible frame never shows. Do
  // NOT "fix" this by adding a goToStep: navigation here is emergent from the
  // guard state, by design. The condition (current descriptor is missing or its
  // guard is false, and the re-seated step differs) makes it a provably one-shot
  // — initialState always lands on a guard-passing step, so it cannot loop.
  if (!isNested) {
    const currentDescriptor = config.descriptors.find(d => d.id === state.current);
    if (!currentDescriptor || !guardHolds(currentDescriptor)) {
      const seated = initialState(config);
      if (seated.current !== state.current) {
        setState(seated);
      }
    }
  }

  // Deferred-advance resolver (adjust-state-during-render — NOT a useEffect, the
  // SAME sanctioned pattern as the clamp above; runs AFTER it so the clamp wins
  // if `current` just became unreachable). When `goNext` could not advance
  // because the next step's guard had not caught up to a just-resolved mutation,
  // it parked the from-position in `pendingNextFrom`. Re-reduce NEXT against the
  // FRESH `config` this render:
  //   - the user navigated elsewhere (current moved off the parked position) →
  //     abandon the pending advance;
  //   - NEXT now advances (the awaited revalidate landed, guard holds) → commit
  //     it and clear;
  //   - NEXT still blocked (data not in yet) → keep pending; a later render
  //     (the awaited revalidate guarantees one in the happy path) resolves it.
  // Deliberately no auto-clear on "still blocked": clearing early would re-open
  // the very race this fixes.
  if (pendingNextFrom !== null) {
    if (pendingNextFrom !== state.current) {
      setPendingNextFrom(null);
    } else {
      const advanced = reduce(state, { type: 'NEXT' }, config);
      if (advanced !== state) {
        setState(advanced);
        setPendingNextFrom(null);
      }
    }
  }

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
    if (next !== prev) {
      // Advanced immediately. Any pending deferred advance is now moot.
      setPendingNextFrom(null);
      commit(prev, next);
      return;
    }
    // No transition. Distinguish a scope boundary (terminal position — bubble to
    // the parent so a nested sub-flow's last step advances the parent) from a
    // guard-BLOCKED mid-flow next. A blocked next also returns same-ref, so we
    // MUST check the position to tell them apart.
    const i = indexOfCurrent(prev, cfg);
    const isTerminal = i === cfg.descriptors.length - 1;
    if (isTerminal) {
      // Bubble unchanged — the parent itself defers if ITS next guard hasn't
      // caught up yet (the configure→test case: the nested SAML metadata step is
      // terminal, so its advance bubbles, and the parent defers test until the
      // updateConnection revalidate lands). The parent's own dispatch fires its
      // `onStepChange`.
      parentRef.current?.goNext();
      return;
    }
    // Guard-BLOCKED mid-flow next. Instead of a hard stop, DEFER: a
    // submit-then-advance handler awaited its mutation + revalidate, so the cache
    // is fresh but this render's config is stale. Park the from-position; the
    // render-phase resolver re-reduces NEXT against the fresh config next render
    // and advances once the guard holds. An explicit nav (goPrev/goToStep) before
    // then abandons it.
    setPendingNextFrom(prev.current);
  }, []);

  const goPrev = React.useCallback(() => {
    // Any explicit navigation abandons a pending forward advance.
    setPendingNextFrom(null);
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

  const goToStep = React.useCallback(
    (id: string) => {
      // Any explicit navigation abandons a pending forward advance.
      setPendingNextFrom(null);
      dispatch({ type: 'GOTO', step: id });
    },
    [dispatch],
  );

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
