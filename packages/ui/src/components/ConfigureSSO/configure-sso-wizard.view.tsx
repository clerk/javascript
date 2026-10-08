import React from 'react';

import { CardStateProvider } from '@/elements/contexts';

import type { useConfigureSSOWizardController } from './configure-sso-wizard.controller';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { Wizard } from './elements/Wizard';
import { ActivateStep, ConfigureStep, OrganizationDomainsStep, TestConfigurationStep } from './steps';

export const ConfigureSSOWizardView = ({
  title,
  steps,
  initialStepId,
}: Pick<React.ComponentProps<typeof ConfigureSSOHeader>, 'title'> &
  ReturnType<typeof useConfigureSSOWizardController>): JSX.Element => (
  <Wizard
    steps={steps}
    initialStepId={initialStepId}
  >
    <ConfigureSSOHeader title={title} />

    <Wizard.Match id='verify-domain'>
      <CardStateProvider>
        <OrganizationDomainsStep />
      </CardStateProvider>
    </Wizard.Match>

    <Wizard.Match id='configure'>
      <CardStateProvider>
        <ConfigureStep />
      </CardStateProvider>
    </Wizard.Match>

    <Wizard.Match id='test'>
      <CardStateProvider>
        <TestConfigurationStep />
      </CardStateProvider>
    </Wizard.Match>

    <Wizard.Match id='activate'>
      <CardStateProvider>
        <ActivateStep />
      </CardStateProvider>
    </Wizard.Match>
  </Wizard>
);
