import { descriptors, Flow, Text } from '@/customizables';

import { useRegisterContinueAction, useWizard } from '../elements/Wizard';
import { Step } from './Step';

export const VerifyDomainStep = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
    // TODO: Implement verification
    // isDisabled: true,
  });

  return (
    <Flow.Part part='verifyDomain'>
      <Step
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('verify-domain')}
      >
        <Step.Header
          title='Verify your domain'
          description='Verify the domain you want to enable the enterprise connection on.'
        />

        <Step.Body>
          <Text>UI goes here</Text>
        </Step.Body>
      </Step>
    </Flow.Part>
  );
};
