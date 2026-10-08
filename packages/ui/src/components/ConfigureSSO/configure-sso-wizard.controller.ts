import React from 'react';

import type { useConfigureSSOWizardModel } from './configure-sso-wizard.model';
import type { WizardStepConfig } from './elements/Wizard';

export const useConfigureSSOWizardController = (
  { gates, domainsReady }: ReturnType<typeof useConfigureSSOWizardModel>,
  forceInitialStep: boolean | undefined,
) => {
  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      { id: 'verify-domain', label: 'Domains', isComplete: () => domainsReady },
      {
        id: 'configure',
        label: 'Connection',
        isReachable: () => domainsReady || gates.hasConnection,
        isComplete: () => gates.hasMinimumConfiguration || gates.isActive,
      },
      {
        id: 'test',
        label: 'Test',
        isReachable: () => gates.hasMinimumConfiguration || gates.isActive,
        isComplete: () => gates.hasSuccessfulTestRun || gates.isActive,
      },
      {
        id: 'activate',
        label: 'Activate',
        isReachable: () => gates.hasSuccessfulTestRun || gates.isActive,
        isComplete: () => gates.isActive,
      },
    ],
    [gates, domainsReady],
  );

  const initialStepId = forceInitialStep ? steps[0].id : undefined;
  return { steps, initialStepId };
};
