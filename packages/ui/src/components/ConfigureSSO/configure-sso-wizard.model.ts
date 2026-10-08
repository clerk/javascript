import React from 'react';

import type { ConfigureSSOWizardProps } from './ConfigureSSOWizard';
import { areConnectionDomainsReady } from './domain/organizationEnterpriseConnection';

export const useConfigureSSOWizardModel = ({
  organizationEnterpriseConnection,
  connectionDomains,
  claimedDomains,
  organizationDomains,
}: ConfigureSSOWizardProps) => {
  const gates = React.useMemo(
    () => ({
      hasConnection: organizationEnterpriseConnection.hasConnection,
      hasMinimumConfiguration: organizationEnterpriseConnection.hasMinimumConfiguration,
      hasSuccessfulTestRun: organizationEnterpriseConnection.hasSuccessfulTestRun,
      isActive: organizationEnterpriseConnection.isActive,
    }),
    [organizationEnterpriseConnection],
  );
  return {
    gates,
    domainsReady: areConnectionDomainsReady(connectionDomains, organizationDomains, claimedDomains),
  };
};
