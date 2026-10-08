import { ClerkRuntimeError } from '@clerk/shared/error';
import { __internal_useOrganizationRoles, useOrganization, useSession } from '@clerk/shared/react';
import type { OrganizationMembershipResource } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import type { OrganizationProfileMember } from './members-table-tab.types';

const PAGE_SIZE = 10;
const READ_PERMISSION = 'org:sys_memberships:read';
const MANAGE_PERMISSION = 'org:sys_memberships:manage';

export function useMembersTableAccessModel() {
  const { isLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  if (!isLoaded || !isSessionLoaded) {
    return { status: 'loading' as const };
  }
  if (!organization || !session?.checkAuthorization({ permission: READ_PERMISSION })) {
    return { status: 'hidden' as const };
  }
  return { status: 'ready' as const, organizationId: organization.id };
}

export function useMembersTableModel(query: string) {
  const { session } = useSession();
  const canRead = session?.checkAuthorization({ permission: READ_PERMISSION }) ?? false;
  const canManage = session?.checkAuthorization({ permission: MANAGE_PERMISSION }) ?? false;
  const { organization, memberships } = useOrganization({
    memberships: canRead ? { pageSize: PAGE_SIZE, keepPreviousData: true, query } : undefined,
  });
  const roles = __internal_useOrganizationRoles({ enabled: canRead });
  const fetchPage = useRef(memberships?.fetchPage);
  fetchPage.current = memberships?.fetchPage;
  useEffect(() => {
    fetchPage.current?.(1);
  }, [query]);
  const currentUserId = session?.user.id;
  const rows = (memberships?.data ?? [])
    .filter(member => member.organization.id === organization?.id)
    .map(member => toMember(member, currentUserId));

  const findManageable = (id: string) => {
    const member = memberships?.data?.find(item => item.id === id && item.organization.id === organization?.id);
    if (
      !canManage ||
      !member ||
      !member.publicUserData?.userId ||
      member.publicUserData.userId === currentUserId ||
      member.publicUserData.deprovisioned
    ) {
      throw new ClerkRuntimeError('This member cannot be managed.', { code: 'member_unavailable' });
    }
    return member;
  };

  return {
    rows,
    roles: roles.data?.map(role => ({ value: role.key, label: role.name })) ?? [],
    hasRoleSetMigration: roles.hasRoleSetMigration,
    isRolesError: Boolean(roles.error),
    retryRoles: roles.revalidate,
    totalCount: memberships?.count ?? 0,
    page: memberships?.page ?? 1,
    isLoading: memberships?.isLoading ?? true,
    isFetching: memberships?.isFetching ?? false,
    isError: memberships?.isError ?? false,
    retry: () => memberships?.revalidate?.(),
    fetchPage: (page: number) => memberships?.fetchPage?.(page),
    changeRole:
      canManage && !roles.hasRoleSetMigration && !roles.error && roles.data
        ? async (id: string, role: string) => {
            if (!roles.data?.some(option => option.key === role)) {
              throw new ClerkRuntimeError('This role is unavailable.', { code: 'role_unavailable' });
            }
            await findManageable(id).update({ role });
            await memberships?.revalidate?.();
          }
        : undefined,
    remove: canManage
      ? async (id: string) => {
          const lastOnPage = (memberships?.data?.length ?? 0) === 1 && (memberships?.page ?? 1) > 1;
          await findManageable(id).destroy();
          await memberships?.revalidate?.();
          if (lastOnPage) {
            memberships?.fetchPage?.((memberships?.page ?? 1) - 1);
          }
        }
      : undefined,
  };
}

function toMember(
  member: OrganizationMembershipResource,
  currentUserId: string | undefined,
): Omit<OrganizationProfileMember, 'joinedAtLabel'> & { joinedAt: Date } {
  const user = member.publicUserData;
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  return {
    id: member.id,
    name: name || user?.identifier || member.id,
    email: user?.identifier ?? '',
    imageUrl: user?.imageUrl,
    joinedAt: member.createdAt,
    role: member.role,
    roleLabel: member.roleName,
    isCurrentUser: Boolean(user?.userId && user.userId === currentUserId),
    isDeprovisioned: user?.deprovisioned,
    isBanned: user?.banned,
  };
}
