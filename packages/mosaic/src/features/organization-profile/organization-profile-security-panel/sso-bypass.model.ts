import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import { __internal_useOrganizationSSOBypassAllowlist, useOrganization, useUser } from '@clerk/shared/react';
import type { OrganizationResource, SSOBypassAllowlistUserResource } from '@clerk/shared/types';

import { useOrganizationRoleMemberCountsQuery } from '../../../queries/use-organization-role-member-counts-query';
import { useOrganizationRolesQuery } from '../../../queries/use-organization-roles-query';
import { save } from '../../../utils/errors';
import type { SSOBypassAddResult, SSOBypassAllowlistData, SSOBypassEntry, SSOBypassRoles } from './sso-bypass.types';
import { skipReason } from './sso-bypass.utils';

const MEMBER_LOOKUP_PAGE_SIZE = 10;
const NONE_ADDED_CODES = {
  domainNotServed: 'sso_bypass_none_added_domain_not_served',
  notMember: 'sso_bypass_none_added_not_member',
  unknown: 'sso_bypass_none_added',
} as const;
const ROLE_MEMBERS_PAGE_SIZE = 100;

export interface SSOBypassModel extends SSOBypassAllowlistData {
  isFeatureDisabled: boolean;
  roles: SSOBypassRoles;
  retry: () => void;
  remove: (userId: string) => Promise<void>;
  addByEmail: (email: string) => Promise<SSOBypassAddResult>;
  addByRole: (role: string) => Promise<SSOBypassAddResult>;
}

export function useSSOBypassModel({
  enabled,
  withRoles = false,
}: {
  enabled: boolean;
  withRoles?: boolean;
}): SSOBypassModel {
  const { organization } = useOrganization();
  const { user } = useUser();
  const allowlist = __internal_useOrganizationSSOBypassAllowlist({ enabled });
  const rolesQuery = useOrganizationRolesQuery({ enabled: enabled && withRoles });
  const roleKeys = rolesQuery.data?.data.map(role => role.key) ?? [];
  const countsQuery = useOrganizationRoleMemberCountsQuery({ roleKeys, enabled: enabled && withRoles });

  const data = allowlist.data ?? [];
  const allowlistedUserIds = new Set(data.map(entry => entry.userId));

  const requireOrganization = (): OrganizationResource => {
    if (!organization) {
      throw new ClerkRuntimeError('The active organization is unavailable.', { code: 'organization_changed' });
    }
    return organization;
  };

  return {
    entries: data.map(entry => toEntry(entry, user?.id)),
    isLoading: allowlist.isLoading,
    isFetching: allowlist.isFetching,
    isError: Boolean(allowlist.error) && !isFeatureNotEnabled(allowlist.error),
    isFeatureDisabled: isFeatureNotEnabled(allowlist.error),
    roles: {
      roles: (rolesQuery.data?.data ?? []).map(role => ({
        key: role.key,
        name: role.name,
        memberCount: countsQuery.data?.[role.key],
      })),
      isLoading: rolesQuery.isLoading,
      isError: Boolean(rolesQuery.error),
    },
    retry: () => void allowlist.revalidate(),
    remove: async userId => {
      await allowlist.removeUser(userId);
    },
    addByEmail: async email => {
      await save(async () => {
        const member = await findMemberByEmail(requireOrganization(), email.trim());
        const userId = member?.publicUserData?.userId;
        if (!userId) {
          throw new ClerkRuntimeError('No member of this organization has that email address.', {
            code: 'sso_bypass_member_not_found',
          });
        }
        if (allowlistedUserIds.has(userId)) {
          throw new ClerkRuntimeError('This member is already on the allow list.', {
            code: 'sso_bypass_already_added',
          });
        }
        await allowlist.addUser({ userId });
      }, ['emailAddress']);
      return { mode: 'email', added: 1, skipped: 0, skipReason: 'unknown' };
    },
    addByRole: async role => {
      let result: SSOBypassAddResult = { mode: 'role', added: 0, skipped: 0, skipReason: 'unknown' };
      await save(async () => {
        const userIds = (await collectUserIdsByRole(requireOrganization(), role)).filter(
          userId => !allowlistedUserIds.has(userId),
        );
        if (userIds.length === 0) {
          throw new ClerkRuntimeError('Everyone with that role is already on the allow list.', {
            code: 'sso_bypass_all_already_added',
          });
        }
        const response = await allowlist.addUsers({ userIds });
        const skipped = response?.errors ?? [];
        const reason = skipReason(skipped.map(error => error.code));
        const added = response?.data.length ?? 0;
        if (added === 0) {
          throw new ClerkRuntimeError('None of these members could be added.', {
            code: NONE_ADDED_CODES[reason],
          });
        }
        result = { mode: 'role', added, skipped: skipped.length, skipReason: reason };
      }, ['role']);
      return result;
    },
  };
}

export function useSSOBypassAvailabilityModel({ enabled }: { enabled: boolean }) {
  const allowlist = __internal_useOrganizationSSOBypassAllowlist({ enabled });
  return { isFeatureDisabled: isFeatureNotEnabled(allowlist.error) };
}

function isFeatureNotEnabled(error: Error | null): boolean {
  return error !== null && isClerkAPIResponseError(error) && error.errors.some(e => e.code === 'feature_not_enabled');
}

function toEntry(entry: SSOBypassAllowlistUserResource, currentUserId: string | undefined): SSOBypassEntry {
  const { firstName, lastName, identifier, username, imageUrl } = entry.publicUserData;
  const name = [firstName, lastName].filter(Boolean).join(' ');
  return {
    userId: entry.userId,
    name: name || identifier,
    identifier,
    username: username ?? undefined,
    imageUrl: imageUrl || undefined,
    isCurrentUser: entry.userId === currentUserId,
  };
}

async function findMemberByEmail(organization: OrganizationResource, email: string) {
  const wanted = email.toLowerCase();
  let fetched = 0;
  for (let page = 1; ; page++) {
    const { data, total_count } = await organization.getMemberships({
      query: email,
      pageSize: MEMBER_LOOKUP_PAGE_SIZE,
      initialPage: page,
    });
    const match = data.find(membership => membership.publicUserData?.identifier?.toLowerCase() === wanted);
    fetched += data.length;
    if (match || data.length === 0 || fetched >= total_count) {
      return match;
    }
  }
}

async function collectUserIdsByRole(organization: OrganizationResource, role: string) {
  const userIds: string[] = [];
  let fetched = 0;
  for (let page = 1; ; page++) {
    const { data, total_count } = await organization.getMemberships({
      role: [role],
      pageSize: ROLE_MEMBERS_PAGE_SIZE,
      initialPage: page,
    });
    fetched += data.length;
    for (const membership of data) {
      const userId = membership.publicUserData?.userId;
      if (userId) {
        userIds.push(userId);
      }
    }
    if (data.length === 0 || fetched >= total_count) {
      return userIds;
    }
  }
}
