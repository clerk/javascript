import type { MembershipRole, OrganizationMembershipResource } from '@clerk/types';

import { Gate } from '../../common/Gate';
import { useCoreOrganization, useCoreUser } from '../../contexts';
import { Badge, localizationKeys, Td, Text } from '../../customizables';
import { ThreeDotsMenu, useCardState, UserPreview } from '../../elements';
import { handleError, roleLocalizationKey } from '../../utils';
import { DataTable, RoleSelect, RowContainer } from './MemberListTable';

export const ActiveMembersList = () => {
  const card = useCardState();
  const { organization, memberships } = useCoreOrganization({
    memberships: true,
  });

  if (!organization) {
    return null;
  }

  const handleRoleChange = (membership: OrganizationMembershipResource) => (newRole: MembershipRole) => {
    return card
      .runAsync(async () => {
        return await membership.update({ role: newRole });
      })
      .catch(err => handleError(err, [], card.setError));
  };

  const handleRemove = (membership: OrganizationMembershipResource) => () => {
    return card
      .runAsync(async () => {
        const destroyedMembership = await membership.destroy();
        await memberships?.revalidate?.();
        return destroyedMembership;
      })
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <DataTable
      page={memberships?.page || 1}
      onPageChange={n => memberships?.fetchPage?.(n)}
      itemCount={memberships?.count || 0}
      pageCount={memberships?.pageCount || 0}
      isLoading={memberships?.isLoading}
      emptyStateLocalizationKey={localizationKeys('organizationProfile.membersPage.detailsTitle__emptyRow')}
      headers={[
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__user'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__joined'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__role'),
        localizationKeys('organizationProfile.membersPage.activeMembersTab.tableHeader__actions'),
      ]}
      rows={(memberships?.data || []).map(m => (
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

// TODO: Find a way to disable Role select based on last admin by using permissions
const MemberRow = (props: {
  membership: OrganizationMembershipResource;
  onRemove: () => unknown;
  onRoleChange?: (role: MembershipRole) => unknown;
}) => {
  const { membership, onRemove, onRoleChange } = props;
  const card = useCardState();
  const user = useCoreUser();

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
        <Gate
          permission={'org:sys_memberships:manage'}
          fallback={
            <Text
              sx={t => ({ opacity: t.opacity.$inactive })}
              localizationKey={roleLocalizationKey(membership.role)}
            />
          }
        >
          <RoleSelect
            isDisabled={card.isLoading || !onRoleChange}
            value={membership.role}
            onChange={onRoleChange}
          />
        </Gate>
      </Td>
      <Td>
        <Gate permission={'org:sys_memberships:delete'}>
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
        </Gate>
      </Td>
    </RowContainer>
  );
};
