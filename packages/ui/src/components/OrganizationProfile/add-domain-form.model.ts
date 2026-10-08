import { useClerk, useOrganization, useUser } from '@clerk/shared/react';

import { useEnvironment } from '@/contexts';

import type { AddDomainFormModel } from './add-domain-form.types';

export const useAddDomainFormModel = (): AddDomainFormModel => {
  const clerk = useClerk();
  const { user } = useUser();
  const { organizationSettings } = useEnvironment();
  const { organization, domains } = useOrganization({ domains: { infinite: true } });
  const subject = organization?.id;
  const actor = user?.id;
  const ownsScope = () => !!subject && !!actor && clerk.organization?.id === subject && clerk.user?.id === actor;
  const refreshDomains = async () => {
    if (!ownsScope()) {
      return false;
    }
    await domains?.revalidate?.();
    return ownsScope();
  };

  return {
    scope: `${actor}:${subject}`,
    available: Boolean(organization && organizationSettings),
    createDomain: async (name: string) => {
      if (!organization || !ownsScope()) {
        return;
      }

      const domain = await organization.createDomain(name);
      if (!(await refreshDomains())) {
        return;
      }
      return { id: domain.id, isVerified: domain.verification?.status === 'verified' };
    },
    refreshDomains,
  };
};
