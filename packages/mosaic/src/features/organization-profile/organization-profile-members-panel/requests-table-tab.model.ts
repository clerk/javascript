import { ClerkRuntimeError } from '@clerk/shared/error';
import { useOrganization } from '@clerk/shared/react';
import type { OrganizationMembershipRequestResource } from '@clerk/shared/types';

import type { ClerkCall } from '../../clerk/errors';
import { callClerk } from '../../clerk/errors';

const PAGE_SIZE = 10;

export interface MembershipRequestRow {
  id: string;
  identifier: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
}

export interface RequestsTableModel {
  rows: MembershipRequestRow[];
  pageSize: number;
  totalCount: number;
  page: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  retry: () => unknown;
  fetchPage: (page: number) => unknown;
  accept: ((id: string) => ClerkCall) | undefined;
  reject: ((id: string) => ClerkCall) | undefined;
}

export function useRequestsTableModel(enabled: boolean): RequestsTableModel {
  const { organization, membershipRequests, memberships } = useOrganization({
    membershipRequests: enabled ? { pageSize: PAGE_SIZE, keepPreviousData: true } : undefined,
  });
  const rows = (membershipRequests?.data ?? [])
    .filter(
      request =>
        request.organizationId === organization?.id &&
        request.status === 'pending' &&
        request.publicUserData?.identifier,
    )
    .map(toRequest);

  const findPending = (id: string) => {
    const request = membershipRequests?.data?.find(
      item => item.id === id && item.organizationId === organization?.id && item.status === 'pending',
    );
    if (!enabled || !request) {
      throw new ClerkRuntimeError('This request is unavailable.', { code: 'request_unavailable' });
    }
    return request;
  };

  const refresh = async () => {
    await membershipRequests?.revalidate?.();
    const page = membershipRequests?.page ?? 1;
    if (page > 1 && membershipRequests?.data?.every(request => request.status !== 'pending')) {
      membershipRequests?.fetchPage?.(page - 1);
    }
  };

  return {
    rows,
    pageSize: PAGE_SIZE,
    totalCount: membershipRequests?.count ?? 0,
    page: membershipRequests?.page ?? 1,
    isLoading: membershipRequests?.isLoading ?? true,
    isFetching: membershipRequests?.isFetching ?? false,
    isError: membershipRequests?.isError ?? false,
    retry: () => membershipRequests?.revalidate?.(),
    fetchPage: (page: number) => membershipRequests?.fetchPage?.(page),
    accept: enabled
      ? (id: string) =>
          callClerk(async () => {
            await findPending(id).accept();
            await Promise.allSettled([refresh(), memberships?.revalidate?.()]);
          })
      : undefined,
    reject: enabled
      ? (id: string) =>
          callClerk(async () => {
            await findPending(id).reject();
            await refresh();
          })
      : undefined,
  };
}

function toRequest(request: OrganizationMembershipRequestResource): MembershipRequestRow {
  const { id, createdAt, publicUserData } = request;
  return {
    id,
    identifier: publicUserData.identifier,
    name: [publicUserData.firstName, publicUserData.lastName].filter(Boolean).join(' '),
    imageUrl: publicUserData.imageUrl,
    createdAt,
  };
}
