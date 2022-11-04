import { OrganizationInvitationResource } from '@clerk/types';
import React from 'react';

import { useCoreOrganization } from '../../contexts';
import { Td, Text } from '../../customizables';
import { ThreeDotsMenu, useCardState, usePagination, UserPreview } from '../../elements';
import { handleError, roleLocalizationKey } from '../../utils';
import { MembersListTable, RowContainer } from './MemberListTable';

const ITEMS_PER_PAGE = 10;

export const InvitedMembersList = () => {
  const card = useCardState();
  const { page, changePage } = usePagination();
  const { organization, invitationList } = useCoreOrganization({
    invitationList: { offset: (page - 1) * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE },
  });

  if (!organization) {
    return null;
  }

  const revoke = (invitation: OrganizationInvitationResource) => () => {
    return card
      .runAsync(invitation.revoke)
      .then(() => changePage(1))
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <MembersListTable
      page={page}
      onPageChange={changePage}
      itemCount={organization.pendingInvitationsCount}
      itemsPerPage={ITEMS_PER_PAGE}
      isLoading={!invitationList}
      headers={['User', 'Invited', 'Role', '']}
      rows={(invitationList || []).map(i => (
        <InvitationRow
          key={i.id}
          invitation={i}
          onRevoke={revoke(i)}
        />
      ))}
    />
  );
};

const InvitationRow = (props: { invitation: OrganizationInvitationResource; onRevoke: () => unknown }) => {
  const { invitation, onRevoke } = props;
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
          localizationKey={roleLocalizationKey(invitation.role)}
        />
      </Td>
      <Td>
        <ThreeDotsMenu
          actions={[
            {
              label: 'Revoke invitation',
              isDestructive: true,
              onClick: onRevoke,
            },
          ]}
        />
      </Td>
    </RowContainer>
  );
};
