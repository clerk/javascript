import { withCardStateProvider } from '@/ui/elements/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';

import type { LocalizationKey } from '../../customizables';
import { localizationKeys } from '../../customizables';
import { useActionConfirmationController, useOrganizationActionController } from './action-confirmation.controller';
import { ActionConfirmationView } from './action-confirmation.view';
import { useOrganizationActionModel } from './organization-action.model';

type LeaveOrganizationFormProps = FormProps;

export const LeaveOrganizationForm = (props: LeaveOrganizationFormProps) => {
  const model = useOrganizationActionModel('leave');
  const leaveOrg = useOrganizationActionController(model);

  if (!model.available) {
    return null;
  }

  return (
    <ActionConfirmationPage
      organizationName={model.organizationName}
      title={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
      messageLine1={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.messageLine1')}
      messageLine2={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.messageLine2')}
      actionDescription={localizationKeys(
        'organizationProfile.profilePage.dangerSection.leaveOrganization.actionDescription',
        { organizationName: model.organizationName },
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
  const model = useOrganizationActionModel('delete');
  const deleteOrg = useOrganizationActionController(model);

  if (!model.available) {
    return null;
  }

  return (
    <ActionConfirmationPage
      organizationName={model.organizationName}
      title={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.title')}
      messageLine1={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.messageLine1')}
      messageLine2={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.messageLine2')}
      actionDescription={localizationKeys(
        'organizationProfile.profilePage.dangerSection.deleteOrganization.actionDescription',
        { organizationName: model.organizationName },
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
  const controller = useActionConfirmationController(props);

  return (
    <ActionConfirmationView
      controller={controller}
      title={props.title}
      messageLine1={props.messageLine1}
      messageLine2={props.messageLine2}
      submitLabel={props.submitLabel}
      successMessage={props.successMessage}
      onSuccess={props.onSuccess}
      onReset={props.onReset}
      colorScheme={props.colorScheme ?? 'danger'}
    />
  );
});
