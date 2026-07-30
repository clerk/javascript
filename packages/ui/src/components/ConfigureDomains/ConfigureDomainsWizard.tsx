import React, { type ComponentProps } from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOProvider } from '../ConfigureSSO/ConfigureSSOContext';
import { ConfigureSSOHeader } from '../ConfigureSSO/ConfigureSSOHeader';
import { areAllOrganizationDomainsVerified } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { Step } from '../ConfigureSSO/elements/Step';
import { Wizard, type WizardStepConfig } from '../ConfigureSSO/elements/Wizard';
import { OrganizationDomainsStep } from '../ConfigureSSO/steps';
import { DomainsCompleteStep } from './DomainsCompleteStep';

export type ConfigureDomainsWizardProps = Omit<ComponentProps<typeof ConfigureSSOProvider>, 'children'> & {
  title?: React.ReactNode;
  forceInitialStep?: boolean;
};

/**
 * PROTOTYPE ONLY — the standalone domain setup + verification flow, the first
 * prerequisite in the restructured IA. Reuses the real domains step wholesale.
 */
export const ConfigureDomainsWizard = ({
  title,
  forceInitialStep,
  ...props
}: ConfigureDomainsWizardProps): JSX.Element => {
  const { organizationDomains } = props;

  const allDomainsVerified = areAllOrganizationDomainsVerified(organizationDomains);

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      { id: 'verify-domain', label: 'Domains', isComplete: () => allDomainsVerified },
      {
        id: 'complete',
        label: 'Finish',
        isReachable: () => allDomainsVerified,
        isComplete: () => allDomainsVerified,
      },
    ],
    [allDomainsVerified],
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

        <Wizard.Match id='complete'>
          <CardStateProvider>
            <Step>
              <DomainsCompleteStep />
            </Step>
          </CardStateProvider>
        </Wizard.Match>
      </Wizard>
    </ConfigureSSOProvider>
  );
};
