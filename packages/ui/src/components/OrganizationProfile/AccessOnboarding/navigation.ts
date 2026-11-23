import { useOrganizationProfileContext } from '../../../contexts';
import { useRouter } from '../../../router';

/** The Members page's tab for a parent account's unmanaged users. */
export const UNMANAGED_USERS_TAB = 'unmanaged';

/*
 * The Access page is one route; query params pick the view so every page
 * shares the session-backed store:
 *   (none) | tab=connections|sub-organizations   the list tabs
 *   policy=<id>|new               Add policy, Manage policy, Manage default
 *   setup=sso|directory&policy=…  the setup wizards, returning to that policy
 *   connection=<id>               Manage SSO connection / Directory Sync
 * A parent's unmanaged users live on the Members page, at tab=unmanaged.
 */
export const useAccessNavigation = () => {
  const { navigate, queryParams } = useRouter();
  const { isMembersPageRoot } = useOrganizationProfileContext();
  const go = (params: Record<string, string>) =>
    void navigate('../organization-access', { searchParams: new URLSearchParams(params) });

  return {
    queryParams,
    toPolicies: () => go({}),
    toConnections: () => go({ tab: 'connections' }),
    toSubOrganizations: () => go({ tab: 'sub-organizations' }),
    toUnmanagedUsers: () =>
      void navigate(isMembersPageRoot ? '../' : '../organization-members', {
        searchParams: new URLSearchParams({ tab: UNMANAGED_USERS_TAB }),
      }),
    toPolicy: (policyId: string) => go({ policy: policyId }),
    toSetup: (kind: 'sso' | 'directory', policyId: string) => go({ setup: kind, policy: policyId }),
    toConnection: (connectionId: string, fromPolicy?: string) =>
      go(fromPolicy ? { connection: connectionId, policy: fromPolicy } : { connection: connectionId }),
  };
};
