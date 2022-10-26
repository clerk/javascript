import { MembershipRole, OrganizationMembershipResource } from '@clerk/types';
import React, { useState } from 'react';

import { useCoreOrganization } from '../../contexts';
import { Td } from '../../customizables';
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
  const { membership: currentUserMembership } = useCoreOrganization();
  const card = useCardState();
  const [role, setRole] = useState<MembershipRole>(membership.role);

  const isAdmin = currentUserMembership?.role === 'admin';

  const handleRoleChange = (newRole: MembershipRole) => {
    if (!isAdmin) {
      return;
    }
    return membership
      .update({ role: newRole })
      .then(() => setRole(newRole))
      .catch(err => handleError(err, [], card.setError));
  };

  const handleRemove = () => {
    if (!isAdmin) {
      return;
    }
    return membership.destroy().catch(err => handleError(err, [], card.setError));
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
        <ThreeDotsMenu actions={[{ label: 'Remove member', isDestructive: true, onClick: handleRemove }]} />
      </Td>
    </RowContainer>
  );
};
