import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import type { WizardStepId } from './types';

/**
 * Decides where the ConfigureSSO wizard should mount on (re)load based on
 * the current state of the user's enterprise connection.
 */
export const deriveInitialStep = (
  enterpriseConnection: EnterpriseConnectionResource | undefined,
  options: { isDomainTakenByOtherOrg: boolean; hasSuccessfulTestRun: boolean },
): WizardStepId => {
  const { isDomainTakenByOtherOrg, hasSuccessfulTestRun } = options;

  if (!enterpriseConnection) {
    return 'select-provider';
  }

  if (isDomainTakenByOtherOrg) {
    return 'verify-domain';
  }

  // Connection is enabled, go to the confirmation step
  const isEnabled = enterpriseConnection?.active;
  if (isEnabled) {
    return 'confirmation';
  }

  const hasMinimumIdPConfiguration = checkHasMinimumIdPConfiguration(enterpriseConnection);

  // If the connection hasn't finished configuring it, go to the configure step
  // Connection exists, but is not enabled and hasn't finished configuring it
  if (!hasMinimumIdPConfiguration) {
    return 'configure';
  }

  // If the connection hasn't been tested, go to the test step
  if (!hasSuccessfulTestRun) {
    return 'test';
  }

  // Connection is disabled but has been tested and configured
  return 'confirmation';
};

// TODO - Update to support OpenID Connect
const checkHasMinimumIdPConfiguration = (connection: EnterpriseConnectionResource): boolean => {
  return Boolean(connection.samlConnection?.idpSsoUrl && connection.samlConnection?.idpEntityId);
};
