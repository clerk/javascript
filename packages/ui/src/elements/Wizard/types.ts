import type React from 'react';

import type { LocalizationKey } from '@/customizables';

/**
 * Describes a single step in a multi-step Wizard
 *
 * A step can either be a *leaf* (renders a single `Component`) or a
 * *container* (declares an ordered list of `innerSteps`)
 * Containers are routed under their parent path (e.g. `/configure/create-app`)
 */
export interface WizardStep<TData = unknown> {
  /**
   * Stable identifier for the step. Used for keying and for `goToStep(id)`
   */
  id: string;
  /**
   * Path fragment used by the SDK router. The first non-skipped step is
   * automatically rendered as the index route, so its `path` is only
   * used as a label for `goToStep`/deep-linking purposes
   */
  path: string;
  /**
   * Label shown in the breadcrumb at the top of the wizard. Inner
   * steps don't need a label — they don't appear in the breadcrumb
   */
  label: LocalizationKey | string;
  /**
   * The component rendered when this step is active. Required for
   * leaf steps, ignored when `innerSteps` is provided (the active
   * inner step's component is rendered instead)
   */
  Component?: React.ComponentType;
  /**
   * Optional inner sub-steps. When provided, this step is treated as
   * a container: the wizard advances through the inner steps via the
   * Footer's "Continue" button, then moves on to the next main step
   * once the last inner step is completed.
   *
   * Inner steps share their parent's breadcrumb entry but each get
   * their own URL (`<parent.path>/<inner.path>`). The first inner
   * step is mounted as the parent's index route
   */
  innerSteps?: ReadonlyArray<WizardInnerStep<TData>>;
  /**
   * When it returns `true`, removes the step from the
   * active list. Skipped steps are not rendered, do not appear in the
   * breadcrumb, and are jumped over by `goNext`/`goPrev`.
   *
   * Receives the optional `data` value passed to `<Wizard.Root data={...}>`
   */
  shouldSkip?: (data: TData) => boolean;
}

/**
 * Inner sub-step of a container `WizardStep`. Inner steps are not
 * shown in the breadcrumb, instead they drive the per-step indicator
 * badge ("Step X / Y") and the Continue/Previous footer behaviour
 */
export interface WizardInnerStep<TData = unknown> {
  /**
   * Stable identifier, unique within the parent step
   */
  id: string;
  /**
   * Path fragment relative to the parent step. The first non-skipped
   * inner step is rendered at the parent's path (index route)
   */
  path: string;
  /**
   * Component rendered when this inner step is active
   */
  Component: React.ComponentType;
  /**
   * Same semantics as `WizardStep.shouldSkip`, scoped to inner steps
   */
  shouldSkip?: (data: TData) => boolean;
}

/**
 * Action registered by the currently active step to be invoked when the
 * "Continue" button in the Wizard footer is clicked
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

export interface WizardContextValue<TData = unknown> {
  /**
   * The list of main steps after `shouldSkip` has been applied. This
   * is what the breadcrumb iterates over
   */
  activeSteps: WizardStep<TData>[];
  /**
   * The main step matched by the current SDK route, or `undefined`
   * while the router is settling
   */
  currentStep: WizardStep<TData> | undefined;
  /**
   * Index of `currentStep` within `activeSteps`. `-1` if not matched
   */
  currentIndex: number;
  /**
   * Convenience: `activeSteps.length`
   */
  totalSteps: number;
  /**
   * Active inner steps of the current main step (after `shouldSkip`).
   * Empty when the current step has no inner steps
   */
  innerSteps: WizardInnerStep<TData>[];
  /**
   * The inner step matched by the current SDK route. `undefined` when
   * the current main step has no inner steps
   */
  currentInnerStep: WizardInnerStep<TData> | undefined;
  /**
   * Index of `currentInnerStep` within `innerSteps`. `-1` when there
   * is no inner step (or none matched)
   */
  currentInnerIndex: number;
  /**
   * Convenience: `innerSteps.length`. `0` when there are no inner steps
   */
  totalInnerSteps: number;
  /**
   * `true` when the user is at the very first position in the wizard
   * (first main step + first inner step, if any)
   */
  isFirstStep: boolean;
  /**
   * `true` when the user is at the very last position in the wizard
   * (last main step + last inner step, if any)
   */
  isLastStep: boolean;
  /**
   * Navigate forward. Within a container step, advances through inner
   * steps first, otherwise (or on the last inner step) advances to
   * the next main step. No-op at the very end of the wizard
   */
  goNext: () => Promise<unknown> | void;
  /**
   * Navigate backward. Mirror of `goNext`
   */
  goPrev: () => Promise<unknown> | void;
  /**
   * Jump to a specific main step by `id`. Lands on the step's first
   * inner step when applicable. No-op if the id is not in `activeSteps`
   */
  goToStep: (id: string) => Promise<unknown> | void;
  /**
   * Currently registered Continue action, or `undefined` if no step
   * has registered one
   */
  continueAction: ContinueAction | undefined;
  /**
   * Used by step components to register what should happen when the
   * shared Continue button is pressed. Pass `undefined` to clear.
   *
   * Typical usage: register on mount, clear on unmount
   */
  setContinueAction: (action: ContinueAction | undefined) => void;
}
