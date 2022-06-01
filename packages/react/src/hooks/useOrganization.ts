import {
  GetMembershipsParams,
  GetPendingInvitationsParams,
  LoadedClerk,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
} from '@clerk/types';
import useSWR from 'swr';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useOrganizationContext } from '../contexts/OrganizationContext';
import { useSessionContext } from '../contexts/SessionContext';

type UseOrganizationParams = {
  invitationList?: GetPendingInvitationsParams;
  membershipList?: GetMembershipsParams;
};

type UseOrganizationReturn =
  | {
      isLoaded: false;
      organization: undefined;
      invitationList: undefined;
      membershipList: undefined;
      membership: undefined;
    }
  | {
      isLoaded: true;
      organization: OrganizationResource | null | undefined;
      invitationList: OrganizationInvitationResource[] | null | undefined;
      membershipList: OrganizationMembershipResource[] | null | undefined;
      membership: OrganizationMembershipResource | undefined;
    };

type UseOrganization = (params?: UseOrganizationParams) => UseOrganizationReturn;

export const useOrganization: UseOrganization = ({
  invitationList: invitationListParams,
  membershipList: membershipListParams,
} = {}) => {
  const { organization, lastOrganizationMember, lastOrganizationInvitation } = useOrganizationContext();
  const session = useSessionContext();

  const isomorphicClerk = useIsomorphicClerkContext();

  // TODO re-iterate on SSR based on value of `organization`
  if (!isomorphicClerk.loaded || !session || !organization) {
    return {
      isLoaded: false,
      organization: undefined,
      invitationList: undefined,
      membershipList: undefined,
      membership: undefined,
    };
  }

  const clerk = isomorphicClerk as unknown as LoadedClerk;

  const pendingInvitations = async () => {
    return await clerk.organization?.getPendingInvitations(invitationListParams);
  };

  const currentOrganizationMemberships = async () => {
    return await clerk.organization?.getMemberships(membershipListParams);
  };

  const { data: invitationList } = useSWR(
    invitationListParams
      ? composeOrganizationResourcesUpdateKey(organization, lastOrganizationInvitation, 'invitations')
      : null,
    pendingInvitations,
  );

  const { data: membershipList } = useSWR(
    membershipListParams
      ? composeOrganizationResourcesUpdateKey(organization, lastOrganizationMember, 'memberships')
      : null,
    currentOrganizationMemberships,
  );

  return {
    isLoaded: true,
    organization,
    membershipList,
    membership: getCurrentOrganizationMembership(session.user.organizationMemberships, organization.id), // your membership in the current org
    invitationList,
  };
};

function getCurrentOrganizationMembership(
  organizationMemberships: OrganizationMembershipResource[],
  activeOrganizationId: string,
) {
  return organizationMemberships.find(
    organizationMembership => organizationMembership.organization.id === activeOrganizationId,
  );
}

function composeOrganizationResourcesUpdateKey(
  organization: OrganizationResource,
  resource: OrganizationInvitationResource | OrganizationMembershipResource | null = null,
  resourceType: string,
) {
  return `${organization.id}${resource?.id}${resource?.updatedAt}${resourceType}`;
}
