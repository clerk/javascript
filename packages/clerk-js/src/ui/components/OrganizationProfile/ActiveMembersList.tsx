import { MembershipRole, OrganizationMembershipResource } from '@clerk/types';
import React, { useState } from 'react';

import { useCoreOrganization, useCoreUser } from '../../contexts';
import { Badge, localizationKeys, Td } from '../../customizables';
import { ThreeDotsMenu, useCardState, usePagination, UserPreview } from '../../elements';
import { handleError } from '../../utils';
import { MembersListTable, RoleSelect, RowContainer } from './MemberListTable';

const MOCK_ITEM_COUNT = 28;
const ITEMS_PER_PAGE = 10;

export const ActiveMembersList = () => {
  const { page, changePage } = usePagination({ defaultPage: 1 });
  const { membershipList } = useCoreOrganization({
    membershipList: { offset: (page - 1) * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE },
  });

  return (
    <MembersListTable
      page={page}
      onPageChange={changePage}
      itemCount={MOCK_ITEM_COUNT}
      isLoading={!membershipList}
      headers={['User', 'Joined', 'Role', '']}
      rows={(membershipList || []).map(m => (
        <MemberRow
          key={m.id}
          membership={m}
        />
      ))}
    />
  );
};

const MemberRow = (props: { membership: OrganizationMembershipResource }) => {
  const { membership } = props;
  const card = useCardState();
  const { membership: currentUserMembership } = useCoreOrganization();
  const user = useCoreUser();
  const [role, setRole] = useState<MembershipRole>(membership.role);

  const isAdmin = currentUserMembership?.role === 'admin';
  const isCurrentUser = user.id === membership.publicUserData.userId;

  const handleRoleChange = (newRole: MembershipRole) => {
    if (!isAdmin) {
      return;
    }
    return card
      .runAsync(membership.update({ role: newRole }))
      .then(() => setRole(newRole))
      .catch(err => handleError(err, [], card.setError));
  };

  const handleRemove = () => {
    if (!isAdmin) {
      return;
    }
    return card.runAsync(membership.destroy()).catch(err => handleError(err, [], card.setError));
  };

  return (
    <RowContainer>
      <Td>
        <UserPreview
          sx={{ maxWidth: '30ch' }}
          user={membership.publicUserData}
          subtitle={membership.publicUserData.identifier}
          badge={isCurrentUser && <Badge localizationKey={localizationKeys('badge__you')} />}
        />
      </Td>
      <Td>{membership.createdAt.toLocaleDateString()}</Td>
      <Td>
        <RoleSelect
          isDisabled={!isAdmin || card.isLoading}
          value={role}
          onChange={handleRoleChange}
        />
      </Td>
      <Td>
        {isAdmin && (
          <ThreeDotsMenu
            actions={[
              { label: 'Remove member', isDestructive: true, onClick: handleRemove, isDisabled: isCurrentUser },
            ]}
          />
        )}
      </Td>
    </RowContainer>
  );
};
