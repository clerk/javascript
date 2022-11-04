import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreOrganization, useCoreUser, useOrganizationProfileContext } from '../../contexts';
import { LocalizationKey, localizationKeys, Text } from '../../customizables';
import { Form, useCardState, withCardStateProvider } from '../../elements';
import { useNavigate } from '../../hooks';
import { handleError } from '../../utils';
import { FormButtonContainer } from '../UserProfile/FormButtons';
import { SuccessPage } from '../UserProfile/SuccessPage';
import { ContentPage } from './OrganizationContentPage';

export const LeaveOrganizationPage = () => {
  const card = useCardState();
  const { navigateAfterLeaveOrganization } = useOrganizationProfileContext();
  const { organization, membership } = useCoreOrganization();
  const user = useCoreUser();

  if (!organization || !membership) {
    return null;
  }

  const leave = () => {
    return card.runAsync(organization.removeMember(user.id)).then(navigateAfterLeaveOrganization);
  };

  return (
    <ActionConfirmationPage
      title={localizationKeys('organizationProfile.profilePage.leave.title')}
      messageLine1={localizationKeys('organizationProfile.profilePage.leave.messageLine1')}
      messageLine2={localizationKeys('organizationProfile.profilePage.leave.messageLine2')}
      successMessage={localizationKeys('organizationProfile.profilePage.leave.successMessage')}
      onConfirmation={leave}
    />
  );
};

type ActionConfirmationPageProps = {
  title: LocalizationKey;
  messageLine1: LocalizationKey;
  messageLine2: LocalizationKey;
  successMessage: LocalizationKey;
  onConfirmation: () => Promise<any>;
  colorScheme?: 'danger' | 'neutral' | 'primary';
};

const ActionConfirmationPage = withCardStateProvider((props: ActionConfirmationPageProps) => {
  const { title, messageLine1, messageLine2, successMessage, onConfirmation, colorScheme = 'danger' } = props;
  const wizard = useWizard();
  const card = useCardState();
  const { navigate } = useNavigate();

  const handleSubmit = async () => {
    try {
      await onConfirmation().then(() => wizard.nextStep());
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage headerTitle={title}>
        <Form.Root onSubmit={handleSubmit}>
          <Text
            localizationKey={messageLine1}
            variant='regularRegular'
          />
          <Text
            localizationKey={messageLine2}
            variant='regularRegular'
          />
          <FormButtonContainer>
            <Form.SubmitButton
              block={false}
              colorScheme={colorScheme}
              localizationKey={'Leave Organization'}
            />
            <Form.ResetButton
              localizationKey={localizationKeys('userProfile.formButtonReset')}
              block={false}
              onClick={() => {
                navigate('..');
              }}
            />
          </FormButtonContainer>
        </Form.Root>
      </ContentPage>
      <SuccessPage
        title={title}
        text={successMessage}
      />
    </Wizard>
  );
});
