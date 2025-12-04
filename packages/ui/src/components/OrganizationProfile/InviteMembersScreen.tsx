import { useOrganization } from '@clerk/shared/react';
import { runIfFunctionOrReturn } from '@clerk/shared/utils';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { FormContainer } from '@/ui/elements/FormContainer';
import { IconCircle } from '@/ui/elements/IconCircle';
import { SuccessPage } from '@/ui/elements/SuccessPage';

import { useWizard, Wizard } from '../../common';
import { useOrganizationProfileContext } from '../../contexts';
import { descriptors, Flex, localizationKeys, Text } from '../../customizables';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { Email } from '../../icons';
import { InviteMembersForm } from './InviteMembersForm';

type InviteMembersScreenProps = {
  onReset?: () => void;
};

export const InviteMembersScreen = withCardStateProvider((props: InviteMembersScreenProps) => {
  const { close } = useActionContext();
  const { onReset = close } = props;
  const title = localizationKeys('organizationProfile.invitePage.title');
  const subtitle = localizationKeys('organizationProfile.invitePage.subtitle');
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });
  const { organization } = useOrganization();

  if (!organization) {
    return null;
  }

  return (
    <Wizard {...wizard.props}>
      <FormContainer
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <InviteMembersForm
          onSuccess={wizard.nextStep}
          onReset={onReset}
        />
      </FormContainer>
      <SuccessPage
        title={title}
        onFinish={close}
        contents={<InvitationsSentMessage />}
      />
    </Wizard>
  );
});

export const InvitationsSentMessage = () => {
  return (
    <Flex
      direction='col'
      center
      gap={4}
    >
      <IconCircle
        boxElementDescriptor={descriptors.invitationsSentIconBox}
        iconElementDescriptor={descriptors.invitationsSentIcon}
        icon={Email}
      />
      <Text localizationKey={localizationKeys('organizationProfile.invitePage.successMessage')} />
    </Flex>
  );
};
