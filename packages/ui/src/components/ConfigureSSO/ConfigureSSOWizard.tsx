import React, { type ComponentProps } from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOProvider } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { Wizard, type WizardStepConfig } from './elements/Wizard';
import { ActivateStep, TestConfigurationStep } from './steps';

export type ConfigureSSOWizardProps = Omit<ComponentProps<typeof ConfigureSSOProvider>, 'children'> & {
  title?: React.ReactNode;
  forceInitialStep?: boolean;
};

// PROTOTYPE ONLY: the verify-domain and configure steps moved into the
// ConfigureIdentityProvider prerequisite flow; this wizard now assumes a
// verified-domain, configured connection and only tests + activates it.
export const ConfigureSSOWizard = ({ title, forceInitialStep, ...props }: ConfigureSSOWizardProps): JSX.Element => {
  const { organizationEnterpriseConnection: c } = props;

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      {
        id: 'test',
        label: 'Test',
        isComplete: () => c.hasSuccessfulTestRun || c.isActive,
      },
      {
        id: 'activate',
        label: 'Activate',
        isReachable: () => c.hasSuccessfulTestRun || c.isActive,
        isComplete: () => c.isActive,
      },
    ],
    [c],
  );

  const initialStepId = forceInitialStep ? steps[0].id : undefined;

  return (
    <ConfigureSSOProvider {...props}>
      <Wizard
        steps={steps}
        initialStepId={initialStepId}
      >
        <ConfigureSSOHeader title={title} />

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
    </ConfigureSSOProvider>
  );
};
