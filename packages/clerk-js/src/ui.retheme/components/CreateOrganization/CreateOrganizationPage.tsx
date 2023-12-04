import { useClerk } from '@clerk/shared/react';

import { useCreateOrganizationContext } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { CreateOrganizationForm } from './CreateOrganizationForm';

export const CreateOrganizationPage = withCardStateProvider(() => {
  const title = localizationKeys('createOrganization.title');
  const { closeCreateOrganization } = useClerk();

  const { mode, navigateAfterCreateOrganization, skipInvitationScreen } = useCreateOrganizationContext();

  return (
    <CreateOrganizationForm
      skipInvitationScreen={skipInvitationScreen}
      navigateAfterCreateOrganization={navigateAfterCreateOrganization}
      flow={'default'}
      startPage={{
        headerTitle: title,
      }}
      onComplete={() => {
        if (mode === 'modal') {
          closeCreateOrganization();
        }
      }}
    />
  );
});
