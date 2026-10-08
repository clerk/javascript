import { createOrganizationMessages } from './create-organization.messages';
import { useCreateOrganizationPageModel } from './create-organization-page.model';
import { CreateOrganizationPageView } from './create-organization-page.view';
import { CreateOrganizationForm } from './CreateOrganizationForm';

export const CreateOrganizationPage = () => {
  const model = useCreateOrganizationPageModel();
  return (
    <CreateOrganizationPageView>
      <CreateOrganizationForm
        skipInvitationScreen={model.skipInvitationScreen}
        startPage={{ headerTitle: createOrganizationMessages.title }}
        navigateAfterCreateOrganization={model.navigateAfterCreateOrganization}
        flow='default'
        onComplete={model.onComplete}
      />
    </CreateOrganizationPageView>
  );
};
