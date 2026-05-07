import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';

export const ConfigureCreateApp = (): JSX.Element => {
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

        <Step.Footer />
      </Step>
    </Flow.Part>
  );
};
