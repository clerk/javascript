import type { OrganizationResource, UserOrganizationInvitationResource } from '@clerk/types';
import { useState } from 'react';

import { useCoreClerk, useCoreOrganizationList } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { handleError } from '../../utils';
import { populateCacheUpdateItem } from '../OrganizationSwitcher/utils';
import { PreviewListItem, PreviewListItemButton } from './shared';
import { MembershipPreview } from './UserMembershipList';
import { organizationListParams } from './utils';

export const AcceptRejectInvitationButtons = (props: { onAccept: () => void }) => {
  const card = useCardState();

  return (
    <PreviewListItemButton
      isLoading={card.isLoading}
      onClick={props.onAccept}
      localizationKey={localizationKeys('organizationList.action__invitationAccept')}
    />
  );
};

export const InvitationPreview = withCardStateProvider((props: UserOrganizationInvitationResource) => {
  const card = useCardState();
  const { getOrganization } = useCoreClerk();
  const [acceptedOrganization, setAcceptedOrganization] = useState<OrganizationResource | null>(null);
  const { userInvitations } = useCoreOrganizationList({
    userInvitations: organizationListParams.userInvitations,
  });

  const handleAccept = () => {
    return card
      .runAsync(async () => {
        const updatedItem = await props.accept();
        const organization = await getOrganization(props.publicOrganizationData.id);
        return [updatedItem, organization] as const;
      })
      .then(([updatedItem, organization]) => {
        // Update cache in case another listener depends on it
        void userInvitations?.setData?.(cachedPages => populateCacheUpdateItem(updatedItem, cachedPages));
        setAcceptedOrganization(organization);
      })
      .catch(err => handleError(err, [], card.setError));
  };

  if (acceptedOrganization) {
    return <MembershipPreview organization={acceptedOrganization} />;
  }

  return (
    <PreviewListItem organizationData={props.publicOrganizationData}>
      {/* TODO: Fix this properly */}
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <AcceptRejectInvitationButtons onAccept={handleAccept} />
    </PreviewListItem>
  );
});
