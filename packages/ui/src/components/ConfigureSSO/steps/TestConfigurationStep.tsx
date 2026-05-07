import { Col, descriptors, Flow, Text } from '@/customizables';

import { ProfileCardBody, ProfileCardSection } from '../elements/ProfileCard';

export const TestConfigurationStep = (): JSX.Element => {
  return (
    <Flow.Part part='test-sso'>
      <Col
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('test')}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <ProfileCardBody>
          <ProfileCardSection
            title='Test your SSO connection'
            subtitle='Test your SSO configuration to verify you can successfully authenticate via your identity provider'
          >
            <Text>UI goes here</Text>
          </ProfileCardSection>
        </ProfileCardBody>
      </Col>
    </Flow.Part>
  );
};
