import { MembershipRole, OrganizationMembershipResource } from '@clerk/types';
import React, { useState } from 'react';

import { useCoreOrganization, useCoreUser } from '../../contexts';
import { Badge, localizationKeys, Td } from '../../customizables';
import { ThreeDotsMenu, useCardState, UserPreview } from '../../elements';
import { handleError } from '../../utils';
import { MembersListTable, RoleSelect, RowContainer } from './MemberListTable';

export const ActiveMembersList = () => {
  const { membershipList } = useCoreOrganization({ membershipList: { offset: 0, limit: 10 } });

  return (
    <MembersListTable
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
      <Td
        sx={{
          width: '100%',
          p: {
            maxWidth: '20ch',
          },
        }}
      >
        <UserPreview
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
