import { useClerk, useOrganization, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

export const useInviteMembersOrganizationModel = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const organizationId = organization?.id;
  const sourceKey = JSON.stringify([actor, sessionId, clientId, organizationId]);
  const current = useRef({ sourceKey, clerk, version: 0 });
  const sourceChanged = current.current.sourceKey !== sourceKey || current.current.clerk !== clerk;
  const version = current.current.version + (sourceChanged ? 1 : 0);
  current.current = { sourceKey, clerk, version };
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return {
    hasOrganization: Boolean(organization),
    scopeKey: JSON.stringify([sourceKey, version]),
    canRun: () =>
      mounted.current &&
      !!actor &&
      !!organizationId &&
      current.current.version === version &&
      clerk.user?.id === actor &&
      clerk.session?.id === sessionId &&
      clerk.client?.id === clientId &&
      clerk.organization?.id === organizationId,
  };
};
