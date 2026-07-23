import { useOrganization } from '@clerk/shared/react';
import type { InviteMembersModalProps } from '@clerk/shared/types';

import { Protect, useWizard, Wizard } from '@/common';
import { SubscriberTypeContext } from '@/contexts';
import { localizationKeys } from '@/customizables';
import { Card } from '@/elements/Card';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { FormContainer } from '@/elements/FormContainer';
import { Route } from '@/router';

import { InviteMembersForm } from '../OrganizationProfile/InviteMembersForm';
import { InvitationsSentMessage } from '../OrganizationProfile/InviteMembersScreen';

const InviteMembersModalInner = withCardStateProvider(() => {
  const { organization } = useOrganization();
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });
  const title = localizationKeys('organizationProfile.invitePage.title');
  const subtitle = localizationKeys('organizationProfile.invitePage.subtitle');

  if (!organization) {
    return null;
  }

  return (
    <Card.Root>
      <Card.Content>
        <Wizard {...wizard.props}>
          <FormContainer
            headerTitle={title}
            headerTitleTextVariant='h2'
            headerSubtitle={subtitle}
          >
            <InviteMembersForm
              onSuccess={wizard.nextStep}
              hideResetButton
            />
          </FormContainer>
          <FormContainer
            headerTitle={title}
            headerTitleTextVariant='h2'
          >
            <InvitationsSentMessage />
          </FormContainer>
        </Wizard>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
});

export const InviteMembersModal = (_props: InviteMembersModalProps): JSX.Element => {
  return (
    <Route path='inviteMembers'>
      <SubscriberTypeContext.Provider value='organization'>
        <Protect permission='org:sys_memberships:manage'>
          {/*TODO: Used by InvisibleRootBox, can we simplify? */}
          <div>
            <InviteMembersModalInner />
          </div>
        </Protect>
      </SubscriberTypeContext.Provider>
    </Route>
  );
};
