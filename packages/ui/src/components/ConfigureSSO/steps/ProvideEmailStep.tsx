import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';
import { useRegisterContinueAction, useWizard } from '../elements/Wizard';

export const ProvideEmail = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
  });

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
      </Step>
    </Flow.Part>
  );
};
