import type { LocalizationKey } from '@/customizables';

/**
 * One navigable position in a `<Wizard>`, declared as a plain config object in
 * the `steps` array. The graph IS the array — no `React.Children` walking, no
 * `<Wizard.Step>` component. Each entry is registration only (order, reachability,
 * label/visibility) and carries NO body; rendering is declarative via
 * `<Wizard.Match id>`.
 *
 * `isReachable` is an *entry precondition* ("may navigation LAND here right now?"),
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
   * stepper. OMITTED ⇒ TRUE (always enterable — the entry step). Reachability
   * predicates are expected to be *monotonic* across the declared order (a later
   * predicate holding implies every earlier one holds); the furthest-reachable
   * init and the always-reachable predecessor both rely on that.
   */
  isReachable?: () => boolean;
  /**
   * Inline completion predicate: "is THIS step's work done right now?", decoupled
   * from the current position. Drives the stepper's completed tick so a step reads
   * as done whenever its own work is, regardless of where the user currently
   * stands (re-entering an already-finished flow shows every step ticked).
   * OMITTED ⇒ fall back to the POSITIONAL default (sits before current) — nested /
   * per-provider wizards that declare no `isComplete` are unchanged.
   */
  isComplete?: () => boolean;
}

/**
 * The step descriptor the engine reads. The `steps` config array is body-less
 * registration, so the descriptor and the config are the same shape — the
 * reducer consumes the array verbatim.
 */
export type WizardStepDescriptor = WizardStepConfig;

/**
 * A breadcrumb-facing view of an in-flow step: the descriptors in declaration
 * order, with their resolved completion and reachability state. Whether a step
 * shows in the breadcrumb is a render concern (the header filters on `label`),
 * not a property of the descriptor.
 */
export interface WizardActiveStep {
  id: string;
  label?: LocalizationKey | string;
  /**
   * Whether this step's work is done — drives the visual "completed" tick. Resolved
   * from the step's own `isComplete` predicate when it declares one (position-
   * independent: a finished step stays ticked even when the user navigates back),
   * otherwise the POSITIONAL default (sits before current in declaration order).
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
  /** All descriptors in declaration order, known synchronously. */
  activeSteps: WizardActiveStep[];
  /** The active step's view; `undefined` only if `current` names no descriptor. */
  currentStep: WizardActiveStep | undefined;
  /** Index of `current` within `activeSteps`; `-1` if it names no descriptor. */
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
   * Advance one slot when the next step's entry guard holds (sequential, no
   * skip-satisfied walk) — immediately if it already holds, otherwise as soon as
   * it becomes satisfied while still on this step (a deferred advance: the call
   * parks a pending forward move that resolves on a later render once the guard
   * holds). An explicit `goPrev`/`goToStep` abandons that pending advance. From
   * the terminal position, falls through to the parent's `goNext` (so a nested
   * sub-flow's last step advances the parent); no-op when there is no parent.
   *
   * Call-site rule: only call `goNext` after the action that satisfies the next
   * guard (submit-then-advance), or pre-check the condition first. Calling it on
   * an ungated click parks a deferred advance that fires later without a user
   * gesture once the guard happens to hold.
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
