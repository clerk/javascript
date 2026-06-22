import React, { type ComponentProps } from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOProvider } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { areAllOrganizationDomainsVerified } from './domain/organizationEnterpriseConnection';
import { Wizard, type WizardStepConfig } from './elements/Wizard';
import { ActivateStep, ConfigureStep, OrganizationDomainsStep, TestConfigurationStep } from './steps';

export type ConfigureSSOWizardProps = Omit<ComponentProps<typeof ConfigureSSOProvider>, 'children'> & {
  title?: React.ReactNode;
  forceInitialStep?: boolean;
};

export const ConfigureSSOWizard = ({ title, forceInitialStep, ...props }: ConfigureSSOWizardProps): JSX.Element => {
  const { organizationEnterpriseConnection: c, organizationDomains } = props;

  const allDomainsVerified = areAllOrganizationDomainsVerified(organizationDomains);

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      { id: 'verify-domain', label: 'Domains', isComplete: () => allDomainsVerified },
      {
        id: 'configure',
        label: 'Connection',
        guard: () => allDomainsVerified || c.hasConnection,
        isComplete: () => c.hasMinimumConfiguration || c.isActive,
      },
      {
        id: 'test',
        label: 'Test',
        guard: () => c.hasMinimumConfiguration || c.isActive,
        isComplete: () => c.hasSuccessfulTestRun || c.isActive,
      },
      {
        id: 'activate',
        label: 'Activate',
        guard: () => c.hasSuccessfulTestRun || c.isActive,
        isComplete: () => c.isActive,
      },
    ],
    [c, allDomainsVerified],
  );

  const initialStepId = forceInitialStep ? steps[0].id : undefined;

  return (
    <ConfigureSSOProvider {...props}>
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
    </ConfigureSSOProvider>
  );
};
