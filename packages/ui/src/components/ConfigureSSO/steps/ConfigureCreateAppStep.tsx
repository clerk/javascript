import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';
import { useRegisterContinueAction, useWizard } from '../elements/Wizard';

export const ConfigureCreateApp = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
  });

  return (
    <Flow.Part part='configureCreateApp'>
      <Step
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('create-app')}
      >
        <Step.Header
          title='Configure Okta Workforce'
          description='Create a new enterprise application in your Okta Dashboard.'
        />

        <Step.Body>
          <Text>UI goes here</Text>
        </Step.Body>
      </Step>
    </Flow.Part>
  );
};
