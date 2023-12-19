import { useOrganization, useUser } from '@clerk/shared/react';

import { useWizard, Wizard } from '../../common';
import { useOrganizationProfileContext } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Col, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import {
  Form,
  FormButtonContainer,
  FormContent,
  SuccessPage,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

type LeaveOrganizationFormProps = FormProps;
export const LeaveOrganizationForm = (props: LeaveOrganizationFormProps) => {
  const card = useCardState();
  const { navigateAfterLeaveOrganization } = useOrganizationProfileContext();
  const { organization } = useOrganization();
  const { user } = useUser();

  if (!organization || !user) {
    return null;
  }

  const leave = () => {
    return card.runAsync(user.leaveOrganization(organization.id)).then(navigateAfterLeaveOrganization);
  };

  return (
    <ActionConfirmationPage
      organizationName={organization?.name}
      title={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
      messageLine1={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.messageLine1')}
      messageLine2={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.messageLine2')}
      actionDescription={localizationKeys(
        'organizationProfile.profilePage.dangerSection.leaveOrganization.actionDescription',
        { organizationName: organization?.name },
      )}
      submitLabel={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
      successMessage={localizationKeys(
        'organizationProfile.profilePage.dangerSection.leaveOrganization.successMessage',
      )}
      onConfirmation={leave}
      {...props}
    />
  );
};

type DeleteOrganizationFormProps = FormProps;
export const DeleteOrganizationForm = (props: DeleteOrganizationFormProps) => {
  const card = useCardState();
  const { navigateAfterLeaveOrganization } = useOrganizationProfileContext();
  const { organization } = useOrganization();

  if (!organization) {
    return null;
  }

  const deleteOrg = () => {
    return card.runAsync(organization.destroy()).then(navigateAfterLeaveOrganization);
  };

  return (
    <ActionConfirmationPage
      organizationName={organization?.name}
      title={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.title')}
      messageLine1={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.messageLine1')}
      messageLine2={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.messageLine2')}
      actionDescription={localizationKeys(
        'organizationProfile.profilePage.dangerSection.deleteOrganization.actionDescription',
        { organizationName: organization?.name },
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
  actionDescription?: LocalizationKey;
  organizationName?: string;
  successMessage: LocalizationKey;
  submitLabel: LocalizationKey;
  onConfirmation: () => Promise<any>;
  variant?: 'primaryDanger' | 'primary';
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
    variant = 'primaryDanger',
  } = props;
  const wizard = useWizard();
  const card = useCardState();

  const confirmationField = useFormControl('deleteOrganizationConfirmation', '', {
    type: 'text',
    label:
      actionDescription ||
      localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.actionDescription'),
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
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <FormContent
        headerTitle={title}
        breadcrumbTitle={localizationKeys('organizationProfile.profilePage.dangerSection.title')}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
        <Form.Root onSubmit={handleSubmit}>
          <Col gap={1}>
            <Text
              localizationKey={messageLine1}
              colorScheme='neutral'
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
              variant={variant}
              localizationKey={submitLabel}
              isDisabled={!canSubmit}
            />
            <Form.ResetButton
              localizationKey={localizationKeys('userProfile.formButtonReset')}
              block={false}
              onClick={async () => {
                onReset?.();
              }}
            />
          </FormButtonContainer>
        </Form.Root>
      </FormContent>
      <SuccessPage
        title={title}
        text={successMessage}
        onFinish={onSuccess}
      />
    </Wizard>
  );
});
