import type { OrganizationInvitationResource } from '@clerk/types';

import { useCoreOrganization } from '../../contexts';
import { localizationKeys, Td, Text } from '../../customizables';
import { ThreeDotsMenu, useCardState, usePagination, UserPreview } from '../../elements';
import { handleError, roleLocalizationKey } from '../../utils';
import { MembersListTable, RowContainer } from './MemberListTable';

const ITEMS_PER_PAGE = 10;

export const InvitedMembersList = () => {
  const card = useCardState();
  const { page, changePage } = usePagination();
  const { organization, invitationList, ...rest } = useCoreOrganization({
    invitationList: { offset: (page - 1) * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE },
  });

  const mutateSwrState = () => {
    const unstable__mutate = (rest as any).unstable__mutate;
    if (unstable__mutate && typeof unstable__mutate === 'function') {
      unstable__mutate();
    }
  };

  if (!organization) {
    return null;
  }

  const revoke = (invitation: OrganizationInvitationResource) => () => {
    return card
      .runAsync(invitation.revoke)
      .then(mutateSwrState)
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
      headers={[
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user'),
        localizationKeys('organizationProfile.membersPage.invitedMembersTab.tableHeader__invited'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__role'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
      ]}
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
