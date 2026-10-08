import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import { useCallback, useEffect, useRef } from 'react';

export const useAuthenticationRequestScopeModel = (flow: 'signIn' | 'signUp', resource: object, target: string) => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const clientId = clerk.client?.id;
  const userId = user?.id;
  const sessionId = session?.id;
  const organizationId = organization?.id;
  const identity = JSON.stringify([flow, clientId, userId, sessionId, organizationId, target]);
  const current = useRef({ identity, resource, version: 0 });
  if (current.current.identity !== identity || current.current.resource !== resource) {
    current.current = { identity, resource, version: current.current.version + 1 };
  }
  const owner = current.current;
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
      current.current === owner &&
      clerk.client?.id === clientId &&
      clerk.client?.[flow] === resource &&
      clerk.user?.id === userId &&
      clerk.session?.id === sessionId &&
      clerk.organization?.id === organizationId,
    [owner, clerk, clientId, flow, resource, userId, sessionId, organizationId],
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
  return { requestKey: JSON.stringify([identity, owner.version]), canRun, run };
};
