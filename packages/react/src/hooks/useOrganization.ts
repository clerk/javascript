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
      isLoaded: boolean;
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
  const clerk = isomorphicClerk as unknown as LoadedClerk;
  const shouldFetch = isomorphicClerk.loaded && session && organization;

  // Some gymnastics to adhere to the rules of hooks
  // We need to make sure useSWR is called on every render
  const pendingInvitations = !isomorphicClerk.loaded
    ? () => [] as OrganizationInvitationResource[]
    : () => clerk.organization?.getPendingInvitations(invitationListParams);

  const currentOrganizationMemberships = !isomorphicClerk.loaded
    ? () => [] as OrganizationMembershipResource[]
    : () => clerk.organization?.getMemberships(membershipListParams);

  const { data: invitationList, isValidating: isInvitationsLoading } = useSWR(
    shouldFetch && invitationListParams
      ? composeOrganizationResourcesUpdateKey(organization, lastOrganizationInvitation, 'invitations')
      : null,
    pendingInvitations,
  );

  const { data: membershipList, isValidating: isMembershipsLoading } = useSWR(
    shouldFetch && membershipListParams
      ? composeOrganizationResourcesUpdateKey(organization, lastOrganizationMember, 'memberships')
      : null,
    currentOrganizationMemberships,
  );

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

  return {
    isLoaded: !isMembershipsLoading && !isInvitationsLoading,
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
