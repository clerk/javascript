import { MembershipRole, OrganizationMembershipResource } from '@clerk/types';
import React from 'react';

import { useCoreOrganization, useCoreUser } from '../../contexts';
import { Badge, localizationKeys, Td, Text } from '../../customizables';
import { ThreeDotsMenu, useCardState, usePagination, UserPreview } from '../../elements';
import { handleError, roleLocalizationKey } from '../../utils';
import { MembersListTable, RoleSelect, RowContainer } from './MemberListTable';

const ITEMS_PER_PAGE = 10;

export const ActiveMembersList = () => {
  const card = useCardState();
  const { page, changePage } = usePagination({ defaultPage: 1 });
  const {
    organization,
    membershipList,
    membership: currentUserMembership,
  } = useCoreOrganization({
    membershipList: { offset: (page - 1) * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE },
  });
  const isAdmin = currentUserMembership?.role === 'admin';

  if (!organization) {
    return null;
  }

  const handleRoleChange = (membership: OrganizationMembershipResource) => (newRole: MembershipRole) => {
    if (!isAdmin) {
      return;
    }
    return card.runAsync(membership.update({ role: newRole })).catch(err => handleError(err, [], card.setError));
  };

  const handleRemove = (membership: OrganizationMembershipResource) => () => {
    if (!isAdmin) {
      return;
    }
    return card.runAsync(membership.destroy()).catch(err => handleError(err, [], card.setError));
  };

  return (
    <MembersListTable
      page={page}
      onPageChange={changePage}
      itemCount={organization.membersCount}
      itemsPerPage={ITEMS_PER_PAGE}
      isLoading={!membershipList}
      headers={['User', 'Joined', 'Role', '']}
      rows={(membershipList || []).map(m => (
        <MemberRow
          key={m.id}
          membership={m}
          onRoleChange={handleRoleChange(m)}
          onRemove={handleRemove(m)}
        />
      ))}
    />
  );
};

const MemberRow = (props: {
  membership: OrganizationMembershipResource;
  onRemove: () => unknown;
  onRoleChange: (role: MembershipRole) => unknown;
}) => {
  const { membership, onRemove, onRoleChange } = props;
  const card = useCardState();
  const { membership: currentUserMembership } = useCoreOrganization();
  const user = useCoreUser();

  const isAdmin = currentUserMembership?.role === 'admin';
  const isCurrentUser = user.id === membership.publicUserData.userId;

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
        {isAdmin ? (
          <RoleSelect
            isDisabled={card.isLoading}
            value={membership.role}
            onChange={onRoleChange}
          />
        ) : (
          <Text
            sx={t => ({ opacity: t.opacity.$inactive })}
            localizationKey={roleLocalizationKey(membership.role)}
          />
        )}
      </Td>
      <Td>
        {isAdmin && (
          <ThreeDotsMenu
            actions={[{ label: 'Remove member', isDestructive: true, onClick: onRemove, isDisabled: isCurrentUser }]}
          />
        )}
      </Td>
    </RowContainer>
  );
};
