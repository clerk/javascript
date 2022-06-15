import {
  CreateOrganizationParams,
  LoadedClerk,
  OrganizationMembershipResource,
  OrganizationResource,
  SetActive,
} from '@clerk/types';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useUserContext } from '../contexts/UserContext';

type OrganizationList = ReturnType<typeof createOrganizationList>;

type UseOrganizationListReturn =
  | { isLoaded: false; organizationList: undefined; createOrganization: undefined; setActive: undefined }
  | {
      isLoaded: true;
      organizationList: OrganizationList;
      createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;
      setActive: SetActive;
    };

type UseOrganizationList = () => UseOrganizationListReturn;

export const useOrganizationList: UseOrganizationList = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const user = useUserContext();

  // TODO: Properly check for SSR user values
  if (!isomorphicClerk.loaded || !user) {
    return { isLoaded: false, organizationList: undefined, createOrganization: undefined, setActive: undefined };
  }

  const clerk = isomorphicClerk as unknown as LoadedClerk;

  return {
    isLoaded: true,
    organizationList: createOrganizationList(user.organizationMemberships),
    setActive: clerk.setActive,
    createOrganization: clerk.createOrganization,
  };
};

function createOrganizationList(organizationMemberships: OrganizationMembershipResource[]) {
  return organizationMemberships.map(organizationMembership => ({
    membership: organizationMembership,
    organization: organizationMembership.organization,
  }));
}
