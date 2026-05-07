import { descriptors, Flow, Text } from '@/customizables';

import { Step } from './Step';

export const ConfirmationStep = (): JSX.Element => {
  return (
    <Flow.Part part='sso-confirmation'>
      <Step
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('confirmation')}
      >
        <Step.Body>
          <Text>UI goes here</Text>
        </Step.Body>
      </Step>
    </Flow.Part>
  );
};
