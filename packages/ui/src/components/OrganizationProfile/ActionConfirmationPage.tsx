import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard, Wizard } from '../../common';
import { useOrganizationProfileContext } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Col, localizationKeys, Text } from '../../customizables';
import { organizationListParams } from '../OrganizationSwitcher/utils';

type LeaveOrganizationFormProps = FormProps;

const useLeaveWithRevalidations = (leavePromise: (() => Promise<any>) | undefined) => {
  const card = useCardState();
  const { navigateAfterLeaveOrganization } = useOrganizationProfileContext();
  const { userMemberships, userInvitations } = useOrganizationList({
    userMemberships: organizationListParams.userMemberships,
    userInvitations: organizationListParams.userInvitations,
  });

  return () =>
    card
      .runAsync(async () => {
        await leavePromise?.();
      })
      .then(() => {
        void userMemberships.revalidate?.();
        void userInvitations.revalidate?.();
        void navigateAfterLeaveOrganization();
      });
};

export const LeaveOrganizationForm = (props: LeaveOrganizationFormProps) => {
  const { organization } = useOrganization();
  const { user } = useUser();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-assertion
  const leaveOrg = useLeaveWithRevalidations(() => user!.leaveOrganization(organization!.id));

  if (!organization || !user) {
    return null;
  }

  return (
    <ActionConfirmationPage
      organizationName={organization.name}
      title={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
      messageLine1={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.messageLine1')}
      messageLine2={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.messageLine2')}
      actionDescription={localizationKeys(
        'organizationProfile.profilePage.dangerSection.leaveOrganization.actionDescription',
        { organizationName: organization.name },
      )}
      submitLabel={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
      successMessage={localizationKeys(
        'organizationProfile.profilePage.dangerSection.leaveOrganization.successMessage',
      )}
      onConfirmation={leaveOrg}
      {...props}
    />
  );
};

type DeleteOrganizationFormProps = FormProps;
export const DeleteOrganizationForm = (props: DeleteOrganizationFormProps) => {
  const { organization, membership } = useOrganization();

  const deleteOrg = useLeaveWithRevalidations(organization?.destroy);

  if (!organization || !membership) {
    return null;
  }

  return (
    <ActionConfirmationPage
      organizationName={organization.name}
      title={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.title')}
      messageLine1={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.messageLine1')}
      messageLine2={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.messageLine2')}
      actionDescription={localizationKeys(
        'organizationProfile.profilePage.dangerSection.deleteOrganization.actionDescription',
        { organizationName: organization.name },
      )}
      submitLabel={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.title')}
      successMessage={localizationKeys(
        'organizationProfile.profilePage.dangerSection.deleteOrganization.successMessage',
      )}
      onConfirmation={deleteOrg}
      {...props}
    />
  );
};

type ActionConfirmationPageProps = FormProps & {
  title: LocalizationKey;
  messageLine1: LocalizationKey;
  messageLine2: LocalizationKey;
  actionDescription: LocalizationKey;
  organizationName?: string;
  successMessage: LocalizationKey;
  submitLabel: LocalizationKey;
  onConfirmation: () => Promise<any>;
  colorScheme?: 'danger' | 'primary';
};

const ActionConfirmationPage = withCardStateProvider((props: ActionConfirmationPageProps) => {
  const {
    title,
    messageLine1,
    messageLine2,
    actionDescription,
    organizationName,
    successMessage,
    submitLabel,
    onSuccess,
    onReset,
    onConfirmation,
    colorScheme = 'danger',
  } = props;
  const wizard = useWizard();
  const card = useCardState();

  const confirmationField = useFormControl('deleteOrganizationConfirmation', '', {
    type: 'text',
    label: actionDescription,
    isRequired: true,
    placeholder: organizationName,
  });

  const canSubmit = actionDescription ? confirmationField.value === organizationName : true;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    try {
      await onConfirmation().then(() => wizard.nextStep());
    } catch (e: any) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <FormContainer
        headerTitle={title}
        gap={1}
      >
        <Form.Root onSubmit={handleSubmit}>
          <Col>
            <Text
              localizationKey={messageLine1}
              colorScheme='secondary'
            />
            <Text
              localizationKey={messageLine2}
              colorScheme='danger'
            />
          </Col>

          <Form.ControlRow elementId={confirmationField.id}>
            <Form.PlainInput {...confirmationField.props} />
          </Form.ControlRow>

          <FormButtonContainer>
            <Form.SubmitButton
              block={false}
              colorScheme={colorScheme}
              localizationKey={submitLabel}
              isDisabled={!canSubmit}
            />
            <Form.ResetButton
              localizationKey={localizationKeys('userProfile.formButtonReset')}
              block={false}
              onClick={onReset}
            />
          </FormButtonContainer>
        </Form.Root>
      </FormContainer>
      <SuccessPage
        title={title}
        text={successMessage}
        onFinish={onSuccess}
      />
    </Wizard>
  );
});
