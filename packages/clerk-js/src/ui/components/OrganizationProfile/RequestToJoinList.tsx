import type { OrganizationMembershipRequestResource } from '@clerk/types';

import { useCoreOrganization } from '../../contexts';
import { Button, Flex, localizationKeys, Td } from '../../customizables';
import { useCardState, UserPreview } from '../../elements';
import { handleError } from '../../utils';
import { MembersListTable, RowContainer } from './MemberListTable';

const ITEMS_PER_PAGE = 10;
export const RequestToJoinList = () => {
  const card = useCardState();
  const { organization, membershipRequests } = useCoreOrganization({
    membershipRequests: {
      pageSize: ITEMS_PER_PAGE,
    },
  });

  const mutateSwrState = () => {
    const unstable__mutate = (membershipRequests as any).unstable__mutate;
    if (unstable__mutate && typeof unstable__mutate === 'function') {
      unstable__mutate();
    }
  };

  if (!organization) {
    return null;
  }

  const approve = (request: OrganizationMembershipRequestResource) => () => {
    return card
      .runAsync(request.accept)
      .then(mutateSwrState)
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <MembersListTable
      page={membershipRequests?.page || 1}
      onPageChange={membershipRequests?.fetchPage ?? (() => null)}
      itemCount={membershipRequests?.count ?? 0}
      itemsPerPage={ITEMS_PER_PAGE}
      isLoading={membershipRequests?.isFetching}
      headers={[
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user'),
        localizationKeys('organizationProfile.membersPage.requestsTab.tableHeader__requested'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
      ]}
      rows={(membershipRequests?.data || []).map(i => (
        <RequestRow
          key={i.id}
          request={i}
          onAccept={approve(i)}
        />
      ))}
    />
  );
};

const RequestRow = (props: { request: OrganizationMembershipRequestResource; onAccept: () => unknown }) => {
  const { request, onAccept } = props;

  return (
    <RowContainer>
      <Td>
        <UserPreview
          sx={{ maxWidth: '30ch' }}
          showAvatar={false}
          user={{ primaryEmailAddress: { emailAddress: request.publicUserData.identifier } } as any}
        />
      </Td>
      <Td>{request.createdAt.toLocaleDateString()}</Td>

      <Td>
        <Flex>
          <AcceptRejectRequestButtons onAccept={onAccept} />
        </Flex>
      </Td>
    </RowContainer>
  );
};

const AcceptRejectRequestButtons = (props: { onAccept: () => unknown }) => {
  const card = useCardState();
  return (
    <>
      <Button
        textVariant='buttonExtraSmallBold'
        variant='solid'
        isLoading={card.isLoading}
        onClick={props.onAccept}
        localizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.menuAction__approve')}
      />
    </>
  );
};
