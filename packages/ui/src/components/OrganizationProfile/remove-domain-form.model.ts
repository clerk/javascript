import { useOrganization, useSafeLayoutEffect } from '@clerk/shared/react';
import { useRef } from 'react';

import { useEnvironment } from '@/contexts';

import { useOrganizationDomainSourceModel } from './organization-domain-source.model';
import type { RemoveDomainFormModel } from './remove-domain-form.types';

export const useRemoveDomainFormModel = (domainId: string): RemoveDomainFormModel => {
  const { organizationSettings } = useEnvironment();
  const { domains } = useOrganization({ domains: { infinite: true } });
  const { scope, canRun, available, isLoading, errorMessage, retry, domain, getDomain, createGuard } =
    useOrganizationDomainSourceModel(domainId);
  const latest = useRef(domains);
  latest.current = domains;
  useSafeLayoutEffect(() => {
    latest.current = domains;
    return () => {
      latest.current = null;
    };
  }, [scope]);

  return {
    scope,
    canRun,
    available: Boolean(available && organizationSettings),
    isLoading,
    errorMessage,
    retry,
    domainName: domain?.name || '',
    deleteDomain: async (canContinue = () => true) => {
      const isCurrent = createGuard(canContinue);
      const resource = getDomain();
      if (!resource || !isCurrent()) {
        return false;
      }
      try {
        await resource.delete();
        if (!isCurrent()) {
          return false;
        }
        await latest.current?.revalidate?.();
        return isCurrent();
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
  };
};
