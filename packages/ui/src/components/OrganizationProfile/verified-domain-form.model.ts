import { useOrganization, useSafeLayoutEffect } from '@clerk/shared/react';
import type { OrganizationEnrollmentMode } from '@clerk/shared/types';
import { useRef } from 'react';

import { useEnvironment } from '@/contexts';

import { useOrganizationDomainSourceModel } from './organization-domain-source.model';
import type { VerifiedDomainFormModel } from './verified-domain-form.types';

export const useVerifiedDomainFormModel = (domainId: string): VerifiedDomainFormModel => {
  const { organizationSettings } = useEnvironment();
  const { membership, domains } = useOrganization({ domains: { infinite: true } });
  const source = useOrganizationDomainSourceModel(domainId);
  const { scope, canRun, domain, createGuard, getDomain } = source;
  const latest = useRef({ domains, membership });
  latest.current = { domains, membership };
  useSafeLayoutEffect(() => {
    latest.current = { domains, membership };
    return () => {
      latest.current = { domains: null, membership: undefined };
    };
  }, [scope]);

  return {
    scope,
    canRun,
    available: Boolean(source.available && organizationSettings),
    isLoading: source.isLoading,
    errorMessage: source.errorMessage,
    retry: source.retry,
    domain:
      domain && canRun()
        ? {
            id: domain.id,
            name: domain.name,
            enrollmentMode: domain.enrollmentMode,
            isVerified: domain.verification?.status === 'verified',
            totalPendingInvitations: domain.totalPendingInvitations || 0,
            totalPendingSuggestions: domain.totalPendingSuggestions || 0,
          }
        : null,
    enrollmentModes: (['manual_invitation', 'automatic_invitation', 'automatic_suggestion'] as const).filter(mode =>
      organizationSettings.domains.enrollmentModes.includes(mode),
    ),
    updateEnrollmentMode: async (
      enrollmentMode: OrganizationEnrollmentMode,
      deletePending: boolean | undefined,
      canContinue = () => true,
    ) => {
      const isCurrent = createGuard(canContinue);
      const resource = getDomain();
      if (!resource || !latest.current.membership || !latest.current.domains || !isCurrent()) {
        return false;
      }
      try {
        await resource.updateEnrollmentMode({ enrollmentMode, deletePending });
        if (!isCurrent()) {
          return false;
        }
        await latest.current.domains?.revalidate?.();
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
