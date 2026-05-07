import { descriptors, Flow, Text } from '@/customizables';

import { Step } from '../elements/Step';

export const TestConfigurationStep = (): JSX.Element => {
  return (
    <Flow.Part part='test-sso'>
      <Step
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('test')}
      >
        <Step.Header
          title='Test your SSO connection'
          description='Test your SSO configuration to verify you can successfully authenticate via your identity provider'
        />

        <Step.Body>
          <Text>UI goes here</Text>
        </Step.Body>

        <Step.Footer />
      </Step>
    </Flow.Part>
  );
};
