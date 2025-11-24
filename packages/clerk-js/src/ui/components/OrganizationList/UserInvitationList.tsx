import { useClerk, useOrganizationList } from '@clerk/shared/react';
import type { OrganizationResource, UserOrganizationInvitationResource } from '@clerk/shared/types';
import { useState } from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import { localizationKeys } from '../../customizables';
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
  const { getOrganization } = useClerk();
  const [acceptedOrganization, setAcceptedOrganization] = useState<OrganizationResource | null>(null);
  const { userInvitations } = useOrganizationList({
    userInvitations: organizationListParams.userInvitations,
    userMemberships: organizationListParams.userMemberships,
  });

  const handleAccept = () => {
    return (
      card
        // When accepting an invitation we don't want to trigger a revalidation as this will cause a layout shift, prefer updating in place
        .runAsync(async () => {
          const updatedItem = await props.accept();
          const organization = await getOrganization(props.publicOrganizationData.id);
          return [updatedItem, organization] as const;
        })
        .then(([updatedItem, organization]) => {
          // Update cache in case another listener depends on it
          void userInvitations?.setData?.(cachedPages => populateCacheUpdateItem(updatedItem, cachedPages, 'negative'));
          setAcceptedOrganization(organization);
        })
        .catch(err => handleError(err, [], card.setError))
    );
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
