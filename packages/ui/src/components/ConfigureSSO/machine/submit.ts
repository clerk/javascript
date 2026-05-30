import type { ClerkAPIError, ClerkRuntimeError, EmailAddressResource } from '@clerk/shared/types';

import type { LocalizationKey } from '@/customizables';

import type { WizardFacts } from '../data/deriveFacts';
import type { ConfigureSSOMutations } from '../data/useConfigureSSOMutations';
import type { ProviderType, WizardStepId } from '../types';

/**
 * The result a step's `onSubmit` returns to the footer/submit driver.
 *
 * - `void` — nothing happened, the footer falls back to its default advance.
 * - `{ ok: true; goTo? }` — the submit succeeded; the driver advances (or jumps
 *   to `goTo` when present).
 * - `{ ok: false; error? }` — the submit failed; the driver surfaces `error` and
 *   stays put.
 *
 * The shape matches the footer/submit API locked by the earlier spike exactly.
 */
export type SubmitResult =
  | void
  | { ok: true; goTo?: string }
  | { ok: false; error?: string | ClerkAPIError | ClerkRuntimeError | LocalizationKey };

/**
 * Everything a step's `onSubmit` handler needs, passed as a plain argument so
 * the handlers stay pure and unit-testable without mounting React.
 */
export interface SubmitCtx {
  /**
   * The derived booleans the wizard makes decisions from.
   */
  facts: WizardFacts;
  /**
   * The reverification-wrapped connection mutations.
   */
  mutations: ConfigureSSOMutations;
  /**
   * Imperative navigation handle, injected by the driver.
   */
  nav: { goToStep: (id: WizardStepId) => void };
  /**
   * The currently-selected provider, if any.
   */
  provider: ProviderType | undefined;
  /**
   * Sets the local provider selection.
   */
  setProvider: (p: ProviderType) => void;
  /**
   * The user's primary email address, used to derive the connection name.
   */
  primaryEmailAddress?: EmailAddressResource;
}

/**
 * Submit handler for the select-provider step.
 *
 * Implements create-in-pre-configure-submit on the verified path:
 *   - No provider selected → `{ ok: false }` (footer surfaces the validation).
 *   - Provider selected, email verified → create the connection now, then
 *     `{ ok: true }`. The reducer's NEXT then skips the now-fulfilled
 *     verify-domain step and lands on configure.
 *   - Provider selected, email NOT verified → `{ ok: true }` WITHOUT creating;
 *     the reducer's NEXT lands on verify-domain (not fulfilled), where the
 *     unverified-path create happens after email verification.
 *   - Create throws → `{ ok: false; error }`.
 */
export const submitSelectProvider = async (ctx: SubmitCtx): Promise<SubmitResult> => {
  const { provider, setProvider, facts, mutations, primaryEmailAddress } = ctx;

  if (!provider) {
    return { ok: false };
  }

  setProvider(provider);

  if (!facts.isPrimaryEmailVerified) {
    // Unverified path: defer creation to the verify-domain terminal submit.
    return { ok: true };
  }

  try {
    await mutations.createConnection(provider, primaryEmailAddress);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error as ClerkAPIError | ClerkRuntimeError | string };
  }
};

/**
 * Terminal submit of the verify-domain flow, fired after the user verifies
 * their email.
 *
 * This is the unverified-path create point: the provider was chosen at
 * select-provider but the connection was deliberately not created because the
 * email wasn't verified yet. Once verification lands here, create the connection
 * (if one doesn't already exist) and report success.
 *
 * Wiring this handler into the nested verify sub-flow happens in a later
 * sub-item — here it is only defined.
 */
export const submitVerifyDomain = async (ctx: SubmitCtx): Promise<SubmitResult> => {
  const { facts, mutations, provider, primaryEmailAddress } = ctx;

  if (!facts.hasConnection) {
    try {
      await mutations.createConnection(provider as ProviderType, primaryEmailAddress);
    } catch (error) {
      return { ok: false, error: error as ClerkAPIError | ClerkRuntimeError | string };
    }
  }

  return { ok: true };
};
