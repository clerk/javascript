import React, { type ComponentProps } from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOProvider } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { Wizard, type WizardStepConfig } from './elements/Wizard';
import {
  ConfigureStep,
  ConfirmationStep,
  OrganizationDomainsStep,
  SelectProviderStep,
  TestConfigurationStep,
} from './steps';

export type ConfigureSSOWizardProps = Omit<ComponentProps<typeof ConfigureSSOProvider>, 'children'>;

/** Pure, data-injected ConfigureSSO flow — hosts own fetching, loading, and permission gating. */
export const ConfigureSSOWizard = (props: ConfigureSSOWizardProps): JSX.Element => {
  const { organizationEnterpriseConnection: c, organizationDomains } = props;

  const allDomainsVerified =
    !!organizationDomains?.length &&
    organizationDomains.every(domain => domain.ownershipVerification?.status === 'verified');

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      { id: 'verify-domain', label: 'Verify domain' },
      { id: 'select-provider', guard: () => allDomainsVerified },
      { id: 'configure', label: 'Configure', guard: () => c.hasConnection },
      { id: 'test', label: 'Test', guard: () => c.hasMinimumConfiguration || c.isActive },
      { id: 'confirmation', label: 'Confirmation', guard: () => c.hasSuccessfulTestRun || c.isActive },
    ],
    [c, allDomainsVerified],
  );

  // Each step owns a `CardStateProvider` so card errors stay scoped to their step and clear when it unmounts.
  return (
    <ConfigureSSOProvider {...props}>
      <Wizard steps={steps}>
        <ConfigureSSOHeader />

        <Wizard.Match id='verify-domain'>
          <CardStateProvider>
            <OrganizationDomainsStep />
          </CardStateProvider>
        </Wizard.Match>

        <Wizard.Match id='select-provider'>
          <CardStateProvider>
            <SelectProviderStep />
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

        <Wizard.Match id='confirmation'>
          <CardStateProvider>
            <ConfirmationStep />
          </CardStateProvider>
        </Wizard.Match>
      </Wizard>
    </ConfigureSSOProvider>
  );
};
