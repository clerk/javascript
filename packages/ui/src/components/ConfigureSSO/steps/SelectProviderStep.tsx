import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

export const SelectProviderStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <Flow.Part part='selectProvider'>
      <Step
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('select-provider')}
      >
        <Step.Header
          title='Select provider'
          description='Select the provider you are going to setup SSO for.'
        />

        <Step.Body>
          <Step.Section>
            <Text>UI goes here</Text>
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous
            onClick={() => goPrev()}
            isDisabled={isFirstStep}
          />
          <Step.Footer.Continue
            onClick={() => goNext()}
            isDisabled={isLastStep}
          />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};
