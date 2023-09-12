import type { OrganizationResource, UserOrganizationInvitationResource } from '@clerk/types';
import { useState } from 'react';

import { Organization } from '../../../core/resources/Organization';
import { useCoreOrganizationList } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { handleError } from '../../utils';
import { updateCacheInPlace } from '../OrganizationSwitcher/utils';
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
  const [acceptedOrganization, setAcceptedOrganization] = useState<OrganizationResource | null>(null);
  const { userInvitations } = useCoreOrganizationList({
    userInvitations: organizationListParams.userInvitations,
  });

  const handleAccept = () => {
    return card
      .runAsync(async () => {
        const updatedItem = await props.accept();
        const organization = await Organization.get(props.publicOrganizationData.id);
        return [updatedItem, organization] as const;
      })
      .then(([updatedItem, organization]) => {
        // Update cache in case another listener depends on it
        updateCacheInPlace(userInvitations)(updatedItem);
        setAcceptedOrganization(organization);
      })
      .catch(err => handleError(err, [], card.setError));
  };

  if (acceptedOrganization) {
    return <MembershipPreview organization={acceptedOrganization} />;
  }

  return (
    <PreviewListItem organizationData={props.publicOrganizationData}>
      <AcceptRejectInvitationButtons onAccept={handleAccept} />
    </PreviewListItem>
  );
});
