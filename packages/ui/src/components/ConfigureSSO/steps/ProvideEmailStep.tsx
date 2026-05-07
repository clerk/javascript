import { Col, descriptors, Flow, Text } from '@/customizables';

import { ProfileCardBody, ProfileCardSection } from '../elements/ProfileCard';
import { useRegisterContinueAction, useWizard } from '../elements/Wizard';

export const ProvideEmail = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => {
      return goNext();
    },
  });

  return (
    <Flow.Part part='provideEmail'>
      <Col
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('provide-email')}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <ProfileCardBody>
          <ProfileCardSection
            title='Verify your domain'
            subtitle='Verify the domain you want to enable the enterprise connection on.'
          >
            <Text as='p'>UI goes here</Text>
          </ProfileCardSection>
        </ProfileCardBody>
      </Col>
    </Flow.Part>
  );
};
