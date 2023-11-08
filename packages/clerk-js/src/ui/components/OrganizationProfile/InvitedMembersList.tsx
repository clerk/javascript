import type { OrganizationInvitationResource } from '@clerk/types';

import { useCoreOrganization } from '../../contexts';
import { localizationKeys, Td, Text } from '../../customizables';
import { ThreeDotsMenu, useCardState, UserPreview } from '../../elements';
import { useLocalizeCustomRoles } from '../../hooks/useFetchRoles';
import { handleError } from '../../utils';
import { DataTable, RowContainer } from './MemberListTable';

const invitationsParams = {
  invitations: {
    pageSize: 10,
    keepPreviousData: true,
  },
};

export const InvitedMembersList = () => {
  const card = useCardState();
  const { organization, invitations } = useCoreOrganization(invitationsParams);

  if (!organization) {
    return null;
  }

  const revoke = (invitation: OrganizationInvitationResource) => async () => {
    return card
      .runAsync(async () => {
        await invitation.revoke();
        await invitations?.revalidate?.();
        return invitation;
      })
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <DataTable
      page={invitations?.page || 1}
      onPageChange={invitations?.fetchPage || (() => null)}
      itemCount={invitations?.count || 0}
      pageCount={invitations?.pageCount || 0}
      itemsPerPage={invitationsParams.invitations.pageSize}
      isLoading={invitations?.isLoading}
      emptyStateLocalizationKey={localizationKeys('organizationProfile.membersPage.invitationsTab.table__emptyRow')}
      headers={[
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user'),
        localizationKeys('organizationProfile.membersPage.invitedMembersTab.tableHeader__invited'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__role'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
      ]}
      rows={(invitations?.data || []).map(i => (
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
  const { localizeCustomRole } = useLocalizeCustomRoles();
  return (
    <RowContainer>
      <Td>
        <UserPreview
          sx={{ maxWidth: '30ch' }}
          user={{ primaryEmailAddress: { emailAddress: invitation.emailAddress } } as any}
        />
      </Td>
      <Td>{invitation.createdAt.toLocaleDateString()}</Td>
      <Td>
        <Text
          colorScheme={'neutral'}
          localizationKey={localizeCustomRole(invitation.role)}
        />
      </Td>
      <Td>
        <ThreeDotsMenu
          actions={[
            {
              label: localizationKeys('organizationProfile.membersPage.invitedMembersTab.menuAction__revoke'),
              isDestructive: true,
              onClick: onRevoke,
            },
          ]}
          elementId={'invitation'}
        />
      </Td>
    </RowContainer>
  );
};
