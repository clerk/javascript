import type { ReactNode } from 'react';

import { Wizard } from '@/common';
import { descriptors, Flex, localizationKeys, Text } from '@/customizables';
import { Envelope } from '@/icons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { IconCircle } from '@/ui/elements/IconCircle';
import { SuccessPage } from '@/ui/elements/SuccessPage';

import type { useInviteMembersScreenController } from './invite-members-screen.controller';

export const InviteMembersScreenView = ({
  controller,
  form,
  successMessage,
}: {
  controller: ReturnType<typeof useInviteMembersScreenController>;
  form: ReactNode;
  successMessage: ReactNode;
}) => (
  <Wizard {...controller.wizardProps}>
    <FormContainer
      headerTitle={localizationKeys('organizationProfile.invitePage.title')}
      headerSubtitle={localizationKeys('organizationProfile.invitePage.subtitle')}
    >
      {form}
    </FormContainer>
    <SuccessPage
      title={localizationKeys('organizationProfile.invitePage.title')}
      onFinish={controller.close}
      contents={successMessage}
    />
  </Wizard>
);

export const InvitationsSentMessageView = () => (
  <Flex
    direction='col'
    center
    gap={4}
  >
    <IconCircle
      boxElementDescriptor={descriptors.invitationsSentIconBox}
      iconElementDescriptor={descriptors.invitationsSentIcon}
      icon={Envelope}
    />
    <Text localizationKey={localizationKeys('organizationProfile.invitePage.successMessage')} />
  </Flex>
);
