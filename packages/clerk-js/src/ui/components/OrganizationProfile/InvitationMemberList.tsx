import { OrganizationInvitationResource } from '@clerk/types';
import React from 'react';

import { useCoreOrganization } from '../../contexts';
import { Td, Text } from '../../customizables';
import { ThreeDotsMenu, useCardState, UserPreview } from '../../elements';
import { handleError } from '../../utils';
import { MembersListTable, RowContainer } from './MemberListTable';

export const InvitedMembersList = () => {
  const { invitationList } = useCoreOrganization({ invitationList: { offset: 0, limit: 10 } });

  return (
    <MembersListTable
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
      <Td
        sx={{
          width: '100%',
          p: {
            maxWidth: '20ch',
          },
        }}
      >
        <UserPreview user={{ primaryEmailAddress: { emailAddress: invitation.emailAddress } } as any} />
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
