import type { ClerkPaginatedResponse, UserOrganizationInvitationResource } from '@clerk/types';

import { useCoreOrganizationList } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { handleError } from '../../utils';
import { PreviewListItem, PreviewListItemButton } from './shared';
import { organizationListParams } from './utils';

export const AcceptRejectInvitationButtons = (props: UserOrganizationInvitationResource) => {
  const card = useCardState();
  const { userInvitations } = useCoreOrganizationList({
    userInvitations: organizationListParams.userInvitations,
  });

  const handleAccept = () => {
    return card
      .runAsync(props.accept())
      .then(result => {
        (userInvitations as any)?.unstable__mutate?.(result, {
          populateCache: (
            updatedInvitation: UserOrganizationInvitationResource,
            invitationInfinitePages: ClerkPaginatedResponse<UserOrganizationInvitationResource>[],
          ) => {
            return invitationInfinitePages.map(item => {
              const newData = item.data.map(obj => {
                if (obj.id === updatedInvitation.id) {
                  return {
                    ...updatedInvitation,
                  };
                }

                return obj;
              });
              return { ...item, data: newData };
            });
          },
          // Since `accept` gives back the updated information,
          // we don't need to revalidate here.
          revalidate: false,
        });
      })
      .catch(err => handleError(err, [], card.setError));
  };

  if (props.status === 'accepted') {
    return (
      <Text
        variant='smallRegular'
        colorScheme='neutral'
        localizationKey={localizationKeys('organizationList.invitationAcceptedLabel')}
      />
    );
  }

  return (
    <PreviewListItemButton
      isLoading={card.isLoading}
      onClick={handleAccept}
      localizationKey={localizationKeys('organizationList.action__invitationAccept')}
    />
  );
};

export const InvitationPreview = withCardStateProvider((props: UserOrganizationInvitationResource) => {
  return (
    <PreviewListItem organizationData={props.publicOrganizationData}>
      <AcceptRejectInvitationButtons {...props} />
    </PreviewListItem>
  );
});
