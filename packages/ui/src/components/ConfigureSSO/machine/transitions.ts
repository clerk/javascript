import type { LocalizationKey } from '@/customizables';

import type { WizardFacts } from '../data/deriveFacts';
import type { WizardStepId } from '../types';
import * as guards from './guards';
import type { SubmitCtx, SubmitResult } from './submit';
import { submitSelectProvider } from './submit';

/**
 * Pure, view-free description of a single wizard step. The ordered array of
 * these (`STEPS`) is the single source of truth the reducer reads from —
 * replacing the JSX-order-as-truth shape in `ConfigureSSO.tsx`.
 *
 * No React/view imports live here so the machine stays pure: the state→view
 * edge is isolated in `stepBodies.tsx`, which the wiring sub-item renders from.
 */
export interface StepTransition {
  /**
   * Stable identifier, matching {@link WizardStepId}.
   */
  id: WizardStepId;
  /**
   * Breadcrumb label. Plain string today (no localization keys exist for the
   * step labels yet); typed to also accept a `LocalizationKey` once they do.
   */
  label?: LocalizationKey | string;
  /**
   * Whether the step participates in the flow at all for the given facts. A
   * disabled step is filtered out of the enabled-steps list entirely (the
   * reducer never lands on it, NEXT/BACK skip past it, GOTO is a no-op).
   */
  enabled?: (f: WizardFacts) => boolean;
  /**
   * Whether the step is already satisfied. NEXT skips fulfilled steps; GOTO
   * ignores this and jumps regardless.
   */
  fulfilled?: (f: WizardFacts) => boolean;
  /**
   * Whether the step is a terminal/dead-end state (e.g. the domain is taken by
   * another org) for the given facts.
   */
  terminal?: (f: WizardFacts) => boolean;
  /**
   * Optional submit handler invoked by the footer driver when the step's
   * primary action fires.
   */
  onSubmit?: (ctx: SubmitCtx) => Promise<SubmitResult>;
  /**
   * Whether the step exposes a "reset" affordance back to provider selection.
   */
  showReset?: boolean;
}

/**
 * Back-compat alias. The config used to be named `StepConfig` when it carried a
 * `Body` component; the view edge now lives in `stepBodies.tsx`, leaving this a
 * pure transition descriptor.
 */
export type StepConfig = StepTransition;

/**
 * The ordered, single source of truth for the ConfigureSSO wizard's steps.
 *
 * Order here is the canonical flow order: verify-domain first (the user proves
 * domain ownership / email verification before anything is created), then
 * provider selection, configuration, testing, and confirmation.
 * `enabled`/`fulfilled`/`terminal` are evaluated against {@link WizardFacts} by
 * the reducer; bodies are mounted by the wiring sub-item from `stepBodies.tsx`.
 */
export const STEPS: readonly StepTransition[] = [
  {
    id: 'verify-domain',
    label: 'Verify domain',
    fulfilled: guards.verifyDomainFulfilled,
    terminal: f => f.isDomainTakenByOtherOrg,
    showReset: true,
  },
  {
    id: 'select-provider',
    // Only a step while there's no connection yet — creating one removes it
    // from the flow so navigation can never bubble back into provider choice.
    enabled: f => !f.hasConnection,
    onSubmit: submitSelectProvider,
  },
  {
    id: 'configure',
    label: 'Configure',
    fulfilled: guards.configureFulfilled,
    showReset: true,
  },
  {
    id: 'test',
    label: 'Test',
    fulfilled: guards.testFulfilled,
    showReset: true,
  },
  {
    id: 'confirmation',
    label: 'Confirmation',
  },
] as const;
