import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import type { WizardStepId } from './types';

/**
 * Decides where the ConfigureSSO wizard should mount on (re)load based on
 * the current state of the user's enterprise connection.
 *
 * No connection → `select-provider`
 * Connection without SAML IdP metadata → `configure`
 * Connection with SAML IdP metadata → `confirmation`
 *
 * The `test` step is intentionally absent — we can't derive a "last test
 * passed" signal synchronously from the resource. Users can re-test from
 * Confirmation.
 */
export const deriveInitialStep = (connection: EnterpriseConnectionResource | undefined): WizardStepId => {
  if (!connection) {
    return 'select-provider';
  }
  if (!connection.samlConnection?.idpSsoUrl) {
    return 'configure';
  }
  return 'confirmation';
};
