import { useClerk } from '@clerk/shared/react';

import { useCreateOrganizationContext } from '@/ui/contexts';

import type { CreateOrganizationFormProps } from './create-organization-form.model';

type CreateOrganizationPageData = Pick<
  CreateOrganizationFormProps,
  'navigateAfterCreateOrganization' | 'skipInvitationScreen'
> & { onComplete: () => void };

export const useCreateOrganizationPageModel = (): CreateOrganizationPageData => {
  const { closeCreateOrganization } = useClerk();
  const { mode, navigateAfterCreateOrganization, skipInvitationScreen } = useCreateOrganizationContext();

  return {
    navigateAfterCreateOrganization,
    skipInvitationScreen,
    onComplete: () => {
      if (mode === 'modal') {
        closeCreateOrganization();
      }
    },
  };
};
