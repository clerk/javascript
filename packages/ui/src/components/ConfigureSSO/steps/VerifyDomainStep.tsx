import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';

export const VerifyDomainStep = (): JSX.Element => {
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

        <Step.Footer />
      </Step>
    </Flow.Part>
  );
};
