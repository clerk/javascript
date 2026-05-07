import { Col, descriptors, Flow, Text } from '@/customizables';

import { ProfileCardBody, ProfileCardSection } from '../elements/ProfileCard';
import { useRegisterContinueAction, useWizard } from '../elements/Wizard';

export const ConfigureCreateApp = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
  });

  return (
    <Flow.Part part='configureCreateApp'>
      <Col
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('create-app')}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <ProfileCardBody>
          <ProfileCardSection
            title='Configure Okta Workforce'
            subtitle='Create a new enterprise application in your Okta Dashboard.'
          >
            <Text>UI goes here</Text>
          </ProfileCardSection>
        </ProfileCardBody>
      </Col>
    </Flow.Part>
  );
};
