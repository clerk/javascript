import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import { useCallback, useEffect, useRef } from 'react';

export const useUVRequestScopeModel = (target: string) => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const organizationId = organization?.id;
  const identity = JSON.stringify([actor, sessionId, clientId, organizationId, target]);
  const scope = useRef({ identity, version: 0 });
  if (scope.current.identity !== identity) {
    scope.current = { identity, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canRun = useCallback(
    () =>
      mounted.current &&
      scope.current.version === version &&
      Boolean(actor && sessionId) &&
      clerk.user?.id === actor &&
      clerk.session?.id === sessionId &&
      clerk.client?.id === clientId &&
      clerk.organization?.id === organizationId,
    [version, clerk, actor, sessionId, clientId, organizationId],
  );
  const run = useCallback(
    async <T>(request: () => Promise<T>): Promise<T | undefined> => {
      if (!canRun()) {
        return;
      }
      try {
        const result = await request();
        return canRun() ? result : undefined;
      } catch (error) {
        if (canRun()) {
          throw error;
        }
      }
    },
    [canRun],
  );
  return { requestKey: JSON.stringify([identity, version]), canRun, run };
};
