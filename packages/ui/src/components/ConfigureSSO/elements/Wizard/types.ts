import type { LocalizationKey } from '@/customizables';

/**
 * One navigable position in a `<Wizard>`, declared as a plain config object in
 * the `steps` array passed to the primitive. The graph is the array itself —
 * there is no `React.Children` walking and no `<Wizard.Step>` component.
 *
 * Each entry is *registration only* — order, entry guard, and breadcrumb
 * label/visibility. It carries NO body: rendering is declarative via
 * `<Wizard.Match id>` children, which read `current` from context and render
 * their children only when the active step matches. The reducer consumes this
 * array verbatim (no body stripping).
 *
 * A step's `guard` is an *entry precondition*: a pure predicate answering "may
 * navigation LAND on this step right now?". It is applied uniformly by init,
 * `goNext`, `goPrev`, `goToStep`, and the breadcrumb stepper. It is NOT a
 * "skip if already satisfied" flag — guards never cause a step to be skipped on
 * forward navigation; they only block landing on a step whose precondition is
 * not yet met.
 */
export interface WizardStepConfig {
  /**
   * Stable identifier for the step. Used as a React key, for `goToStep(id)`,
   * for `<Wizard.Match id>` matching, and as the step's position in the graph.
   */
  id: string;
  /**
   * Label shown in the breadcrumb at the top of the wizard. Only outermost
   * steps need a label — inner steps reuse their parent's breadcrumb entry.
   */
  label?: LocalizationKey | string;
  /**
   * Inline entry-precondition predicate: "may navigation land on this step
   * right now?". Evaluated uniformly by init / `goNext` / `goPrev` /
   * `goToStep` / the stepper. OMITTED ⇒ resolves TRUE (always enterable — the
   * entry step). Guards are expected to be *monotonic* across the declared
   * order (a later step's guard holding implies every earlier step's guard
   * holds); the furthest-reachable init and the always-reachable predecessor
   * both rely on that.
   */
  guard?: () => boolean;
  /**
   * Hide this step from the breadcrumb while keeping it in the navigable graph.
   * Used for steps that are real positions but should not surface as a
   * breadcrumb entry (e.g. provider selection).
   */
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
  /**
   * The id of the currently active step.
   */
  current: string;
  /**
   * The breadcrumb-facing steps: non-hidden descriptors, in declaration order.
   * Always known synchronously — derived from the steps config before `current`
   * is resolved.
   */
  activeSteps: WizardActiveStep[];
  /**
   * The currently active step's breadcrumb descriptor, or `undefined` when the
   * active step is hidden / out of the breadcrumb set.
   */
  currentStep: WizardActiveStep | undefined;
  /**
   * Index of `current` within `activeSteps`. `-1` if the active step is hidden
   * or not in the breadcrumb set.
   */
  currentIndex: number;
  /**
   * Direction of the last transition (`1` forward, `-1` back, `0` jump/initial).
   * Drives enter/exit animation only.
   */
  direction: 1 | -1 | 0;
  /**
   * Convenience: `activeSteps.length`.
   */
  totalSteps: number;
  /**
   * `true` while the wizard still sits on the step it first mounted on and no
   * navigation has happened yet (`NEXT`/`PREV`/`GOTO` all clear it). Lets a step
   * tell "we landed here on the initial load" apart from "we navigated in
   * later", without inspecting any navigation history. Used to drive
   * load-once-then-refetch-on-entry data semantics.
   */
  isInitialStep: boolean;
  /**
   * `true` when this wizard is rendered inside another wizard. The outermost
   * wizard owns the breadcrumb / footer chrome; nested wizards just contribute
   * their own active step bodies.
   */
  isNested: boolean;
  /**
   * `true` when the user is at the very first position inside *this* wizard
   * scope and there is no parent wizard to fall back on.
   */
  isFirstStep: boolean;
  /**
   * `true` when the user is at the very last position inside *this* wizard
   * scope and there is no parent wizard to fall back on.
   */
  isLastStep: boolean;
  /**
   * Navigate forward one slot. Advances to the immediately-next step iff its
   * entry guard holds (a sequential, one-slot move — no skip-satisfied walk). A
   * guard-blocked mid-flow next is a hard stop. From the terminal position,
   * falls through to the parent wizard's `goNext` (so a nested sub-flow's last
   * step advances the parent); a no-op when there is no parent.
   */
  goNext: () => void;
  /**
   * Navigate backward one slot positionally (no history). Advances to the
   * immediately-previous step iff its entry guard holds. From the first
   * position, falls through to the parent wizard's `goPrev`.
   */
  goPrev: () => void;
  /**
   * Jump to a specific step by `id` iff its entry guard holds. No-op if the id
   * is not a step, is already current, or its guard does not hold.
   */
  goToStep: (id: string) => void;
}
