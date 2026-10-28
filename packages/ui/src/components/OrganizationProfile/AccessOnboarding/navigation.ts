import { useRouter } from '../../../router';

/*
 * The Access page is one route; query params pick the view so every page
 * shares the session-backed store:
 *   (none) | tab=connections      the Policies / Connections tabs
 *   policy=<id>|new               Add policy, Manage policy, Manage default
 *   setup=sso|directory&policy=…  the setup wizards, returning to that policy
 *   connection=<id>               Manage SSO connection / Directory Sync
 */
export const useAccessNavigation = () => {
  const { navigate, queryParams } = useRouter();
  const go = (params: Record<string, string>) =>
    void navigate('../organization-access', { searchParams: new URLSearchParams(params) });

  return {
    queryParams,
    toPolicies: () => go({}),
    toConnections: () => go({ tab: 'connections' }),
    toPolicy: (policyId: string) => go({ policy: policyId }),
    toSetup: (kind: 'sso' | 'directory', policyId: string) => go({ setup: kind, policy: policyId }),
    toConnection: (connectionId: string, fromPolicy?: string) =>
      go(fromPolicy ? { connection: connectionId, policy: fromPolicy } : { connection: connectionId }),
  };
};
