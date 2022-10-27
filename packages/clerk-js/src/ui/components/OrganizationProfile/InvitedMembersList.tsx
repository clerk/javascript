import { OrganizationInvitationResource } from '@clerk/types';
import React from 'react';

import { useCoreOrganization } from '../../contexts';
import { Td, Text } from '../../customizables';
import { ThreeDotsMenu, useCardState, usePagination, UserPreview } from '../../elements';
import { handleError } from '../../utils';
import { MembersListTable, RowContainer } from './MemberListTable';

const MOCK_ITEM_COUNT = 28;
const ITEMS_PER_PAGE = 10;

export const InvitedMembersList = () => {
  const { page, changePage } = usePagination();

  const { invitationList } = useCoreOrganization({
    invitationList: { offset: (page - 1) * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE },
  });

  return (
    <MembersListTable
      page={page}
      onPageChange={changePage}
      itemCount={MOCK_ITEM_COUNT}
      isLoading={!invitationList}
      headers={['User', 'Invited', 'Role', '']}
      rows={(invitationList || []).map(i => (
        <InvitationRow
          key={i.id}
          invitation={i}
        />
      ))}
    />
  );
};

const InvitationRow = (props: { invitation: OrganizationInvitationResource }) => {
  const { invitation } = props;
  const card = useCardState();

  const revoke = () => {
    return invitation.revoke().catch(err => handleError(err, [], card.setError));
  };

  return (
    <RowContainer>
      <Td>
        <UserPreview
          sx={{ maxWidth: '30ch' }}
          showAvatar={false}
          user={{ primaryEmailAddress: { emailAddress: invitation.emailAddress } } as any}
        />
      </Td>
      <Td>{invitation.createdAt.toLocaleDateString()}</Td>
      <Td>
        <Text
          colorScheme={'neutral'}
          localizationKey={invitation.role}
        />
      </Td>
      <Td>
        <ThreeDotsMenu
          actions={[
            {
              label: 'Revoke invitation',
              isDestructive: true,
              onClick: revoke,
            },
          ]}
        />
      </Td>
    </RowContainer>
  );
};
