import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useOrganization, useUser } from '@clerk/shared/react';

import { useProtect } from '@/common/Gate';
import { useFetchRoles, useLocalizeCustomRoles } from '@/hooks/useFetchRoles';

import type { ActiveMembersListModel } from './active-members-list.types';

type ActiveMembersListModelInput = {
  memberships: ReturnType<typeof useOrganization>['memberships'];
  pageSize: number;
};

export const useActiveMembersListModel = ({
  memberships,
  pageSize,
}: ActiveMembersListModelInput): ActiveMembersListModel => {
  const clerk = useClerk();
  const { organization } = useOrganization();
  const { options, isLoading: loadingRoles, hasRoleSetMigration } = useFetchRoles();
  const { localizeCustomRole } = useLocalizeCustomRoles();
  const { user } = useUser();
  const canManageMemberships = useProtect({ permission: 'org:sys_memberships:manage' });

  const subject = organization?.id;
  const actor = user?.id;
  const roleOptions = options?.map(option => ({ label: option.label, value: option.value }));

  return {
    subject,
    hasOrganization: Boolean(organization),
    hasRoleSetMigration,
    members: (memberships?.data || []).map(membership => {
      const publicUserData = membership.publicUserData;
      const isDeprovisioned = publicUserData?.deprovisioned;
      const unlocalizedRoleLabel = options?.find(option => option.value === membership.role)?.label;

      return {
        id: membership.id,
        preview: {
          display: publicUserData
            ? {
                name: getFullName(publicUserData),
                identifier: publicUserData.username,
                imageUrl: publicUserData.imageUrl,
                avatar: { firstName: publicUserData.firstName, lastName: publicUserData.lastName },
              }
            : undefined,
          identifier: publicUserData?.identifier,
          isCurrentUser: user?.id === publicUserData?.userId,
          isDeprovisioned,
          isBanned: publicUserData?.banned,
        },
        view: {
          isDeprovisioned,
          date: membership.createdAt.toLocaleDateString(),
          canManageMemberships,
          role: membership.role,
          roleName: membership.roleName,
          localizedRoleLabel: localizeCustomRole(membership.role) || unlocalizedRoleLabel,
          options: roleOptions,
        },
        updateRole: async (role: string) => {
          if (!subject || !actor || clerk.user?.id !== actor || clerk.organization?.id !== subject) {
            return;
          }
          await membership.update({ role });
          if (clerk.user?.id === actor && clerk.organization?.id === subject) {
            await memberships?.revalidate?.();
          }
        },
        remove: async () => {
          if (!subject || !actor || clerk.user?.id !== actor || clerk.organization?.id !== subject) {
            return;
          }
          await membership.destroy();
          if (clerk.user?.id === actor && clerk.organization?.id === subject) {
            await memberships?.revalidate?.();
          }
        },
      };
    }),
    table: {
      page: memberships?.page || 1,
      onPageChange: (page: number) => {
        if (subject && actor && clerk.user?.id === actor && clerk.organization?.id === subject) {
          memberships?.fetchPage?.(page);
        }
      },
      itemCount: memberships?.count || 0,
      pageCount: memberships?.pageCount || 0,
      itemsPerPage: pageSize,
      isLoading: (memberships?.isLoading && !memberships?.data.length) || loadingRoles,
    },
  };
};
