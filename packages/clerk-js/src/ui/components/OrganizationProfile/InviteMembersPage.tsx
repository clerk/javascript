import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreOrganization } from '../../contexts';
import { ContentPage, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { InviteMembersForm } from './InviteMembersForm';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const InviteMembersPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Invite members';
  const subtitle = 'Invite new members to this organization';
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });
  const { organization } = useCoreOrganization();

  if (!organization) {
    return null;
  }

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
        <InviteMembersForm
          organization={organization}
          onSuccess={wizard.nextStep}
        />
      </ContentPage>
      <SuccessPage
        title={title}
        // text={localizationKeys('userProfile.profilePage.successMessage')}
        text={'Invitations successfully sent'}
      />
    </Wizard>
  );
});
