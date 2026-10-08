import { useRef } from 'react';

import { useEnvironment } from '@/contexts';

import { useOrganizationDomainSourceModel } from './organization-domain-source.model';
import type { VerifyDomainFormModel } from './verify-domain-form.types';

export const useVerifyDomainFormModel = (domainId: string, skipToVerified: boolean): VerifyDomainFormModel => {
  const { organizationSettings } = useEnvironment();
  const {
    scope,
    available,
    domain,
    isLoading,
    errorMessage,
    retry,
    canRun: sourceCanRun,
    getDomain,
    createGuard,
    setDomain,
  } = useOrganizationDomainSourceModel(domainId, !skipToVerified);
  const key = `${scope}:${skipToVerified}`;
  const current = useRef({ key });
  if (current.current.key !== key) {
    current.current = { key };
  }
  const owner = current.current;
  const canRun = () => !skipToVerified && current.current === owner && sourceCanRun();

  return {
    scope: key,
    canRun,
    errorMessage,
    retry: () => {
      if (canRun()) {
        retry();
      }
    },
    available: Boolean(available && organizationSettings),
    hasDomain: Boolean(domain),
    isLoading,
    domainName: domain?.name ?? '',
    prepare: async (emailAddress, canContinue = () => true) => {
      const isCurrent = createGuard(() => canRun() && canContinue());
      const resource = getDomain();
      if (!resource || !isCurrent()) {
        return false;
      }
      try {
        const result = await resource.prepareAffiliationVerification({ affiliationEmailAddress: emailAddress });
        if (!isCurrent()) {
          return false;
        }
        setDomain(result);
        return true;
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
    attempt: async (code: string, canContinue = () => true) => {
      const isCurrent = createGuard(() => canRun() && canContinue());
      const resource = getDomain();
      if (!resource?.attemptAffiliationVerification || !isCurrent()) {
        return undefined;
      }
      try {
        const result = await resource.attemptAffiliationVerification({ code });
        if (!isCurrent()) {
          return undefined;
        }
        setDomain(result);
        return result.verification?.status === 'verified';
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return undefined;
      }
    },
  };
};
