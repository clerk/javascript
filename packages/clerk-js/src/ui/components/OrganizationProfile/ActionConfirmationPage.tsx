import { useWizard, Wizard } from '../../common';
import {
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useOrganizationProfileContext,
} from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { localizationKeys, Text } from '../../customizables';
import {
  ContentPage,
  Form,
  FormButtonContainer,
  SuccessPage,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { organizationListParams } from '../OrganizationSwitcher/utils';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

const useLeaveWithRevalidations = (leavePromise: (() => Promise<any>) | undefined) => {
  const card = useCardState();
  const { navigateAfterLeaveOrganization } = useOrganizationProfileContext();
  const { userMemberships, userInvitations } = useCoreOrganizationList({
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

export const LeaveOrganizationPage = () => {
  const { organization } = useCoreOrganization();
  const user = useCoreUser();

  const leaveOrg = useLeaveWithRevalidations(organization ? () => user.leaveOrganization(organization.id) : undefined);

  if (!organization || !user) {
    return null;
  }

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
      onConfirmation={leaveOrg}
    />
  );
};

export const DeleteOrganizationPage = () => {
  const { organization, membership } = useCoreOrganization();

  const deleteOrg = useLeaveWithRevalidations(organization?.destroy);

  if (!organization || !membership) {
    return null;
  }

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
    />
  );
};

type ActionConfirmationPageProps = {
  title: LocalizationKey;
  messageLine1: LocalizationKey;
  messageLine2: LocalizationKey;
  actionDescription?: LocalizationKey;
  organizationName?: string;
  successMessage: LocalizationKey;
  submitLabel: LocalizationKey;
  onConfirmation: () => Promise<any>;
  colorScheme?: 'danger' | 'neutral' | 'primary';
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
    onConfirmation,
    colorScheme = 'danger',
  } = props;
  const wizard = useWizard();
  const card = useCardState();
  const { navigate } = useRouter();

  const confirmationField = useFormControl('deleteOrganizationConfirmation', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__confirmDeletion'),
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
      <ContentPage
        headerTitle={title}
        breadcrumbTitle={localizationKeys('organizationProfile.profilePage.dangerSection.title')}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
        <Form.Root onSubmit={handleSubmit}>
          <Text localizationKey={messageLine1} />
          <Text localizationKey={messageLine2} />

          <Text localizationKey={actionDescription} />

          <Form.ControlRow elementId={confirmationField.id}>
            <Form.Control
              {...confirmationField.props}
              required
            />
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
              onClick={async () => {
                await navigate('..');
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
