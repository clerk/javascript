import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import {
  __internal_useOrganizationSSOBypassAllowlist,
  useClerk,
  useOrganization,
  useSafeLayoutEffect,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type { OrganizationCustomRoleKey, OrganizationResource } from '@clerk/shared/types';
import { useEffect, useRef, useState } from 'react';

import { useProtect } from '../../common';
import { localizationKeys, useLocalizations } from '../../customizables';
import type { AddMemberFormProps, AddMemberProps, AllowlistEntry, RoleOption } from './sso-bypass-allowlist.types';

const MEMBER_LOOKUP_PAGE_SIZE = 10;
const ROLE_MEMBERS_PAGE_SIZE = 100;
const permission = 'org:sys_entconns_sso_bypass:manage';

export const useSSOBypassAllowlistModel = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const canManage = useProtect({ permission });
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const organizationId = organization?.id;
  const identity = JSON.stringify([actor, sessionId, clientId, organizationId, canManage]);
  const current = useRef({ identity, version: 0, clerk });
  if (current.current.identity !== identity || current.current.clerk !== clerk) {
    current.current = { identity, version: current.current.version + 1, clerk };
  }
  const owner = current.current;
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canRun = () =>
    mounted.current &&
    current.current === owner &&
    !!actor &&
    !!organizationId &&
    canManage &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    clerk.organization?.id === organizationId &&
    !!clerk.session?.checkAuthorization({ permission });
  const allowlist = __internal_useOrganizationSSOBypassAllowlist({ enabled: canRun(), keepPreviousData: false });
  const revalidate = useRef(allowlist.revalidate);
  revalidate.current = allowlist.revalidate;
  const { t } = useLocalizations();

  const mutate = async <T>(
    operation: (organization: OrganizationResource) => Promise<T>,
    canContinue: () => boolean,
    refreshOnError = false,
  ) => {
    const isCurrent = () => canRun() && canContinue();
    const activeOrganization = clerk.organization;
    if (!activeOrganization || !isCurrent()) {
      return;
    }
    try {
      let result: T;
      let succeeded = false;
      try {
        result = await operation(activeOrganization);
        succeeded = true;
      } finally {
        if (isCurrent() && (succeeded || refreshOnError)) {
          await revalidate.current();
        }
      }
      return isCurrent() ? result : undefined;
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
    }
  };

  return {
    scopeKey: JSON.stringify([identity, owner.version]),
    canRun,
    data: canRun()
      ? allowlist.data?.map(
          ({ userId, publicUserData }): AllowlistEntry => ({
            userId,
            preview: {
              name: getFullName(publicUserData),
              identifier: publicUserData.username,
              imageUrl: publicUserData.imageUrl,
              avatar: { firstName: publicUserData.firstName, lastName: publicUserData.lastName },
            },
            subtitle: publicUserData.identifier,
            searchText: [
              publicUserData.firstName,
              publicUserData.lastName,
              publicUserData.identifier,
              publicUserData.username,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase(),
          }),
        )
      : undefined,
    isLoading: canRun() && allowlist.isLoading,
    errorMessage: canRun() ? allowlist.error?.message : undefined,
    addUser: async (params: Parameters<AddMemberProps['addUser']>[0], canContinue = () => true) =>
      !!(await mutate(async organization => {
        await organization.ssoBypassAllowlist.addUser(params);
        return true;
      }, canContinue)),
    addUsers: (params: Parameters<AddMemberProps['addUsers']>[0], canContinue = () => true) =>
      mutate(
        async organization => {
          const result = await organization.ssoBypassAllowlist.addUsers(params);
          return { added: result.data.length, errors: result.errors.map(({ code }) => ({ code })) };
        },
        canContinue,
        true,
      ),
    removeUser: async (userId: string, canContinue = () => true) =>
      !!(await mutate(async organization => {
        await organization.ssoBypassAllowlist.removeUser(userId);
        return true;
      }, canContinue)),
    currentUserId: actor,
    searchLabel: t(localizationKeys('organizationProfile.securityPage.ssoBypassPage.action__search')),
  };
};

export const useSSOBypassAddMemberFormModel = (props: AddMemberFormProps) => {
  const clerk = useClerk();
  const { t, translateError } = useLocalizations();
  const canReadMemberships = useProtect(
    has => has({ permission: 'org:sys_memberships:read' }) || has({ permission: 'org:sys_memberships:manage' }),
  );
  const mounted = useRef(true);
  const latest = useRef(props);
  latest.current = props;
  const scopeKey = props.scopeKey;
  const canRun = () => mounted.current && latest.current.scopeKey === scopeKey && latest.current.canRun();
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [roles, setRoles] = useState<RoleOption[]>();
  const canRead = () =>
    canRun() &&
    !!(
      clerk.session?.checkAuthorization({ permission: 'org:sys_memberships:read' }) ||
      clerk.session?.checkAuthorization({ permission: 'org:sys_memberships:manage' })
    );
  const roleSource = useRef({ canRead, clerk });
  roleSource.current = { canRead, clerk };
  useEffect(() => {
    let active = true;
    const source = roleSource.current;
    setRoles(undefined);
    void Promise.resolve()
      .then(async () => {
        const organization = source.clerk.organization;
        if (!active || !canReadMemberships || !source.canRead() || !organization) {
          return;
        }
        const result = await organization.getRoles({ pageSize: 20 });
        if (active && source.canRead()) {
          setRoles(result.data.map(role => ({ value: role.key, label: role.name })));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [scopeKey, canReadMemberships]);

  const read = async <T>(
    operation: (organization: OrganizationResource, isCurrent: () => boolean) => Promise<T>,
    canContinue: () => boolean,
  ) => {
    const isCurrent = () => canRun() && canContinue();
    const organization = clerk.organization;
    if (!organization || !isCurrent()) {
      return null;
    }
    try {
      const result = await operation(organization, isCurrent);
      return isCurrent() ? result : null;
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
      return null;
    }
  };

  return {
    ...props,
    canRun,
    addUser: (params: Parameters<AddMemberProps['addUser']>[0], canContinue = () => true) =>
      latest.current.addUser(params, () => canRun() && canContinue()),
    addUsers: (params: Parameters<AddMemberProps['addUsers']>[0], canContinue = () => true) =>
      latest.current.addUsers(params, () => canRun() && canContinue()),
    roles,
    t,
    translateError,
    getRoleCounts: (canContinue = () => true) =>
      read(
        async (organization, isCurrent) => {
          const entries = await Promise.all(
            (roles ?? []).map(async role => {
              if (!isCurrent()) {
                return [role.value, 0] as const;
              }
              const { total_count } = await organization.getMemberships({ role: [role.value], pageSize: 1 });
              return [role.value, total_count] as const;
            }),
          );
          return Object.fromEntries(entries) as Record<string, number>;
        },
        () => canContinue() && canRead(),
      ),
    findMemberByEmail: (email: string, canContinue = () => true) =>
      read(async (organization, isCurrent) => {
        const wanted = email.toLowerCase();
        let fetched = 0;
        for (let page = 1; isCurrent(); page++) {
          const { data, total_count } = await organization.getMemberships({
            query: email,
            pageSize: MEMBER_LOOKUP_PAGE_SIZE,
            initialPage: page,
          });
          if (!isCurrent()) {
            return;
          }
          const match = data.find(member => member.publicUserData?.identifier?.toLowerCase() === wanted);
          fetched += data.length;
          if (match || data.length === 0 || fetched >= total_count) {
            return match ? { userId: match.publicUserData?.userId } : undefined;
          }
        }
        return;
      }, canContinue),
    collectUserIdsByRole: (role: OrganizationCustomRoleKey, canContinue = () => true) =>
      read(
        async (organization, isCurrent) => {
          const userIds: string[] = [];
          let fetched = 0;
          for (let page = 1; isCurrent(); page++) {
            const { data, total_count } = await organization.getMemberships({
              role: [role],
              pageSize: ROLE_MEMBERS_PAGE_SIZE,
              initialPage: page,
            });
            if (!isCurrent()) {
              return;
            }
            fetched += data.length;
            data.forEach(member => {
              if (member.publicUserData?.userId) {
                userIds.push(member.publicUserData.userId);
              }
            });
            if (data.length === 0 || fetched >= total_count) {
              return userIds;
            }
          }
          return;
        },
        () => canContinue() && canRead(),
      ),
  };
};
