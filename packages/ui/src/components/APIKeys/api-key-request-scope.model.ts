import { useClerk, useOrganization, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import type { APIKeyRequestScope } from './api-keys.types';

export const useAPIKeyRequestScopeModel = (target: string): APIKeyRequestScope => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const userId = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const organizationId = organization?.id;
  const identity = JSON.stringify([userId, sessionId, clientId, organizationId, target]);
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
  return {
    scopeKey: JSON.stringify([identity, owner.version]),
    canRun: () =>
      mounted.current &&
      current.current === owner &&
      !!userId &&
      clerk.user?.id === userId &&
      clerk.session?.id === sessionId &&
      clerk.client?.id === clientId &&
      clerk.organization?.id === organizationId,
  };
};
