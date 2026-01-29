import { useOrganization, useUser } from '@clerk/shared/react';
import type { OrganizationMembershipResource } from '@clerk/shared/types';

import { useCardState } from '@/ui/elements/contexts';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { UserPreview } from '@/ui/elements/UserPreview';
import { handleError } from '@/ui/utils/errorHandler';

import { Protect } from '../../common/Gate';
import { Badge, Box, descriptors, localizationKeys, Td, Text } from '../../customizables';
import { useFetchRoles, useLocalizeCustomRoles } from '../../hooks/useFetchRoles';
import { DataTable, RoleSelect, RowContainer } from './MemberListTable';

type ActiveMembersListProps = {
  memberships: ReturnType<typeof useOrganization>['memberships'];
  pageSize: number;
};

export const ActiveMembersList = ({ memberships, pageSize }: ActiveMembersListProps) => {
  const card = useCardState();
  const { organization } = useOrganization();

  const { options, isLoading: loadingRoles, hasRoleSetMigration } = useFetchRoles();

  if (!organization) {
    return null;
  }

  const handleRoleChange = (membership: OrganizationMembershipResource) => (newRole: string) =>
    card.runAsync(() => membership.update({ role: newRole })).catch(err => handleError(err, [], card.setError));

  const handleRemove = (membership: OrganizationMembershipResource) => async () => {
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
      itemsPerPage={pageSize}
      isLoading={(memberships?.isLoading && !memberships?.data.length) || loadingRoles}
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
          options={options}
          onRoleChange={handleRoleChange(m)}
          onRemove={handleRemove(m)}
          hasRoleSetMigration={hasRoleSetMigration}
        />
      ))}
    />
  );
};

// TODO: Find a way to disable Role select based on last admin by using permissions
const MemberRow = (props: {
  membership: OrganizationMembershipResource;
  onRemove: () => unknown;
  options: Parameters<typeof RoleSelect>[0]['roles'];
  onRoleChange: (role: string) => unknown;
  hasRoleSetMigration: boolean;
}) => {
  const { membership, onRemove, onRoleChange, options, hasRoleSetMigration } = props;
  const { localizeCustomRole } = useLocalizeCustomRoles();
  const card = useCardState();
  const { user } = useUser();

  const isCurrentUser = user?.id === membership.publicUserData?.userId;
  const unlocalizedRoleLabel = options?.find(a => a.value === membership.role)?.label;

  return (
    <RowContainer>
      <Td>
        <UserPreview
          sx={{ maxWidth: '30ch' }}
          user={membership.publicUserData}
          subtitle={membership.publicUserData?.identifier}
          subtitleProps={{ variant: 'caption' }}
          badge={isCurrentUser && <Badge localizationKey={localizationKeys('badge__you')} />}
        />
      </Td>
      <Td>
        <Box
          as='span'
          elementDescriptor={descriptors.formattedDate}
          elementId={descriptors.formattedDate.setId('tableCell')}
        >
          {membership.createdAt.toLocaleDateString()}
        </Box>
      </Td>
      <Td>
        <Protect
          permission={'org:sys_memberships:manage'}
          fallback={
            <Text sx={t => ({ opacity: t.opacity.$inactive })}>
              {localizeCustomRole(membership.role) || unlocalizedRoleLabel}
            </Text>
          }
        >
          <RoleSelect
            isDisabled={card.isLoading || !onRoleChange || hasRoleSetMigration}
            value={membership.role}
            fallbackLabel={membership.roleName}
            onChange={onRoleChange}
            roles={options}
          />
        </Protect>
      </Td>
      <Td sx={{ textAlign: 'right' }}>
        <Protect permission={'org:sys_memberships:manage'}>
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
        </Protect>
      </Td>
    </RowContainer>
  );
};
