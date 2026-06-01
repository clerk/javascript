import { type LocalizationKey, useLocalizations } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import type { SubmitCtx, SubmitResult } from '../machine/submit';
import type { WizardStepId } from '../types';
import { useWizardMachine } from './WizardMachineContext';

/**
 * Centralizes the submit lifecycle for a ConfigureSSO step's primary action
 * EXACTLY ONCE: clear error -> run -> advance/jump on success / surface error
 * on failure -> always settle to idle (loading is owned by the card).
 *
 * Every simple step used to re-implement this boilerplate in its own footer
 * handler:
 *
 * ```ts
 * card.setError(undefined);
 * card.setLoading();
 * try {
 *   await mutation();
 *   goNext();
 * } catch (err) {
 *   handleError(err, [], card.setError);
 * } finally {
 *   card.setIdle();
 * }
 * ```
 *
 * `useSubmitRunner` returns a single `run(onSubmit?)` function that owns that
 * flow. The step passes only its LOCAL `onSubmit` closure (sourced from the
 * step's transition) — it never publishes a handler up to a sibling footer
 * (no action registry).
 *
 * ## Spike → machine adaptation
 *
 * The footer spike (b8ebd14b7) drove navigation through the OLD
 * `useWizard().goNext/goToStep`. After the cutover, navigation is the pure
 * state machine: this runner dispatches `NEXT` / `GOTO` against the reducer.
 * The runner is the single seam where that swap happened, so the steps and the
 * footer's `Step.Footer.Submit` part did not have to change shape.
 *
 * `onSubmit` receives a {@link SubmitCtx} built from the context + machine so
 * the handlers stay pure and unit-testable (they live in `machine/submit.ts`).
 *
 * Result handling mirrors the spike exactly:
 * - no `onSubmit` -> plain `NEXT` (linear advance, e.g. the test step's
 *   Continue when the gate passes).
 * - `void` / `{ ok: true }` -> `NEXT`.
 * - `{ ok: true; goTo }` -> `GOTO` that step (branching steps name their
 *   target; e.g. select-provider jumps to `configure` after create).
 * - `{ ok: false; error }` -> surface the card-level error, stay put.
 * - `{ ok: false }` (no error) -> stay put; the step already mapped the
 *   failure onto its own fields.
 * - throw -> centralized `handleError` card-level fallback.
 */
export function useSubmitRunner(): (
  onSubmit?: (ctx: SubmitCtx) => Promise<SubmitResult> | SubmitResult,
) => Promise<void> {
  const card = useCardState();
  const { dispatch } = useWizardMachine();
  const { facts, mutations, provider, setProvider, primaryEmailAddress } = useConfigureSSO();
  const { t } = useLocalizations();

  return async onSubmit => {
    card.setError(undefined);

    // No step-specific submit logic: just advance linearly.
    if (!onSubmit) {
      dispatch({ type: 'NEXT' });
      return;
    }

    card.setLoading();

    try {
      const ctx: SubmitCtx = {
        facts,
        mutations,
        provider,
        setProvider,
        primaryEmailAddress,
        // Imperative escape hatch — most steps express navigation via the
        // returned `goTo`, but `nav.goToStep` is wired to the machine for the
        // handful that need to jump mid-submit.
        nav: { goToStep: step => dispatch({ type: 'GOTO', step }) },
      };

      const res = await onSubmit(ctx);

      if (!res || res.ok) {
        // Branching steps can name their target; everyone else advances
        // linearly. Either way navigation is the runner's job, not the step's.
        if (res && res.goTo) {
          dispatch({ type: 'GOTO', step: res.goTo as WizardStepId });
        } else {
          dispatch({ type: 'NEXT' });
        }
        return;
      }

      // Handled failure: stay on the step. Surface a card-level message if the
      // step provided one; if it omitted `error`, it has already mapped the
      // failure onto its own fields, so leave its message untouched.
      // `card.setError` runs strings / Clerk errors through translateError, but
      // a LocalizationKey object must be resolved via `t` first.
      if (res.error !== undefined) {
        card.setError(
          typeof res.error === 'object' && 'key' in (res.error as LocalizationKey)
            ? t(res.error as LocalizationKey)
            : (res.error as string),
        );
      }
    } catch (err) {
      // Centralized error path — field-level handling stays in the step (e.g.
      // the SAML form's `applySubmitError`); the runner only owns the
      // card-level fallback.
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };
}
