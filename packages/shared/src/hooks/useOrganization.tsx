import type {
  ClerkPaginationParams,
  GetMembershipsParams,
  GetPendingInvitationsParams,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
} from '@clerk/types';
import useSWR from 'swr';

import { useClerkInstanceContext, useOrganizationContext, useSessionContext } from './contexts';

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
      organization: OrganizationResource;
      invitationList: undefined;
      membershipList: undefined;
      membership: undefined;
    }
  | {
      isLoaded: boolean;
      organization: OrganizationResource | null;
      invitationList: OrganizationInvitationResource[] | null | undefined;
      membershipList: OrganizationMembershipResource[] | null | undefined;
      membership: OrganizationMembershipResource | null | undefined;
    };

type UseOrganization = (params?: UseOrganizationParams) => UseOrganizationReturn;

export const useOrganization: UseOrganization = params => {
  const { invitationList: invitationListParams, membershipList: membershipListParams } = params || {};
  const { organization, lastOrganizationMember, lastOrganizationInvitation } = useOrganizationContext();
  const session = useSessionContext();

  const clerk = useClerkInstanceContext();
  const shouldFetch = clerk.loaded && session && organization;

  // Some gymnastics to adhere to the rules of hooks
  // We need to make sure useSWR is called on every render
  const pendingInvitations = !clerk.loaded
    ? () => [] as OrganizationInvitationResource[]
    : () => clerk.organization?.getPendingInvitations(invitationListParams);

  const currentOrganizationMemberships = !clerk.loaded
    ? () => [] as OrganizationMembershipResource[]
    : () => clerk.organization?.getMemberships(membershipListParams);

  const {
    data: invitationList,
    isValidating: isInvitationsLoading,
    mutate: mutateInvitationList,
  } = useSWR(
    shouldFetch && invitationListParams
      ? cacheKey('invites', organization, lastOrganizationInvitation, invitationListParams)
      : null,
    pendingInvitations,
  );

  const {
    data: membershipList,
    isValidating: isMembershipsLoading,
    mutate: mutateMembershipList,
  } = useSWR(
    shouldFetch && membershipListParams
      ? cacheKey('memberships', organization, lastOrganizationMember, membershipListParams)
      : null,
    currentOrganizationMemberships,
  );

  if (organization === undefined) {
    return {
      isLoaded: false,
      organization: undefined,
      invitationList: undefined,
      membershipList: undefined,
      membership: undefined,
    };
  }

  if (organization === null) {
    return {
      isLoaded: true,
      organization: null,
      invitationList: null,
      membershipList: null,
      membership: null,
    };
  }

  /** In SSR context we include only the organization object when loadOrg is set to true. */
  if (!clerk.loaded && organization) {
    return {
      isLoaded: true,
      organization,
      invitationList: undefined,
      membershipList: undefined,
      membership: undefined,
    };
  }

  return {
    isLoaded: !isMembershipsLoading && !isInvitationsLoading,
    organization,
    membershipList,
    membership: getCurrentOrganizationMembership(session!.user.organizationMemberships, organization.id), // your membership in the current org
    invitationList,
    unstable__mutate: () => {
      void mutateMembershipList();
      void mutateInvitationList();
    },
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

function cacheKey(
  type: 'memberships' | 'invites',
  organization: OrganizationResource,
  resource: OrganizationInvitationResource | OrganizationMembershipResource | null | undefined,
  pagination: ClerkPaginationParams,
) {
  return [type, organization.id, resource?.id, resource?.updatedAt, pagination.offset, pagination.limit]
    .filter(Boolean)
    .join('-');
}
