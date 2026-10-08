import { useClerk, useOrganization, useUser } from '@clerk/shared/react';

import { useProtect } from '@/common';

import type { DomainListModel, DomainListModelOptions } from './domain-list.types';

export type { DomainListModelOptions } from './domain-list.types';

export const useDomainListModel = ({
  verificationStatus,
  enrollmentMode,
  ...rest
}: DomainListModelOptions): DomainListModel => {
  const clerk = useClerk();
  const { user } = useUser();
  const { organization, domains } = useOrganization({ domains: { infinite: true, ...rest } });
  const canManageDomains = useProtect({ permission: 'org:sys_domains:manage' });
  const subject = organization?.id;
  const actor = user?.id;
  const ownsScope = () => !!subject && !!actor && clerk.organization?.id === subject && clerk.user?.id === actor;
  const canFetchNext = Boolean(domains?.hasNextPage && !domains.isFetching);
  const rows = (domains?.data || [])
    .filter(domain => {
      let matchesStatus = true;
      let matchesMode = true;
      if (verificationStatus) {
        matchesStatus = !!domain.verification && domain.verification.status === verificationStatus;
      }
      if (enrollmentMode) {
        matchesMode = domain.enrollmentMode === enrollmentMode;
      }

      return matchesStatus && matchesMode;
    })
    .map(domain => ({
      id: domain.id,
      name: domain.name,
      enrollmentMode: domain.enrollmentMode,
      isVerified: domain.ownershipVerification?.status === 'verified' || domain.verification?.status === 'verified',
      isVerificationComplete: domain.verification?.status === 'verified',
    }));

  return {
    scope: `${actor}:${subject}`,
    hasOrganization: Boolean(organization),
    canManageDomains,
    rows,
    isLoading: Boolean(domains?.isLoading),
    canFetchNext,
    showSpinner: Boolean((domains?.hasNextPage || domains?.isFetching) && domains?.data.length === 0),
    fetchNext: () => {
      if (canFetchNext && ownsScope()) {
        void domains?.fetchNext?.();
      }
    },
  };
};
