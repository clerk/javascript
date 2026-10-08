import { useClerk, useOrganization, useUser } from '@clerk/shared/react';

import type { RequestToJoinListModel } from './request-to-join-list.types';

const membershipRequestsParams = {
  membershipRequests: {
    pageSize: 10,
    keepPreviousData: true,
  },
};

export const useRequestToJoinListModel = (): RequestToJoinListModel => {
  const clerk = useClerk();
  const { user } = useUser();
  const { organization, membership, membershipRequests } = useOrganization(membershipRequestsParams);
  const subject = organization?.id;
  const actor = user?.id;
  const canAct = Boolean(membership && membershipRequests);
  const ownsScope = () => !!subject && !!actor && clerk.organization?.id === subject && clerk.user?.id === actor;
  const refresh = async () => {
    if (ownsScope()) {
      await membershipRequests?.revalidate?.();
    }
  };

  return {
    scope: `${actor}:${subject}`,
    hasOrganization: Boolean(organization),
    canAct,
    requests: (membershipRequests?.data || []).map(request => ({
      id: request.id,
      view: {
        identifier: request.publicUserData.identifier,
        requestedAt: request.createdAt.toLocaleDateString(),
      },
      accept: async () => {
        if (!canAct || !ownsScope()) {
          return;
        }
        await request.accept();
        await refresh();
      },
      reject: async () => {
        if (!canAct || !ownsScope()) {
          return;
        }
        await request.reject();
        await refresh();
      },
    })),
    table: {
      page: membershipRequests?.page || 1,
      onPageChange: page => {
        if (ownsScope()) {
          membershipRequests?.fetchPage?.(page);
        }
      },
      itemCount: membershipRequests?.count || 0,
      pageCount: membershipRequests?.pageCount || 0,
      itemsPerPage: membershipRequestsParams.membershipRequests.pageSize,
      isLoading: membershipRequests?.isLoading,
    },
  };
};
