import type { MembershipRole, OrganizationMembershipResource } from '@clerk/types';

import { useCoreOrganization, useCoreUser } from '../../contexts';
import { Badge, localizationKeys, Td, Text } from '../../customizables';
import { ThreeDotsMenu, useCardState, usePagination, UserPreview } from '../../elements';
import { handleError, roleLocalizationKey } from '../../utils';
import { DataTable, RoleSelect, RowContainer } from './MemberListTable';

const ITEMS_PER_PAGE = 10;

export const ActiveMembersList = () => {
  const card = useCardState();
  const { page, changePage } = usePagination({ defaultPage: 1 });
  const {
    organization,
    membershipList,
    membership: currentUserMembership,
    memberships: adminMembers,
    ...rest
  } = useCoreOrganization({
    membershipList: { offset: (page - 1) * ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE },
    memberships: {
      role: ['admin'],
    },
  });
  const isAdmin = currentUserMembership?.role === 'admin';

  const mutateSwrState = () => {
    const unstable__mutate = (rest as any).unstable__mutate;
    if (unstable__mutate && typeof unstable__mutate === 'function') {
      unstable__mutate();
    }
  };

  if (!organization) {
    return null;
  }

  const handleRoleChange = (membership: OrganizationMembershipResource) => (newRole: MembershipRole) => {
    if (!isAdmin) {
      return;
    }
    return card
      .runAsync(async () => {
        await membership.update({ role: newRole });
        await (adminMembers as any).unstable__mutate?.();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  const handleRemove = (membership: OrganizationMembershipResource) => () => {
    if (!isAdmin) {
      return;
    }
    return card
      .runAsync(async () => {
        const destroyedMembership = membership.destroy();
        await (adminMembers as any).unstable__mutate?.();
        return destroyedMembership;
      })
      .then(mutateSwrState)
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <DataTable
      page={page}
      onPageChange={changePage}
      itemCount={organization.membersCount}
      itemsPerPage={ITEMS_PER_PAGE}
      isLoading={!membershipList}
      emptyStateLocalizationKey={localizationKeys('organizationProfile.membersPage.detailsTitle__emptyRow')}
      headers={[
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__joined'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__role'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
      ]}
      rows={(membershipList || []).map(m => (
        <MemberRow
          key={m.id}
          membership={m}
          onRoleChange={handleRoleChange(m)}
          onRemove={handleRemove(m)}
          adminCount={adminMembers?.count || 0}
        />
      ))}
    />
  );
};

const MemberRow = (props: {
  membership: OrganizationMembershipResource;
  onRemove: () => unknown;
  adminCount: number;
  onRoleChange?: (role: MembershipRole) => unknown;
}) => {
  const { membership, onRemove, onRoleChange, adminCount } = props;
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
          badge={
            isCurrentUser && (
              <Badge
                textVariant={'extraSmallMedium'}
                localizationKey={localizationKeys('badge__you')}
              />
            )
          }
        />
      </Td>
      <Td>{membership.createdAt.toLocaleDateString()}</Td>
      <Td>
        {isAdmin ? (
          <RoleSelect
            isDisabled={card.isLoading || !onRoleChange || (adminCount <= 1 && membership.role === 'admin')}
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
            actions={[
              {
                label: localizationKeys('organizationProfile.membersPage.activeMembersTab.menuAction__remove'),
                isDestructive: true,
                onClick: onRemove,
                isDisabled: isCurrentUser,
              },
            ]}
            elementId={'member'}
          />
        )}
      </Td>
    </RowContainer>
  );
};
