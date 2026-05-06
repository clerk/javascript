import type React from 'react';

import type { LocalizationKey } from '@/customizables';

/**
 * Props for `<Wizard.Step>`. Each rendered Step is one navigable
 * position in its parent `<Wizard>`. Inner sub-steps are declared by
 * nesting another `<Wizard>` inside the Step's body
 */
export interface WizardStepProps {
  /**
   * Stable identifier for the step. Used as a React key, for
   * `goToStep(id)`, and to register the step with the parent wizard
   */
  id: string;
  /**
   * Label shown in the breadcrumb at the top of the wizard. Only
   * outermost steps need a label — inner steps reuse their parent's
   * breadcrumb entry
   */
  label?: LocalizationKey | string;
  /**
   * Marks this step as completed regardless of its position relative
   * to the current step
   */
  isCompleted?: boolean;
  /**
   * The step body. Anything React, including a nested
   * `<Wizard>` for inner sub-steps
   */
  children: React.ReactNode;
}

/**
 * Action registered by the currently active step to be invoked when
 * the "Continue" button in the Wizard footer is clicked
 *
 * If no step registers a `ContinueAction`, the footer falls back to
 * calling `goNext()` directly
 */
export interface ContinueAction {
  /**
   * Called when the user clicks "Continue". Should typically validate /
   * submit the step's form and then call `goNext()` on success
   */
  handler: () => void | Promise<unknown>;
  /**
   * Disables the Continue button (e.g. while a form is invalid)
   */
  isDisabled?: boolean;
  /**
   * Renders a loading state on the Continue button
   */
  isLoading?: boolean;
  /**
   * Optional override for the Continue button label
   */
  label?: LocalizationKey | string;
}

/**
 * Internal step descriptor mirrored from a Step's props once it has
 * registered itself with the parent wizard. Consumers shouldn't need
 * to construct these directly
 */
export interface WizardActiveStep {
  id: string;
  label?: LocalizationKey | string;
  isCompleted?: boolean;
}

export interface WizardContextValue {
  /**
   * The active siblings inside the *current* Wizard scope, in JSX
   * declaration order. Steps register themselves on mount and
   * unregister on unmount
   */
  activeSteps: WizardActiveStep[];
  /**
   * The step currently rendered as the wizard's body, or `undefined`
   * before the first step has registered
   */
  currentStep: WizardActiveStep | undefined;
  /**
   * Index of `currentStep` within `activeSteps`. `-1` if not matched
   */
  currentIndex: number;
  /**
   * Convenience: `activeSteps.length`
   */
  totalSteps: number;
  /**
   * `true` when the user is at the very first position inside *this*
   * wizard scope and there is no parent wizard to fall back on
   */
  isFirstStep: boolean;
  /**
   * `true` when the user is at the very last position inside *this*
   * wizard scope and there is no parent wizard to fall back on
   */
  isLastStep: boolean;
  /**
   * `true` when this wizard is rendered inside another wizard. The
   * outermost wizard owns the breadcrumb / footer chrome; nested
   * wizards just contribute their own active step bodies
   */
  isNested: boolean;
  /**
   * Navigate forward. Within this wizard, advances to the next active
   * sibling. On the last sibling, falls through to the parent
   * wizard's `goNext` (if any)
   */
  goNext: () => Promise<unknown> | void;
  /**
   * Navigate backward. Mirror of `goNext`: previous sibling, then
   * back to the parent's last sibling on overflow
   */
  goPrev: () => Promise<unknown> | void;
  /**
   * Jump to a specific step by `id` within this wizard scope. No-op
   * if the id is not in `activeSteps`
   */
  goToStep: (id: string) => Promise<unknown> | void;
  /**
   * Internal — called by `<Wizard.Step>` on mount (and again whenever
   * its descriptor props change) to register itself with the wizard
   */
  registerStep: (step: WizardActiveStep) => void;
  /**
   * Internal — called by `<Wizard.Step>` on unmount (or when its `id`
   * changes) to remove itself from the wizard's active steps
   */
  unregisterStep: (id: string) => void;
}
