import { type JSX } from 'react';

import { descriptors, Flow } from '@/customizables';

import { useConfigureSSO } from '../../ConfigureSSOContext';
import { Step } from '../../elements/Step';
import { Wizard } from '../../elements/Wizard';
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
  const { provider } = useConfigureSSO();

  // Type guard, at this point the provider should have been defined
  if (!provider) {
    return null;
  }

  // Type guard to ensure steps are provided
  // If a new provider is added to the select step, then build will fail ahead of runtime
  const StepsByProvider = STEPS_BY_PROVIDER[provider];
  if (!StepsByProvider) {
    throw new Error(`No steps found for provider: ${provider}`);
  }

  return (
    <Flow.Part part='configureCreateApp'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('configure')}
      >
        <Wizard>
          <StepsByProvider />
        </Wizard>
      </Step>
    </Flow.Part>
  );
};
