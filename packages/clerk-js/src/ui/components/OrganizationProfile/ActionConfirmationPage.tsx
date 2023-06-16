import { useWizard, Wizard } from '../../common';
import { useCoreOrganization, useCoreUser, useOrganizationProfileContext } from '../../contexts';
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
import { handleError } from '../../utils';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

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
      title={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
      messageLine1={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.messageLine1')}
      messageLine2={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.messageLine2')}
      submitLabel={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
      successMessage={localizationKeys(
        'organizationProfile.profilePage.dangerSection.leaveOrganization.successMessage',
      )}
      onConfirmation={leave}
    />
  );
};

export const DeleteOrganizationPage = () => {
  const card = useCardState();
  const { navigateAfterLeaveOrganization } = useOrganizationProfileContext();
  const { organization, membership } = useCoreOrganization();

  if (!organization || !membership) {
    return null;
  }

  const deleteOrg = () => {
    return card.runAsync(organization.destroy()).then(navigateAfterLeaveOrganization);
  };

  return (
    <ActionConfirmationPage
      title={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.title')}
      messageLine1={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.messageLine1')}
      messageLine2={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.messageLine2')}
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
    successMessage,
    submitLabel,
    onConfirmation,
    colorScheme = 'danger',
  } = props;
  const wizard = useWizard();
  const card = useCardState();
  const { navigate } = useRouter();

  const handleSubmit = async () => {
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
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
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
              localizationKey={submitLabel}
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
