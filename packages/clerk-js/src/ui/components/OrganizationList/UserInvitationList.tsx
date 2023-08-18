import type { ClerkPaginatedResponse, UserOrganizationInvitationResource } from '@clerk/types';

import { useCoreOrganizationList } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { useInView } from '../../hooks';
import { handleError } from '../../utils';
import { organizationListParams } from './utils';
import {
  PreviewListDivider,
  PreviewListItem,
  PreviewListItemButton,
  PreviewListSpinner,
  PreviewList,
  PreviewListItems,
  PreviewListSubtitle,
} from './shared';

export const UserInvitationList = () => {
  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView) {
        userInvitations.fetchNext?.();
      }
    },
  });

  const { userInvitations } = useCoreOrganizationList({
    userInvitations: organizationListParams.userInvitations,
  });

  if ((userInvitations.count ?? 0) === 0) {
    return null;
  }

  return (
    <PreviewList elementId='invitations'>
      <PreviewListSubtitle
        localizationKey={localizationKeys(
          (userInvitations.count ?? 0) > 1
            ? 'organizationList.invitationCountLabel_many'
            : 'organizationList.invitationCountLabel_single',
          {
            count: userInvitations.count,
          },
        )}
      />

      <PreviewListItems>
        {userInvitations?.data?.map(inv => {
          return (
            <InvitationPreview
              key={inv.id}
              {...inv}
            />
          );
        })}

        {userInvitations.hasNextPage && <PreviewListSpinner ref={ref} />}
      </PreviewListItems>
      <PreviewListDivider />
    </PreviewList>
  );
};

const AcceptRejectInvitationButtons = (props: UserOrganizationInvitationResource) => {
  const card = useCardState();
  const { userInvitations, userMemberships } = useCoreOrganizationList({
    userInvitations: organizationListParams.userInvitations,
    userMemberships: organizationListParams.userMemberships,
  });

  const handleAccept = () => {
    return card
      .runAsync(
        props.accept().then(async res => {
          await (userMemberships as any)?.unstable__mutate();
          return res;
        }),
      )
      .then(async result => {
        (userInvitations as any)?.unstable__mutate?.(result, {
          populateCache: (
            updatedInvitation: UserOrganizationInvitationResource,
            invitationInfinitePages: ClerkPaginatedResponse<UserOrganizationInvitationResource>[],
          ) => {
            const prevTotalCount = invitationInfinitePages[invitationInfinitePages.length - 1].total_count;

            return invitationInfinitePages.map(item => {
              const newData = item.data.filter(obj => {
                return obj.id !== updatedInvitation.id;
              });
              return { ...item, data: newData, total_count: prevTotalCount - 1 };
            });
          },
          // Since `accept` gives back the updated information,
          // we don't need to revalidate here.
          revalidate: false,
        });

        // Fetch memberships again to update the list in the UI
        await (userMemberships as any)?.unstable__mutate();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <PreviewListItemButton
      isLoading={card.isLoading}
      onClick={handleAccept}
      localizationKey={localizationKeys('organizationList.action__invitationAccept')}
    />
  );
};

const InvitationPreview = withCardStateProvider((props: UserOrganizationInvitationResource) => {
  return (
    <PreviewListItem organizationData={props.publicOrganizationData}>
      <AcceptRejectInvitationButtons {...props} />
    </PreviewListItem>
  );
});
