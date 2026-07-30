import React, { type ComponentProps } from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOProvider } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { Wizard, type WizardStepConfig } from './elements/Wizard';
import { ActivateStep, TestConfigurationStep } from './steps';
import { ConfigureProviderStep } from './steps/ConfigureStep';

export type ConfigureSSOWizardProps = Omit<ComponentProps<typeof ConfigureSSOProvider>, 'children'> & {
  title?: React.ReactNode;
  forceInitialStep?: boolean;
};

// PROTOTYPE ONLY: domains and provider SELECTION moved into their own
// prerequisite flows (ConfigureDomains, ConfigureIdentityProvider). This
// wizard assumes a selected provider and covers the SSO-specific work:
// provider connection configuration, test, activate.
export const ConfigureSSOWizard = ({ title, forceInitialStep, ...props }: ConfigureSSOWizardProps): JSX.Element => {
  const { organizationEnterpriseConnection: c } = props;

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      {
        id: 'configure',
        label: 'Connection',
        isComplete: () => c.hasMinimumConfiguration || c.isActive,
      },
      {
        id: 'test',
        label: 'Test',
        isReachable: () => c.hasMinimumConfiguration || c.isActive,
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

        <Wizard.Match id='configure'>
          <CardStateProvider>
            <ConfigureProviderStep />
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
    </ConfigureSSOProvider>
  );
};
