import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

export const ConfigureStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <Flow.Part part='configureCreateApp'>
      <Step
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('create-app')}
      >
        <Step.Header
          title='Configure Okta Workforce'
          description='Create a new enterprise application in your Okta Dashboard'
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
