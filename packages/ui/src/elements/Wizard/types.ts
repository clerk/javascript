import type React from 'react';

import type { LocalizationKey } from '@/customizables';

/**
 * Describes a single step in a multi-step Wizard flow.
 *
 * Steps are typically defined as a `const` array on the consumer side
 * and passed to `<Wizard.Root steps={...} />`. The Wizard renders one
 * step at a time, driven by the SDK router (`Route`/`Switch`).
 */
export interface WizardStep<TData = unknown> {
  /**
   * Stable identifier for the step. Used for keying and for `goToStep(id)`.
   */
  id: string;
  /**
   * Path fragment used by the SDK router. The first non-skipped step is
   * automatically rendered as the index route, so its `path` is only
   * used as a label for `goToStep`/deep-linking purposes.
   */
  path: string;
  /**
   * Label shown in the breadcrumb / step indicator at the top of the wizard.
   */
  label: LocalizationKey | string;
  /**
   * The component rendered when this step is active.
   */
  Component: React.ComponentType;
  /**
   * Marks the step as conditional. Purely informational — the runtime
   * decision is made by `shouldSkip`.
   */
  isOptional?: boolean;
  /**
   * Predicate that, when it returns `true`, removes the step from the
   * active list. Skipped steps are not rendered, do not appear in the
   * breadcrumb, and are jumped over by `goNext`/`goPrev`.
   *
   * Receives the optional `data` value passed to `<Wizard.Root data={...}>`.
   */
  shouldSkip?: (data: TData) => boolean;
}

/**
 * Action registered by the currently active step to be invoked when the
 * shared "Continue" button in the Wizard footer is clicked.
 *
 * If no step registers a `ContinueAction`, the footer falls back to
 * calling `goNext()` directly.
 */
export interface ContinueAction {
  /**
   * Called when the user clicks "Continue". Should typically validate /
   * submit the step's form and then call `goNext()` on success.
   *
   * The return value is ignored — `Promise<unknown>` is allowed so that
   * step authors can directly forward the wizard's `goNext()` result.
   */
  handler: () => void | Promise<unknown>;
  /**
   * Disables the Continue button (e.g. while a form is invalid).
   */
  isDisabled?: boolean;
  /**
   * Renders a loading state on the Continue button.
   */
  isLoading?: boolean;
  /**
   * Optional override for the Continue button label.
   */
  label?: LocalizationKey | string;
}

export interface WizardContextValue<TData = unknown> {
  /**
   * The list of steps after `shouldSkip` has been applied. This is what
   * the breadcrumb and footer iterate over.
   */
  activeSteps: WizardStep<TData>[];
  /**
   * The step matched by the current SDK route, or `undefined` while the
   * router is settling.
   */
  currentStep: WizardStep<TData> | undefined;
  /**
   * Index of `currentStep` within `activeSteps`. `-1` if not matched.
   */
  currentIndex: number;
  /**
   * Convenience: `activeSteps.length`.
   */
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  /**
   * Navigate to the next active step. No-op on the last step.
   */
  goNext: () => Promise<unknown> | void;
  /**
   * Navigate to the previous active step. No-op on the first step.
   */
  goPrev: () => Promise<unknown> | void;
  /**
   * Jump to a specific step by `id`. No-op if the id is not in
   * `activeSteps`.
   */
  goToStep: (id: string) => Promise<unknown> | void;
  /**
   * Currently registered Continue action, or `undefined` if no step has
   * registered one.
   */
  continueAction: ContinueAction | undefined;
  /**
   * Used by step components to register what should happen when the
   * shared Continue button is pressed. Pass `undefined` to clear.
   *
   * Typical usage: register on mount, clear on unmount.
   */
  setContinueAction: (action: ContinueAction | undefined) => void;
}
