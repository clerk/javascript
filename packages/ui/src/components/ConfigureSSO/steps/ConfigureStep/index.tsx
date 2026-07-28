import React, { type JSX } from 'react';

import { descriptors, Flow, localizationKeys } from '@/customizables';
import { CardStateProvider } from '@/elements/contexts';

import { useConfigureSSO } from '../../ConfigureSSOContext';
import { isOidcProvider } from '../../domain/organizationEnterpriseConnection';
import { Step } from '../../elements/Step';
import { useWizard, Wizard, type WizardStepConfig } from '../../elements/Wizard';
import type { EnterpriseConnectionProviderType, SamlProviderType } from '../../types';
import { SelectProviderStep } from '../SelectProviderStep';
import { OidcCustomConfigureSteps } from './oidc';
import {
  SamlCustomConfigureSteps,
  SamlGoogleConfigureSteps,
  SamlMicrosoftConfigureSteps,
  SamlOktaConfigureSteps,
} from './saml';

type ConfigureStepsComponent = () => JSX.Element;

const STEPS_BY_SAML_PROVIDER: Record<SamlProviderType, ConfigureStepsComponent> = {
  saml_custom: SamlCustomConfigureSteps,
  saml_okta: SamlOktaConfigureSteps,
  saml_google: SamlGoogleConfigureSteps,
  saml_microsoft: SamlMicrosoftConfigureSteps,
};

export const resolveConfigureSteps = (
  provider: EnterpriseConnectionProviderType,
): ConfigureStepsComponent | undefined =>
  isOidcProvider(provider) ? OidcCustomConfigureSteps : STEPS_BY_SAML_PROVIDER[provider];

export const ConfigureStep = (): JSX.Element => {
  const { organizationEnterpriseConnection: c } = useConfigureSSO();
  const { direction } = useWizard();

  const steps = React.useMemo<WizardStepConfig[]>(
    () => [{ id: 'select-provider' }, { id: 'configure-provider', isReachable: () => c.hasConnection }],
    [c],
  );

  const initialStepId = direction === 1 ? 'select-provider' : undefined;

  return (
    <Wizard
      steps={steps}
      initialStepId={initialStepId}
    >
      <Wizard.Match id='select-provider'>
        <CardStateProvider>
          <SelectProviderStep />
        </CardStateProvider>
      </Wizard.Match>

      <Wizard.Match id='configure-provider'>
        <CardStateProvider>
          <ConfigureProviderStep />
        </CardStateProvider>
      </Wizard.Match>
    </Wizard>
  );
};

const ConfigureProviderStep = (): JSX.Element | null => {
  const { organizationEnterpriseConnection: c } = useConfigureSSO();

  // Type guard: the provider should be defined by the time we reach configure.
  if (!c.provider) {
    return null;
  }

  const ConfigureSteps = resolveConfigureSteps(c.provider);

  return (
    <Flow.Part part='configureCreateApp'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('configure')}
      >
        {ConfigureSteps ? (
          <ConfigureSteps />
        ) : (
          <>
            <Step.Header
              title={localizationKeys('configureSSO.configureStep.unsupportedProvider.title')}
              description={localizationKeys('configureSSO.configureStep.unsupportedProvider.description')}
            />
            <Step.Body />
          </>
        )}
      </Step>
    </Flow.Part>
  );
};
