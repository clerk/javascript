import React, { type JSX } from 'react';

import { descriptors, Flow } from '@/customizables';
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

/**
 * Resolves the configure sub-flow for a created connection's provider. OIDC is an
 * open, backend-derived family (`oauth_custom_<slug>` or `oidc_*`), so every OIDC
 * provider shares one sub-flow and is matched by protocol prefix; SAML stays an
 * exact-literal lookup.
 * Returns `undefined` for an unrecognized provider so the caller can degrade.
 */
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

export const ConfigureProviderStep = (): JSX.Element | null => {
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
          // A provider the SDK doesn't recognize (e.g. a newer backend family)
          // degrades to a terminal state instead of white-screening the wizard.
          <>
            <Step.Header
              title='Unsupported provider'
              description='This identity provider isn’t supported in this version of Clerk. Update to the latest version to finish setting it up.'
            />
            <Step.Body />
          </>
        )}
      </Step>
    </Flow.Part>
  );
};
