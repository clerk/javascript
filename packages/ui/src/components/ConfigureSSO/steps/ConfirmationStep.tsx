import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

export const ConfirmationStep = (): JSX.Element => {
  const { goPrev, isFirstStep } = useWizard();

  return (
    <Flow.Part part='sso-confirmation'>
      <Step
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('confirmation')}
      >
        <Step.Body>
          <Text>UI goes here</Text>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous
            onClick={() => goPrev()}
            isDisabled={isFirstStep}
          />
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};
