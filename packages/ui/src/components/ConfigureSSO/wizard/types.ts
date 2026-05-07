import type React from 'react';

import type { LocalizationKey } from '@/customizables';

/**
 * Props for `<ConfigureSSOWizard.Step>`. Each rendered Step is one
 * navigable position in its parent `<ConfigureSSOWizard>`. Inner
 * sub-steps are declared by nesting another `<ConfigureSSOWizard>`
 * inside the Step's body
 */
export interface ConfigureSSOWizardStepProps {
  /**
   * Stable identifier for the step. Used as a React key, for
   * `goToStep(id)`, and as a fallback when two steps share a path
   */
  id: string;
  /**
   * Path fragment used by the SDK router. The first non-skipped
   * sibling is mounted as the parent's index route, so its `path`
   * is only used for `goToStep` / deep-linking purposes
   */
  path: string;
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
   * `<ConfigureSSOWizard>` for inner sub-steps
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
 * Internal step descriptor extracted from a Step element's props.
 * Consumers shouldn't need to construct these directly
 */
export interface ConfigureSSOWizardActiveStep {
  id: string;
  path: string;
  label?: LocalizationKey | string;
  isCompleted?: boolean;
  children: React.ReactNode;
}

export interface ConfigureSSOWizardContextValue {
  /**
   * The active siblings inside the *current* Wizard scope (only the
   * steps that survived conditional rendering)
   */
  activeSteps: ConfigureSSOWizardActiveStep[];
  /**
   * The step matched by the current SDK route, or `undefined` while
   * the router is settling
   */
  currentStep: ConfigureSSOWizardActiveStep | undefined;
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
   * `true` while the parent flow is still loading async dependencies.
   * The header renders a skeleton breadcrumb, the content renders a
   * centered spinner, and the footer's buttons are disabled
   */
  isLoading: boolean;
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
   * `true` when this wizard is rendered inside another wizard. The
   * outermost wizard owns the breadcrumb / footer chrome; nested
   * wizards render only the active step's body
   */
  isNested: boolean;
}
