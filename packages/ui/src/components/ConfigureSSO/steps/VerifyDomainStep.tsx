import { Col, descriptors, Flow, Text } from '@/customizables';

import { ProfileCardBody, ProfileCardSection } from '../elements/ProfileCard';
import { useRegisterContinueAction, useWizard } from '../elements/Wizard';

export const VerifyDomainStep = (): JSX.Element => {
  const { goNext } = useWizard();

  useRegisterContinueAction({
    handler: () => goNext(),
    // TODO: Implement verification
    // isDisabled: true,
  });

  return (
    <Flow.Part part='verifyDomain'>
      <Col
        elementDescriptor={descriptors.configureSSOWizardBody}
        elementId={descriptors.configureSSOWizardBody.setId('verify-domain')}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <ProfileCardBody>
          <ProfileCardSection
            title='Verify your domain'
            subtitle='Verify the domain you want to enable the enterprise connection on.'
          >
            <Text>UI goes here</Text>
          </ProfileCardSection>
        </ProfileCardBody>
      </Col>
    </Flow.Part>
  );
};
