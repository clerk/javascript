import { useOrganization } from '@clerk/shared/react';
import type { OrganizationMembershipRequestResource } from '@clerk/shared/types';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { UserPreview } from '@/ui/elements/UserPreview';
import { handleError } from '@/ui/utils/errorHandler';

import { Box, Button, descriptors, Flex, localizationKeys, Td } from '../../customizables';
import { DataTable, RowContainer } from './MemberListTable';

const membershipRequestsParams = {
  membershipRequests: {
    pageSize: 10,
    keepPreviousData: true,
  },
};

export const RequestToJoinList = () => {
  const card = useCardState();
  const { organization, membershipRequests } = useOrganization(membershipRequestsParams);

  if (!organization) {
    return null;
  }

  return (
    <DataTable
      page={membershipRequests?.page || 1}
      onPageChange={membershipRequests?.fetchPage ?? (() => null)}
      itemCount={membershipRequests?.count || 0}
      pageCount={membershipRequests?.pageCount || 0}
      itemsPerPage={membershipRequestsParams.membershipRequests.pageSize}
      isLoading={membershipRequests?.isLoading}
      emptyStateLocalizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.table__emptyRow')}
      headers={[
        { key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user') },
        { key: localizationKeys('organizationProfile.membersPage.requestsTab.tableHeader__requested') },
        {
          key: localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
          align: 'right',
        },
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
    const { membership, membershipRequests } = useOrganization(membershipRequestsParams);

    const onAccept = () => {
      if (!membership || !membershipRequests) {
        return;
      }
      return card
        .runAsync(async () => {
          await request.accept();
          await membershipRequests.revalidate();
        }, 'accept')
        .catch(err => handleError(err, [], onError));
    };
    const onReject = () => {
      if (!membership || !membershipRequests) {
        return;
      }
      return card
        .runAsync(async () => {
          await request.reject();
          await membershipRequests.revalidate();
        }, 'reject')
        .catch(err => handleError(err, [], onError));
    };

    return (
      <RowContainer>
        <Td>
          <UserPreview
            sx={{ maxWidth: '30ch' }}
            showAvatar={false}
            user={{ primaryEmailAddress: { emailAddress: request.publicUserData.identifier } } as any}
            subtitleProps={{ variant: 'caption' }}
          />
        </Td>
        <Td>
          <Box
            as='span'
            elementDescriptor={descriptors.formattedDate}
            elementId={descriptors.formattedDate.setId('tableCell')}
          >
            {request.createdAt.toLocaleDateString()}
          </Box>
        </Td>

        <Td sx={{ textAlign: 'right' }}>
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
        textVariant='buttonSmall'
        variant='ghost'
        isLoading={card.isLoading && card.loadingMetadata === 'reject'}
        isDisabled={card.isLoading && card.loadingMetadata !== 'reject'}
        onClick={props.onReject}
        localizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.menuAction__reject')}
      />

      <Button
        textVariant='buttonSmall'
        isLoading={card.isLoading && card.loadingMetadata === 'accept'}
        isDisabled={card.isLoading && card.loadingMetadata !== 'accept'}
        onClick={props.onAccept}
        localizationKey={localizationKeys('organizationProfile.membersPage.requestsTab.menuAction__approve')}
      />
    </Flex>
  );
};
