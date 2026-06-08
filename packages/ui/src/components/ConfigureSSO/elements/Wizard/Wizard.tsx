import React from 'react';

import type { WizardConfig } from './reducer';
import type { WizardStepConfig } from './types';
import { useWizardMachine } from './useWizardMachine';
import { useWizard, WizardContext } from './WizardContext';

interface WizardProps {
  /** The step graph (see the component doc below). The array IS the graph. */
  steps: WizardStepConfig[];
  /** Mount here instead of the guard-derived initial step (nested resume). */
  initialStepId?: string;
  /**
   * Fired from the dispatch handler (not a `useEffect`) when a transition changes
   * the active step, so a host can react (e.g. clear a card error) without a
   * state-sync effect. Only the top-level wizard passes this; a nested terminal
   * bubble advances through the parent's dispatch, so it fires there too.
   */
  onStepChange?: (stepId: string) => void;
  children?: React.ReactNode;
}

/**
 * Generic, declarative, UI-less wizard primitive.
 *
 * Steps are a body-less config array (`steps`): each entry is one navigable
 * position with an `id` + optional inline `guard` / `hidden` / `label`. The
 * graph IS the array — known synchronously, no `React.Children` walking, no
 * effect-timed registration — and feeds a domain-agnostic machine in the same
 * render pass. Rendering lives in `children`: chrome is a normal child, each
 * step body is a render-only `<Wizard.Match id>`.
 *
 * The machine is hidden behind `useWizard()`. Conditional flow is expressed by
 * each step's inline `guard` (applied uniformly by init / nav / stepper); steps
 * are never added or removed, only gated. Inner sub-flows nest another `<Wizard>`
 * whose forward boundary falls through to the parent (a nested last-step `goNext`
 * advances the parent; a guard-blocked mid-flow next is a hard stop).
 */
const WizardRoot = ({ steps, initialStepId, onStepChange, children }: WizardProps): JSX.Element => {
  const parentWizard = React.useContext(WizardContext);

  // The body-less `steps` array is the reducer's descriptor set verbatim.
  const config = React.useMemo<WizardConfig>(() => ({ descriptors: steps }), [steps]);

  const value = useWizardMachine({ config, parentWizard, initialStepId, onStepChange });

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};

interface WizardMatchProps {
  /** The step id this branch renders for. */
  id: string;
  children?: React.ReactNode;
}

/**
 * Render-only branch: renders `children` only when the active step matches `id`,
 * else `null`. It does NOT register a step or build the graph (the `steps` array
 * already did).
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
