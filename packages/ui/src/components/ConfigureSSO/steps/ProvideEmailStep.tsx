import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';

export const ProvideEmail = (): JSX.Element => {
  return (
    <Flow.Part part='provideEmail'>
      <Step
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('provide-email')}
      >
        <Step.Header
          title='Verify your domain'
          description='Verify the domain you want to enable the enterprise connection on.'
        />

        <Step.Body>
          <Text as='p'>UI goes here</Text>
        </Step.Body>

        <Step.Footer />
      </Step>
    </Flow.Part>
  );
};
