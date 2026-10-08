import { useClerk, useOrganization, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import type { OrganizationDomainResource } from '@clerk/shared/types';
import { useRef } from 'react';

import { useFetch } from '@/ui/hooks';

export const useOrganizationDomainSourceModel = (domainId: string, enabled = true) => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const subject = organization?.id;
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const identity = JSON.stringify([actor, sessionId, clientId, subject, domainId]);
  const current = useRef({ identity, version: 0, clerk, generation: {} });
  if (current.current.identity !== identity || current.current.clerk !== clerk) {
    current.current = { identity, version: current.current.version + 1, clerk, generation: {} };
  }
  const owner = current.current;
  const scope = JSON.stringify([identity, owner.version]);
  const mounted = useRef(true);
  const canRun = () =>
    mounted.current &&
    current.current === owner &&
    !!actor &&
    !!sessionId &&
    !!subject &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    clerk.organization?.id === subject;
  const {
    data: fetchedDomain,
    isLoading,
    error,
    revalidate,
    setCache,
  } = useFetch(
    enabled && organization && user && session
      ? async () => {
          const currentOrganization = clerk.organization;
          return currentOrganization && canRun() ? currentOrganization.getDomain({ domainId }) : null;
        }
      : undefined,
    { identity },
    undefined,
    'organization-domain',
  );
  const domain = fetchedDomain?.id === domainId && fetchedDomain.organizationId === subject ? fetchedDomain : null;
  const latest = useRef(domain);
  latest.current = domain;
  useSafeLayoutEffect(() => {
    mounted.current = true;
    latest.current = domain;
    return () => {
      mounted.current = false;
      owner.generation = {};
      latest.current = null;
    };
  }, [owner]);

  return {
    scope,
    canRun,
    available: Boolean(organization),
    isLoading: enabled && canRun() && !error && Boolean(isLoading || !domain),
    errorMessage: enabled && canRun() && error ? error.message || String(error) : undefined,
    domain: canRun() ? domain : null,
    getDomain: () => (canRun() ? latest.current : null),
    createGuard: (canContinue = () => true) => {
      const generation = owner.generation;
      return () => canRun() && owner.generation === generation && canContinue();
    },
    retry: () => {
      if (canRun()) {
        revalidate();
      }
    },
    setDomain: (result: OrganizationDomainResource) => {
      if (canRun() && result.id === domainId && result.organizationId === subject) {
        setCache({ data: { ...result }, isLoading: false, isValidating: false, error: null, cachedAt: Date.now() });
      }
    },
  };
};
