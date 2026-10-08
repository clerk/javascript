import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import { useCallback, useEffect, useRef } from 'react';

export const useAuthCodeRequestScopeModel = (
  flow: 'signIn' | 'signUp',
  resource: { id?: string },
  target: string,
  readTarget?: () => string,
) => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const clientId = clerk.client?.id;
  const userId = user?.id;
  const sessionId = session?.id;
  const organizationId = organization?.id;
  const identity = JSON.stringify([flow, target, clientId, userId, sessionId, organizationId]);
  const observed = useRef({ identity, resource, id: resource.id, version: 0 });
  if (
    observed.current.identity !== identity ||
    observed.current.resource !== resource ||
    (observed.current.id !== undefined && observed.current.id !== resource.id)
  ) {
    observed.current = { identity, resource, id: resource.id, version: observed.current.version + 1 };
  } else if (observed.current.id === undefined && resource.id !== undefined) {
    observed.current.id = resource.id;
  }
  const owner = observed.current;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canRun = useCallback(() => {
    if (owner.id === undefined && resource.id !== undefined) {
      owner.id = resource.id;
    }
    return (
      mounted.current &&
      observed.current === owner &&
      clerk.client?.id === clientId &&
      clerk.client?.[flow] === resource &&
      (owner.id === undefined || resource.id === owner.id) &&
      clerk.user?.id === userId &&
      clerk.session?.id === sessionId &&
      clerk.organization?.id === organizationId &&
      (!readTarget || readTarget() === target)
    );
  }, [owner, clerk, clientId, flow, resource, userId, sessionId, organizationId, readTarget, target]);
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
