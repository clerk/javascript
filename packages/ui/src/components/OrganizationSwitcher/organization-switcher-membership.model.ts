import { useClerk, useOrganization, useOrganizationList, useSession, useUser } from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import { useOrganizationSwitcherContext } from '../../contexts';
import { useInView } from '../../hooks';
import type { OrganizationSwitcherMembershipData } from './organization-switcher-membership.types';
import type { UserMembershipListProps } from './UserMembershipList';
import { organizationListParams } from './utils';

export const useOrganizationSwitcherMembershipModel = (
  onOrganizationClick: UserMembershipListProps['onOrganizationClick'],
): OrganizationSwitcherMembershipData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { hidePersonal } = useOrganizationSwitcherContext();
  const { organization: currentOrg } = useOrganization();
  const { userMemberships } = useOrganizationList({
    userMemberships: { ...organizationListParams.userMemberships, keepPreviousData: false },
  });
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const scopeKey = JSON.stringify([actor, sessionId, clientId]);
  const mounted = useRef(true);
  const current = useRef({ scopeKey, version: 0 });
  const query = useRef<typeof userMemberships>();
  query.current = userMemberships;
  const version = current.current.version + (current.current.scopeKey === scopeKey ? 0 : 1);
  current.current = { scopeKey, version };
  const canRun = () =>
    mounted.current &&
    !!actor &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    current.current.version === version;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    query.current = userMemberships;
    return () => {
      query.current = undefined;
    };
  }, [userMemberships]);
  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      const memberships = query.current;
      if (inView && canRun() && memberships?.hasNextPage && !memberships.isFetching) {
        void memberships.fetchNext?.();
      }
    },
  });
  const otherOrgs = ((userMemberships.count || 0) > 0 ? userMemberships.data || [] : [])
    .map(item => item.organization)
    .filter(organization => organization.id !== currentOrg?.id);

  return {
    isVisible: !!user,
    hidePersonal: !!hidePersonal,
    showPersonal: !!currentOrg && !hidePersonal,
    personalPreview: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        }
      : undefined,
    organizations: otherOrgs.map(organization => {
      const organizationId = organization.id;
      return {
        id: organization.id,
        preview: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          imageUrl: organization.imageUrl,
          hasImage: organization.hasImage,
        },
        onClick: () => canRun() && onOrganizationClick(organizationId),
      };
    }),
    isLoading: !!userMemberships.isLoading,
    hasNextPage: !!userMemberships.hasNextPage,
    paginationRef: ref,
  };
};
