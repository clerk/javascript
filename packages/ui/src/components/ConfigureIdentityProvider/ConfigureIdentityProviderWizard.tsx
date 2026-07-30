import React, { type ComponentProps } from 'react';

import { CardStateProvider } from '@/elements/contexts';

import { ConfigureSSOProvider } from '../ConfigureSSO/ConfigureSSOContext';
import { ConfigureSSOHeader } from '../ConfigureSSO/ConfigureSSOHeader';
import { areAllOrganizationDomainsVerified } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { Step } from '../ConfigureSSO/elements/Step';
import { Wizard, type WizardStepConfig } from '../ConfigureSSO/elements/Wizard';
import { ConfigureStep, OrganizationDomainsStep } from '../ConfigureSSO/steps';
import { SetupCompleteStep } from './SetupCompleteStep';

export type ConfigureIdentityProviderWizardProps = Omit<ComponentProps<typeof ConfigureSSOProvider>, 'children'> & {
  title?: React.ReactNode;
  forceInitialStep?: boolean;
};

/**
 * PROTOTYPE ONLY — the prerequisite "identity provider setup" flow: domain
 * verification + IdP connection configuration, pulled out of ConfigureSSO so
 * both SSO and Directory Sync can require it. Reuses the real ConfigureSSO
 * steps and context wholesale; only the wizard composition is new.
 */
export const ConfigureIdentityProviderWizard = ({
  title,
  forceInitialStep,
  ...props
}: ConfigureIdentityProviderWizardProps): JSX.Element => {
  const { organizationEnterpriseConnection: c, organizationDomains } = props;

  const allDomainsVerified = areAllOrganizationDomainsVerified(organizationDomains);

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [
      { id: 'verify-domain', label: 'Domains', isComplete: () => allDomainsVerified },
      {
        id: 'configure',
        label: 'Identity provider',
        isReachable: () => allDomainsVerified || c.hasConnection,
        isComplete: () => c.hasMinimumConfiguration || c.isActive,
      },
      {
        id: 'complete',
        label: 'Finish',
        isReachable: () => c.hasMinimumConfiguration || c.isActive,
        isComplete: () => c.hasMinimumConfiguration || c.isActive,
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

        <Wizard.Match id='complete'>
          <CardStateProvider>
            <Step>
              <SetupCompleteStep />
            </Step>
          </CardStateProvider>
        </Wizard.Match>
      </Wizard>
    </ConfigureSSOProvider>
  );
};
