import type { ClerkPaginatedResponse } from '@clerk/types';

import type { useCoreOrganizationList } from '../../contexts';

export const organizationListParams = {
  userMemberships: {
    infinite: true,
  },
  userInvitations: {
    infinite: true,
  },
  userSuggestions: {
    infinite: true,
    status: ['pending', 'accepted'],
  },
} satisfies Parameters<typeof useCoreOrganizationList>[0];

export const populateCacheUpdateItem = <T extends { id: string }>(
  updatedItem: T,
  itemsInfinitePages: (ClerkPaginatedResponse<T> | undefined)[] | undefined,
) => {
  if (typeof itemsInfinitePages === 'undefined') {
    return [{ data: [updatedItem], total_count: 1 }];
  }

  /**
   * We should "preserve" an undefined page if one is found. For example if swr triggers 2 requests, page 1 & page2, and the request for page2 resolves first, at that point in memory itemsInfinitePages would look like this [undefined, {....}]
   * if SWR says that has fetched 2 pages but the first result of is undefined, we should not return back an array with 1 item as this will end up having cacheKeys that point nowhere.
   */
  return itemsInfinitePages.map(item => {
    if (typeof item === 'undefined') {
      return item;
    }
    const newData = item.data.map(obj => {
      if (obj.id === updatedItem.id) {
        return {
          ...updatedItem,
        };
      }

      return obj;
    });
    return { ...item, data: newData };
  });
};

export const populateCacheRemoveItem = <T extends { id: string }>(
  updatedItem: T,
  itemsInfinitePages: (ClerkPaginatedResponse<T> | undefined)[] | undefined,
) => {
  const prevTotalCount = itemsInfinitePages?.[itemsInfinitePages.length - 1]?.total_count;

  if (!prevTotalCount) {
    return undefined;
  }

  /**
   * We should "preserve" an undefined page if one is found. For example if swr triggers 2 requests, page 1 & page2, and the request for page2 resolves first, at that point in memory itemsInfinitePages would look like this [undefined, {....}]
   * if SWR says that has fetched 2 pages but the first result of is undefined, we should not return back an array with 1 item as this will end up having cacheKeys that point nowhere.
   */
  return itemsInfinitePages?.map(item => {
    if (typeof item === 'undefined') {
      return item;
    }
    const newData = item.data.filter(obj => {
      return obj.id !== updatedItem.id;
    });
    return { ...item, data: newData, total_count: prevTotalCount - 1 };
  });
};
