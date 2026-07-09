import { useOrganization } from '@clerk/shared/react';

type OrganizationProfileController = { status: 'loading' } | { status: 'hidden' } | { status: 'ready' };

export function useOrganizationProfileController(): OrganizationProfileController {
  const { isLoaded, organization } = useOrganization();

  if (!isLoaded) {
    return { status: 'loading' };
  }

  if (!organization) {
    return { status: 'hidden' };
  }

  return { status: 'ready' };
}
