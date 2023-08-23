import type { OrganizationMembershipRequestResource } from '@clerk/types';

import { useCoreOrganization } from '../../contexts';
import { Button, Flex, localizationKeys, Td } from '../../customizables';
import { useCardState, UserPreview, withCardStateProvider } from '../../elements';
import { handleError } from '../../utils';
import { DataTable, RowContainer } from './MemberListTable';

const ITEMS_PER_PAGE = 10;
export const RequestToJoinList = () => {
  const card = useCardState();
  const { organization, membershipRequests } = useCoreOrganization({
    membershipRequests: {
      pageSize: ITEMS_PER_PAGE,
    },
  });

  if (!organization) {
    return null;
  }

  return (
    <DataTable
      page={membershipRequests?.page || 1}
      onPageChange={membershipRequests?.fetchPage ?? (() => null)}
      itemCount={membershipRequests?.count ?? 0}
      itemsPerPage={ITEMS_PER_PAGE}
      isLoading={membershipRequests?.isLoading}
      emptyStateLocalizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.table__emptyRow')}
      headers={[
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user'),
        localizationKeys('organizationProfile.membersPage.requestsTab.tableHeader__requested'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
      ]}
      rows={(membershipRequests?.data || []).map(request => (
        <RequestRow
          key={request.id}
          request={request}
          onError={card.setError}
        />
      ))}
    />
  );
};

const RequestRow = withCardStateProvider(
  (props: { request: OrganizationMembershipRequestResource; onError: ReturnType<typeof useCardState>['setError'] }) => {
    const { request, onError } = props;
    const card = useCardState();
    const { membershipRequests } = useCoreOrganization();

    const mutateSwrState = () => {
      const unstable__mutate = (membershipRequests as any).unstable__mutate;
      if (unstable__mutate && typeof unstable__mutate === 'function') {
        unstable__mutate();
      }
    };

    const onAccept = () => {
      return card
        .runAsync(request.accept, 'accept')
        .then(mutateSwrState)
        .catch(err => handleError(err, [], onError));
    };

    const onReject = () => {
      return card
        .runAsync(request.reject, 'reject')
        .then(mutateSwrState)
        .catch(err => handleError(err, [], onError));
    };

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
          <AcceptRejectRequestButtons {...{ onAccept, onReject }} />
        </Td>
      </RowContainer>
    );
  },
);

const AcceptRejectRequestButtons = (props: { onAccept: () => unknown; onReject: () => unknown }) => {
  const card = useCardState();
  return (
    <Flex gap={2}>
      <Button
        textVariant='buttonExtraSmallBold'
        variant='ghost'
        isLoading={card.isLoading && card.loadingMetadata === 'reject'}
        isDisabled={card.isLoading && card.loadingMetadata !== 'reject'}
        onClick={props.onReject}
        localizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.menuAction__reject')}
      />

      <Button
        textVariant='buttonExtraSmallBold'
        variant='solid'
        isLoading={card.isLoading && card.loadingMetadata === 'accept'}
        isDisabled={card.isLoading && card.loadingMetadata !== 'accept'}
        onClick={props.onAccept}
        localizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.menuAction__approve')}
      />
    </Flex>
  );
};
