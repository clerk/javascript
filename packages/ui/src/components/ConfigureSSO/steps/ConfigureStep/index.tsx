import { type JSX } from 'react';

import { descriptors, Flow } from '@/customizables';

import { useConfigureSSO } from '../../ConfigureSSOContext';
import { Step } from '../../elements/Step';
import { Wizard } from '../../elements/Wizard';
import { useWizardMachine } from '../../elements/WizardMachineContext';
import type { ProviderType } from '../../types';
import { SamlCustomConfigureSteps } from './saml/SamlCustomConfigureSteps';
import { SamlOktaConfigureSteps } from './saml/SamlOktaConfigureSteps';

const STEPS_BY_PROVIDER: Record<ProviderType, () => JSX.Element> = {
  saml_custom: SamlCustomConfigureSteps,
  saml_okta: SamlOktaConfigureSteps,
};

export const ConfigureStep = (): JSX.Element | null => {
  const { provider } = useConfigureSSO();
  // The inner SAML sub-step flow keeps its own nested <Wizard> (untouched —
  // slated for the TXT rework). Only its terminal step advances the top-level
  // machine, via the injected `onComplete`.
  const { dispatch } = useWizardMachine();

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
        <Wizard onComplete={() => dispatch({ type: 'NEXT' })}>
          <StepsByProvider />
        </Wizard>
      </Step>
    </Flow.Part>
  );
};
