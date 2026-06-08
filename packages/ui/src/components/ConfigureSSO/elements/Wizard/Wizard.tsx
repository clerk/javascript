import React from 'react';

import type { WizardConfig } from './reducer';
import type { WizardStepConfig } from './types';
import { useWizardMachine } from './useWizardMachine';
import { useWizard, WizardContext } from './WizardContext';

interface WizardProps {
  /**
   * The step graph, declared explicitly as a body-less config array. Each entry
   * is a navigable position: `id` + an optional inline entry `guard`, `hidden`,
   * and breadcrumb `label`. The array *is* the graph (order, guards, breadcrumb
   * labels/visibility) — there is no `React.Children` walking and no
   * `<Wizard.Step>` component. Rendering is declarative: the children decide
   * what to show per step via `<Wizard.Match id>`.
   */
  steps: WizardStepConfig[];
  /**
   * Mount on this step instead of the guard-derived initial step. Used by
   * linear nested flows that resume from an externally-decided position.
   */
  initialStepId?: string;
  /**
   * Fired with the new step id whenever a transition actually changes the active
   * step (`goNext` / `goPrev` / `goToStep`). Fired from the dispatch handler, not
   * a `useEffect` — so a host can react to a step change (e.g. clear a card-level
   * error) without a state-sync effect. Only the top-level wizard passes this; a
   * nested terminal bubble advances through the parent's dispatch, so it fires
   * there too.
   */
  onStepChange?: (stepId: string) => void;
  /**
   * Declarative children rendered inside the wizard context. Persistent chrome
   * (breadcrumb, shared sub-flow header) is a plain child; per-step bodies are
   * `<Wizard.Match id>` children that render only when their step is active.
   */
  children?: React.ReactNode;
}

/**
 * Generic, declarative wizard primitive — UI-less, state-driven.
 *
 * Steps are declared as an explicit, body-less config array (`steps`): each
 * entry is one navigable position with an `id` and an optional inline entry
 * `guard` + `hidden` + breadcrumb `label`. The graph is the array itself —
 * known synchronously, with no effect-timed registration and no `React.Children`
 * walking. It feeds a domain-agnostic state machine in the same render pass.
 *
 * Rendering is declarative and lives in `children`: persistent chrome (the
 * breadcrumb, a shared sub-flow header) is a normal child, and each step's body
 * is a `<Wizard.Match id>` child that reads `current` from context and renders
 * its children only when active. `<Wizard.Match>` is render-only — it never
 * registers or builds the graph; the `steps` array already did.
 *
 * The machine is hidden: consumers read navigation via `useWizard()` only
 * (`goNext` / `goPrev` / `goToStep` + the derived `current` / `activeSteps` /
 * `isFirstStep` / `isLastStep`). Conditional flow is expressed by each step's
 * inline entry `guard` — a pure "may navigation land here right now?" predicate
 * applied uniformly by init / `goNext` / `goPrev` / `goToStep` / the stepper.
 * Steps are never added to or removed from the graph; they are only gated. Inner
 * sub-flows nest another `<Wizard>` inside a step body; their forward boundary
 * falls through to the parent wizard — a nested last-step `goNext` advances the
 * parent automatically, while a guard-blocked mid-flow next is a hard stop.
 */
const WizardRoot = ({ steps, initialStepId, onStepChange, children }: WizardProps): JSX.Element => {
  const parentWizard = React.useContext(WizardContext);

  // The config the pure reducer reads. The body-less `steps` array is the
  // descriptor verbatim — no body stripping; guards are inline on each entry.
  // Memoized on the steps config so the machine's render-time ref always
  // mirrors the latest inputs.
  const config = React.useMemo<WizardConfig>(() => ({ descriptors: steps }), [steps]);

  const value = useWizardMachine({ config, parentWizard, initialStepId, onStepChange });

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};

interface WizardMatchProps {
  /**
   * The step id this branch renders for. Children render only while the wizard's
   * active step matches this id; otherwise `null`.
   */
  id: string;
  children?: React.ReactNode;
}

/**
 * Declarative, render-only branch: renders its `children` only when the active
 * wizard step matches `id`, else `null`. A pure conditional render — it does NOT
 * register a step or build the graph (the `steps` config array already did).
 */
const Match = ({ id, children }: WizardMatchProps): JSX.Element | null => {
  const { current } = useWizard();
  if (current !== id) {
    return null;
  }
  return <>{children}</>;
};
Match.displayName = 'Wizard.Match';

export const Wizard = Object.assign(WizardRoot, { Match });
