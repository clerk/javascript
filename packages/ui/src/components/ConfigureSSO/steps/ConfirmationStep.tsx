import { Col, descriptors, Flow, Text } from '@/customizables';

import { ProfileCardBody, ProfileCardSection } from '../elements/ProfileCard';

export const ConfirmationStep = (): JSX.Element => {
  return (
    <Flow.Part part='sso-confirmation'>
      <Col
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('confirmation')}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <ProfileCardBody>
          <ProfileCardSection>
            <Text>UI goes here</Text>
          </ProfileCardSection>
        </ProfileCardBody>
      </Col>
    </Flow.Part>
  );
};
