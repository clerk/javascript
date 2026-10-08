import { useClerk, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

export const useProfileRequestScopeModel = (target: string) => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const userId = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const identity = JSON.stringify([userId, sessionId, clientId, target]);
  const current = useRef({ identity, version: 0 });
  if (current.current.identity !== identity) {
    current.current = { identity, version: current.current.version + 1 };
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
    !!userId &&
    mounted.current &&
    current.current === owner &&
    clerk.user?.id === userId &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId;
  return { requestKey: JSON.stringify([identity, owner.version]), canRun };
};
