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
 * Under the new step order verify-domain runs first, so by the time the user
 * reaches select-provider their domain/email is already verified — the create
 * is unconditional:
 *   - No provider selected → `{ ok: false }` (footer surfaces the validation).
 *   - Provider selected → create the connection now, then `{ ok: true }`. The
 *     reducer's NEXT advances into configure.
 *   - Create throws → `{ ok: false; error }`.
 */
export const submitSelectProvider = async (ctx: SubmitCtx): Promise<SubmitResult> => {
  const { provider, setProvider, mutations, primaryEmailAddress } = ctx;

  if (!provider) {
    return { ok: false };
  }

  setProvider(provider);

  try {
    await mutations.createConnection(provider, primaryEmailAddress);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error as ClerkAPIError | ClerkRuntimeError | string };
  }
};

/**
 * Terminal submit of the verify-domain sub-flow, fired after the user verifies
 * their email.
 *
 * Under the new step order verify-domain runs before select-provider, so no
 * connection exists yet at this point — creation is deferred to select-provider.
 * This handler simply advances (`{ ok: true }`); it no longer touches
 * `mutations.createConnection`.
 *
 * Wiring this handler into the nested verify sub-flow happens in a later
 * sub-item — here it is only defined.
 */
export const submitVerifyDomain = (_ctx: SubmitCtx): Promise<SubmitResult> => {
  return Promise.resolve({ ok: true });
};
