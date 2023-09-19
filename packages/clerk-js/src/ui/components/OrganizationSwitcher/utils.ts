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
