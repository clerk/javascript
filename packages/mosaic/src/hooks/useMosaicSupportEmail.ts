import { buildEmailAddress } from '@clerk/shared/internal/clerk-js/email';
import { useClerk } from '@clerk/shared/react';

import { useMosaicEnvironment } from './useMosaicEnvironment';

/**
 * Resolves the support email Mosaic flows show in "contact us" copy.
 *
 * Priority matches clerk-js's `useSupportEmail`: the ClerkProvider `supportEmail`
 * option, then `displayConfig.supportEmail`, then `support@` + the Frontend API
 * host. Mosaic has no `OptionsContext`, so the option is read through
 * `clerk.__internal_getOption` — quarantined here the same way
 * `__internal_environment` lives only in `useMosaicEnvironment`.
 *
 * This is a one-shot read off the Clerk singleton, NOT a reactive subscription:
 * `useClerk()` does not re-render when options or the environment mutate. Only
 * use this for the hydration-time address; a later option/env change will not
 * update the value.
 *
 * Returns `undefined` until the value is stable. The option can resolve before
 * the environment hydrates; otherwise callers must wait so the Frontend API
 * fallback is not locked in ahead of a dashboard-configured address.
 */
export function useMosaicSupportEmail(): string | undefined {
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const emailFromOptions = clerk.__internal_getOption('supportEmail');

  if (emailFromOptions) {
    return emailFromOptions;
  }
  if (!environment) {
    return undefined;
  }
  return (
    environment.displayConfig.supportEmail ||
    buildEmailAddress({ localPart: 'support', frontendApi: clerk.frontendApi })
  );
}
