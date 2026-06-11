import { type JSX } from 'react';

import { descriptors, Flow } from '@/customizables';

import { useConfigureSSO } from '../../ConfigureSSOContext';
import { Step } from '../../elements/Step';
import type { ProviderType } from '../../types';
import {
  SamlCustomConfigureSteps,
  SamlGoogleConfigureSteps,
  SamlMicrosoftConfigureSteps,
  SamlOktaConfigureSteps,
} from './saml';

const STEPS_BY_PROVIDER: Record<ProviderType, () => JSX.Element> = {
  saml_custom: SamlCustomConfigureSteps,
  saml_okta: SamlOktaConfigureSteps,
  saml_google: SamlGoogleConfigureSteps,
  saml_microsoft: SamlMicrosoftConfigureSteps,
};

export const ConfigureStep = (): JSX.Element | null => {
  const { organizationEnterpriseConnection: c } = useConfigureSSO();

  // Type guard: the provider should be defined by the time we reach configure.
  if (!c.provider) {
    return null;
  }

  // Adding a provider to the select step without a mapping here fails the build.
  const StepsByProvider = STEPS_BY_PROVIDER[c.provider];

  if (!StepsByProvider) {
    throw new Error(`No steps found for provider: ${c.provider}`);
  }

  return (
    <Flow.Part part='configureCreateApp'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('configure')}
      >
        <StepsByProvider />
      </Step>
    </Flow.Part>
  );
};
