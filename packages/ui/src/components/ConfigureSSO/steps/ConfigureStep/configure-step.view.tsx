import type { ReactNode } from 'react';

import { descriptors, Flow, localizationKeys } from '@/customizables';
import { CardStateProvider } from '@/elements/contexts';

import { Step } from '../../elements/Step';
import { Wizard, type WizardStepConfig } from '../../elements/Wizard';
import { SelectProviderStep } from '../SelectProviderStep';
import type { useConfigureProviderStepModel } from './configure-step.model';

export const ConfigureStepView = ({
  steps,
  initialStepId,
  configureProviderStep,
}: {
  steps: WizardStepConfig[];
  initialStepId: string | undefined;
  configureProviderStep: ReactNode;
}): JSX.Element => (
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
      <CardStateProvider>{configureProviderStep}</CardStateProvider>
    </Wizard.Match>
  </Wizard>
);

export const ConfigureProviderStepView = ({
  provider,
  ConfigureSteps,
}: ReturnType<typeof useConfigureProviderStepModel>): JSX.Element | null => {
  if (!provider) {
    return null;
  }

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
