import type { LocalizationKey } from '@/customizables';

/**
 * One navigable position in a `<Wizard>`, declared as a plain config object in
 * the `steps` array. The graph IS the array — no `React.Children` walking, no
 * `<Wizard.Step>` component. Each entry is registration only (order, guard,
 * label/visibility) and carries NO body; rendering is declarative via
 * `<Wizard.Match id>`.
 *
 * `guard` is an *entry precondition* ("may navigation LAND here right now?"),
 * NOT a "skip if already satisfied" flag — it only blocks landing on a step
 * whose precondition is unmet, never causes a step to be skipped.
 */
export interface WizardStepConfig {
  /** Stable id: React key, `goToStep(id)`, `<Wizard.Match id>`, graph position. */
  id: string;
  /** Breadcrumb label. Only outermost steps need one; inner steps reuse the parent's. */
  label?: LocalizationKey | string;
  /**
   * Inline entry-precondition predicate: "may navigation land on this step right
   * now?". Evaluated uniformly by init / `goNext` / `goPrev` / `goToStep` / the
   * stepper. OMITTED ⇒ TRUE (always enterable — the entry step). Guards are
   * expected to be *monotonic* across the declared order (a later guard holding
   * implies every earlier one holds); the furthest-reachable init and the
   * always-reachable predecessor both rely on that.
   */
  guard?: () => boolean;
  /** Hide from the breadcrumb while keeping the step in the navigable graph. */
  hidden?: boolean;
}

/**
 * The step descriptor the engine reads. The `steps` config array is body-less
 * registration, so the descriptor and the config are the same shape — the
 * reducer consumes the array verbatim.
 */
export type WizardStepDescriptor = WizardStepConfig;

/**
 * A breadcrumb-facing view of an in-flow step: the non-hidden descriptors, in
 * declaration order, with their resolved completion and reachability state.
 */
export interface WizardActiveStep {
  id: string;
  label?: LocalizationKey | string;
  /**
   * POSITIONAL: the step sits before the current step in declaration order.
   * Drives the visual "completed" tick only — it is not guard-derived.
   */
  isCompleted: boolean;
  /**
   * GUARD-DRIVEN: the step's entry guard holds right now, so navigation may
   * land on it. The single source the stepper binds `isDisabled = !isReachable`
   * to, and the exact predicate `goToStep` checks before jumping.
   */
  isReachable: boolean;
}

export interface WizardContextValue {
  current: string;
  /** Non-hidden descriptors in declaration order, known synchronously. */
  activeSteps: WizardActiveStep[];
  /** `undefined` when the active step is hidden / off the breadcrumb. */
  currentStep: WizardActiveStep | undefined;
  /** Index of `current` within `activeSteps`; `-1` if hidden/off-breadcrumb. */
  currentIndex: number;
  /** `1` forward, `-1` back, `0` jump/initial. Drives animation only. */
  direction: 1 | -1 | 0;
  totalSteps: number;
  /**
   * `true` while still on the mount step with no navigation yet — separates
   * "landed here on initial load" from "navigated in later" without inspecting
   * history. Drives load-once-then-refetch-on-entry data semantics.
   */
  isInitialStep: boolean;
  /** `true` when rendered inside another wizard (parent owns the chrome). */
  isNested: boolean;
  /** First position in THIS scope, with no parent to fall back on. */
  isFirstStep: boolean;
  /** Last position in THIS scope, with no parent to fall back on. */
  isLastStep: boolean;
  /**
   * Advance one slot iff the next step's entry guard holds (sequential, no
   * skip-satisfied walk). A guard-blocked mid-flow next is a hard stop. From the
   * terminal position, falls through to the parent's `goNext` (so a nested
   * sub-flow's last step advances the parent); no-op when there is no parent.
   */
  goNext: () => void;
  /** Mirror of `goNext` backward (positional, no history). */
  goPrev: () => void;
  /**
   * Jump by `id` iff its entry guard holds. No-op if unknown, already current,
   * or guard-blocked.
   */
  goToStep: (id: string) => void;
}
